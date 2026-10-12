import { quoteCart } from "../engine/pricing";
import { defaultDemoData, type DemoData } from "../engine/source";
import type { OrderStatus } from "../engine/orders";
import { orderSeeds } from "../fixtures/admin-orders";
import { adminClaims, adminUsers } from "../fixtures/admin-people";
import { emailTemplates, type EmailTemplate } from "../fixtures/emails";
import { customerProfiles, type CustomerProfile } from "../fixtures/customers";
import { calendarEvents, materials, recipes, workshopSettings, type CalendarEvent, type Material, type Recipe, type WorkshopSettings } from "../fixtures/workshop";
import type { PriceUndo } from "./bulk-price";
import type { ImportSnapshot } from "./catalog-slice";
import type { AdminClaim, AdminOrder, AdminUser, AuditEntry, StatusLogEntry } from "./types";
import { emailsForOrder, OUTBOX_LIMIT, triggersForNewOrder, triggersForTransition, type OutboxEmail } from "./emails/triggers";

export interface AdminData {
  data: DemoData;
  orders: AdminOrder[];
  users: AdminUser[];
  claims: AdminClaim[];
  audit: AuditEntry[];
  /** Última importación de Excel, para deshacerla. */
  lastImport: ImportSnapshot | null;
  /** Último aumento masivo de precios, para deshacerlo. */
  lastPriceChange: PriceUndo | null;
  /** Taller: calendario y capacidad, insumos, recetas de costo y fichas de clientes (solo del panel). */
  workshop: WorkshopData;
  /** Emails automáticos: plantillas y bandeja de salida simulada (nada se envía). */
  emails: EmailsData;
}

export interface EmailsData {
  templates: EmailTemplate[];
  outbox: OutboxEmail[];
}

/** Historial de muestra: los emails que habrían salido con cada paso de los pedidos sembrados. */
function seedOutbox(orders: AdminOrder[], templates: EmailTemplate[]): OutboxEmail[] {
  const sent = orders.flatMap((o) => [
    ...emailsForOrder(templates, triggersForNewOrder(), o, o.createdAt),
    ...o.log.flatMap((l) => (l.from ? emailsForOrder(templates, triggersForTransition(l.from, l.to), { ...o, status: l.to }, l.at) : [])),
  ]);
  return sent.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, OUTBOX_LIMIT);
}

export interface WorkshopData {
  settings: WorkshopSettings;
  materials: Material[];
  recipes: Record<string, Recipe>;
  /** Fichas por email en minúsculas. */
  profiles: Record<string, CustomerProfile>;
  /** Tareas y notas del calendario (8.3.15). */
  events: CalendarEvent[];
}

const HAPPY_PATH: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];

function plusHours(iso: string, h: number): string {
  return new Date(new Date(iso).getTime() + h * 3_600_000).toISOString();
}

/** Línea de tiempo plausible hasta el estado actual del pedido de muestra. */
function seedLog(o: (typeof orderSeeds)[number]): StatusLogEntry[] {
  const manual = o.paymentMethod !== "CHECKOUT_PRO";
  const path = HAPPY_PATH.filter((s) => (s !== "PAYMENT_REVIEW" || manual) && (s !== "SHIPPED" || o.fulfillment !== "PICKUP"));
  const target = o.status === "IN_CLAIM" ? (o.prevStatus ?? "DELIVERED") : o.status === "CANCELLED" ? "PENDING_PAYMENT" : o.status;
  const steps = path.slice(0, path.indexOf(target) + 1);
  if (o.status === "CANCELLED" || o.status === "IN_CLAIM") steps.push(o.status);
  return steps.map((to, i) => ({ at: plusHours(o.createdAt, i === 0 ? 0 : i === 1 ? 0.5 : (i - 1) * 6), from: i === 0 ? null : steps[i - 1]!, to }));
}

export function defaultAdminData(): AdminData {
  const data = defaultDemoData();
  const orders: AdminOrder[] = orderSeeds.map((o) => ({
    ...o, notes: o.notes ?? [], log: o.log ?? seedLog(o),
    total: quoteCart(o.lines, { fulfillment: o.fulfillment, paymentMethod: o.paymentMethod }).total,
  }));
  const templates = structuredClone(emailTemplates);
  return {
    data,
    orders,
    users: structuredClone(adminUsers),
    claims: structuredClone(adminClaims),
    audit: [{ id: "a0", at: "2026-10-04T08:00:00-03:00", actor: "Sistema (demo)", action: "Datos de muestra cargados", entity: "Panel" }],
    lastImport: null,
    lastPriceChange: null,
    workshop: structuredClone({ settings: workshopSettings, materials, recipes, profiles: customerProfiles, events: calendarEvents }),
    emails: { templates, outbox: seedOutbox(orders, templates) },
  };
}

let seq = 0;
export function auditEntry(action: string, entity: string): AuditEntry {
  return { id: `a-${Date.now().toString(36)}-${++seq}`, at: new Date().toISOString(), actor: "Volta (demo)", action, entity };
}
