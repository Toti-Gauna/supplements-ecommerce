"use client";
import type { ReactNode } from "react";
import { isGear } from "@/demo/engine/catalog";
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

/** "Elegí color, peso y cantidad" en el equipamiento (con sus nombres de opción); en los suplementos, sabor y tamaño. */
function regionName(product: Product, sel: Props["sel"]): string {
  if (!isGear(product)) return "Elegí sabor, tamaño y cantidad";
  const names = [sel.colorOptions.length > 0 && (product.optionNames?.color ?? "Color"), sel.sizeOptions.length > 0 && (product.optionNames?.size ?? "Talle")];
  const picked = names.filter((n): n is string => !!n).map((n) => n.toLowerCase());
  return `Elegí ${picked.length > 0 ? `${picked.join(", ")} y cantidad` : "cantidad"}`;
}

/** Sabor (o color) como placas. En el celular va pegado a la galería, para ver el cambio en la foto al elegir. */
export function ColorPicker({ product, sel, className }: { product: Product; sel: Props["sel"]; className?: string }) {
  if (sel.colorOptions.length === 0) return null;
  const gear = isGear(product);
  return (
    <div className={className}>
      <FlavorPlates legend={product.optionNames?.color ?? (gear ? "Color" : "Sabor")} options={sel.colorOptions} value={sel.color} onChange={sel.chooseColor} compact={gear} />
    </div>
  );
}

/**
 * Todo lo que se elige en una sola placa: sabor y tamaño como placas (cada tamaño con su precio por servicio y el que
 * más rinde marcado; en el equipamiento, color y talle o peso), stock, cantidad y la compra. En el celular el sabor o
 * color va debajo de la galería (`ColorPicker`), así que acá se oculta.
 */
export function ConfigureCard({ product, sel, quantity, max, stockNote, onQuantity, stock, actions }: Props) {
  const plates = sel.sizeOptions.length > 0 ? sizePlates(product, sel.color) : [];
  return (
    <section id="elegir" aria-label={regionName(product, sel)} className="flex scroll-mt-28 flex-col gap-4 rounded-sm border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <ColorPicker product={product} sel={sel} className="max-lg:hidden" />
      {plates.length > 0 && <SizePlates legend={product.optionNames?.size ?? (isGear(product) ? "Talle" : "Tamaño")} plates={plates} value={sel.size} onChange={sel.chooseSize} />}
      {stock}
      <QuantityPicker value={quantity} max={max} note={stockNote} onChange={onQuantity} />
      {actions}
    </section>
  );
}
