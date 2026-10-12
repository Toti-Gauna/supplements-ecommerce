import type { Material, Recipe, WorkshopSettings } from "../../fixtures/workshop";
import type { Category, Product, Variant } from "../../types";
import { productMinPrice, variantPrice } from "../stock";

/** Costo por unidad de un producto revendido: lo que se le paga al proveedor + el embalaje que lleva. Pesos enteros. */
export interface CostBreakdown {
  /** Lo que se le paga al proveedor. */
  merchandise: number;
  lines: { material: Material; qty: number; cost: number }[];
  materials: number;
  total: number;
  /** Insumos del embalaje que ya no existen en la lista. */
  missing: string[];
}

export function recipeCost(recipe: Recipe, materials: Material[], merchandise = recipe.supplierCost ?? 0): CostBreakdown {
  const byId = new Map(materials.map((m) => [m.id, m]));
  const lines: CostBreakdown["lines"] = [];
  const missing: string[] = [];
  for (const item of recipe.items) {
    const material = byId.get(item.materialId);
    if (!material) { missing.push(item.materialId); continue; }
    lines.push({ material, qty: item.qty, cost: Math.round(item.qty * material.costPerUnit) });
  }
  const mats = lines.reduce((s, l) => s + l.cost, 0);
  return { merchandise, lines, materials: mats, total: merchandise + mats, missing };
}

/**
 * Costo del proveedor de una presentación: el propio si está cargado; si no, el de la más barata en proporción al
 * precio (mismo margen). null si el producto no tiene costo de proveedor.
 */
export function variantSupplierCost(product: Product, variant: Variant, recipe: Recipe | undefined): { cost: number; estimated: boolean } | null {
  const own = recipe?.variantCosts?.[variant.id];
  if (own !== undefined) return { cost: own, estimated: false };
  if (recipe?.supplierCost === undefined) return null;
  const min = productMinPrice(product);
  const price = variantPrice(product, variant);
  return { cost: price === min || min <= 0 ? recipe.supplierCost : Math.round((recipe.supplierCost * price) / min), estimated: price !== min };
}

/** Precio que deja el margen buscado sobre el precio de venta, redondeado hacia arriba a $100. */
export function suggestedPrice(cost: number, marginPct: number): number {
  const pct = Math.min(Math.max(Math.round(marginPct), 0), 90);
  // En enteros (cost × 100 / (100 − %)) para que el error de coma flotante no sume $100 de más.
  return Math.ceil((cost * 100) / (100 - pct) / 100) * 100;
}

/** Margen sobre el precio de venta, en % entero. */
export function marginPct(price: number, cost: number): number | null {
  return price > 0 ? Math.round(((price - cost) / price) * 100) : null;
}

export type MarginState = "ok" | "low" | "loss" | "missing";

export const MARGIN_LABEL: Record<MarginState, string> = { ok: "Buen margen", low: "Margen bajo", loss: "Pierde plata", missing: "Sin costo cargado" };

export function marginState(margin: number | null, target: number): MarginState {
  if (margin === null) return "missing";
  if (margin < 0) return "loss";
  return margin < target ? "low" : "ok";
}

/** Margen de una presentación al precio actual, con su costo (proveedor + embalaje). */
export interface VariantMargin {
  variant: Variant;
  price: number;
  cost: number | null;
  estimated: boolean;
  margin: number | null;
  state: MarginState;
  suggested: number | null;
}

export function variantMargins(product: Product, recipe: Recipe | undefined, materials: Material[], target: number): VariantMargin[] {
  return product.variants.map((variant) => {
    const price = variantPrice(product, variant);
    const supplier = variantSupplierCost(product, variant, recipe);
    const cost = supplier && recipe ? recipeCost(recipe, materials, supplier.cost).total : null;
    const margin = cost === null ? null : marginPct(price, cost);
    return { variant, price, cost, estimated: !!supplier?.estimated, margin, state: marginState(margin, target), suggested: cost === null ? null : suggestedPrice(cost, target) };
  });
}

export interface CostRow {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  /** Precio más bajo de venta ("desde"): el margen se mide en el caso menos favorable. */
  price: number;
  cost: CostBreakdown | null;
  margin: number | null;
  suggested: number | null;
  /** Ganancia por unidad al precio actual. */
  profit: number | null;
  state: MarginState;
}

export function costRows(products: Product[], categories: Category[], recipes: Record<string, Recipe>, materials: Material[], settings: Pick<WorkshopSettings, "targetMarginPct">): CostRow[] {
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  return products.map((p) => {
    const recipe = recipes[p.slug];
    const price = productMinPrice(p);
    const cost = recipe?.supplierCost !== undefined ? recipeCost(recipe, materials) : null;
    const margin = cost ? marginPct(price, cost.total) : null;
    return {
      slug: p.slug, name: p.name, categorySlug: p.categorySlug, categoryName: names.get(p.categorySlug) ?? p.categorySlug, price, cost, margin,
      suggested: cost ? suggestedPrice(cost.total, settings.targetMarginPct) : null,
      profit: cost ? price - cost.total : null,
      state: marginState(margin, settings.targetMarginPct),
    };
  });
}

/** Precio base que hace que el precio "desde" sea `target` (las variantes conservan su diferencia). */
export function basePriceFor(product: Product, target: number): number {
  return product.basePrice + (target - productMinPrice(product));
}
