import { isPaidOrLater } from "../engine/orders";
import { addDays } from "../engine/workdays";
import { toDayKey } from "@/lib/date";
import type { AdminOrder } from "./types";

/**
 * Pedidos agrupados por lo que hay que hacer (R4b, Pedidos unificado): cobrar, armar y posventa. Puro: las pantallas
 * solo muestran estos grupos. El cobro nunca se da por hecho con un comprobante: solo "Pagado" (o después) cuenta.
 */

const byPromise = (a: AdminOrder, b: AdminOrder) => (a.promisedDate ?? "9999").localeCompare(b.promisedDate ?? "9999") || a.createdAt.localeCompare(b.createdAt);

export type CollectFilter = "todo" | "review" | "waiting" | "done";

export interface CollectGroups {
  /** Comprobante subido que espera tu revisión (el pedido sigue sin pagar). */
  review: AdminOrder[];
  /** Sin pagar: sin comprobante, con el comprobante rechazado o esperando a Mercado Pago. */
  waiting: AdminOrder[];
  /** Comprobantes que ya aprobaste o rechazaste a mano (lo último primero). */
  done: AdminOrder[];
}

export function collectGroups(orders: AdminOrder[]): CollectGroups {
  return {
    review: orders.filter((o) => o.status === "PAYMENT_REVIEW").sort(byPromise),
    waiting: orders.filter((o) => o.status === "PENDING_PAYMENT").sort(byPromise),
    done: orders.filter((o) => o.proof && o.proof.status !== "IN_REVIEW").sort((a, b) => b.proof!.receivedAt.localeCompare(a.proof!.receivedAt)),
  };
}

/** La fila de revisión: primero los comprobantes (el cliente ya pagó y espera), después lo que falta pagar. */
export function collectQueue(groups: CollectGroups, filter: CollectFilter): AdminOrder[] {
  if (filter === "done") return groups.done;
  if (filter === "review") return groups.review;
  if (filter === "waiting") return groups.waiting;
  return [...groups.review, ...groups.waiting];
}

/** Lo que falta cobrar, en pesos: un comprobante en revisión todavía no es plata cobrada. */
export const amountToCollect = (orders: AdminOrder[]) => orders.filter((o) => !isPaidOrLater(o.status) && (o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_REVIEW")).reduce((s, o) => s + o.total, 0);

/** Paso del armado: 1 = juntar los potes (pagado o armando), 2 = controlar lote y vencimiento; null si no se arma. */
export type PackStep = 1 | 2;

export function packStep(o: Pick<AdminOrder, "status" | "stage">): PackStep | null {
  if (o.status === "PAID") return 1;
  if (o.status === "IN_PRODUCTION") return o.stage === "lot-check" ? 2 : 1;
  return null;
}

export type PackFilter = "todo" | "juntar" | "controlar";

/** Para armar: pagados y en preparación, el que sale antes primero (los atrasados quedan arriba solos). */
export function packQueue(orders: AdminOrder[], filter: PackFilter = "todo"): AdminOrder[] {
  const step = filter === "juntar" ? 1 : filter === "controlar" ? 2 : null;
  return orders.filter((o) => { const s = packStep(o); return s !== null && (step === null || s === step); }).sort(byPromise);
}

/** Día en que se entregó (el cambio a Entregado del historial; si no está, la fecha comprometida). */
export function deliveredOn(o: AdminOrder): string | undefined {
  const entry = [...o.log].reverse().find((l) => l.to === "DELIVERED");
  return entry ? toDayKey(entry.at) : o.promisedDate;
}

export const RECENT_DELIVERY_DAYS = 30;

export interface AfterSaleGroups {
  /** Salió con el cadete o el correo: falta confirmar que llegó. */
  onTheWay: AdminOrder[];
  /** Entregados en los últimos 30 días: preguntarle cómo le fue. */
  delivered: AdminOrder[];
  /** Con un reclamo abierto sobre el pedido. */
  inClaim: AdminOrder[];
}

export function afterSaleGroups(orders: AdminOrder[], today: string): AfterSaleGroups {
  const since = addDays(today, -RECENT_DELIVERY_DAYS);
  const recent = (o: AdminOrder) => { const d = deliveredOn(o); return !!d && d >= since && d <= today; };
  return {
    onTheWay: orders.filter((o) => o.status === "SHIPPED").sort(byPromise),
    delivered: orders.filter((o) => o.status === "DELIVERED" && recent(o)).sort((a, b) => (deliveredOn(b) ?? "").localeCompare(deliveredOn(a) ?? "")),
    inClaim: orders.filter((o) => o.status === "IN_CLAIM"),
  };
}
