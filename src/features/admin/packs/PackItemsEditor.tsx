"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { addItem, moveItem, patchItem, productChoices, removeItem } from "@/demo/admin/packs";
import type { Category, PackItem, Product } from "@/demo/types";
import { PackItemRow } from "./PackItemRow";

interface Props {
  items: PackItem[];
  products: Product[];
  categories: Category[];
  onChange: (items: PackItem[]) => void;
}

/** Productos del pack: agregar (solo activos, agrupados por categoría) y, por producto, cantidad, variante, orden y quitar. */
export function PackItemsEditor({ items, products, categories, onChange }: Props) {
  const [pick, setPick] = useState("");
  const groups = productChoices(products, categories, items.map((i) => i.productSlug));
  const add = () => { if (!pick) return; onChange(addItem(items, pick)); setPick(""); };
  return (
    <section aria-labelledby="pack-items" className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5">
      <div>
        <h2 id="pack-items" className="text-lg font-extrabold">Productos del pack ({items.length})</h2>
        <p className="text-sm text-muted">Un pack lleva al menos dos productos y un suplemento. Los suplementos se repiten cada mes; el equipamiento viaja solo en la primera entrega.</p>
      </div>
      {items.length === 0 ? <p className="rounded-sm bg-bg p-4 text-sm text-muted">Todavía no agregaste productos.</p> : (
        <ol aria-label="Productos del pack" className="flex flex-col gap-2">
          {items.map((item, i) => (
            <PackItemRow key={item.productSlug} item={item} product={products.find((p) => p.slug === item.productSlug)} first={i === 0} last={i === items.length - 1}
              onPatch={(patch) => onChange(patchItem(items, item.productSlug, patch))} onMove={(dir) => onChange(moveItem(items, item.productSlug, dir))} onRemove={() => onChange(removeItem(items, item.productSlug))} />
          ))}
        </ol>
      )}
      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-4">
        <label className="flex min-w-0 flex-1 basis-60 flex-col gap-1 text-sm font-bold">Agregar un producto
          <Select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Elegí un producto…</option>
            {groups.map((g) => <optgroup key={g.category.slug} label={g.category.name}>{g.products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</optgroup>)}
          </Select>
        </label>
        <Button variant="secondary" disabled={!pick} onClick={add}><Plus size={17} aria-hidden="true" /> Agregar al pack</Button>
      </div>
    </section>
  );
}
