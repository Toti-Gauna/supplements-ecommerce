"use client";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import type { Quote } from "@/demo/engine/pricing";
import { getProduct } from "@/demo/engine/catalog";
import { formatARS } from "@/lib/money";

export function summaryRows(quote: Omit<Quote, "lines">) {
  return [
    { label: "Subtotal", amount: quote.subtotal },
    ...(quote.couponDiscount > 0 ? [{ label: "Cupón", amount: quote.couponDiscount, negative: true }] : []),
    ...(quote.transferDiscount > 0 ? [{ label: "Descuento transferencia/QR", amount: quote.transferDiscount, negative: true }] : []),
    { label: quote.freeShippingApplied ? "Envío (gratis)" : "Envío", amount: quote.shippingCost, pendingLabel: "Elegí la entrega" },
  ];
}

/** Resumen del checkout (subtotal, cupón, descuento por transferencia/QR, envío, total y productos), debajo del paso. */
export function CheckoutSummary({ quote }: { quote: Quote }) {
  return (
    <OrderSummary title="Resumen de tu compra" rows={summaryRows(quote)} total={quote.total} totalNote="Total de muestra. En la tienda real el servidor recalcula precios y stock antes de cobrar.">
      <ul className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
        {quote.lines.map((q) => {
          const product = getProduct(q.line.productSlug);
          return (
            <li key={q.line.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">{q.line.quantity} × {product?.name}{q.line.personalization ? " (personalizado)" : ""}{q.line.gift ? ` · regalo para ${q.line.gift.to}` : ""}</span>
              <span className="shrink-0 whitespace-nowrap tabular-nums">{formatARS(q.lineTotal)}</span>
            </li>
          );
        })}
      </ul>
    </OrderSummary>
  );
}
