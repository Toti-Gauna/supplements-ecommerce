import { checkReschedule, promiseFor, type RescheduleCheck } from "../engine/delivery";
import { canTransition, STATUS_LABEL, type OrderStatus, type TransitionTrigger } from "../engine/orders";
import { DEMO_TODAY } from "../fixtures/admin-orders";
import type { DemoOrder } from "@/stores/checkout";
import { formatDate } from "@/lib/date";
import { auditEntry, type AdminData } from "./defaults";
import type { AdminOrder } from "./types";
import { consumeMaterials, orderNeeds } from "./workshop/materials";
import { emailsForOrder, pushOutbox, triggersForNewOrder, triggersForTransition, type OutboxEmail } from "./emails/triggers";
import { productionMove, PRODUCTION_COLUMNS, type ProductionColumn } from "./workshop/production";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

export interface OrdersActions {
  syncShopOrder: (order: DemoOrder) => void;
  receiveProof: (code: string, fileName: string) => boolean;
  approveProof: (code: string) => boolean;
  rejectProof: (code: string, reason: string) => boolean;
  confirmProvider: (code: string) => boolean;
  transition: (code: string, to: OrderStatus, note?: string) => boolean;
  addNote: (code: string, text: string) => void;
  /** Reprograma la entrega validando días cerrados; devuelve los avisos (día sobrecargado, antes del plazo). */
  rescheduleOrder: (code: string, day: string) => RescheduleCheck;
  /** Mueve un pedido en la cola de producción; devuelve el motivo si no se puede. */
  moveProduction: (code: string, to: ProductionColumn) => string | null;
}

/**
 * Aplica una transición válida (spec 5.2) y registra historial + auditoría. Devuelve false si no corresponde.
 * Al entrar a producción desde "pagado" el pedido pasa a "en máquina" (salvo otra etapa) y descuenta sus insumos.
 */
function move(set: Set, code: string, to: OrderStatus, trigger: TransitionTrigger, patch: (o: AdminOrder) => Partial<AdminOrder>, action: string): boolean {
  let ok = false;
  set((s) => {
    let materials = s.workshop.materials;
    let mails: OutboxEmail[] = [];
    const orders = s.orders.map((o) => {
      if (o.code !== code || !canTransition(o.status, to, { fulfillment: o.fulfillment, trigger, prevStatus: o.prevStatus })) return o;
      ok = true;
      const prevStatus = to === "IN_CLAIM" ? o.status : o.status === "IN_CLAIM" ? null : o.prevStatus;
      const next: AdminOrder = { ...o, ...patch(o), status: to, prevStatus, log: [...o.log, { at: new Date().toISOString(), from: o.status, to, note: action }] };
      if (to === "IN_PRODUCTION") next.stage ??= "machine";
      // Los insumos se descuentan una sola vez: al pasar de pagado a producción (no al volver de un reclamo).
      if (to === "IN_PRODUCTION" && o.status === "PAID") materials = consumeMaterials(materials, orderNeeds(o.lines, s.workshop.recipes));
      // La etapa se conserva durante un reclamo para volver a la misma columna; se borra al salir de producción.
      if (to !== "IN_PRODUCTION" && to !== "IN_CLAIM") delete next.stage;
      // Emails automáticos del cambio de estado (bandeja de salida simulada).
      mails = emailsForOrder(s.emails.templates, triggersForTransition(o.status, to), next, new Date().toISOString());
      return next;
    });
    return ok ? { orders, workshop: { ...s.workshop, materials }, emails: { ...s.emails, outbox: pushOutbox(s.emails.outbox, mails) }, audit: [auditEntry(action, code), ...s.audit].slice(0, 80) } : {};
  });
  return ok;
}

