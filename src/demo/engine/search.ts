import type { Category, Product } from "../types";

/** Búsqueda tolerante a acentos y errores de tipeo. En producción: Postgres unaccent + pg_trgm. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

function tolerance(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

/** 0 = no coincide; mayor = mejor. */
export function tokenScore(token: string, word: string): number {
  if (word === token) return 4;
  if (word.startsWith(token)) return 3;
  if (token.length >= 3 && word.includes(token)) return 2;
  const tol = tolerance(token);
  if (tol === 0) return 0;
  let best = Infinity;
  for (let len = Math.max(1, token.length - 1); len <= Math.min(word.length, token.length + 2); len++) {
    best = Math.min(best, levenshtein(token, word.slice(0, len)));
  }
  return best <= tol ? 1 : 0;
}

function words(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

export interface SearchResult {
  product: Product;
  score: number;
}

export function searchProducts(query: string, products: Product[], categories: Category[]): SearchResult[] {
  const tokens = words(query);
  if (tokens.length === 0) return [];
  const results: SearchResult[] = [];
  for (const product of products) {
    const category = categories.find((c) => c.slug === product.categorySlug);
    const fields = [
      { text: product.name, weight: 3 },
      { text: `${category?.name ?? ""} ${product.tags.join(" ")}`, weight: 2 },
      { text: `${product.short} ${product.description}`, weight: 1 },
    ].map((f) => ({ words: words(f.text), weight: f.weight }));
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      let best = 0;
      for (const field of fields) for (const w of field.words) best = Math.max(best, tokenScore(token, w) * field.weight);
      if (best === 0) matchedAll = false;
      score += best;
    }
    if (matchedAll) results.push({ product, score });
  }
  return results.sort((a, b) => b.score - a.score || b.product.soldCount - a.product.soldCount);
}

/** Sugerencia "¿Quisiste decir…?" con la palabra del catálogo más parecida. */
export function suggestTerm(query: string, products: Product[]): string | null {
  const token = words(query)[0];
  if (!token) return null;
  const vocabulary = new Set(products.flatMap((p) => [...words(p.name), ...p.tags.flatMap(words)]).filter((w) => w.length > 3));
  let best: { word: string; d: number } | null = null;
  for (const word of vocabulary) {
    const d = levenshtein(token, word);
    if (!best || d < best.d) best = { word, d };
  }
  return best && best.d <= Math.max(2, Math.floor(token.length / 2)) ? best.word : null;
}
