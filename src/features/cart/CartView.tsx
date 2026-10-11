"use client";
import { Lock, Truck } from "lucide-react";
import { motion } from "motion/react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import { FLOATING_BAR } from "@/components/organisms/bottomBars";
import { CartLineItem, type CartLineView } from "@/components/organisms/CartLineItem";
import { getProduct, maxQuantity } from "@/demo/engine/catalog";
import { missingForFreeShipping, type QuotedLine } from "@/demo/engine/pricing";
import { recommendForCart } from "@/demo/engine/recommend";
import { demoData } from "@/demo/engine/source";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useDemoVersion } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { CartMissionNudge } from "./CartMissionNudge";
import { CouponForm } from "./CouponForm";
import { MiniRecommendations } from "./MiniRecommendations";
import { useCartQuote } from "./useCartQuote";
import { useGoToCheckout } from "./useGoToCheckout";

export function toLineView(q: QuotedLine): CartLineView | null {
  const product = getProduct(q.line.productSlug);
  const variant = product?.variants.find((v) => v.id === q.line.variantId);
  if (!product || !variant) return null;
  return {
    id: q.line.id, slug: product.slug, name: product.name, variantLabel: variant.label, art: product.art, tint: variant.colorHex,
    unitPrice: q.unitPrice, lineTotal: q.lineTotal, quantity: q.line.quantity, maxQuantity: maxQuantity(variant), personalization: q.line.personalization, gift: q.line.gift, zone: demoData().textZones[product.art],
  };
}

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
        <EmptyState title="Tu carrito está vacío" action={<ButtonLink href="/">Ver productos</ButtonLink>}>Agregá algo o creá tu producto personalizado.</EmptyState>
        <MiniRecommendations title="Lo más elegido" products={recommendForCart([], 6)} />
      </div>
    );
  }
  const missing = missingForFreeShipping(quote.subtotal);
  const threshold = demoData().settings.freeShippingFrom;
  const summary = (
    <OrderSummary
      rows={[
        { label: `Subtotal (${quote.units} ${quote.units === 1 ? "producto" : "productos"})`, amount: quote.subtotal },
        ...(quote.couponDiscount > 0 ? [{ label: "Cupón", amount: quote.couponDiscount, negative: true }] : []),
        { label: "Envío", amount: null, pendingLabel: "Se calcula en el checkout" },
      ]}
      total={quote.total}
      totalNote="Precios de muestra. En la tienda real el total se recalcula en el servidor al confirmar."
    >
      <Button size="lg" className="w-full" onClick={goToCheckout}><Lock size={16} aria-hidden="true" /> Continuar al checkout</Button>
      <ButtonLink href="/categorias/" variant="ghost" className="mt-2 w-full">Seguir comprando</ButtonLink>
    </OrderSummary>
  );
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-12 lg:pb-0">
      <div className="flex flex-col gap-4 lg:col-start-1">
        <div className="rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
          <p className="flex items-center gap-2 text-sm font-semibold"><Truck size={18} aria-hidden="true" className="text-primary" />{missing > 0 ? <>Te faltan <strong>{formatARS(missing)}</strong> para envío gratis</> : "¡Tenés envío gratis!"}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent"><motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (quote.subtotal / threshold) * 100)}%` }} transition={{ duration: 1 }} /></div>
        </div>
        <ul className="flex flex-col gap-3" aria-label="Productos en el carrito">
          {quote.lines.map((q) => {
            const view = toLineView(q);
            return view && <CartLineItem key={view.id} line={view} onQuantity={(n) => setQuantity(view.id, n)} onRemove={() => remove(view.id)} />;
          })}
        </ul>
      </div>
      {/* En el celular: cupón y resumen justo debajo de los productos. En escritorio: columna fija a la derecha. */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <section aria-label="Cupones" className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]"><CouponForm subtotal={quote.subtotal} isRegistered={isRegistered} check={couponCheck} /></section>
        {summary}
      </aside>
      <div className="flex flex-col gap-6 lg:col-start-1">
        <CartMissionNudge units={quote.units} total={quote.total} />
        <MiniRecommendations title="Completá tu pedido" products={recommendForCart(lines, 6)} />
      </div>
      <div data-buy-bar className={cn(FLOATING_BAR, "z-30 pl-5 lg:hidden")}>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Total{quote.couponDiscount > 0 ? " con cupón" : ""} · sin envío</p>
          <p className="text-xl font-extrabold tabular-nums">{formatARS(quote.total)}</p>
        </div>
        <Button size="lg" onClick={goToCheckout} className="px-6"><Lock size={16} aria-hidden="true" /> Ir a pagar</Button>
      </div>
    </div>
  );
}
