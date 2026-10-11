import { isPaidOrLater, ORDER_STATUSES, type OrderStatus } from "../engine/orders";
import { toDayKey } from "@/lib/date";
import type { AdminOrder } from "./types";

export interface DaySales {
  day: string;
  amount: number;
  orders: number;
  /** Códigos de los pedidos que suman ese día (barras, tabla y detalle salen de acá: siempre coinciden). */
  codes: string[];
}

/** Ventas de MUESTRA: pedidos pagados o posteriores, contados contra la fecha de referencia de la demo. */
export function salesSummary(orders: AdminOrder[], today: string) {
  const paid = orders.filter((o) => isPaidOrLater(o.status) || (o.status === "IN_CLAIM" && o.prevStatus && isPaidOrLater(o.prevStatus)));
  const base = new Date(`${today}T12:00:00-03:00`).getTime();
  const days: DaySales[] = Array.from({ length: 7 }, (_, i) => {
    const day = toDayKey(new Date(base - (6 - i) * 86_400_000).toISOString());
    const list = paid.filter((o) => toDayKey(o.createdAt) === day).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { day, amount: list.reduce((s, o) => s + o.total, 0), orders: list.length, codes: list.map((o) => o.code) };
  });
  const sumSince = (n: number) => {
    const from = toDayKey(new Date(base - (n - 1) * 86_400_000).toISOString());
    return paid.filter((o) => toDayKey(o.createdAt) >= from && toDayKey(o.createdAt) <= today).reduce((s, o) => s + o.total, 0);
  };
  const prevFrom = toDayKey(new Date(base - 13 * 86_400_000).toISOString());
  const prevTo = toDayKey(new Date(base - 7 * 86_400_000).toISOString());
  const prevWeek = paid.filter((o) => toDayKey(o.createdAt) >= prevFrom && toDayKey(o.createdAt) <= prevTo).reduce((s, o) => s + o.total, 0);
  const avgTicket = paid.length ? Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length) : 0;
  return { days, today: sumSince(1), week: sumSince(7), month: sumSince(30), prevWeek, avgTicket, paidCount: paid.length };
}

/** Variación porcentual (null si no hay base de comparación). */
export function delta(current: number, previous: number): number | null {
  return previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
}

/** Productos más pedidos (unidades) entre pedidos no cancelados. */
export function topProducts(orders: AdminOrder[], n = 5): { slug: string; units: number }[] {
  const units = new Map<string, number>();
  for (const o of orders) {
    if (o.status === "CANCELLED") continue;
    for (const l of o.lines) units.set(l.productSlug, (units.get(l.productSlug) ?? 0) + l.quantity);
  }
  return [...units].map(([slug, u]) => ({ slug, units: u })).sort((a, b) => b.units - a.units || a.slug.localeCompare(b.slug)).slice(0, n);
}

export function countByStatus(orders: AdminOrder[]): Record<OrderStatus, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const o of orders) counts[o.status] += 1;
  return counts;
}

export function filterOrders(orders: AdminOrder[], f: { q: string; status: OrderStatus | "ALL"; from: string; to: string }): AdminOrder[] {
  const q = f.q.trim().toLowerCase();
  return orders
    .filter((o) => !q || o.code.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.includes(q))
    .filter((o) => f.status === "ALL" || o.status === f.status)
    .filter((o) => (!f.from || toDayKey(o.createdAt) >= f.from) && (!f.to || toDayKey(o.createdAt) <= f.to))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
