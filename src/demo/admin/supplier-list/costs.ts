import type { Material, Recipe, WorkshopSettings } from "../../fixtures/workshop";
import type { Product, Variant } from "../../types";
import { marginPct, recipeCost, variantSupplierCost } from "../workshop/costs";
import { variantPrice } from "../stock";

/** Lo que hace falta para costear una variante: recetas (embalaje y costo cargado), insumos y márgenes. */
export interface CostBook {
  recipes: Record<string, Recipe>;
  materials: Material[];
  settings: Pick<WorkshopSettings, "targetMarginPct" | "brandMargins">;
}

/** Margen buscado para una marca: el suyo, o el general de la tienda. */
export function brandMargin(brand: string, settings: CostBook["settings"]): number {
  return settings.brandMargins?.[brand] ?? settings.targetMarginPct;
}

/** Embalaje que lleva una unidad (cajas, folleto, precinto…), en pesos enteros. */
export function packagingCost(recipe: Recipe | undefined, materials: Material[]): number {
  return recipe ? recipeCost(recipe, materials, 0).total : 0;
}

/** Costo del proveedor hoy (cargado a mano, por lista o estimado), o null si no hay. */
export function supplierCostNow(product: Product, variant: Variant, book: CostBook): number | null {
  return variantSupplierCost(product, variant, book.recipes[product.slug])?.cost ?? null;
}

/** Costo puesto en el local: proveedor más embalaje. null si no hay costo del proveedor. */
export function landedCost(product: Product, variant: Variant, book: CostBook, supplierCost = supplierCostNow(product, variant, book)): number | null {
  return supplierCost === null ? null : supplierCost + packagingCost(book.recipes[product.slug], book.materials);
}

/** Margen del precio de lista actual de la variante, o null sin costo. */
export function currentMargin(product: Product, variant: Variant, book: CostBook): number | null {
  const cost = landedCost(product, variant, book);
  return cost === null ? null : marginPct(variantPrice(product, variant), cost);
}
