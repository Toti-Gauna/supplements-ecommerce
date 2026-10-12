import type { OrderStatus } from "../engine/orders";
import type { AdminOrder } from "./types";

/** Pestañas de la tabla de pedidos: agrupan estados por lo que Volta tiene que hacer. */
export const ORDER_TABS = [
  { id: "all", label: "Todos", statuses: [] as OrderStatus[] },
  { id: "to-collect", label: "Por cobrar", statuses: ["PENDING_PAYMENT", "PAYMENT_REVIEW"] as OrderStatus[] },
  { id: "to-make", label: "Por preparar", statuses: ["PAID"] as OrderStatus[] },
  { id: "making", label: "En preparación", statuses: ["IN_PRODUCTION"] as OrderStatus[] },
  { id: "ready", label: "Listos", statuses: ["READY"] as OrderStatus[] },
  { id: "shipped", label: "Enviados", statuses: ["SHIPPED"] as OrderStatus[] },
  { id: "done", label: "Entregados", statuses: ["DELIVERED"] as OrderStatus[] },
  { id: "issues", label: "Reclamos y cancelados", statuses: ["IN_CLAIM", "RETURNED", "CANCELLED"] as OrderStatus[] },
] as const;

export type OrderTabId = (typeof ORDER_TABS)[number]["id"];

export function tabForStatus(status: string | null): OrderTabId {
  return ORDER_TABS.find((t) => t.statuses.includes(status as OrderStatus))?.id ?? "all";
}

export function inTab(order: AdminOrder, tab: OrderTabId): boolean {
  const t = ORDER_TABS.find((x) => x.id === tab)!;
  return t.statuses.length === 0 || t.statuses.includes(order.status);
}

/** Pedido con fecha de despacho vencida que todavía no se terminó de preparar. */
export function isLate(order: AdminOrder, today: string): boolean {
  return !!order.promisedDate && order.promisedDate < today && ["PAID", "IN_PRODUCTION"].includes(order.status);
}

/** Estados a los que se puede pasar en lote desde la tabla (siempre validados por canTransition). */
export const BULK_TARGETS: OrderStatus[] = ["IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];