export function createOrdersActions(set: Set, get: () => AdminData): OrdersActions {
  return {
    syncShopOrder: (order) =>
      set((s) => {
        const existing = s.orders.find((o) => o.code === order.code);
        if (existing && (!existing.fromShop || existing.createdAt === order.createdAt)) return {};
        const created: AdminOrder = {
          code: order.code, createdAt: order.createdAt, customer: order.contact, userId: order.asAccount ? "u-demo" : null,
          status: "PENDING_PAYMENT", fulfillment: order.fulfillment, paymentMethod: order.paymentMethod, lines: order.lines,
          total: order.quote.total, notes: [], fromShop: true, promisedDate: promiseFor(order.lines, DEMO_TODAY, s.orders, s.workshop.settings, order.code).day, log: [{ at: order.createdAt, from: null, to: "PENDING_PAYMENT", note: "Checkout de demostración" }],
        };
        const mails = emailsForOrder(s.emails.templates, triggersForNewOrder(created), created, order.createdAt);
        return { orders: [created, ...s.orders.filter((o) => o.code !== order.code)], emails: { ...s.emails, outbox: pushOutbox(s.emails.outbox, mails) } };
      }),
    receiveProof: (code, fileName) =>
      move(set, code, "PAYMENT_REVIEW", "proof-received", () => ({ proof: { fileName, receivedAt: new Date().toISOString(), status: "IN_REVIEW" } }), `Comprobante recibido (${fileName}): queda en revisión`),
    approveProof: (code) =>
      move(set, code, "PAID", "proof-approved", (o) => ({ proof: o.proof && { ...o.proof, status: "APPROVED" } }), "Comprobante aprobado tras verificar el ingreso (simulado)"),
    rejectProof: (code, reason) =>
      move(set, code, "PENDING_PAYMENT", "proof-rejected", (o) => ({ proof: o.proof && { ...o.proof, status: "REJECTED", rejectReason: reason } }), `Comprobante rechazado: ${reason}`),
    confirmProvider: (code) => move(set, code, "PAID", "provider-confirmed", () => ({}), "Confirmación de Mercado Pago simulada (en producción llega por webhook)"),
    transition: (code, to, note) => move(set, code, to, "admin", () => ({}), note?.trim() || `Estado cambiado a ${STATUS_LABEL[to]}`),
    addNote: (code, text) =>
      set((s) => ({ orders: s.orders.map((o) => (o.code === code ? { ...o, notes: [...o.notes, text] } : o)), audit: [auditEntry("Nota interna agregada", code), ...s.audit] })),
    rescheduleOrder: (code, day) => {
      let result: RescheduleCheck = { ok: false, error: "No se encontró el pedido.", warnings: [] };
      set((s) => {
        const order = s.orders.find((o) => o.code === code);
        if (!order) return {};
        result = checkReschedule(order, day, DEMO_TODAY, s.orders, s.workshop.settings);
        if (!result.ok || order.promisedDate === day) return {};
        return {
          orders: s.orders.map((o) => (o.code === code ? { ...o, promisedDate: day } : o)),
          audit: [auditEntry(`Entrega reprogramada al ${formatDate(day)}`, code), ...s.audit].slice(0, 80),
        };
      });
      return result;
    },
    moveProduction: (code, to) => {
      let error: string | null = "No se encontró el pedido.";
      const order = get().orders.find((o) => o.code === code);
      if (!order) return error;
      const m = productionMove(order, to);
      if (!m.ok) return m.error;
      const label = PRODUCTION_COLUMNS.find((c) => c.id === to)!.label;
      if (m.status !== order.status) {
        error = move(set, code, m.status, "admin", () => (m.stage ? { stage: m.stage } : {}), `Producción: ${label}`) ? null : "Esa transición no corresponde al estado actual del pedido.";
      } else {
        set((s) => ({ orders: s.orders.map((o) => (o.code === code ? { ...o, stage: m.stage } : o)), audit: [auditEntry(`Producción: ${label}`, code), ...s.audit].slice(0, 80) }));
        error = null;
      }
      return error;
    },
  };
}
