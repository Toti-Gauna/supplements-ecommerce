"use client";
import type { CartLine } from "@/demo/engine/cart-types";
import type { OrderStatus } from "@/demo/engine/orders";
import { quoteLines } from "@/demo/engine/pricing";
import type { PotOrder } from "@/demo/engine/repurchase";
import { DEMO_DELIVERED_TOKEN } from "@/demo/fixtures/commerce";
import { deliveredSampleOrder } from "@/demo/fixtures/tracking";
import { useCheckout } from "@/stores/checkout";
import { useShopOrder } from "../order/useShopOrder";

export interface AccountOrder extends PotOrder {
  total: number;
  /** Link de seguimiento. */
  href: string;
}

const lineTotal = (lines: CartLine[]) => quoteLines(lines).reduce((n, q) => n + q.lineTotal, 0);

/**
 * Pedidos de la cuenta demo, del más nuevo al más viejo: el que se compró en este navegador (con el estado que tiene
 * en el panel) y el entregado de muestra. Alimentan "Mis pedidos" y los potes de "Mi box".
 */
export function useAccountOrders(): AccountOrder[] {
  const last = useCheckout((s) => s.lastOrder);
  const tracked = useShopOrder(last?.code);
  const sample = deliveredSampleOrder;
  const orders: AccountOrder[] = [{ code: sample.code, createdAt: sample.createdAt, promisedDate: sample.promisedDate, status: sample.status, lines: sample.lines, total: lineTotal(sample.lines), href: `/pedido/${DEMO_DELIVERED_TOKEN}/` }];
  if (last?.lines.length) {
    const status: OrderStatus = tracked?.status ?? "PENDING_PAYMENT";
    orders.unshift({ code: last.code, createdAt: last.createdAt, promisedDate: tracked?.promisedDate ?? last.promisedDate, status, lines: last.lines, total: last.quote.total, href: `/pedido/${last.token}/` });
  }
  return orders;
}
