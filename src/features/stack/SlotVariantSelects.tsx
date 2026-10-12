"use client";
import { useId } from "react";
import { Select } from "@/components/atoms/Select";
import { variantOptions } from "@/demo/engine/catalog";
import type { Product, Variant } from "@/demo/types";

const inStock = (v: Variant) => v.stock !== 0;

/** La variante con ese sabor (o tamaño) que conserva lo otro si hay stock; si no, la primera con stock. */
function choose(product: Product, current: Variant, key: "color" | "size", value: string): Variant | undefined {
  const other = key === "color" ? "size" : "color";
  const matches = product.variants.filter((v) => v[key] === value && inStock(v));
  return matches.find((v) => v[other] === current[other]) ?? matches[0];
}

interface SlotVariantSelectsProps {
  product: Product;
  variant: Variant;
  onChange: (variantId: string) => void;
}

/** Sabor y tamaño del producto de un lugar (selects nativos). Lo que no tiene stock aparece deshabilitado. */
export function SlotVariantSelects({ product, variant, onChange }: SlotVariantSelectsProps) {
  const id = useId();
  const { colors, sizes } = variantOptions(product);
  const fields = [
    { key: "color" as const, label: product.optionNames?.color ?? "Sabor", value: variant.color, options: colors.map((c) => c.name) },
    { key: "size" as const, label: product.optionNames?.size ?? "Tamaño", value: variant.size, options: sizes },
  ].filter((f) => f.options.length > 1 && f.value);
  if (fields.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((f) => (
        <div key={f.key} className={fields.length === 1 ? "col-span-2 flex flex-col gap-1 sm:col-span-1" : "flex min-w-0 flex-col gap-1"}>
          <label htmlFor={`${id}-${f.key}`} className="text-xs font-bold text-muted">{f.label}<span className="sr-only"> de {product.name}</span></label>
          <Select id={`${id}-${f.key}`} value={f.value} className="min-h-11 rounded-xl px-3 text-sm"
            onChange={(e) => { const next = choose(product, variant, f.key, e.target.value); if (next) onChange(next.id); }}>
            {f.options.map((o) => {
              const available = product.variants.some((v) => v[f.key] === o && inStock(v));
              return <option key={o} value={o} disabled={!available}>{o}{available ? "" : " (sin stock)"}</option>;
            })}
          </Select>
        </div>
      ))}
    </div>
  );
}
