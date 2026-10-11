"use client";
import type { Column } from "@/components/organisms/data-table/types";
import { STOCK_LABEL, stockState, type StockRow } from "@/demo/admin/stock";
import type { FilterSpec } from "@/demo/admin/table";
import type { Category, Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { StockChip } from "../table/StockChip";
import { StockEditor } from "../stock/StockEditor";

/** Productos y stock (8.3.19): mismos filtros para la vista por producto, por variante y la vista Excel. */
const STOCK_OPTIONS = [
  { value: "reponer", label: "Para reponer" }, { value: "out", label: "Sin stock" }, { value: "low", label: "Stock bajo" },
  { value: "ok", label: "En stock" }, { value: "made-to-order", label: "A pedido" },
];
const VISIBILITY = [{ value: "visible", label: "Visibles en la tienda" }, { value: "paused", label: "Pausados" }];
const needsReorder = (state: string, active: boolean) => active && (state === "out" || state === "low");

export function productFilters(categories: Category[], low: number): FilterSpec<Product>[] {
  const states = (p: Product) => p.variants.map((v) => stockState(v.stock, low));
  return [
    { id: "categoria", label: "Categoría", allLabel: "Todas", options: categories.map((c) => ({ value: c.slug, label: c.name })), test: (p, v) => p.categorySlug === v },
    { id: "stock", label: "Stock", options: STOCK_OPTIONS,
      test: (p, v) => (v === "reponer" ? states(p).some((s) => needsReorder(s, p.active !== false)) : states(p).includes(v as never)) },
    { id: "visibilidad", label: "En la tienda", options: VISIBILITY, test: (p, v) => (v === "paused" ? p.active === false : p.active !== false) },
  ];
}

export function variantFilters(categories: Category[]): FilterSpec<StockRow>[] {
  return [
    { id: "categoria", label: "Categoría", allLabel: "Todas", options: categories.map((c) => ({ value: c.slug, label: c.name })), test: (r, v) => r.categorySlug === v },
    { id: "stock", label: "Stock", options: STOCK_OPTIONS, test: (r, v) => (v === "reponer" ? needsReorder(r.state, r.active) : r.state === v) },
    { id: "visibilidad", label: "En la tienda", options: VISIBILITY, test: (r, v) => (v === "paused" ? !r.active : r.active) },
  ];
}

export const variantSearch = (r: StockRow) => `${r.productName} ${r.variantLabel} ${r.categoryName}`;
export const productSearch = (p: Product) => `${p.name} ${p.slug} ${p.tags.join(" ")}`;

/** Una fila por variante: el stock se edita acá mismo (− / + / número / a pedido). */
export function variantColumns(setStock: (r: StockRow, stock: number) => void): Column<StockRow>[] {
  return [
    { id: "product", header: "Producto", pinned: true, primary: true, cell: (r) => r.productName, sortValue: (r) => r.productName, exportValue: (r) => r.productName },
    { id: "variant", header: "Variante", cell: (r) => r.variantLabel, sortValue: (r) => r.variantLabel, exportValue: (r) => r.variantLabel },
    { id: "category", header: "Categoría", cell: (r) => r.categoryName, sortValue: (r) => r.categoryName, exportValue: (r) => r.categoryName },
    { id: "price", header: "Precio", align: "right", money: true, cell: (r) => formatARS(r.price), sortValue: (r) => r.price, exportValue: (r) => r.price },
    { id: "stock", header: "Unidades", cell: (r) => <StockEditor value={r.stock} label={`${r.productName} · ${r.variantLabel}`} onChange={(s) => setStock(r, s)} />, sortValue: (r) => (r.stock < 0 ? Number.MAX_SAFE_INTEGER : r.stock), exportValue: (r) => (r.stock < 0 ? "a pedido" : r.stock) },
    { id: "state", header: "Estado", cell: (r) => <StockChip state={r.state} />, sortValue: (r) => ["out", "low", "ok", "made-to-order"].indexOf(r.state), exportValue: (r) => STOCK_LABEL[r.state] },
    { id: "active", header: "En la tienda", cell: (r) => (r.active ? "Visible" : <span className="text-muted">Pausado</span>), sortValue: (r) => r.active, exportValue: (r) => (r.active ? "Visible" : "Pausado") },
    { id: "value", header: "Valor en stock", align: "right", money: true, cell: (r) => (r.stock > 0 ? formatARS(r.stock * r.price) : "—"), sortValue: (r) => Math.max(0, r.stock) * r.price, exportValue: (r) => Math.max(0, r.stock) * r.price },
  ];
}
