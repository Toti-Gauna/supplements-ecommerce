"use client";
import { LineThumb } from "@/components/organisms/LineThumb";
import { cn } from "@/lib/cn";
import type { LotCheckItem } from "./useLotCheck";

interface Props {
  /** Prefijo de los ids (el código del pedido): en Para armar hay varios pedidos en la misma pantalla. */
  idBase: string;
  item: LotCheckItem;
  checked: boolean;
  onChange: (on: boolean) => void;
  autoFocus?: boolean;
}

/** Un producto del control de lote: la casilla, el envase, cuántos y el lote que sale (o el aviso si no hay lote cargado). */
export function LotCheckRow({ idBase, item: { line, product, variant, lot }, checked, onChange, autoFocus }: Props) {
  const id = `lot-${idBase}-${line.id}`;
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 rounded-sm bg-surface p-3 shadow-[var(--shadow-card)] ring-1 transition-colors", checked ? "ring-success" : "ring-ink/[0.06] hover:ring-ink/20")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-autofocus={autoFocus ? true : undefined}
        aria-describedby={id} className="h-5 w-5 shrink-0 accent-primary" />
      {product && <span className="w-12 shrink-0"><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></span>}
      <span className="min-w-0 flex-1 text-sm">
        <span className="block font-bold">{line.quantity} × {product?.name ?? line.productSlug}</span>
        {variant && <span className="block text-muted">{variant.label}</span>}
        <span id={id} className={cn("font-lab mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold", lot.code ? "bg-night text-volt" : "bg-warning-soft text-warning")}>
          {lot.code ? `Lote ${lot.text}` : `${lot.text}: anotá el del pote que vence primero`}
        </span>
      </span>
    </label>
  );
}
