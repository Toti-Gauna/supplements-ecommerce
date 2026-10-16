"use client";
import { AnimatePresence, motion } from "motion/react";
import { Check, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { getProduct } from "@/demo/engine/catalog";
import { packDiscountRows } from "@/demo/engine/pack-cart";
import { missingForFreeShipping } from "@/demo/engine/pricing";
import { recommendForCart } from "@/demo/engine/recommend";
import { demoData } from "@/demo/engine/source";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { DrawerLine } from "./DrawerLine";
import { QuotedGroups } from "./QuotedGroups";
import { StackNudge } from "./StackNudge";
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
              <span className="grid h-5 w-5 place-items-center rounded-sm bg-success text-white"><Check size={13} aria-hidden="true" /></span>Agregaste {added.name}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1 overflow-y-auto px-6">
        {lines.length === 0 ? (
          <p className="rounded-sm bg-surface p-6 text-center text-muted">Todavía no agregaste nada.</p>
        ) : (
          <>
            <div className="mb-4 rounded-sm bg-surface p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><Truck size={16} aria-hidden="true" className="text-primary" />{missing > 0 ? `Te faltan ${formatARS(missing)} para envío gratis` : "¡Tenés envío gratis!"}</p>
              <BatteryMeter pct={Math.min(100, (quote.subtotal / threshold) * 100)} label="Avance hacia el envío gratis" className="mt-2" tone={missing > 0 ? "volt" : "success"} />
            </div>
            <div className="mb-4"><StackNudge stack={quote.stack} compact /></div>
            <ul className="flex flex-col gap-3">
              <QuotedGroups quote={quote} renderLine={(q, inPack) => <DrawerLine key={q.line.id} q={q} inPack={inPack} />} />
            </ul>
            <div className="mt-4"><CartMissionNudge units={quote.units} total={quote.total} /></div>
          </>
        )}
        <div className="my-6"><MiniRecommendations title={lines.length ? "Completá tu pedido" : "Lo más elegido"} products={recommendForCart(lines, 5)} onNavigate={closeCart} /></div>
      </div>
      {lines.length > 0 && (
        <div className="border-t border-line bg-surface px-6 py-4">
          {packDiscountRows(quote.pack.entries).map((r) => <p key={r.label} className="mb-1 flex justify-between text-sm font-semibold text-success"><span>{r.label}</span><span className="tabular-nums">−{formatARS(r.amount)}</span></p>)}
          {quote.stack.discount > 0 && <p className="mb-1 flex justify-between text-sm font-semibold text-success"><span>Descuento stack ({quote.stack.pct} %)</span><span className="tabular-nums">−{formatARS(quote.stack.discount)}</span></p>}
          <div className="mb-3 flex items-end justify-between"><span className="text-sm text-muted">Subtotal (muestra)</span><span className="text-2xl font-extrabold tabular-nums">{formatARS(quote.subtotal - quote.stack.discount - quote.pack.discount)}</span></div>
          <div className="grid gap-2">
            <Button onClick={goToCheckout} size="lg" className="w-full">Ir al checkout</Button>
            <ButtonLink href="/carrito/" onClick={closeCart} variant="ghost" className="w-full">Ver carrito completo</ButtonLink>
          </div>
        </div>
      )}
    </Sheet>
  );
}
