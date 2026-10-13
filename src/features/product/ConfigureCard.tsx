"use client";
import type { ReactNode } from "react";
import { sizePlates } from "@/demo/engine/sheet";
import type { Product } from "@/demo/types";
import { FlavorPlates, SizePlates } from "./OptionPlates";
import { QuantityPicker } from "./QuantityPicker";
import type { useVariantSelection } from "./useVariantSelection";

interface Props {
  product: Product;
  sel: ReturnType<typeof useVariantSelection>;
  quantity: number;
  max: number;
  stockNote: string;
  onQuantity: (n: number) => void;
  /** Disponibilidad de la variante (medidor de stock). */
  stock: ReactNode;
  actions: ReactNode;
}

/**
 * Todo lo que se elige en una sola placa: sabor y tamaño como placas (cada tamaño con su precio por servicio y el que
 * más rinde marcado), stock, cantidad y la compra.
 */
export function ConfigureCard({ product, sel, quantity, max, stockNote, onQuantity, stock, actions }: Props) {
  const plates = sel.sizeOptions.length > 0 ? sizePlates(product, sel.color) : [];
  return (
    <section id="elegir" aria-label="Elegí sabor, tamaño y cantidad" className="flex scroll-mt-28 flex-col gap-4 rounded-sm border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      {sel.colorOptions.length > 0 && <FlavorPlates legend={product.optionNames?.color ?? "Sabor"} options={sel.colorOptions} value={sel.color} onChange={sel.chooseColor} />}
      {plates.length > 0 && <SizePlates legend={product.optionNames?.size ?? "Tamaño"} plates={plates} value={sel.size} onChange={sel.chooseSize} />}
      {stock}
      <QuantityPicker value={quantity} max={max} note={stockNote} onChange={onQuantity} />
      {actions}
    </section>
  );
}
