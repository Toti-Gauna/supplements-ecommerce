"use client";
import type { CartLine } from "@/demo/engine/cart-types";
import { promiseFor } from "@/demo/engine/delivery";
import type { OrderStatus } from "@/demo/engine/orders";
import { stageDates, trackedStatus } from "@/demo/engine/tracking";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEMO_DELIVERED_TOKEN, DEMO_ORDER_CODE } from "@/demo/fixtures/commerce";
import { deliveredSampleOrder, sampleTrackedOrder } from "@/demo/fixtures/tracking";
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
  /** Lote que confirmó el control de lote del panel, por línea (solo después de ese control). */
  lotCheck?: Record<string, string>;
  /** Total que se pagó (con descuentos y envío), si es un pedido hecho en este navegador. */
  total?: number;
}

/**
 * El pedido que se sigue según el link: el entregado de la cuenta demo (VOL-DEMO-0000) o el último que se compró en
 * este navegador, con el estado, el historial, la fecha y los lotes que tiene en el panel; si no hay compra, el de
 * ejemplo, con la fecha que calcula hoy el calendario de despachos.
 */
export function useTrackedOrder(token: string): TrackedOrder {
  const last = useCheckout((s) => s.lastOrder);
  const inPanel = useShopOrder(last?.code);
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  const promise = (lines: CartLine[], fulfillment: FulfillmentType) => promiseFor(lines, DEMO_TODAY, orders, settings, { fulfillment, exceptCode: DEMO_ORDER_CODE }).day;
  if (token === DEMO_DELIVERED_TOKEN) {
    const o = deliveredSampleOrder;
    return { code: o.code, lines: o.lines, sample: false, status: o.status, fulfillment: o.fulfillment, promisedDate: o.promisedDate, dates: stageDates(o.log, o.status), lotCheck: o.lotCheck };
  }
  if (last?.lines.length) {
    const status = trackedStatus(inPanel?.status ?? "PENDING_PAYMENT", inPanel?.prevStatus);
    const log = inPanel?.log ?? [{ at: last.createdAt, to: "PENDING_PAYMENT" as const }];
    const promisedDate = inPanel?.promisedDate ?? last.promisedDate ?? promise(last.lines, last.fulfillment);
    return { code: last.code, lines: last.lines, sample: false, status, fulfillment: last.fulfillment, promisedDate, dates: stageDates(log, status), lotCheck: inPanel?.lotCheck, total: last.quote.total };
  }
  const { lines, fulfillment, log } = sampleTrackedOrder;
  const status = log.at(-1)!.to;
  return { code: DEMO_ORDER_CODE, lines, sample: true, status, fulfillment, promisedDate: promise(lines, fulfillment), dates: stageDates(log, status) };
}
