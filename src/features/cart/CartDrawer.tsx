"use client";
import { AnimatePresence, motion } from "motion/react";
import { Check, Trash2, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { LineThumb } from "@/components/organisms/LineThumb";
import { getProduct, maxQuantity } from "@/demo/engine/catalog";
import { missingForFreeShipping } from "@/demo/engine/pricing";
import { recommendForCart } from "@/demo/engine/recommend";
import { demoData } from "@/demo/engine/source";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { CartMissionNudge } from "./CartMissionNudge";
import { MiniRecommendations } from "./MiniRecommendations";
import { useCartQuote } from "./useCartQuote";
import { useGoToCheckout } from "./useGoToCheckout";

/** Carrito lateral: aparece al agregar, con progreso de envío gratis, misión y complementos. */
export function CartDrawer() {
  const { cartOpen, closeCart, lastAdded } = useUi();
  const { quote } = useCartQuote();
  const goToCheckout = useGoToCheckout();
  const lines = useCart((s) => s.lines);
  const { setQuantity, remove } = useCart();
  const missing = missingForFreeShipping(quote.subtotal);
  const threshold = demoData().settings.freeShippingFrom;
  const added = lastAdded ? getProduct(lastAdded) : undefined;
  return (
    <Sheet open={cartOpen} onClose={closeCart} title="Carrito">
      <div className="px-6 pb-4 pt-6">
        <h2 className="font-display text-3xl">Tu carrito</h2>
        <AnimatePresence>
          {added && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="status" className="mt-2 flex items-center gap-2 text-sm font-bold text-success">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-white"><Check size={13} aria-hidden="true" /></span>Agregaste {added.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1 overflow-y-auto px-6">
        {lines.length === 0 ? (
          <p className="rounded-3xl bg-surface p-6 text-center text-muted">Todavía no agregaste nada.</p>
        ) : (
          <>
            <div className="mb-4 rounded-2xl bg-surface p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><Truck size={16} aria-hidden="true" className="text-primary" />{missing > 0 ? `Te faltan ${formatARS(missing)} para envío gratis` : "¡Tenés envío gratis!"}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent"><motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${Math.min(100, (quote.subtotal / threshold) * 100)}%` }} /></div>
            </div>
            <ul className="flex flex-col gap-3">
              {quote.lines.map((q) => {
                const product = getProduct(q.line.productSlug);
                const variant = product?.variants.find((v) => v.id === q.line.variantId);
                if (!product || !variant) return null;
                return (
                  <motion.li layout key={q.line.id} className="flex gap-3 rounded-2xl bg-surface p-3">
                    <div className="w-16 shrink-0"><LineThumb art={product.art} tint={variant.colorHex} name={product.name} personalization={q.line.personalization} zone={demoData().textZones[product.art]} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{product.name}</p>
                      <p className="truncate text-xs text-muted">{variant.label}{q.line.personalization?.text ? ` · “${q.line.personalization.text}”` : ""}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <QuantityStepper label={`Cantidad de ${product.name}`} value={q.line.quantity} max={maxQuantity(variant)} onChange={(n) => setQuantity(q.line.id, n)} />
                        <span className="text-sm font-extrabold tabular-nums">{formatARS(q.lineTotal)}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => remove(q.line.id)} aria-label={`Quitar ${product.name}`} className="grid h-9 w-9 place-items-center self-start rounded-full text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={16} aria-hidden="true" /></button>
                  </motion.li>
                );
              })}
            </ul>
            <div className="mt-4"><CartMissionNudge units={quote.units} total={quote.total} /></div>
          </>
        )}
        <div className="my-6"><MiniRecommendations title={lines.length ? "Completá tu pedido" : "Lo más elegido"} products={recommendForCart(lines, 5)} onNavigate={closeCart} /></div>
      </div>
      {lines.length > 0 && (
        <div className="border-t border-line bg-surface px-6 py-4">
          <div className="mb-3 flex items-end justify-between"><span className="text-sm text-muted">Subtotal (muestra)</span><span className="text-2xl font-extrabold tabular-nums">{formatARS(quote.subtotal)}</span></div>
          <div className="grid gap-2">
            <Button onClick={goToCheckout} size="lg" className="w-full">Ir al checkout</Button>
            <ButtonLink href="/carrito/" onClick={closeCart} variant="ghost" className="w-full">Ver carrito completo</ButtonLink>
          </div>
        </div>
      )}
    </Sheet>
  );
}
