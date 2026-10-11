"use client";
import type { ReactNode } from "react";
import { VariantPicker } from "@/components/molecules/VariantPicker";
import { bestValueSize, pricePerServing, variantPrice } from "@/demo/engine/servings";
import { findVariant } from "@/demo/engine/catalog";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { QuantityPicker } from "./QuantityPicker";
import type { useVariantSelection } from "./useVariantSelection";

interface Props {
  product: Product;
  sel: ReturnType<typeof useVariantSelection>;
  quantity: number;
  max: number;
  stockNote: string;
  onQuantity: (n: number) => void;
  actions: ReactNode;
}

/**
 * Todo lo que se elige en una sola tarjeta: sabor (muestras de color), tamaño (tarjetas con servicios y precio por
 * servicio, con la de mejor precio marcada), cantidad y compra.
 */
export function ConfigureCard({ product, sel, quantity, max, stockNote, onQuantity, actions }: Props) {
  const best = bestValueSize(product, sel.color);
  const sizeOptions = sel.sizeOptions.map((o) => {
    const v = findVariant(product, sel.color, o.value) ?? findVariant(product, undefined, o.value);
    const pps = v ? pricePerServing(variantPrice(product, v), v.servings) : null;
    return { ...o, detail: v?.servings && v.servings > 1 && pps ? `${v.servings} servicios\n${formatARS(pps)} c/u` : undefined, badge: o.value === best ? "Mejor precio por servicio" : undefined };
  });
  return (
    <section id="elegir" aria-label="Elegí sabor, tamaño y cantidad" className="flex scroll-mt-28 flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      {(sel.colorOptions.length > 0 || sizeOptions.length > 0) && (
        <div className="flex flex-col gap-5">
          {sel.colorOptions.length > 0 && <VariantPicker legend={product.optionNames?.color ?? "Sabor"} options={sel.colorOptions} value={sel.color} onChange={sel.chooseColor} swatches />}
          {sizeOptions.length > 0 && <VariantPicker legend={product.optionNames?.size ?? "Tamaño"} options={sizeOptions} value={sel.size} onChange={sel.chooseSize} />}
        </div>
      )}
      <hr className="border-line" />
      <QuantityPicker value={quantity} max={max} note={stockNote} onChange={onQuantity} />
      {actions}
    </section>
  );
}
