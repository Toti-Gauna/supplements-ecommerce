import { goals as defaultGoals, type GoalInfo } from "../fixtures/goals";
import type { Category, Goal, Product } from "../types";
import { flavorsOf, indexProducts, matchesChips, scoreTerms } from "./search-index";
import { SYNONYMS } from "./search-lexicon";
import { parseQuery, removeChip, removeWords, tokenize, type QueryContext, type QueryTerm, type SearchChip } from "./search-query";
import { levenshtein, normalize, stem } from "./search-text";

/**
 * Buscador del rubro: entiende sellos ("sin tacc", "vegana"), objetivos ("para definir") y sabores ("chocolate") como
 * filtros, busca el resto con sinónimos ("whey" ↔ "proteína de suero") y tolera errores leves.
 * En producción: Postgres unaccent + pg_trgm con el mismo vocabulario.
 */
export { levenshtein, normalize, tokenScore } from "./search-text";
export { removeChip, type SearchChip } from "./search-query";

export interface SearchResult {
  product: Product;
  score: number;
  inStock: boolean;
}

/** Qué probar cuando no hay resultados. `query` es la consulta completa para poner en el buscador. */
export type SearchSuggestion =
  | { kind: "drop-chip"; chip: SearchChip; query: string; count: number }
  | { kind: "drop-term"; term: string; query: string; count: number }
  | { kind: "spelling"; query: string; count: number };

export interface SearchOutcome {
  results: SearchResult[];
  /** Filtros entendidos, en el orden en que se escribieron. */
  chips: SearchChip[];
  /** Palabras libres que se buscaron (como se escribieron). */
  terms: string[];
  /** "sin X" que no es un sello: no se filtra (la UI puede avisarlo). */
  ignored: string[];
  /** Solo con 0 resultados: hasta 3 consultas alternativas que sí dan resultados. */
  suggestions: SearchSuggestion[];
}

export interface SearchOptions {
  /** Objetivos vigentes (nombres editados en el panel) para las etiquetas de los chips. */
  goals?: GoalInfo[];
}

function context(products: Product[], goals: GoalInfo[]): QueryContext {
  const flavors = new Map<string, string>();
  for (const p of products) {
    if (flavorsOf(p).length) for (const v of p.variants) if (v.color && normalize(v.color)) flavors.set(normalize(v.color), v.color);
  }
  return { flavors, goalName: (id: Goal) => goals.find((g) => g.id === id)?.name ?? id };
}

function run(query: string, products: Product[], categories: Category[], ctx: QueryContext) {
  const parsed = parseQuery(query, ctx);
  const results: SearchResult[] = [];
  if (parsed.chips.length + parsed.terms.length > 0) {
    for (const item of indexProducts(products, categories)) {
      if (!matchesChips(item, parsed.chips)) continue;
      const score = scoreTerms(item, parsed.terms);
      if (score !== null) results.push({ product: item.product, score, inStock: item.inStock });
    }
  }
  // Sin stock al final; después relevancia y, a igual relevancia, lo más vendido.
  results.sort((a, b) => Number(b.inStock) - Number(a.inStock) || b.score - a.score || b.product.soldCount - a.product.soldCount);
  return { parsed, results };
}

/** Búsqueda completa: resultados, chips de filtros entendidos y sugerencias si no hay nada. */
export function searchCatalog(query: string, products: Product[], categories: Category[], options: SearchOptions = {}): SearchOutcome {
  const ctx = context(products, options.goals ?? defaultGoals);
  const { parsed, results } = run(query, products, categories, ctx);
  const outcome: SearchOutcome = { results, chips: parsed.chips, terms: parsed.terms.map((t) => t.source), ignored: parsed.ignored, suggestions: [] };
  if (results.length > 0 || parsed.chips.length + parsed.terms.length === 0) return outcome;
  const count = (q: string) => (q.trim() ? run(q, products, categories, ctx).results.length : 0);
  const candidates: SearchSuggestion[] = [];
  const spelled = respell(query, parsed.terms, products, categories);
  if (spelled) candidates.push({ kind: "spelling", query: spelled, count: count(spelled) });
  for (const chip of parsed.chips) {
    const q = removeChip(query, chip);
    candidates.push({ kind: "drop-chip", chip, query: q, count: count(q) });
  }
  if (parsed.terms.length + parsed.chips.length > 1) {
    for (const term of parsed.terms) {
      const q = removeWords(query, term.at);
      candidates.push({ kind: "drop-term", term: term.source, query: q, count: count(q) });
    }
  }
  const seen = new Set<string>();
  outcome.suggestions = candidates
    .filter((s) => s.count > 0 && !seen.has(normalize(s.query)) && seen.add(normalize(s.query)))
    // La corrección de tipeo primero (respeta lo que se buscaba); después lo que más resultados da.
    .sort((a, b) => Number(b.kind === "spelling") - Number(a.kind === "spelling") || b.count - a.count)
    .slice(0, 3);
  return outcome;
}

/** Solo la lista de resultados (la usan el buscador superpuesto y /buscar). */
export function searchProducts(query: string, products: Product[], categories: Category[], options?: SearchOptions): SearchResult[] {
  return searchCatalog(query, products, categories, options).results;
}

/** Palabras conocidas del catálogo y del rubro, para corregir errores de tipeo. */
function vocabulary(products: Product[], categories: Category[] = []): Set<string> {
  const text = [...products.flatMap((p) => [p.name, ...p.tags]), ...categories.map((c) => c.name), ...SYNONYMS.map((s) => s.term)].join(" ");
  return new Set(normalize(text).split(" ").filter((w) => w.length > 3));
}

function closest(token: string, words: Set<string>, allowSame = false): string | null {
  let best: { word: string; d: number } | null = null;
  for (const word of words) {
    const d = levenshtein(token, word);
    if (!best || d < best.d) best = { word, d };
  }
  return best && (allowSame || best.d > 0) && best.d <= Math.max(2, Math.floor(token.length / 2)) ? best.word : null;
}

/** La consulta con cada palabra libre desconocida cambiada por la más parecida del catálogo. */
function respell(query: string, terms: QueryTerm[], products: Product[], categories: Category[]): string | null {
  const words = vocabulary(products, categories);
  const fixes = new Map<number, string>();
  for (const t of terms) {
    const fix = t.known || words.has(normalize(t.source)) ? null : closest(normalize(t.source), words);
    if (fix && stem(fix) !== t.text) fixes.set(t.at[0]!, fix);
  }
  if (!fixes.size) return null;
  return tokenize(query).map((t, i) => fixes.get(i) ?? t.raw).join(" ");
}

/** Sugerencia "¿Quisiste decir…?" con la palabra del catálogo más parecida a la primera palabra. */
export function suggestTerm(query: string, products: Product[]): string | null {
  const token = normalize(query).split(" ")[0];
  return token ? closest(token, vocabulary(products), true) : null;
}
