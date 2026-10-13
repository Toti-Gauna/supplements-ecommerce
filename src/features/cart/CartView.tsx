"use client";
import { Lock } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import { FLOATING_BAR } from "@/components/organisms/bottomBars";
import { CartLineItem } from "@/components/organisms/CartLineItem";
import { recommendForCart } from "@/demo/engine/recommend";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useDemoVersion } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { BagLoad } from "./BagLoad";
import { CadeteCountdown } from "./CadeteCountdown";
import { CartMissionNudge } from "./CartMissionNudge";
import { CouponForm } from "./CouponForm";
import { MiniRecommendations } from "./MiniRecommendations";
import { toLineView } from "./line-view";
import { useCartQuote } from "./useCartQuote";
import { useGoToCheckout } from "./useGoToCheckout";
import { WheelOffer } from "./WheelOffer";

/** Carrito completo: el bolso a la izquierda (carga, potes y misión) y el ticket con cupón y total a la derecha. */
export function CartView() {
  const hydrated = useHydrated();
  useDemoVersion();
  const { quote, couponCheck, isRegistered } = useCartQuote();
  const lines = useCart((s) => s.lines);
  const { setQuantity, remove } = useCart();
  const goToCheckout = useGoToCheckout();
  if (!hydrated) return <ListSkeleton rows={2} label="Cargando carrito" />;
  if (quote.lines.length === 0) {
    return (
      <div className="flex flex-col gap-12">
        <EmptyState title="Tu carrito está vacío" action={<ButtonLink href="/">Ver productos</ButtonLink>}>Sumá tu proteína, tu creatina o lo que necesites para entrenar.</EmptyState>
        <MiniRecommendations title="Lo más elegido" products={recommendForCart([], 6)} />
      </div>
    );
  }
  const summary = (
    <OrderSummary
      rows={[
        { label: `Subtotal (${quote.units} ${quote.units === 1 ? "producto" : "productos"})`, amount: quote.subtotal },
        ...(quote.stack.discount > 0 ? [{ label: `Descuento stack (${quote.stack.pct} %)`, amount: quote.stack.discount, negative: true }] : []),
        ...(quote.couponDiscount > 0 ? [{ label: "Cupón", amount: quote.couponDiscount, negative: true }] : []),
        { label: "Envío", amount: null, pendingLabel: "Se calcula en el checkout" },
      ]}
      total={quote.total}
      totalNote="En la tienda real el total se recalcula en el servidor al confirmar."
    >
      <CadeteCountdown lines={lines} className="mb-3" />
      <Button size="lg" className="w-full" onClick={goToCheckout}><Lock size={16} aria-hidden="true" /> Continuar al checkout</Button>
      <ButtonLink href="/categorias/" variant="ghost" className="mt-2 w-full">Seguir comprando</ButtonLink>
    </OrderSummary>
  );
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-12 lg:pb-0">
      <div className="flex flex-col gap-4 lg:col-start-1">
        <BagLoad quote={quote} />
        <ul className="flex flex-col gap-3" aria-label="Productos en el carrito">
          {quote.lines.map((q) => {
            const view = toLineView(q);
            return view && <CartLineItem key={view.id} line={view} onQuantity={(n) => setQuantity(view.id, n)} onRemove={() => remove(view.id)} />;
          })}
        </ul>
      </div>
      {/* En el celular: cupón y resumen justo debajo de los productos. En escritorio: columna fija a la derecha. */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <WheelOffer when="cart" />
        <section aria-label="Cupones" className="rounded-sm border border-line bg-surface p-4"><CouponForm subtotal={quote.subtotal} isRegistered={isRegistered} check={couponCheck} /></section>
        {summary}
      </aside>
      <div className="flex flex-col gap-6 lg:col-start-1">
        <CartMissionNudge units={quote.units} total={quote.total} />
        <MiniRecommendations title="Completá tu pedido" products={recommendForCart(lines, 6)} />
      </div>
      <div data-buy-bar className={cn(FLOATING_BAR, "z-30 pl-5 lg:hidden")}>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Total{quote.couponDiscount > 0 || quote.stack.discount > 0 ? " con descuentos" : ""} · sin envío</p>
          <p className="font-display text-2xl leading-none tabular-nums">{formatARS(quote.total)}</p>
        </div>
        <Button size="lg" onClick={goToCheckout} className="px-6"><Lock size={16} aria-hidden="true" /> Ir a pagar</Button>
      </div>
    </div>
  );
}
