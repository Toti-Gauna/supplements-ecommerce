import { salesSummary } from "../admin/metrics";
import { lowStockRows } from "../admin/stock";
import { nextCadeteDay, takesCadeteSlot, usesCadete } from "./delivery";
import type { TodaySnapshot } from "./today";
import { inReview, toPack } from "./today-orders";

/**
 * El marcador de "Hoy en tu tienda" (R4a). Cada número sale de una regla simple:
 * - Vendido hoy: pedidos creados hoy que ya están pagados o más adelante (`salesSummary`: la misma regla y la
 *   misma semana que el gráfico de ventas).
 *   Un comprobante en revisión NO suma: no está cobrado hasta que el dueño lo aprueba.
 * - Por cobrar: pedidos pendientes de pago o con el comprobante en revisión (nada de eso está cobrado todavía).
 * - Para armar: pagados o en preparación; cuántos tienen la fecha de despacho vencida.
 * - Sale hoy: pedidos pagados del cadete con fecha de hoy que todavía no salieron, aparte los retiros de hoy; el cupo
 *   usado del cadete y su próximo día con lugar para lo que entre hoy (motor de despachos).
 * - Stock en riesgo: variantes visibles sin stock o con 3 unidades o menos (las mismas de "Para reponer").
 */
export interface TodayScore {
  sold: { amount: number; orders: number; week: number };
  toCollect: { amount: number; orders: number; receipts: number; receiptsAmount: number };
  toPack: { count: number; late: number };
  leaving: { cadete: number; pickup: number; slotsUsed: number; capacity: number; nextCadeteDay: string };
  stockRisk: { count: number; out: number };
}

const sum = (list: { total: number }[]) => list.reduce((s, o) => s + o.total, 0);

export function todayScore(snap: TodaySnapshot, today: string): TodayScore {
  const { orders } = snap;
  const sales = salesSummary(orders, today);
  const unpaid = orders.filter((o) => o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_REVIEW");
  const receipts = orders.filter(inReview);
  const packing = orders.filter(toPack);
  const dueToday = orders.filter((o) => o.promisedDate === today);
  const going = dueToday.filter((o) => ["PAID", "IN_PRODUCTION", "READY"].includes(o.status));
  const low = lowStockRows(snap.data.products, snap.data.categories);
  return {
    sold: { amount: sales.today, orders: sales.days.at(-1)?.orders ?? 0, week: sales.week },
    toCollect: { amount: sum(unpaid), orders: unpaid.length, receipts: receipts.length, receiptsAmount: sum(receipts) },
    toPack: { count: packing.length, late: packing.filter((o) => o.promisedDate && o.promisedDate < today).length },
    leaving: {
      cadete: going.filter(usesCadete).length,
      pickup: going.filter((o) => o.fulfillment === "PICKUP").length,
      slotsUsed: dueToday.filter(takesCadeteSlot).length,
      capacity: Math.max(1, snap.workshop.settings.dailyCapacity),
      nextCadeteDay: nextCadeteDay(today, orders, snap.workshop.settings),
    },
    stockRisk: { count: low.length, out: low.filter((r) => r.state === "out").length },
  };
}
