import type { WorkshopSettings } from "../fixtures/workshop";
import type { Product, Variant } from "../types";
import type { CartLine } from "./cart-types";
import { getProduct } from "./catalog";
import type { OrderStatus } from "./orders";
import { addWorkdays, closureFor, nextWorkday, type WorkCalendar } from "./workdays";

/**
 * Plazos y capacidad del taller (pedido de Ignacio, fuera de la especificación). Un pedido ocupa un lugar en el
 * día comprometido; cuando el día se llena, la próxima fecha disponible pasa al siguiente día hábil con lugar.
 */

/** Lo que está en stock y no se personaliza sale al día hábil siguiente. */
export const READY_STOCK_DAYS = 1;
/** Plazo si un producto a pedido no tiene plazo cargado. */
export const DEFAULT_MAKE_DAYS = 3;

/** Estados que ocupan un lugar del taller en su fecha comprometida (la reserva cuenta desde el checkout). */
export const CAPACITY_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "IN_PRODUCTION"];

export interface ScheduledOrder {
  code: string;
  status: OrderStatus;
  promisedDate?: string;
  lines: CartLine[];
}

export function calendarOf(settings: WorkshopSettings): WorkCalendar {
  return { closedWeekdays: settings.closedWeekdays, closures: settings.closures };
}

/** Días hábiles de fabricación de una línea: plazo de la variante, del producto o el de stock. */
export function lineLeadDays(product: Product, variant: Variant | undefined, personalized: boolean): number {
  if (variant?.leadDays != null) return variant.leadDays;
  if (personalized || !variant || variant.stock < 0) return product.madeToOrderDays || DEFAULT_MAKE_DAYS;
  return READY_STOCK_DAYS;
}

/** El pedido está listo cuando está lista su línea más lenta. */
export function orderLeadDays(lines: CartLine[]): number {
  return Math.max(READY_STOCK_DAYS, ...lines.map((l) => {
    const p = getProduct(l.productSlug);
    return p ? lineLeadDays(p, p.variants.find((v) => v.id === l.variantId), !!l.personalization) : READY_STOCK_DAYS;
  }));
}

/** Pedidos comprometidos por día (solo los que ocupan lugar). */
export function loadByDay(orders: ScheduledOrder[], exceptCode?: string): Map<string, number> {
  const load = new Map<string, number>();
  for (const o of orders) {
    if (!o.promisedDate || o.code === exceptCode || !CAPACITY_STATUSES.includes(o.status)) continue;
    load.set(o.promisedDate, (load.get(o.promisedDate) ?? 0) + 1);
  }
  return load;
}

export interface Availability {
  /** Primer día hábil posible según el plazo, sin mirar la capacidad. */
  earliest: string;
  /** Primer día hábil con lugar. */
  day: string;
  /** Días hábiles que se saltearon por estar completos. */
  fullDays: string[];
}

/** Primer día hábil desde `earliest` (incluido) que todavía tiene lugar. */
export function firstAvailableDay(earliest: string, load: Map<string, number>, settings: WorkshopSettings): Availability {
  const cal = calendarOf(settings);
  const capacity = Math.max(1, settings.dailyCapacity);
  const fullDays: string[] = [];
  let day = nextWorkday(earliest, cal, true);
  for (let i = 0; i < 365 && (load.get(day) ?? 0) >= capacity; i++) {
    fullDays.push(day);
    day = nextWorkday(day, cal);
  }
  return { earliest: nextWorkday(earliest, cal, true), day, fullDays };
}

/** Fecha que se le promete a un pedido que entra hoy (o que se paga hoy). */
export function promiseFor(lines: CartLine[], today: string, orders: ScheduledOrder[], settings: WorkshopSettings, exceptCode?: string): Availability & { leadDays: number } {
  const leadDays = orderLeadDays(lines);
  const earliest = addWorkdays(today, leadDays, calendarOf(settings));
  return { leadDays, ...firstAvailableDay(earliest, loadByDay(orders, exceptCode), settings) };
}

/** Primera fecha con lugar para reprogramar un pedido: lo que ya está en producción o listo solo necesita un día hábil. */
export function nextFreeDayFor(order: ScheduledOrder, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): string {
  const cal = calendarOf(settings);
  // Un pedido listo no ocupa lugar del taller: solo hace falta un día hábil.
  if (order.status === "READY") return addWorkdays(today, READY_STOCK_DAYS, cal);
  const earliest = addWorkdays(today, order.status === "IN_PRODUCTION" ? READY_STOCK_DAYS : orderLeadDays(order.lines), cal);
  return firstAvailableDay(earliest, loadByDay(orders, order.code), settings).day;
}

