import { isLate } from "@/demo/admin/order-groups";
import type { AdminOrder } from "@/demo/admin/types";
import { CAPACITY_STATUSES, canReschedule } from "@/demo/engine/delivery";
import { getProduct } from "@/demo/engine/catalog";
import type { OrderStatus } from "@/demo/engine/orders";
import { closureFor, type WorkCalendar } from "@/demo/engine/workdays";
import type { CalendarEvent } from "@/demo/fixtures/workshop";

/** Pedidos que se dibujan en el calendario: los que tienen fecha y no se cancelaron ni devolvieron. */
const HIDDEN: OrderStatus[] = ["CANCELLED", "RETURNED", "IN_CLAIM"];

export interface Entry {
  order: AdminOrder;
  day: string;
  late: boolean;
  /** Ocupa un lugar de la capacidad del día. */
  counts: boolean;
  movable: boolean;
  /** Quedó en un día que ahora está cerrado (8.3.14): hay que reprogramarlo. */
  blocked: boolean;
  summary: string;
}

export function orderSummary(order: AdminOrder): string {
  return order.lines.map((l) => `${l.quantity > 1 ? `${l.quantity} × ` : ""}${getProduct(l.productSlug)?.name ?? l.productSlug}`).join(", ");
}

export function calendarEntries(orders: AdminOrder[], today: string, cal: WorkCalendar): Entry[] {
  return orders
    .filter((o) => o.promisedDate && !HIDDEN.includes(o.status))
    .map((o) => {
      const day = o.promisedDate!, movable = canReschedule(o.status);
      return { order: o, day, late: isLate(o, today), counts: CAPACITY_STATUSES.includes(o.status), movable, blocked: movable && day >= today && !!closureFor(day, cal), summary: orderSummary(o) };
    })
    .sort((a, b) => a.day.localeCompare(b.day) || a.order.code.localeCompare(b.order.code));
}

export function byDay(entries: Entry[]): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>();
  for (const e of entries) map.set(e.day, [...(map.get(e.day) ?? []), e]);
  return map;
}

export function eventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]);
  return map;
}

export const firstName = (name: string) => name.split(" ")[0] ?? name;
