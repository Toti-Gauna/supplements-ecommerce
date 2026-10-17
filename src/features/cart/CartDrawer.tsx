"use client";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { CartLineItem } from "@/components/organisms/CartLineItem";
import { getProduct } from "@/demo/engine/catalog";
import { packDiscountRows } from "@/demo/engine/pack-cart";
import { recommendForCart } from "@/demo/engine/recommend";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { BagLoad } from "./BagLoad";
import { CadeteCountdown } from "./CadeteCountdown";
import { QuotedGroups } from "./QuotedGroups";
import { CartMissionNudge } from "./CartMissionNudge";
import { MiniRecommendations } from "./MiniRecommendations";
import { toLineView } from "./line-view";
import { useCartQuote } from "./useCartQuote";
import { useGoToCheckout } from "./useGoToCheckout";
import { WheelOffer } from "./WheelOffer";

/**
 * Carrito lateral "bolso" (R2): lo agregado, un solo medidor de carga (envío gratis + stack), cuánto te dura cada pote
 * y, en el pie, el total con la cuenta regresiva del cadete. La misión va en una línea y la ruleta, como placa opcional.
 */
export function CartDrawer() {
  const { cartOpen, closeCart, lastAdded } = useUi();
  const { quote } = useCartQuote();
  const goToCheckout = useGoToCheckout();
  const lines = useCart((s) => s.lines);
  const { setQuantity, remove } = useCart();
  const added = lastAdded ? getProduct(lastAdded) : undefined;
  return (
    <Sheet open={cartOpen} onClose={closeCart} title="Carrito">
      <div className="px-5 pb-3 pt-6 sm:px-6">
        <p className="eyebrow text-muted">Tu bolso</p>
        <h2 className="font-display text-3xl leading-none">Tu carrito</h2>
        <AnimatePresence>
          {added && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="status" className="mt-2 flex items-center gap-2 text-sm font-bold text-success">
              <span className="grid h-5 w-5 place-items-center rounded-sm bg-success text-white"><Check size={13} aria-hidden="true" /></span>Agregaste {added.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 sm:px-6">
        {lines.length === 0 ? (
          <p className="rounded-sm border border-dashed border-line p-6 text-center text-muted">Tu bolso está vacío.</p>
        ) : (
          <>
            <BagLoad quote={quote} />
            <ul className="flex flex-col gap-2" aria-label="Productos en el bolso">
              <QuotedGroups quote={quote} renderLine={(q, inPack) => {
                const view = toLineView(q);
                return view && <CartLineItem key={view.id} line={view} size="compact" inPack={inPack} onNavigate={closeCart} onQuantity={(n) => setQuantity(view.id, n)} onRemove={() => remove(view.id)} />;
              }} />
            </ul>
            <CartMissionNudge units={quote.units} total={quote.total} compact />
            <WheelOffer when="cart" />
          </>
        )}
        <div className="mb-6"><MiniRecommendations title={lines.length ? "Completá tu pedido" : "Lo más elegido"} products={recommendForCart(lines, 5)} onNavigate={closeCart} /></div>
      </div>
      {lines.length > 0 && (
        <div className="border-t border-line bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          <CadeteCountdown lines={lines} className="mb-2" />
          {packDiscountRows(quote.pack.entries).map((r) => <p key={r.label} className="flex justify-between text-sm font-semibold text-success"><span>{r.label}</span><span className="font-mono tabular-nums">−{formatARS(r.amount)}</span></p>)}
          {quote.stack.discount > 0 && <p className="flex justify-between text-sm font-semibold text-success"><span>Descuento stack ({quote.stack.pct} %)</span><span className="font-mono tabular-nums">−{formatARS(quote.stack.discount)}</span></p>}
          <div className="mb-3 flex items-end justify-between"><span className="eyebrow text-muted">Subtotal</span><span className="font-display text-3xl tabular-nums">{formatARS(quote.subtotal - quote.stack.discount - quote.pack.discount)}</span></div>
          <div className="grid gap-1">
            <Button onClick={goToCheckout} size="lg" className="w-full">Ir al checkout</Button>
            <ButtonLink href="/carrito/" onClick={closeCart} variant="ghost" className="w-full">Ver carrito completo</ButtonLink>
          </div>
        </div>
      )}
    </Sheet>
  );
}
