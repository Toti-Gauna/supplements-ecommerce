import type { Product } from "../types";

/**
 * Descuento "stack" (Fases 2 y 3): si el carrito suma productos de N categorías distintas de suplementos (por
 * defecto 3: p. ej. proteína + creatina + pre), esas líneas tienen un % de descuento. Una sola regla, fácil de
 * explicar en la ficha, el carrito y el armador de stacks. En producción la recalcula el servidor.
 */
export const STACK_CATEGORIES = ["proteinas", "creatinas", "pre-entrenos", "aminoacidos", "ganadores", "definicion", "salud", "hidratacion"] as const;

export interface StackRule {
  pct: number;
  minCategories: number;
}

export const DEFAULT_STACK_RULE: StackRule = { pct: 10, minCategories: 3 };

export interface StackLine {
  product: Pick<Product, "slug" | "categorySlug">;
  lineTotal: number;
}

export interface StackResult {
  /** Categorías de suplementos distintas en el carrito. */
  categories: string[];
  /** Cuántas categorías faltan para el descuento (0 = aplica). */
  missing: number;
  /** Total de las líneas que entran al stack. */
  base: number;
  discount: number;
  pct: number;
}

export function isStackCategory(slug: string): boolean {
  return (STACK_CATEGORIES as readonly string[]).includes(slug);
}

export function stackDiscount(lines: StackLine[], rule: StackRule = DEFAULT_STACK_RULE): StackResult {
  const eligible = lines.filter((l) => isStackCategory(l.product.categorySlug) && l.lineTotal > 0);
  const categories = [...new Set(eligible.map((l) => l.product.categorySlug))];
  const missing = Math.max(0, rule.minCategories - categories.length);
  const base = eligible.reduce((s, l) => s + l.lineTotal, 0);
  const discount = missing === 0 && rule.pct > 0 ? Math.round((base * rule.pct) / 100) : 0;
  return { categories, missing, base, discount, pct: rule.pct };
}

/**
 * Sugerencias para completar el stack desde un producto: los más vendidos de otras categorías de suplementos que
 * comparten objetivo con él (o los más vendidos, si no hay), uno por categoría.
 */
export function stackSuggestions(product: Product, catalog: Product[], count = 2): Product[] {
  const others = catalog.filter((p) => p.active !== false && p.slug !== product.slug && isStackCategory(p.categorySlug) && p.categorySlug !== product.categorySlug && p.variants.some((v) => v.stock !== 0));
  const shared = (p: Product) => (p.goals ?? []).filter((g) => product.goals?.includes(g)).length;
  const sorted = [...others].sort((a, b) => shared(b) - shared(a) || b.soldCount - a.soldCount);
  const picked: Product[] = [];
  for (const p of sorted) {
    if (picked.length >= count) break;
    if (!picked.some((x) => x.categorySlug === p.categorySlug)) picked.push(p);
  }
  return picked;
}
