"use client";
import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { VariantPicker } from "@/components/molecules/VariantPicker";
import { LineThumb } from "@/components/organisms/LineThumb";
import { productHref } from "@/demo/engine/catalog";
import type { PackLineView } from "@/demo/engine/packs";
import { formatARS } from "@/lib/money";
import { usePackPick } from "./usePackPick";

/**
 * Un producto del pack: su envase, marca, cantidad y precio, y los selectores de sabor y tamaño (o color y talle) que
 * recotizan el pack en vivo. Dice si se repite cada mes o si viaja solo en la primera entrega (el equipamiento no se consume).
 */
export function PackItemRow({ line, onVariant }: { line: PackLineView; onVariant: (variantId: string) => void }) {
  const { product, variant } = line;
  const pick = usePackPick(product, variant.id, onVariant);
  const names = product.optionNames;
  return (
    <li className="plate border border-line p-3 sm:p-4" data-pack-item={product.slug}>
      <div className="flex gap-3 sm:gap-4">
        <div className="w-16 shrink-0 sm:w-24"><LineThumb art={product.art} pack={product.pack} tint={variant.colorHex} name={product.name} /></div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{product.brand}</p>
          <h3 className="font-display text-xl leading-tight sm:text-2xl"><Link href={productHref(product.slug)} className="hover:underline">{product.name}</Link></h3>
          <p className="mt-0.5 text-sm text-muted">{variant.label}</p>
          <Badge tone={line.recurring ? "brand" : "neutral"} className="mt-2">{line.recurring ? "Se repite cada mes" : "Solo en la primera entrega"}</Badge>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-base font-bold tabular-nums">{formatARS(line.lineTotal)}</p>
          <p className="font-mono text-[11px] text-muted">{line.item.qty > 1 ? `${line.item.qty} × ${formatARS(line.unitPrice)}` : "1 unidad"}</p>
        </div>
      </div>
      {(pick.colorOptions.length > 1 || pick.sizeOptions.length > 1) && (
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 border-t border-line pt-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          {pick.colorOptions.length > 1 && <VariantPicker legend={names?.color ?? "Sabor"} options={pick.colorOptions} value={pick.color} onChange={pick.chooseColor} swatches />}
          {pick.sizeOptions.length > 1 && <VariantPicker legend={names?.size ?? "Tamaño"} options={pick.sizeOptions} value={pick.size} onChange={pick.chooseSize} />}
        </div>
      )}
    </li>
  );
}
