import { promiseFor } from "../engine/delivery";
import { checkReschedule, type RescheduleCheck } from "../engine/reschedule";
import { canTransition, STATUS_LABEL, type OrderStatus, type TransitionTrigger } from "../engine/orders";
import { DEMO_TODAY } from "../fixtures/admin-orders";
import type { DemoOrder } from "@/stores/checkout";
import { formatDate } from "@/lib/date";
import { auditEntry, type AdminData } from "./defaults";
import type { AdminOrder } from "./types";
import { consumeMaterials, orderNeeds } from "./workshop/materials";
import { emailsForOrder, pushOutbox, triggersForNewOrder, triggersForTransition, type OutboxEmail } from "./emails/triggers";
import { missingLots, prepLabel, prepMove, type PrepColumn } from "./workshop/preparation";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

const INVALID = "Esa transición no corresponde al estado actual del pedido.";

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
  /** Mueve un pedido en el tablero de preparación; devuelve el motivo si no se puede. */
  movePreparation: (code: string, to: PrepColumn) => string | null;
  /** Control de lote: guarda el lote que sale de cada línea y pasa el pedido a Listo para despachar. */
  confirmLots: (code: string, lots: Record<string, string>) => string | null;
}

/**
 * Aplica una transición válida (spec 5.2) y registra historial + auditoría. Devuelve false si no corresponde.
 * Al empezar a prepararse desde "pagado" el pedido pasa a "Armando" (salvo otra etapa) y descuenta sus insumos de
 * embalaje. A "Listo" solo llega con el lote de cada línea confirmado.
 */
function move(set: Set, code: string, to: OrderStatus, trigger: TransitionTrigger, patch: (o: AdminOrder) => Partial<AdminOrder>, action: string): boolean {
  let ok = false;
  set((s) => {
    let materials = s.workshop.materials;
    let mails: OutboxEmail[] = [];
    const orders = s.orders.map((o) => {
      if (o.code !== code || !canTransition(o.status, to, { fulfillment: o.fulfillment, trigger, prevStatus: o.prevStatus })) return o;
      const prevStatus = to === "IN_CLAIM" ? o.status : o.status === "IN_CLAIM" ? null : o.prevStatus;
      const next: AdminOrder = { ...o, ...patch(o), status: to, prevStatus, log: [...o.log, { at: new Date().toISOString(), from: o.status, to, note: action }] };
      // Control de lote: sin el lote de cada línea confirmado, el pedido no queda listo.
      if (to === "READY" && o.status === "IN_PRODUCTION" && missingLots(next).length) return o;
      ok = true;
      if (to === "IN_PRODUCTION") next.stage ??= "picking";
      // El embalaje se descuenta una sola vez: al empezar a preparar un pedido pagado (no al volver de un reclamo).
      if (to === "IN_PRODUCTION" && o.status === "PAID") materials = consumeMaterials(materials, orderNeeds(o.lines, s.workshop.recipes));
      // La etapa se conserva durante un reclamo para volver a la misma columna; se borra al salir de preparación.
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
          total: order.quote.total, notes: [], fromShop: true, promisedDate: promiseFor(order.lines, DEMO_TODAY, s.orders, s.workshop.settings, { fulfillment: order.fulfillment, exceptCode: order.code }).day, log: [{ at: order.createdAt, from: null, to: "PENDING_PAYMENT", note: "Checkout de demostración" }],
        };
        const mails = emailsForOrder(s.emails.templates, triggersForNewOrder(), created, order.createdAt);
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
    movePreparation: (code, to) => {
      const order = get().orders.find((o) => o.code === code);
      if (!order) return "No se encontró el pedido.";
      const m = prepMove(order, to);
      if (!m.ok) return m.error;
      const action = `Preparación: ${prepLabel(to)}`;
      if (m.status !== order.status) return move(set, code, m.status, "admin", () => (m.stage ? { stage: m.stage } : {}), action) ? null : INVALID;
      set((s) => ({ orders: s.orders.map((o) => (o.code === code ? { ...o, stage: m.stage } : o)), audit: [auditEntry(action, code), ...s.audit].slice(0, 80) }));
      return null;
    },
    confirmLots: (code, lots) => {
      const order = get().orders.find((o) => o.code === code);
      if (!order) return "No se encontró el pedido.";
      if (order.status !== "IN_PRODUCTION") return "Solo se controlan los lotes de un pedido en preparación.";
      if (missingLots({ ...order, lotCheck: lots }).length) return "Falta confirmar el lote de algún producto.";
      return move(set, code, "READY", "admin", () => ({ lotCheck: lots }), "Lotes controlados: listo para despachar") ? null : INVALID;
    },
  };
}
