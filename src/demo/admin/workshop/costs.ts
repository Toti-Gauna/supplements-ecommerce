import type { Material, Recipe, WorkshopSettings } from "../../fixtures/workshop";
import type { Category, Product } from "../../types";
import { productMinPrice } from "../stock";

/** Costo por unidad de un producto según su receta: insumos + horas de máquina + horas a mano. Pesos enteros. */
export interface CostBreakdown {
  lines: { material: Material; qty: number; cost: number }[];
  materials: number;
  machine: number;
  hand: number;
  total: number;
  /** Insumos de la receta que ya no existen en la lista. */
  missing: string[];
}

export function recipeCost(recipe: Recipe, materials: Material[], settings: WorkshopSettings): CostBreakdown {
  const byId = new Map(materials.map((m) => [m.id, m]));
  const lines: CostBreakdown["lines"] = [];
  const missing: string[] = [];
  for (const item of recipe.items) {
    const material = byId.get(item.materialId);
    if (!material) { missing.push(item.materialId); continue; }
    lines.push({ material, qty: item.qty, cost: Math.round(item.qty * material.costPerUnit) });
  }
  const mats = lines.reduce((s, l) => s + l.cost, 0);
  const machine = Math.round((recipe.machineMinutes / 60) * settings.machineHourCost);
  const hand = Math.round((recipe.handMinutes / 60) * settings.handHourCost);
  return { lines, materials: mats, machine, hand, total: mats + machine + hand, missing };
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

export function costRows(products: Product[], categories: Category[], recipes: Record<string, Recipe>, materials: Material[], settings: WorkshopSettings): CostRow[] {
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  return products.map((p) => {
    const recipe = recipes[p.slug];
    const price = productMinPrice(p);
    const cost = recipe ? recipeCost(recipe, materials, settings) : null;
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
