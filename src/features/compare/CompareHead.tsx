"use client";
import Link from "next/link";
import { Plus, Repeat2, X } from "lucide-react";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { productHref } from "@/demo/engine/catalog";
import type { CompareColumn } from "@/demo/engine/compare";
import type { Product } from "@/demo/types";
import { useAddFlow } from "@/features/cart/useAddFlow";
import { cn } from "@/lib/cn";

const ACTION = "inline-flex min-h-9 items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]";

/** Cabecera de una columna: el pote en su estante (con la cruz para quitarlo), marca, nombre (link a la ficha), presentación y Cambiar. */
export function CompareHead({ column, onChange, onRemove }: { column: CompareColumn; onChange: () => void; onRemove: () => void }) {
  const { product, presentation } = column;
  return (
    <div role="columnheader" className="flex min-w-0 flex-col gap-1.5 pb-3 pt-1 text-left font-normal">
      <span className="rack-bay relative grid aspect-square w-full max-w-36 place-items-center overflow-hidden border border-line">
        <ProductVisual art={product.art} pack={product.pack} photoUrl={product.photoDataUrl} tint={column.variant.colorHex ?? product.variants[0]?.colorHex} label="" showBadge={false} className="size-full" />
        <button type="button" onClick={onRemove} aria-label={`Quitar ${product.name} de la comparación`}
          className="absolute right-1 top-1 grid size-8 place-items-center border border-line bg-surface/90 text-ink backdrop-blur-sm hover:bg-accent">
          <X size={15} aria-hidden="true" />
        </button>
      </span>
      <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-volt-ink">{product.brand}</span>
      <Link href={productHref(product.slug)} className="font-display line-clamp-3 text-[1.05rem] leading-[0.95] text-ink hover:underline sm:text-2xl">{product.name}</Link>
      {presentation && <span className="line-clamp-2 font-mono text-[10px] text-muted">{presentation}</span>}
      <button type="button" onClick={onChange} aria-haspopup="dialog" aria-label={`Cambiar ${product.name}`} className={cn(ACTION, "mt-auto self-start text-volt-ink underline underline-offset-4")}>
        <Repeat2 size={13} aria-hidden="true" />Cambiar
      </button>
    </div>
  );
}

/** Lugar libre (hay menos de 3): sumar otro producto con el selector. */
export function CompareSlot({ onAdd }: { onAdd: () => void }) {
  return (
    <div role="columnheader" className="flex min-w-0 pb-3 pt-1 font-normal">
      <button type="button" onClick={onAdd} aria-haspopup="dialog"
        className="grid aspect-square w-full max-w-36 place-items-center border border-dashed border-ink/30 text-muted transition-colors hover:border-ink/60 hover:text-ink">
        <span className="flex flex-col items-center gap-1 px-2 text-center font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]">
          <Plus size={20} aria-hidden="true" className="text-volt-ink" />Sumar producto
        </span>
      </button>
    </div>
  );
}

/** "Agregar" de cada columna: el mismo flujo de la tarjeta (con varios sabores o tamaños, abre la hoja para elegir). */
export function CompareAdd({ product }: { product: Product }) {
  const { add, sheet, choose } = useAddFlow(product);
  const out = !product.variants.some((v) => v.stock !== 0);
  return (
    <>
      <button type="button" onClick={add} disabled={out} aria-haspopup={choose ? "dialog" : undefined} aria-label={`Agregar ${product.name} al carrito`}
        className="flex h-11 w-full items-center justify-center gap-1.5 bg-primary px-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-on-primary shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] hover:bg-primary-hover active:translate-y-px disabled:opacity-45 sm:text-[12px]">
        <Plus size={15} aria-hidden="true" />{out ? "Sin stock" : "Agregar"}
      </button>
      {sheet}
    </>
  );
}
