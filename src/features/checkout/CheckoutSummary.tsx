"use client";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import type { Quote } from "@/demo/engine/pricing";
import { getProduct } from "@/demo/engine/catalog";
import { groupByPack, monthlyDayOf, packDiscountRows } from "@/demo/engine/pack-cart";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { formatARS } from "@/lib/money";

export function summaryRows(quote: Omit<Quote, "lines">) {
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

/** Resumen del checkout (subtotal, cupón, descuento por transferencia/QR, envío, total y productos), debajo del paso. */
export function CheckoutSummary({ quote }: { quote: Quote }) {
  const listed = useDemoData((d) => d.packs);
  const custom = useCart((s) => s.customPacks);
  const packs = [...(listed ?? []), ...(custom ?? [])];
  return (
    <OrderSummary title="Resumen de tu compra" rows={summaryRows(quote)} total={quote.total} totalNote="Total de muestra. En la tienda real el servidor recalcula precios y stock antes de cobrar.">
      <ul className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
        {groupByPack(quote.lines).flatMap((g) => {
          const day = monthlyDayOf(g.items.map((q) => q.line));
          const title = g.packId ? `${packs.find((p) => p.id === g.packId)?.name ?? "Pack"}${day !== undefined ? ` · todos los meses, día ${day}` : ""}` : null;
          return [
            ...(title ? [<li key={`pack-${g.packId}`} className="eyebrow pt-1 text-volt-ink">{title}</li>] : []),
            ...g.items.map((q) => (
              <li key={q.line.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">{q.line.quantity} × {getProduct(q.line.productSlug)?.name}{q.line.gift ? ` · regalo para ${q.line.gift.to}` : ""}</span>
                <span className="shrink-0 whitespace-nowrap tabular-nums">{formatARS(q.lineTotal)}</span>
              </li>
            )),
          ];
        })}
      </ul>
    </OrderSummary>
  );
}
