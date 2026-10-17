import type { StatusLogEntry } from "../admin/types";
import type { CartLine } from "../engine/cart-types";
import type { OrderStatus } from "../engine/orders";
import type { FulfillmentType, PaymentMethod } from "../types";
import { HOUSE_SHAKER_SLUG, ORDER_PREFIX } from "./house";

/**
 * Pedido ENTREGADO de la cuenta demo ("VOL-DEMO-0000" en Mi cuenta): una whey y una creatina que llegaron con el
 * cadete el 9/9. Es lo que alimenta "Mi box" (la whey se está por terminar) y su seguimiento muestra el lote y el
 * vencimiento que se registraron en el control de lote del panel.
 */
export interface SampleAccountOrder {
  code: string;
  createdAt: string;
  promisedDate: string;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  paymentMethod: PaymentMethod;
  lines: CartLine[];
  log: StatusLogEntry[];
  lotCheck: Record<string, string>;
}

export const deliveredSampleOrder: SampleAccountOrder = {
  code: `${ORDER_PREFIX}-DEMO-0000`,
  createdAt: "2026-09-08T10:12:00-03:00",
  promisedDate: "2026-09-09",
  status: "DELIVERED",
  fulfillment: "LOCAL_DELIVERY",
  paymentMethod: "BANK_TRANSFER",
  lines: [
    { id: "d1", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 },
    { id: "d2", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", quantity: 1 },
  ],
  log: [
    { at: "2026-09-08T10:12:00-03:00", from: null, to: "PENDING_PAYMENT" },
    { at: "2026-09-08T10:20:00-03:00", from: "PENDING_PAYMENT", to: "PAYMENT_REVIEW" },
    { at: "2026-09-08T11:05:00-03:00", from: "PAYMENT_REVIEW", to: "PAID" },
    { at: "2026-09-08T15:30:00-03:00", from: "PAID", to: "IN_PRODUCTION" },
    { at: "2026-09-08T17:45:00-03:00", from: "IN_PRODUCTION", to: "READY", note: "Lotes controlados: listo para despachar" },
    { at: "2026-09-09T16:10:00-03:00", from: "READY", to: "SHIPPED" },
    { at: "2026-09-09T19:25:00-03:00", from: "SHIPPED", to: "DELIVERED" },
  ],
  lotCheck: { d1: "VL-2606-W · vence 06/2027", d2: "VL-2607-C · vence 12/2027" },
};

/**
 * Pedido de ejemplo del seguimiento (`/pedido/demo-…/`) cuando en este navegador todavía no se compró nada. Entró
 * y se pagó el día de la demo (lunes 5/10) y se está armando; la entrega la calcula el calendario de despachos.
 */
export const sampleTrackedOrder: { lines: CartLine[]; fulfillment: FulfillmentType; log: StatusLogEntry[] } = {
  lines: [
    { id: "s1", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 },
    { id: "s2", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", quantity: 1 },
    { id: "s3", productSlug: HOUSE_SHAKER_SLUG, variantId: "sh-voltio", quantity: 1 },
    { id: "s4", productSlug: "barra-proteica", variantId: "bp-mani-u", quantity: 2 },
  ],
  fulfillment: "LOCAL_DELIVERY",
  log: [
    { at: "2026-10-05T08:14:00-03:00", from: null, to: "PENDING_PAYMENT" },
    { at: "2026-10-05T08:21:00-03:00", from: "PENDING_PAYMENT", to: "PAYMENT_REVIEW" },
    { at: "2026-10-05T09:02:00-03:00", from: "PAYMENT_REVIEW", to: "PAID" },
    { at: "2026-10-05T09:40:00-03:00", from: "PAID", to: "IN_PRODUCTION" },
  ],
};
