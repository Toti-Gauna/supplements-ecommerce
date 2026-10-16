"use client";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { LineThumb } from "@/components/organisms/LineThumb";
import { getProduct, maxQuantity } from "@/demo/engine/catalog";
import type { QuotedLine } from "@/demo/engine/pricing";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";

/** Una línea del carrito lateral. Dentro de un pack la cantidad es fija (la define el pack) y la línea no lleva tarjeta propia. */
export function DrawerLine({ q, inPack }: { q: QuotedLine; inPack: boolean }) {
  const { setQuantity, remove } = useCart();
  const product = getProduct(q.line.productSlug);
  const variant = product?.variants.find((v) => v.id === q.line.variantId);
  if (!product || !variant) return null;
  return (
    <motion.li layout className={cn("flex gap-3 p-3", inPack ? "border-t border-line first:border-t-0" : "rounded-sm bg-surface")}>
      <div className="w-16 shrink-0"><LineThumb art={product.art} pack={product.pack} tint={variant.colorHex} name={product.name} /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{product.name}</p>
        <p className="truncate text-xs text-muted">{variant.label}</p>
        <div className="mt-1 flex items-center justify-between">
          {inPack
            ? <span className="font-mono text-xs text-muted">Cantidad: {q.line.quantity}</span>
            : <QuantityStepper label={`Cantidad de ${product.name}`} value={q.line.quantity} max={maxQuantity(variant)} onChange={(n) => setQuantity(q.line.id, n)} />}
          <span className="text-sm font-extrabold tabular-nums">{formatARS(q.lineTotal)}</span>
        </div>
      </div>
      <button type="button" onClick={() => remove(q.line.id)} aria-label={`Quitar ${product.name}`} className="grid h-9 w-9 place-items-center self-start rounded-sm text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={16} aria-hidden="true" /></button>
    </motion.li>
  );
}
