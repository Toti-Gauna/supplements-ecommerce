"use client";
import { Plus } from "lucide-react";
import { useId, type CSSProperties } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { unitPrice } from "@/demo/engine/catalog";
import type { SportInfo } from "@/demo/fixtures/sports";
import type { Product, Variant } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAddFlow } from "../cart/useAddFlow";

/** Un accesorio sugerido: envase, nombre, precio y "Agregar" (con varias opciones abre la hoja chica para elegir). */
function GearItem({ product, variant }: { product: Product; variant: Variant }) {
  const titleId = useId();
  const { add, sheet, choose } = useAddFlow(product);
  return (
    <li aria-labelledby={titleId} className="flex items-center gap-3 rounded-sm border border-line bg-surface p-2.5 pr-3 shadow-[inset_3px_0_0_var(--hue)]">
      <span aria-hidden="true" className="w-14 shrink-0">
        <ProductArt art={product.art} pack={product.pack} tint={variant.colorHex} label="" showBadge={false} className="aspect-square rounded-sm" />
      </span>
      <span className="min-w-0 flex-1">
        <span id={titleId} className="block text-sm font-bold leading-tight">{product.name}</span>
        <span className="font-lab mt-0.5 block text-[13px] font-bold">{formatARS(unitPrice(product, variant))}</span>
      </span>
      <button type="button" onClick={add} aria-label={`Agregar ${product.name}`} aria-haspopup={choose ? "dialog" : undefined}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-sm border border-ink/15 px-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
        <Plus size={16} aria-hidden="true" />Agregar
      </button>
      {sheet}
    </li>
  );
}

interface SportGearRowProps {
  sport: SportInfo;
  items: { product: Product; variant: Variant }[];
}

/** "Sumá para tu deporte": el equipamiento sugerido con stock, aparte del estante (no cuenta para el descuento stack). */
export function SportGearRow({ sport, items }: SportGearRowProps) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="stack-gear-title" style={{ "--hue": sport.hue } as CSSProperties} className="mt-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="stack-gear-title" className="eyebrow text-volt-ink">Sumá para tu deporte · {sport.name}</h2>
        <p className="text-[12px] text-muted">Opcional. No suma al descuento stack.</p>
      </div>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
        {items.map((g) => <GearItem key={g.product.slug} product={g.product} variant={g.variant} />)}
      </ul>
    </section>
  );
}