/** Estimación para la ficha de la tienda, antes de agregar al carrito. */
export function estimateForProduct(product: Product, variant: Variant | undefined, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): Availability & { leadDays: number } {
  const leadDays = lineLeadDays(product, variant, !!product.personalization);
  const earliest = addWorkdays(today, leadDays, calendarOf(settings));
  return { leadDays, ...firstAvailableDay(earliest, loadByDay(orders), settings) };
}

export interface DeliveryWindow {
  id: "pickup" | "local" | "shipping";
  from: string;
  to: string;
}

/** Ventanas de entrega desde el día en que el pedido está listo, en días hábiles. */
export function deliveryWindows(ready: string, settings: WorkshopSettings): DeliveryWindow[] {
  const cal = calendarOf(settings);
  const plus = (n: number) => (n === 0 ? ready : addWorkdays(ready, n, cal));
  return [
    { id: "pickup", from: plus(0), to: plus(1) },
    { id: "local", from: plus(1), to: plus(2) },
    { id: "shipping", from: plus(3), to: plus(7) },
  ];
}

export interface RescheduleCheck {
  ok: boolean;
  error?: string;
  warnings: string[];
  /** El día ya estaba completo: mover el pedido lo sobrecarga. */
  overload?: boolean;
  /** Por qué no se puede: para marcar el día mientras se arrastra. */
  blocked?: "fixed" | "past" | "closed" | "full";
}

/** Entregas pendientes (sin salir del taller) comprometidas entre dos días, ambos incluidos. */
export function pendingDeliveries(orders: ScheduledOrder[], from: string, to: string): number {
  return orders.filter((o) => o.promisedDate && o.promisedDate >= from && o.promisedDate <= to && (CAPACITY_STATUSES.includes(o.status) || o.status === "READY")).length;
}

/** Lo que ya salió del taller o se cerró no se reprograma. */
export const FIXED_DATE_STATUSES: OrderStatus[] = ["SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "IN_CLAIM"];

export function canReschedule(status: OrderStatus): boolean {
  return !FIXED_DATE_STATUSES.includes(status);
}

/** Valida mover un pedido a otro día: nunca a un día pasado ni cerrado; avisa si queda sobrecargado o antes del plazo. */
export function checkReschedule(order: ScheduledOrder, day: string, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): RescheduleCheck {
  if (!canReschedule(order.status)) return { ok: false, error: "Este pedido ya salió del taller o está cerrado: su fecha no se reprograma.", warnings: [], blocked: "fixed" };
  if (day < today) return { ok: false, error: "No se puede comprometer una fecha que ya pasó.", warnings: [], blocked: "past" };
  const closed = closureFor(day, calendarOf(settings));
  if (closed) return { ok: false, error: `${closed.reason}: el taller no trabaja ese día.`, warnings: [], blocked: "closed" };
  const warnings: string[] = [];
  const taken = loadByDay(orders, order.code).get(day) ?? 0;
  const overload = CAPACITY_STATUSES.includes(order.status) && taken >= settings.dailyCapacity && order.promisedDate !== day;
  if (overload) warnings.push(`Ese día ya tenía ${taken} de ${settings.dailyCapacity} pedidos: queda sobrecargado.`);
  if (order.status !== "IN_PRODUCTION" && CAPACITY_STATUSES.includes(order.status)) {
    const lead = orderLeadDays(order.lines);
    if (day < addWorkdays(today, lead, calendarOf(settings))) warnings.push(`Queda antes del plazo de fabricación (${lead} ${lead === 1 ? "día hábil" : "días hábiles"}).`);
  }
  return { ok: true, warnings, overload };
}

/**
 * Soltar un pedido arrastrado (8.3.15): además de las reglas de `checkReschedule`, un día completo lo rechaza con el
 * motivo. Sobrecargar un día queda para "Reprogramar", donde se confirma a propósito.
 */
export function checkDrop(order: ScheduledOrder, day: string, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): RescheduleCheck {
  const r = checkReschedule(order, day, today, orders, settings);
  if (!r.ok || !r.overload) return r;
  const taken = loadByDay(orders, order.code).get(day) ?? 0;
  return { ok: false, error: `Ese día ya está completo (${taken} de ${settings.dailyCapacity} pedidos). Para sobrecargarlo, usá Reprogramar.`, warnings: [], blocked: "full" };
}
