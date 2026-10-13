"use client";
import { CalendarCheck, ChevronDown, ScanBarcode } from "lucide-react";
import { useState } from "react";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import { getProduct } from "@/demo/engine/catalog";
import type { CouponCheck } from "@/demo/engine/coupons";
import type { Quote } from "@/demo/engine/pricing";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useCheckout } from "@/stores/checkout";
import { CouponForm } from "../cart/CouponForm";
import { summaryRows } from "./summary-rows";
import { useOrderPromise } from "./useOrderPromise";

interface Props {
  quote: Quote;
  couponCheck: CouponCheck | null;
  isRegistered: boolean;
  className?: string;
}

/**
 * Ticket del checkout (R2): fijo a la derecha en escritorio y plegable arriba en el celular. Lleva lo que se compra,
 * el cupón (una sola vez en todo el checkout), la entrega con su fecha, los descuentos y el total, que se actualiza
 * al cambiar entrega, cupón o medio de pago.
 */
export function CheckoutTicket({ quote, couponCheck, isRegistered, className }: Props) {
  const [open, setOpen] = useState(false);
  const fulfillment = useCheckout((s) => s.fulfillment);
  const promise = useOrderPromise(quote.lines.map((q) => q.line));
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button type="button" aria-expanded={open} aria-controls="checkout-ticket" onClick={() => setOpen((v) => !v)}
        className="plate flex min-h-14 items-center justify-between gap-3 rounded-sm border border-line px-4 text-left lg:hidden">
        <span className="eyebrow text-muted">{open ? "Ocultar ticket" : "Ver ticket"} · {quote.units} {quote.units === 1 ? "producto" : "productos"}</span>
        <span className="flex items-center gap-2 font-display text-2xl tabular-nums">{formatARS(quote.total)}<ChevronDown size={18} aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} /></span>
      </button>
      <div id="checkout-ticket" className={cn("flex-col gap-3 lg:flex", open ? "flex" : "hidden")}>
        <OrderSummary title="Resumen de tu compra" rows={summaryRows(quote)} total={quote.total} totalNote="En la tienda real el servidor recalcula precios y stock antes de cobrar.">
          <ul className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm" aria-label="Productos del ticket">
            {quote.lines.map((q) => (
              <li key={q.line.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">{q.line.quantity} × {getProduct(q.line.productSlug)?.name}{q.line.gift ? ` · regalo para ${q.line.gift.to}` : ""}</span>
                <span className="shrink-0 whitespace-nowrap font-mono tabular-nums">{formatARS(q.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 border-t border-dashed border-line pt-3 text-[13px]">
            <CalendarCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
            {fulfillment ? <strong>{promise(fulfillment).text}</strong> : <span className="text-muted">La fecha de entrega sale del calendario al elegir cómo lo recibís.</span>}
          </p>
          <p className="mt-2 flex items-start gap-2 text-[13px] text-muted">
            <ScanBarcode size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            Lote y vencimiento: se controlan al armar tu pedido y los ves en el seguimiento.
          </p>
        </OrderSummary>
        {/* El cupón se puede quitar o cambiar hasta confirmar; quitar el de la ruleta lo deja guardado (8.2.14). */}
        <section aria-label="Cupón del pedido" className="rounded-sm border border-line bg-surface p-4">
          <CouponForm subtotal={quote.subtotal} isRegistered={isRegistered} check={couponCheck} where="checkout" />
        </section>
      </div>
    </div>
  );
}
