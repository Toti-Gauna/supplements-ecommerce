import type { Goal, Product, ProductBadge } from "../types";
import { sortFromParam, sortParam, productMetrics, type CatalogSort } from "./catalog-sort";
import { flavorsOf } from "./search-index";
import { normalize } from "./search-text";

/**
 * Filtros "de máquina" del catálogo (R2a): objetivo, marca, sabor, sellos, precio por servicio y categoría. Viven en la
 * URL (`?marca=krono-nutrition&sello=sin-tacc&orden=rendidor`), así se comparten y sobreviven a recargar; la demo los
 * lee en el navegador (export estático). Dentro de un grupo son alternativas (Krono O Ozono); los sellos se suman
 * (vegano Y sin TACC), como en el buscador. Puro y testeado; en producción, la misma consulta en el servidor.
 */
export interface PpsRange {
  min: number | null;
  max: number | null;
}

export interface CatalogFilters {
  goal: Goal[];
  brand: string[];
  flavor: string[];
  badge: ProductBadge[];
  category: string[];
  pps: PpsRange | null;
}

export interface CatalogState {
  filters: CatalogFilters;
  sort: CatalogSort;
}

export type ListFacet = Exclude<keyof CatalogFilters, "pps">;

export const EMPTY_FILTERS: CatalogFilters = { goal: [], brand: [], flavor: [], badge: [], category: [], pps: null };

/** Nombre de cada filtro en la URL (en castellano, como se lee en el link). */
export const PARAMS: Record<keyof CatalogFilters, string> = {
  goal: "objetivo", brand: "marca", flavor: "sabor", badge: "sello", category: "categoria", pps: "porserv",
};

/** "VOLTA Lab" → "volta-lab"; "Cookies & cream" → "cookies-cream". Ids estables para la URL. */
export const slugOf = (text: string) => normalize(text).replace(/\s+/g, "-");

export const brandId = (product: Product) => slugOf(product.brand);
export const flavorIds = (product: Product) => flavorsOf(product).map(slugOf);

/** Rangos de precio por servicio para tocar (pesos enteros). */
export const PPS_BUCKETS: { id: string; label: string; range: PpsRange }[] = [
  { id: "0-500", label: "Hasta $ 500", range: { min: null, max: 500 } },
  { id: "500-1000", label: "$ 500 a $ 1.000", range: { min: 500, max: 1000 } },
  { id: "1000-2000", label: "$ 1.000 a $ 2.000", range: { min: 1000, max: 2000 } },
  { id: "2000-", label: "Más de $ 2.000", range: { min: 2000, max: null } },
];

/** "500-1000", "-500", "2000-" → rango; cualquier otra cosa, sin filtro. */
export function parseRange(value: string | null): PpsRange | null {
  const m = value?.trim().match(/^(\d*)-(\d*)$/);
  if (!m || (!m[1] && !m[2])) return null;
  const min = m[1] ? Number(m[1]) : null;
  const max = m[2] ? Number(m[2]) : null;
  if (min !== null && max !== null && min > max) return null;
  return { min: min || null, max };
}

export function rangeId(range: PpsRange): string {
  return `${range.min ?? 0}-${range.max ?? ""}`;
}

/** Lee los filtros y el orden de la URL. Valores repetidos o vacíos se ignoran. */
export function parseCatalogParams(search: string | URLSearchParams): CatalogState {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const list = (key: string) => [...new Set((params.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean))];
  return {
    filters: {
      goal: list(PARAMS.goal) as Goal[],
      brand: list(PARAMS.brand),
      flavor: list(PARAMS.flavor),
      badge: list(PARAMS.badge) as ProductBadge[],
      category: list(PARAMS.category),
      pps: parseRange(params.get(PARAMS.pps)),
    },
    sort: sortFromParam(params.get("orden")),
  };
}

/** La URL de un estado, en un orden fijo (sin "?" si no hay nada). Las comas quedan legibles. */
export function catalogQuery(state: CatalogState): string {
  const parts: string[] = [];
  const f = state.filters;
  for (const key of ["category", "goal", "brand", "flavor", "badge"] as const) {
    if (f[key].length) parts.push(`${PARAMS[key]}=${f[key].map(encodeURIComponent).join(",")}`);
  }
  if (f.pps) parts.push(`${PARAMS.pps}=${rangeId(f.pps)}`);
  const sort = sortParam(state.sort);
  if (sort) parts.push(`orden=${sort}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** Rango "más de `min`, hasta `max` inclusive": así los rangos que se tocan no se pisan ($ 500 es "Hasta $ 500"). */
export function inRange(value: number | null, range: PpsRange): boolean {
  if (value === null) return false;
  return (range.min === null || value > range.min) && (range.max === null || value <= range.max);
}

/** ¿El producto pasa el grupo de filtros `key`? (Un grupo vacío no filtra.) */
export function matchesFacet(product: Product, filters: CatalogFilters, key: keyof CatalogFilters): boolean {
  if (key === "pps") return !filters.pps || inRange(productMetrics(product).perServing, filters.pps);
  const chosen: string[] = filters[key];
  if (!chosen.length) return true;
  if (key === "badge") return chosen.every((b) => (product.badges as string[] | undefined)?.includes(b));
  if (key === "goal") return chosen.some((g) => (product.goals as string[] | undefined)?.includes(g));
  if (key === "brand") return chosen.includes(brandId(product));
  if (key === "category") return chosen.includes(product.categorySlug);
  const ids = flavorIds(product);
  return chosen.some((f) => ids.includes(f));
}

const FACETS: (keyof CatalogFilters)[] = ["category", "goal", "brand", "flavor", "badge", "pps"];

/** Productos que pasan todos los filtros (salvo el grupo `except`, para contar las opciones de ese grupo). */
export function filterCatalog(products: Product[], filters: CatalogFilters, except?: keyof CatalogFilters): Product[] {
  return products.filter((p) => FACETS.every((key) => key === except || matchesFacet(p, filters, key)));
}

/** Cuántos filtros hay puestos (para "Filtros (3)"). */
export function activeCount(filters: CatalogFilters): number {
  return filters.goal.length + filters.brand.length + filters.flavor.length + filters.badge.length + filters.category.length + (filters.pps ? 1 : 0);
}

/** Suma o saca una opción de un grupo de lista. */
export function toggleFilter(filters: CatalogFilters, key: ListFacet, id: string): CatalogFilters {
  const list: string[] = filters[key];
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  return { ...filters, [key]: next };
}
