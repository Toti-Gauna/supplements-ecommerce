import { normalize } from "../engine/search";
import type { Category, Product } from "../types";
import { DEFAULT_LOW_STOCK, lowStockRows } from "./stock";

/** Categorías como filas de tabla (8.3.22): posición en la tienda, productos activos y variantes para reponer. */
export interface CategoryRow {
  slug: string;
  name: string;
  featured: boolean;
  /** Lugar en el orden de la tienda (1 = primera). Es global: ordenar o paginar la tabla no lo cambia. */
  position: number;
  active: number;
  total: number;
  reorder: number;
}

export function categoryRows(categories: Category[], products: Product[], low = DEFAULT_LOW_STOCK): CategoryRow[] {
  const toReorder = lowStockRows(products, categories, low);
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c, i) => {
    const mine = products.filter((p) => p.categorySlug === c.slug);
    return {
      slug: c.slug, name: c.name, featured: c.featured, position: i + 1,
      active: mine.filter((p) => p.active !== false).length, total: mine.length,
      reorder: toReorder.filter((r) => r.categorySlug === c.slug).length,
    };
  });
}

/** Nombre repetido (sin tildes ni mayúsculas). Se permite, como antes, pero se avisa al crear. */
export function hasCategoryNamed(categories: Category[], name: string): boolean {
  const key = normalize(name);
  return !!key && categories.some((c) => normalize(c.name) === key);
}
