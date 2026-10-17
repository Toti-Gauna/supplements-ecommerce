"use client";
import { useId } from "react";
import { Select } from "@/components/atoms/Select";
import { variantOptions } from "@/demo/engine/catalog";
import { MAX_QTY } from "@/demo/engine/stack-link";
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
  qty: number;
  onChange: (variantId: string) => void;
  onQty: (qty: number) => void;
}

/** Cantidad (hasta 3, o lo que haya en stock): la sube "Igualar duración" y se puede cambiar a mano. */
function QtySelect({ id, product, variant, qty, onQty }: { id: string; product: Product; variant: Variant; qty: number; onQty: (qty: number) => void }) {
  const max = variant.stock < 0 ? MAX_QTY : Math.max(1, Math.min(MAX_QTY, variant.stock));
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={`${id}-qty`} className="text-xs font-bold text-muted">Cantidad<span className="sr-only"> de {product.name}</span></label>
      <Select id={`${id}-qty`} value={String(qty)} className="min-h-11 rounded-sm px-3 text-sm" onChange={(e) => onQty(Number(e.target.value))}>
        {Array.from({ length: max }, (_, i) => <option key={i} value={i + 1}>{i + 1} {i ? "unidades" : "unidad"}</option>)}
      </Select>
    </div>
  );
}

/** Sabor, tamaño y cantidad del producto de un lugar (selects nativos). Lo que no tiene stock aparece deshabilitado. */
export function SlotVariantSelects({ product, variant, qty, onChange, onQty }: SlotVariantSelectsProps) {
  const id = useId();
  const { colors, sizes } = variantOptions(product);
  const fields = [
    { key: "color" as const, label: product.optionNames?.color ?? "Sabor", value: variant.color, options: colors.map((c) => c.name) },
    { key: "size" as const, label: product.optionNames?.size ?? "Tamaño", value: variant.size, options: sizes },
  ].filter((f) => f.options.length > 1 && f.value);
  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((f) => (
        <div key={f.key} className="flex min-w-0 flex-col gap-1">
          <label htmlFor={`${id}-${f.key}`} className="text-xs font-bold text-muted">{f.label}<span className="sr-only"> de {product.name}</span></label>
          <Select id={`${id}-${f.key}`} value={f.value} className="min-h-11 rounded-sm px-3 text-sm"
            onChange={(e) => { const next = choose(product, variant, f.key, e.target.value); if (next) onChange(next.id); }}>
            {f.options.map((o) => {
              const available = product.variants.some((v) => v[f.key] === o && inStock(v));
              return <option key={o} value={o} disabled={!available}>{o}{available ? "" : " (sin stock)"}</option>;
            })}
          </Select>
        </div>
      ))}
      <QtySelect id={id} product={product} variant={variant} qty={qty} onQty={onQty} />
    </div>
  );
}
