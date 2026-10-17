import { pricePerServing } from "../engine/servings";
import type { Recipe } from "../fixtures/workshop";
import type { Product, Variant } from "../types";
import { variantPrice, type StockRow } from "./stock";
import { marginPct, variantSupplierCost } from "./workshop/costs";

/**
 * Precio por servicio y margen en Productos y stock (R2): por variante y, en la vista por producto, como rango entre
 * sus presentaciones. El costo es el del proveedor (el de la variante, el de Costos o, si no hay, estimado en
 * proporción al precio, como en Costos). Pesos enteros y % enteros. Puro y testeado.
 */
export interface Range { min: number; max: number }

export function rangeOf(values: readonly (number | null | undefined)[]): Range | null {
  const nums = values.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  return nums.length ? { min: Math.min(...nums), max: Math.max(...nums) } : null;
}

/** "—" sin datos, un valor si el rango es uno solo y "mín – máx" si varía. */
export function formatRange(r: Range | null, fmt: (n: number) => string): string {
  if (!r) return "—";
  return r.min === r.max ? fmt(r.min) : `${fmt(r.min)} – ${fmt(r.max)}`;
}

/** Precio de lista ÷ servicios del envase (null sin servicios: equipamiento o sin cargar). */
export function variantServingPrice(p: Product, v: Variant): number | null {
  const price = variantPrice(p, v);
  return price > 0 ? pricePerServing(price, v.servings) : null;
}

export function productServingRange(p: Product): Range | null {
  return rangeOf(p.variants.map((v) => variantServingPrice(p, v)));
}

/** Margen sobre el precio de lista con el costo del proveedor (% entero), con qué costo y si ese costo es estimado. */
export function marginInfo(p: Product, v: Variant, recipe: Recipe | undefined): { margin: number; cost: number; estimated: boolean } | null {
  const cost = variantSupplierCost(p, v, recipe);
  const margin = cost ? marginPct(variantPrice(p, v), cost.cost) : null;
  return cost && margin !== null ? { margin, ...cost } : null;
}

export function variantMargin(p: Product, v: Variant, recipe: Recipe | undefined): number | null {
  return marginInfo(p, v, recipe)?.margin ?? null;
}

export function productMarginRange(p: Product, recipe: Recipe | undefined): Range | null {
  return rangeOf(p.variants.map((v) => variantMargin(p, v, recipe)));
}

/** Completa las filas de stock con el costo del proveedor (estimado si hace falta), así la columna Margen no queda vacía. */
export function withSupplierCosts(rows: StockRow[], products: readonly Product[], recipes: Readonly<Record<string, Recipe>>): StockRow[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return rows.map((r) => {
    const p = bySlug.get(r.productSlug);
    const v = p?.variants.find((x) => x.id === r.variantId);
    const cost = p && v ? variantSupplierCost(p, v, recipes[p.slug]) : null;
    return cost ? { ...r, cost: cost.cost, costEstimated: cost.estimated } : r;
  });
}
