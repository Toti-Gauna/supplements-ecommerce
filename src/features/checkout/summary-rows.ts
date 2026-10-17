import type { SummaryRow } from "@/components/molecules/OrderSummary";
import { packDiscountRows } from "@/demo/engine/pack-cart";
import type { Quote } from "@/demo/engine/pricing";

/** Renglones del ticket (checkout y confirmación): subtotal, descuentos y envío. */
export function summaryRows(quote: Omit<Quote, "lines">): SummaryRow[] {
  return [
    { label: "Subtotal", amount: quote.subtotal },
    // `stack` puede faltar en un pedido guardado antes de la Fase 2.
    ...((quote.stack?.discount ?? 0) > 0 ? [{ label: `Descuento stack (${quote.stack!.pct} %)`, amount: quote.stack!.discount, negative: true }] : []),
    // `pack` puede faltar en un pedido guardado antes de los packs (L3).
    ...packDiscountRows(quote.pack?.entries),
    ...(quote.couponDiscount > 0 ? [{ label: "Cupón", amount: quote.couponDiscount, negative: true }] : []),
    ...(quote.transferDiscount > 0 ? [{ label: "Descuento transferencia/QR", amount: quote.transferDiscount, negative: true }] : []),
    { label: quote.freeShippingApplied ? "Envío (gratis)" : "Envío", amount: quote.shippingCost, pendingLabel: "Elegí la entrega" },
  ];
}
