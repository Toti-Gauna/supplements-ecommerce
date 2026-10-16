"use client";
import { PackageCheck, Plus } from "lucide-react";
import Link from "next/link";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { productHref, unitPrice } from "@/demo/engine/catalog";
import type { Product, Variant } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAddFlow } from "../cart/useAddFlow";

interface Props {
  product: Product;
  variant: Variant;
  /** Ya va en "Tu programa" (en la primera entrega): no se ofrece agregarlo aparte. */
  included: boolean;
}

/**
 * Equipamiento sugerido para el deporte: el producto con su precio y, o la marca de que ya va en el programa, o
 * "Agregar" (con varios colores o talles abre la hoja chica para elegir, como en las tarjetas de la tienda).
 */
export function QuizGearCard({ product, variant, included }: Props) {
  const { add, sheet, choose } = useAddFlow(product);
  return (
    <li className="flex flex-col border border-line bg-surface shadow-[var(--shadow-card)]" data-quiz-gear={product.slug}>
      <div className="flex flex-1 gap-3.5 p-3.5">
        <ProductArt art={product.art} pack={product.pack} tint={variant.colorHex} label="" showBadge={false} className="h-24 w-24 shrink-0 rounded-sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="eyebrow text-[10px] text-muted">{product.brand}</p>
          <h3 className="mt-1 font-extrabold leading-tight">
            <Link href={productHref(product.slug)} className="hover:underline">{product.name}</Link>
          </h3>
          <p className="font-lab mt-auto pt-2 text-lg font-bold">{formatARS(unitPrice(product, variant))}</p>
        </div>
      </div>
      {included ? (
        <p className="flex min-h-11 items-center gap-2 border-t border-line bg-success-soft px-3.5 text-sm font-bold text-success">
          <PackageCheck size={17} aria-hidden="true" className="shrink-0" />Va en tu programa, en la primera entrega
        </p>
      ) : (
        <button type="button" onClick={add} aria-haspopup={choose ? "dialog" : undefined} aria-label={`Agregar ${product.name} al carrito`}
          className="flex min-h-11 items-center justify-center gap-2 bg-primary px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-on-primary shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] hover:bg-primary-hover active:translate-y-px">
          <Plus size={15} aria-hidden="true" />Agregar
        </button>
      )}
      {sheet}
    </li>
  );
}
