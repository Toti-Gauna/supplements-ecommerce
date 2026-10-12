import type { StatusLogEntry } from "../admin/types";
import type { CartLine } from "../engine/cart-types";
import type { FulfillmentType } from "../types";
import { HOUSE_SHAKER_SLUG } from "./house";

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
