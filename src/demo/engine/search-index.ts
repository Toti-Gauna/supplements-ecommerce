import type { Category, Product } from "../types";
import type { QueryTerm, SearchChip } from "./search-query";
import { normalize, stems, tokenScore } from "./search-text";

/** Producto listo para buscar: palabras por campo (con peso), sabores y si hay stock. */
export interface IndexedProduct {
  product: Product;
  fields: { words: string[]; weight: number }[];
  /** Palabras del nombre y de las etiquetas: un sabor escrito ahí también cuenta ("Mantequilla de maní"). */
  nameWords: string[];
  flavors: string[];
  inStock: boolean;
}

/** Sabores de un producto (normalizados). Las opciones que no son sabor (color de un shaker) no cuentan. */
export function flavorsOf(product: Product): string[] {
  const option = product.optionNames?.color;
  if (option && normalize(option) !== "sabor") return [];
  return [...new Set(product.variants.map((v) => normalize(v.color ?? "")).filter(Boolean))];
}

/** Con stock = alguna variante con unidades o a pedido (stock -1). */
export const hasStock = (product: Product) => product.variants.some((v) => v.stock !== 0);

/** Pesos: nombre > categoría, marca, etiquetas, objetivos y sabores > bajada y descripción. */
export function indexProducts(products: Product[], categories: Category[]): IndexedProduct[] {
  return products.map((product) => {
    const category = categories.find((c) => c.slug === product.categorySlug);
    const flavors = flavorsOf(product);
    const keys = [category?.name ?? "", product.brand, ...product.tags, ...(product.goals ?? []).map((g) => g.replace(/-/g, " ")), ...flavors].join(" ");
    return {
      product,
      fields: [
        { words: stems(product.name), weight: 3 },
        { words: stems(keys), weight: 2 },
        { words: stems(`${product.short} ${product.description}`), weight: 1 },
      ],
      nameWords: stems(`${product.name} ${product.tags.join(" ")}`),
      flavors,
      inStock: hasStock(product),
    };
  });
}

/**
 * Filtros: los sellos se suman (vegano Y sin TACC); los objetivos y los sabores son alternativas entre sí
 * (chocolate O vainilla).
 */
export function matchesChips(item: IndexedProduct, chips: readonly SearchChip[]): boolean {
  const byKind = (kind: SearchChip["kind"]) => chips.filter((c) => c.kind === kind);
  const badges = byKind("badge");
  const goals = byKind("goal");
  const flavors = byKind("flavor");
  const p = item.product;
  if (!badges.every((c) => p.badges?.includes(c.id as never))) return false;
  if (goals.length && !goals.some((c) => p.goals?.includes(c.id as never))) return false;
  return !flavors.length || flavors.some((c) => item.flavors.includes(c.id) || inName(item, c.id));
}

function inName(item: IndexedProduct, flavor: string): boolean {
  const words = stems(flavor);
  return item.nameWords.some((_, i) => words.every((w, k) => item.nameWords[i + k] === w));
}

/** Mejor puntaje de una palabra en un campo, desde un mínimo (4 = solo entera, 2 = sin errores de tipeo, 1 = todo). */
function fieldScore(token: string, words: string[], weight: number, min: number): number {
  let best = 0;
  for (const w of words) {
    const s = tokenScore(token, w);
    if (s > best && s >= min) best = s;
  }
  return best * weight;
}

/**
 * Exigencia por campo: en la descripción no se toleran errores de tipeo (daban ruido: "caseina" ≈ "cafeína") y las
 * palabras de hasta 3 letras ("pre") van enteras; en el nombre y las etiquetas, al menos como comienzo de palabra
 * ("pre" no es "neoprene"). Una palabra del rubro bien escrita tampoco se busca con errores.
 */
function minScore(term: QueryTerm, weight: number): number {
  if (term.text.length <= 3) return weight === 1 ? 4 : 3;
  return weight === 1 || term.known ? 2 : 1;
}

/** Puntaje de un término: la palabra escrita (con tolerancia a errores) o un sinónimo (solo entero o como prefijo, vale 1 menos). */
export function termScore(item: IndexedProduct, term: QueryTerm): number {
  let best = 0;
  for (const { words, weight } of item.fields) {
    best = Math.max(best, fieldScore(term.text, words, weight, minScore(term, weight)));
    for (const alt of term.alts) {
      const s = fieldScore(alt, words, 1, 3);
      if (s) best = Math.max(best, (s - 1) * weight);
    }
  }
  return best;
}

/** null si alguna palabra libre no aparece; si no, la suma de sus puntajes. */
export function scoreTerms(item: IndexedProduct, terms: readonly QueryTerm[]): number | null {
  let total = 0;
  for (const term of terms) {
    const s = termScore(item, term);
    if (s === 0) return null;
    total += s;
  }
  return total;
}
