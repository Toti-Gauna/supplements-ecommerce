import { DEMO_TODAY } from "../fixtures/admin-orders";
import type { Category, Lot, Product, Variant } from "../types";
import { firstOutLot } from "../engine/lots";
import { hasClearance, variantLotRows, withStock, type LotRow } from "./lots";

/** Stock por variante para las tablas, la planilla y las alertas del panel. */
export const DEFAULT_LOW_STOCK = 3;

export type StockState = "made-to-order" | "out" | "low" | "ok";

export function stockState(stock: number, low = DEFAULT_LOW_STOCK): StockState {
  if (stock < 0) return "made-to-order";
  if (stock === 0) return "out";
  return stock <= low ? "low" : "ok";
}

export const STOCK_LABEL: Record<StockState, string> = { "made-to-order": "A pedido", out: "Sin stock", low: "Stock bajo", ok: "En stock" };

export interface StockRow {
  key: string;
  productSlug: string;
  productName: string;
  categorySlug: string;
  categoryName: string;
  variantId: string;
  variantLabel: string;
  brand: string;
  /** Precio de lista de la variante (base + diferencia), en pesos enteros. */
  price: number;
  /** Costo del proveedor, si está cargado. */
  cost?: number;
  stock: number;
  state: StockState;
  active: boolean;
  /** Lote que sale primero (FEFO). */
  lot?: Lot;
  lots: number;
  /** Lotes vencidos o que vencen en menos de 60 días, el más urgente primero. */
  expiring: LotRow[];
  onClearance: boolean;
}

export function variantPrice(product: Product, variant: Variant): number {
  return product.basePrice + variant.priceDelta;
}

export function stockRows(products: Product[], categories: Category[], low = DEFAULT_LOW_STOCK, today = DEMO_TODAY): StockRow[] {
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      key: `${p.slug}::${v.id}`,
      productSlug: p.slug,
      productName: p.name,
      categorySlug: p.categorySlug,
      categoryName: names.get(p.categorySlug) ?? p.categorySlug,
      variantId: v.id,
      variantLabel: v.label,
      brand: p.brand,
      price: variantPrice(p, v),
      cost: v.cost,
      stock: v.stock,
      state: stockState(v.stock, low),
      active: p.active !== false,
      lot: firstOutLot(v),
      lots: (v.lots ?? []).filter((l) => l.units > 0).length,
      expiring: variantLotRows(p, v, today).filter((r) => r.state !== "ok"),
      onClearance: hasClearance(v),
    })),
  );
}

/** Variantes con stock finito que piden reposición (sin stock o bajo el umbral), solo de productos visibles. */
export function lowStockRows(products: Product[], categories: Category[], low = DEFAULT_LOW_STOCK): StockRow[] {
  return stockRows(products, categories, low).filter((r) => r.active && (r.state === "low" || r.state === "out"));
}

/** Stock total de un producto: null si alguna variante es a pedido (no se suma lo que no tiene límite). */
export function productStockTotal(product: Product): number | null {
  if (product.variants.some((v) => v.stock < 0)) return null;
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

/** Peor estado de stock del producto, para el chip de la tabla. */
export function productStockState(product: Product, low = DEFAULT_LOW_STOCK): StockState {
  const states = product.variants.map((v) => stockState(v.stock, low));
  for (const s of ["out", "low", "ok", "made-to-order"] as const) if (states.includes(s)) return s;
  return "made-to-order";
}

/** Margen sobre el precio de lista con el costo del proveedor, en % entero (null sin costo cargado). */
export function stockMargin(r: Pick<StockRow, "price" | "cost">): number | null {
  return r.cost && r.price > 0 ? Math.round(((r.price - r.cost) / r.price) * 100) : null;
}

/** Valor del inventario finito a precio de venta. */
export function inventoryValue(rows: StockRow[]): number {
  return rows.reduce((sum, r) => sum + (r.stock > 0 ? r.stock * r.price : 0), 0);
}

/** Precio más bajo entre las variantes ("desde"). */
export function productMinPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => variantPrice(product, v)));
}

/** Operación de stock en lote: sumar unidades (lo "a pedido" queda igual) o fijar un valor (-1 = a pedido). */
export type StockOp = { kind: "add"; units: number } | { kind: "set"; stock: number };

export function applyStockOp(products: Product[], keys: string[], op: StockOp): Product[] {
  const set = new Set(keys);
  return products.map((p) => ({
    ...p,
    variants: p.variants.map((v) => {
      if (!set.has(`${p.slug}::${v.id}`)) return v;
      if (op.kind === "set") return withStock(v, op.stock);
      return v.stock < 0 ? v : withStock(v, Math.max(0, v.stock + op.units));
    }),
  }));
}
