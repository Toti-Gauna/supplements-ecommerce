"use client";
import { Check, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { productHref } from "@/demo/engine/catalog";
import { DEFAULT_STACK_RULE, isStackCategory, stackDiscount, stackSuggestions } from "@/demo/engine/stack";
import { variantPrice } from "@/demo/engine/servings";
import type { Product, Variant } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

interface Pick { product: Product; variant: Variant }

/**
 * "Armá tu stack": este producto + los más vendidos de otras categorías con el mismo objetivo. Con suplementos de
 * N categorías distintas en el carrito, esas líneas tienen el descuento stack (regla del engine, editable en el panel:
 * Marketing → Descuento stack). Con 0 % no se promete descuento: queda como sugerencia de qué sumar.
 */
export function StackOffer({ product, variant }: { product: Product; variant: Variant }) {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const suggestions = stackSuggestions(product, catalog, Math.max(2, rule.minCategories - 1));
  const [off, setOff] = useState<string[]>([]);
  // El equipamiento no suma categorías al stack: ofrecerlo acá prometería un descuento que no se aplica.
  if (suggestions.length === 0 || !isStackCategory(product.categorySlug)) return null;
  const picks: Pick[] = [{ product, variant }, ...suggestions.map((p) => ({ product: p, variant: p.variants.find((v) => v.stock !== 0)! }))];
  const chosen = picks.filter((p, i) => i === 0 || !off.includes(p.product.slug));
  const lines = chosen.map((p) => ({ product: p.product, lineTotal: variantPrice(p.product, p.variant) }));
  const result = stackDiscount(lines, rule);
  const total = lines.reduce((s, l) => s + l.lineTotal, 0);
  const addAll = () => {
    chosen.forEach((p) => add({ productSlug: p.product.slug, variantId: p.variant.id, quantity: 1 }));
    openCart(product.slug);
  };
  return (
    <section aria-labelledby="stack-title" className="rounded-sm p-5 edge-volt sm:p-6">
      <p className="eyebrow flex items-center gap-2 text-volt-ink"><Layers size={14} aria-hidden="true" />Armá tu stack</p>
      <h2 id="stack-title" className="font-display mt-1 text-2xl">{rule.pct > 0 ? `Sumá ${rule.minCategories} categorías y llevate ${rule.pct} % off` : "Sumá lo que va con este suplemento"}</h2>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {picks.map((p, i) => {
          const on = i === 0 || !off.includes(p.product.slug);
          return (
            <li key={p.product.slug} className="relative">
              <button type="button" disabled={i === 0} aria-pressed={on} onClick={() => setOff((o) => (o.includes(p.product.slug) ? o.filter((x) => x !== p.product.slug) : [...o, p.product.slug]))}
                aria-label={i === 0 ? `${p.product.name} (este producto)` : `${on ? "Quitar" : "Sumar"} ${p.product.name}`}
                className={cn("flex w-full flex-col gap-1.5 rounded-sm border p-1.5 text-left transition-[opacity,border-color]", on ? "border-primary/60" : "border-line opacity-55", i > 0 && "hover:border-primary")}>
                <ProductArt art={p.product.art} pack={p.product.pack} tint={p.variant.colorHex} label="" showBadge={false} className="aspect-square rounded-sm" />
                <span className="line-clamp-2 px-1 text-[12px] font-bold leading-tight">{p.product.name}</span>
                <span className="font-lab px-1 pb-1 text-[12px] text-muted">{formatARS(variantPrice(p.product, p.variant))}</span>
              </button>
              <span aria-hidden="true" className={cn("absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-sm", on ? "bg-primary text-on-primary" : "bg-surface ring-1 ring-line")}>{on && <Check size={14} />}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm">
          {result.discount > 0 ? (
            <><s className="text-muted">{formatARS(total)}</s> <strong className="font-lab text-lg text-volt-ink">{formatARS(total - result.discount)}</strong><span className="block text-xs font-bold text-success">Ahorrás {formatARS(result.discount)} con el stack</span></>
          ) : (
            <><strong className="font-lab text-lg">{formatARS(total)}</strong>{rule.pct > 0 && <span className="block text-xs text-muted">Sumá {result.missing} categoría{result.missing === 1 ? "" : "s"} más para el {rule.pct} % off</span>}</>
          )}
        </p>
        <Button onClick={addAll} disabled={chosen.length < 2}>Agregar {chosen.length} al carrito</Button>
      </div>
      <p className="mt-3 text-xs text-muted">{rule.pct > 0 && `El descuento se aplica en el carrito cuando hay suplementos de ${rule.minCategories} categorías distintas. `}<Link href={productHref(suggestions[0]!.slug)} className="font-bold text-primary underline">Ver {suggestions[0]!.name}</Link></p>
    </section>
  );
}
