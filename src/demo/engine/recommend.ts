import type { Product } from "../types";
import type { CartLine } from "./cart-types";
import { activeProducts, bestSellers, fromPrice, getProduct } from "./catalog";
import { STACK_CATEGORIES } from "./stack";

const isSupplement = (p: Product) => (STACK_CATEGORIES as readonly string[]).includes(p.categorySlug);
const inStock = (p: Product) => p.variants.some((v) => v.stock !== 0);

/** Recomendaciones de la demo: afinidad por etiquetas y categoría + popularidad. Sin datos personales. */
function overlap(a: string[], b: string[]): number {
  return a.filter((t) => b.includes(t)).length;
}

function rank(candidates: Product[], score: (p: Product) => number, n: number): Product[] {
  return candidates
    .map((p) => ({ p, s: score(p) + p.soldCount / 100 + (p.isNew ? 0.3 : 0) }))
    .sort((a, b) => b.s - a.s || a.p.slug.localeCompare(b.p.slug))
    .slice(0, n)
    .map((x) => x.p);
}

/** "También te puede gustar": misma categoría y etiquetas compartidas. */
export function recommendForProduct(product: Product, n = 4): Product[] {
  const pool = activeProducts().filter((p) => p.slug !== product.slug);
  return rank(pool, (p) => (p.categorySlug === product.categorySlug ? 4 : 0) + overlap(p.tags, product.tags) * 3, n);
}

/**
 * "Completá tu pedido": complementos que no están en el carrito, con preferencia por otra categoría y precio accesible.
 * Si ya hay suplementos, empuja los de otra categoría de suplementos: son los que suman al descuento stack.
 */
export function recommendForCart(lines: CartLine[], n = 4): Product[] {
  const inCart = lines.flatMap((l) => getProduct(l.productSlug) ?? []);
  const slugs = new Set(inCart.map((p) => p.slug));
  const cats = new Set(inCart.map((p) => p.categorySlug));
  const tags = inCart.flatMap((p) => p.tags);
  const pool = activeProducts().filter((p) => !slugs.has(p.slug) && inStock(p));
  if (inCart.length === 0) return rank(pool, () => 0, n);
  const stacking = inCart.some(isSupplement);
  return rank(pool, (p) => overlap(p.tags, tags) * 2 + (cats.has(p.categorySlug) ? 0 : 1.5 + (stacking && isSupplement(p) ? 2 : 0)) + (fromPrice(p) <= 15000 ? 1 : 0), n);
}

/**
 * "Recomendados" del inicio: con carrito, lo mismo que "Completá tu pedido"; vacío, lo destacado que no está en el riel
 * "Más vendidos" (sus `bestCount` primeros), para que los dos rieles no muestren los mismos productos.
 */
export function recommendForHome(lines: CartLine[], n = 4, bestCount = n): Product[] {
  if (lines.some((l) => getProduct(l.productSlug))) return recommendForCart(lines, n);
  const best = new Set(bestSellers(bestCount).map((p) => p.slug));
  return rank(activeProducts().filter((p) => !best.has(p.slug) && inStock(p)), () => 0, n);
}
