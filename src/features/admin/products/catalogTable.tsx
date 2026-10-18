"use client";
import type { Column } from "@/components/organisms/data-table/types";
import { brandsOf } from "@/demo/admin/bulk-price";
import { coverage, coverageText } from "@/demo/admin/live-costs";
import { hasClearance, hasExpiring, type LotRow } from "@/demo/admin/lots";
import { STOCK_LABEL, stockMargin, stockState, type StockRow } from "@/demo/admin/stock";
import type { FilterSpec } from "@/demo/admin/table";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatExpiry } from "@/demo/engine/lots";
import type { Category, Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { LotCell } from "../lots/LotBadge";
import { CostText, MarginText } from "./MarginText";
import { StockChip } from "../table/StockChip";
import { StockEditor } from "../stock/StockEditor";

/** Productos y stock (8.3.19 y Fase 6): mismos filtros para la vista por producto, por variante y la vista Excel. */
export const CATALOG_FILTER_IDS = ["categoria", "marca", "stock", "vence", "visibilidad"];
const STOCK_OPTIONS = [
  { value: "reponer", label: "Para reponer" }, { value: "out", label: "Sin stock" }, { value: "low", label: "Stock bajo" },
  { value: "ok", label: "En stock" }, { value: "made-to-order", label: "A pedido" },
];
const EXPIRY_OPTIONS = [{ value: "pronto", label: "Vence en menos de 60 días" }, { value: "liquidacion", label: "En liquidación" }];
const VISIBILITY = [{ value: "visible", label: "Visibles en la tienda" }, { value: "paused", label: "Pausados" }];
const needsReorder = (state: string, active: boolean) => active && (state === "out" || state === "low");
const brandOptions = (products: Product[]) => brandsOf(products).map((b) => ({ value: b, label: b }));

export function productExpiring(p: Product): boolean {
  return p.variants.some((v) => hasExpiring(v, DEMO_TODAY));
}

export function productFilters(categories: Category[], low: number, products: Product[]): FilterSpec<Product>[] {
  const states = (p: Product) => p.variants.map((v) => stockState(v.stock, low));
  return [
    { id: "categoria", label: "Categoría", allLabel: "Todas", options: categories.map((c) => ({ value: c.slug, label: c.name })), test: (p, v) => p.categorySlug === v },
    { id: "marca", label: "Marca", allLabel: "Todas", options: brandOptions(products), test: (p, v) => p.brand === v },
    { id: "stock", label: "Stock", options: STOCK_OPTIONS,
      test: (p, v) => (v === "reponer" ? states(p).some((s) => needsReorder(s, p.active !== false)) : states(p).includes(v as never)) },
    { id: "vence", label: "Vencimiento", options: EXPIRY_OPTIONS, test: (p, v) => (v === "liquidacion" ? p.variants.some(hasClearance) : productExpiring(p)) },
    { id: "visibilidad", label: "En la tienda", options: VISIBILITY, test: (p, v) => (v === "paused" ? p.active === false : p.active !== false) },
  ];
}

export function variantFilters(categories: Category[], products: Product[]): FilterSpec<StockRow>[] {
  return [
    { id: "categoria", label: "Categoría", allLabel: "Todas", options: categories.map((c) => ({ value: c.slug, label: c.name })), test: (r, v) => r.categorySlug === v },
    { id: "marca", label: "Marca", allLabel: "Todas", options: brandOptions(products), test: (r, v) => r.brand === v },
    { id: "stock", label: "Stock", options: STOCK_OPTIONS, test: (r, v) => (v === "reponer" ? needsReorder(r.state, r.active) : r.state === v) },
    { id: "vence", label: "Vencimiento", options: EXPIRY_OPTIONS, test: (r, v) => (v === "liquidacion" ? r.onClearance : r.expiring.length > 0) },
    { id: "visibilidad", label: "En la tienda", options: VISIBILITY, test: (r, v) => (v === "paused" ? !r.active : r.active) },
  ];
}

export const variantSearch = (r: StockRow) => `${r.productName} ${r.variantLabel} ${r.categoryName} ${r.brand} ${r.lot?.code ?? ""}`;
export const productSearch = (p: Product) => `${p.name} ${p.slug} ${p.brand} ${p.tags.join(" ")}`;

interface VariantActions { setStock: (r: StockRow, stock: number) => void; onClear: (lot: LotRow) => void; /** Unidades vendidas por día de cada variante (clave `producto::variante`), para la cobertura. */ sales: Map<string, number> }

/**
 * Una fila por variante: el stock se edita acá mismo (− / + / número / a pedido) y el lote que vence se liquida.
 * Categoría y "En la tienda" arrancan ocultas (son filtros); marca, precio por servicio, lote, costo y margen están a
 * la vista (R2: el costo sale de la variante o de Costos; "≈" cuando se estima en proporción al precio).
 */
export function variantColumns({ setStock, onClear, sales }: VariantActions): Column<StockRow>[] {
  const cover = (r: StockRow) => coverage(r.stock, sales.get(r.key) ?? 0);
  return [
    { id: "product", header: "Producto", pinned: true, primary: true, cell: (r) => r.productName, sortValue: (r) => r.productName, exportValue: (r) => r.productName },
    { id: "variant", header: "Variante", cell: (r) => r.variantLabel, sortValue: (r) => r.variantLabel, exportValue: (r) => r.variantLabel },
    { id: "category", header: "Categoría", defaultHidden: true, cell: (r) => r.categoryName, sortValue: (r) => r.categoryName, exportValue: (r) => r.categoryName },
    { id: "brand", header: "Marca", cell: (r) => r.brand, sortValue: (r) => r.brand, exportValue: (r) => r.brand },
    { id: "price", header: "Precio", align: "right", money: true, cell: (r) => formatARS(r.price), sortValue: (r) => r.price, exportValue: (r) => r.price },
    { id: "servingPrice", header: "Precio por servicio", align: "right", money: true, cell: (r) => (r.servingPrice === null ? "—" : formatARS(r.servingPrice)), sortValue: (r) => r.servingPrice, exportValue: (r) => r.servingPrice ?? "" },
    { id: "stock", header: "Unidades", cell: (r) => <StockEditor value={r.stock} label={`${r.productName} · ${r.variantLabel}`} onChange={(s) => setStock(r, s)} />, sortValue: (r) => (r.stock < 0 ? Number.MAX_SAFE_INTEGER : r.stock), exportValue: (r) => (r.stock < 0 ? "a pedido" : r.stock) },
    { id: "lot", header: "Lote y vencimiento", className: "min-w-[12rem]", cell: (r) => <LotCell row={r} onClear={onClear} />, sortValue: (r) => r.lot?.expires ?? null, exportValue: (r) => (r.lot ? `${r.lot.code} · ${formatExpiry(r.lot.expires)}` : "") },
    { id: "state", header: "Estado", cell: (r) => <StockChip state={r.state} />, sortValue: (r) => ["out", "low", "ok", "made-to-order"].indexOf(r.state), exportValue: (r) => STOCK_LABEL[r.state] },
    { id: "active", header: "En la tienda", defaultHidden: true, cell: (r) => (r.active ? "Visible" : <span className="text-muted">Pausado</span>), sortValue: (r) => r.active, exportValue: (r) => (r.active ? "Visible" : "Pausado") },
    { id: "cost", header: "Costo", align: "right", money: true, cell: (r) => (r.cost ? <CostText row={r} /> : "—"), sortValue: (r) => r.cost ?? null, exportValue: (r) => r.cost ?? "" },
    { id: "margin", header: "Margen", align: "right", cell: (r) => <MarginText value={stockMargin(r)} />, sortValue: stockMargin, exportValue: (r) => stockMargin(r) ?? "" },
    // R4c: para cuántos días alcanza el stock al ritmo de venta (el detalle está en Compras → Costos vivos).
    { id: "coverage", header: "Cobertura", defaultHidden: true, align: "right", cell: (r) => coverageText(cover(r)), sortValue: (r) => cover(r).days, exportValue: (r) => coverageText(cover(r)) },
    { id: "value", header: "Valor en stock", align: "right", money: true, cell: (r) => (r.stock > 0 ? formatARS(r.stock * r.price) : "—"), sortValue: (r) => Math.max(0, r.stock) * r.price, exportValue: (r) => Math.max(0, r.stock) * r.price },
  ];
}
