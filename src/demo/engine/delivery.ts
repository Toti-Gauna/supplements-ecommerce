import type { WorkshopSettings } from "../fixtures/workshop";
import type { FulfillmentType, Product, Variant } from "../types";
import type { CartLine } from "./cart-types";
import { getProduct } from "./catalog";
import type { OrderStatus } from "./orders";
import { addWorkdays, nextWorkday, type WorkCalendar } from "./workdays";

/**
 * Despachos (Fase 7). Cada pedido tiene su fecha de despacho: sale con el cadete, va al correo o queda listo para
 * retirar. El plazo cuenta días hábiles de preparación. Solo el cadete de Mar del Plata tiene cupo por día: cuando
 * un día se llena, el pedido pasa al siguiente día hábil con lugar. Retiro y envío al país no tienen cupo.
 */

/** Lo que está en stock sale al día hábil siguiente. */
export const READY_STOCK_DAYS = 1;
/** Plazo si un producto a pedido (encargo al proveedor) no tiene plazo cargado. */
export const DEFAULT_MAKE_DAYS = 3;

/** Estados que ocupan un lugar del cadete en su fecha (la reserva cuenta desde el checkout hasta que sale). */
export const CAPACITY_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "IN_PRODUCTION", "READY"];

export interface ScheduledOrder {
  code: string;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  promisedDate?: string;
  lines: CartLine[];
}

/** Lo reparte el cadete en Mar del Plata: es la única entrega con cupo por día. */
export const usesCadete = (o: { fulfillment: FulfillmentType }) => o.fulfillment === "LOCAL_DELIVERY";

/** Ocupa un lugar del cadete en su fecha de despacho. */
export const takesCadeteSlot = (o: Pick<ScheduledOrder, "status" | "fulfillment">) => usesCadete(o) && CAPACITY_STATUSES.includes(o.status);

export function calendarOf(settings: WorkshopSettings): WorkCalendar {
  return { closedWeekdays: settings.closedWeekdays, closures: settings.closures };
}

/** Días hábiles de preparación de una línea: plazo de la variante, del producto (encargo) o el de stock. */
export function lineLeadDays(product: Product, variant: Variant | undefined): number {
  if (variant?.leadDays != null) return variant.leadDays;
  if (!variant || variant.stock < 0) return product.madeToOrderDays || DEFAULT_MAKE_DAYS;
  return READY_STOCK_DAYS;
}

/** El pedido sale cuando está lista su línea más lenta. */
export function orderLeadDays(lines: CartLine[]): number {
  return Math.max(READY_STOCK_DAYS, ...lines.map((l) => {
    const p = getProduct(l.productSlug);
    return p ? lineLeadDays(p, p.variants.find((v) => v.id === l.variantId)) : READY_STOCK_DAYS;
  }));
}

/** Pedidos del cadete por día (solo los que ocupan lugar). */
export function loadByDay(orders: ScheduledOrder[], exceptCode?: string): Map<string, number> {
  const load = new Map<string, number>();
  for (const o of orders) {
    if (!o.promisedDate || o.code === exceptCode || !takesCadeteSlot(o)) continue;
    load.set(o.promisedDate, (load.get(o.promisedDate) ?? 0) + 1);
  }
  return load;
}

export interface Availability {
  /** Primer día hábil posible según el plazo, sin mirar el cupo del cadete. */
  earliest: string;
  /** Primer día hábil con lugar (para retiro y correo, el mismo `earliest`). */
  day: string;
  /** Días hábiles que se saltearon porque el cadete ya estaba completo. */
  fullDays: string[];
}

/** Primer día hábil desde `earliest` (incluido) en el que el cadete todavía tiene lugar. */
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

/** Día de despacho desde `earliest`: el cadete mira su cupo; retiro y correo, solo que sea hábil. */
function dispatchDay(earliest: string, fulfillment: FulfillmentType, load: Map<string, number>, settings: WorkshopSettings): Availability {
  if (usesCadete({ fulfillment })) return firstAvailableDay(earliest, load, settings);
  const day = nextWorkday(earliest, calendarOf(settings), true);
  return { earliest: day, day, fullDays: [] };
}

/** Fecha de despacho que se le promete a un pedido que entra hoy. */
export function promiseFor(lines: CartLine[], today: string, orders: ScheduledOrder[], settings: WorkshopSettings, opts: { fulfillment: FulfillmentType; exceptCode?: string }): Availability & { leadDays: number } {
  const leadDays = orderLeadDays(lines);
  const earliest = addWorkdays(today, leadDays, calendarOf(settings));
  return { leadDays, ...dispatchDay(earliest, opts.fulfillment, loadByDay(orders, opts.exceptCode), settings) };
}

/** Primera fecha con lugar para reprogramar: lo que ya se está preparando o está listo solo necesita un día hábil. */
export function nextFreeDayFor(order: ScheduledOrder, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): string {
  const prepared = order.status === "IN_PRODUCTION" || order.status === "READY";
  const earliest = addWorkdays(today, prepared ? READY_STOCK_DAYS : orderLeadDays(order.lines), calendarOf(settings));
  return dispatchDay(earliest, order.fulfillment, loadByDay(orders, order.code), settings).day;
}

/** Estimación para la ficha de la tienda: `earliest` es el despacho (retiro y correo) y `day`, el primer día del cadete. */
export function estimateForProduct(product: Product, variant: Variant | undefined, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): Availability & { leadDays: number } {
  const leadDays = lineLeadDays(product, variant);
  const earliest = addWorkdays(today, leadDays, calendarOf(settings));
  return { leadDays, ...firstAvailableDay(earliest, loadByDay(orders), settings) };
}

export interface DeliveryWindow {
  id: "pickup" | "local" | "shipping";
  from: string;
  to: string;
}

/** Ventanas de entrega desde el despacho, en días hábiles. El cadete entrega en el día que tiene lugar. */
export function deliveryWindows(ready: string, settings: WorkshopSettings, cadeteDay = ready): DeliveryWindow[] {
  const cal = calendarOf(settings);
  const plus = (n: number) => addWorkdays(ready, n, cal);
  return [
    { id: "pickup", from: ready, to: plus(1) },
    { id: "local", from: cadeteDay, to: cadeteDay },
    { id: "shipping", from: plus(3), to: plus(7) },
  ];
}

/** Despachos pendientes (todavía no salieron) comprometidos entre dos días, ambos incluidos. */
export function pendingDeliveries(orders: ScheduledOrder[], from: string, to: string): number {
  return orders.filter((o) => o.promisedDate && o.promisedDate >= from && o.promisedDate <= to && CAPACITY_STATUSES.includes(o.status)).length;
}
