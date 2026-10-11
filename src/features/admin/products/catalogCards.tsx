"use client";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/components/atoms/Switch";
import type { RowCardProps } from "@/components/organisms/data-table/types";
import { productStockState, productStockTotal, type StockRow } from "@/demo/admin/stock";
import type { Category, Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { StockChip } from "../table/StockChip";
import { StockEditor } from "../stock/StockEditor";
import { minPrice, ProductThumb } from "./productColumns";

/** Tarjetas del celular para Productos y stock: tocar la tarjeta abre la ficha; el switch y el stock no navegan. */
export function ProductCard({ row: p, selected, onToggle, onOpen, categories, low, onVisible }: RowCardProps<Product> & { categories: Category[]; low: number; onVisible: (p: Product) => void }) {
  return (
    <div className={`flex flex-col gap-3 rounded-3xl bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${p.name}`} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
          <ProductThumb product={p} size="w-16" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold leading-tight">{p.name}</span>
            <span className="text-sm text-muted">{categories.find((c) => c.slug === p.categorySlug)?.name} · desde {formatARS(minPrice(p))}</span>
            <span className="mt-1 block"><StockChip state={productStockState(p, low)} units={productStockTotal(p)} /></span>
          </span>
          <ChevronRight size={18} aria-hidden="true" className="mt-1 shrink-0 text-muted" />
        </button>
      </div>
      <Switch checked={p.active !== false} onChange={() => onVisible(p)} label={p.active === false ? "Pausado" : "Visible en la tienda"} />
    </div>
  );
}

export function VariantCard({ row: r, selected, onToggle, onOpen, setStock }: RowCardProps<StockRow> & { setStock: (r: StockRow, stock: number) => void }) {
  return (
    <div className={`flex flex-col gap-3 rounded-3xl bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${r.productName} · ${r.variantLabel}`} className="mt-1 h-5 w-5 accent-primary" />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left"><span className="block font-bold">{r.productName}</span><span className="text-sm text-muted">{r.variantLabel} · {formatARS(r.price)}</span></button>
        <StockChip state={r.state} />
      </div>
      <StockEditor value={r.stock} label={`${r.productName} · ${r.variantLabel}`} onChange={(s) => setStock(r, s)} />
    </div>
  );
}
