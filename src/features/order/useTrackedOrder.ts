"use client";
import type { CartLine } from "@/demo/engine/cart-types";
import { promiseFor } from "@/demo/engine/delivery";
import type { OrderStatus } from "@/demo/engine/orders";
import { stageDates, trackedStatus } from "@/demo/engine/tracking";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEMO_ORDER_CODE } from "@/demo/fixtures/commerce";
import { sampleTrackedOrder } from "@/demo/fixtures/tracking";
import type { FulfillmentType } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useCheckout } from "@/stores/checkout";
import { useShopOrder } from "./useShopOrder";

export interface TrackedOrder {
  code: string;
  lines: CartLine[];
  /** Pedido de ejemplo: en este navegador todavía no se compró nada. */
  sample: boolean;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  /** Día de despacho (AAAA-MM-DD). */
  promisedDate: string;
  /** Cuándo llegó a cada etapa del seguimiento (ISO), desde su historial. */
  dates: (string | undefined)[];
}

/**
 * El pedido que se sigue: el último que se compró en este navegador, con el estado, el historial y la fecha de
 * despacho que tiene en el panel; si no hay, el de ejemplo, con la fecha que calcula hoy el calendario de despachos.
 */
export function useTrackedOrder(): TrackedOrder {
  const last = useCheckout((s) => s.lastOrder);
  const inPanel = useShopOrder(last?.code);
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  const promise = (lines: CartLine[], fulfillment: FulfillmentType) => promiseFor(lines, DEMO_TODAY, orders, settings, { fulfillment, exceptCode: DEMO_ORDER_CODE }).day;
  if (last?.lines.length) {
    const status = trackedStatus(inPanel?.status ?? "PENDING_PAYMENT", inPanel?.prevStatus);
    const log = inPanel?.log ?? [{ at: last.createdAt, to: "PENDING_PAYMENT" as const }];
    const promisedDate = inPanel?.promisedDate ?? last.promisedDate ?? promise(last.lines, last.fulfillment);
    return { code: last.code, lines: last.lines, sample: false, status, fulfillment: last.fulfillment, promisedDate, dates: stageDates(log, status) };
  }
  const { lines, fulfillment, log } = sampleTrackedOrder;
  const status = log.at(-1)!.to;
  return { code: DEMO_ORDER_CODE, lines, sample: true, status, fulfillment, promisedDate: promise(lines, fulfillment), dates: stageDates(log, status) };
}
