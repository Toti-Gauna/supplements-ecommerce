import type { GoalInfo } from "../fixtures/goals";
import type { Category, Product, ProductBadge } from "../types";
import { brandId, filterCatalog, matchesFacet, PPS_BUCKETS, rangeId, slugOf, type CatalogFilters, type ListFacet } from "./catalog-filters";
import { productMetrics } from "./catalog-sort";
import { flavorsOf } from "./search-index";
import { BADGE_LABELS } from "./search-lexicon";

/**
 * Opciones de cada filtro del catálogo con su cuenta: cuántos productos quedarían al tocarla, con el resto de los
 * filtros puestos (la cuenta de facetas de cualquier tienda). Un grupo sin opciones no se muestra: en una categoría de
 * equipamiento no hay sabores ni precio por servicio. Puro y testeado.
 */
export interface FacetOption {
  id: string;
  label: string;
  count: number;
  checked: boolean;
}

export type FacetKey = ListFacet | "pps";

export interface FacetGroup {
  key: FacetKey;
  label: string;
  /** "radio": una sola opción (rango de precio por servicio); "check": varias. */
  kind: "check" | "radio";
  options: FacetOption[];
}

export interface FacetContext {
  goals: GoalInfo[];
  categories: Category[];
  /** Sin el grupo de categoría (dentro de /c/<categoría>/). */
  withCategory?: boolean;
}

export const FACET_LABELS: Record<FacetKey, string> = {
  category: "Categoría", goal: "Objetivo", brand: "Marca", flavor: "Sabor", badge: "Sellos", pps: "Precio por servicio",
};

/** Los valores posibles de un grupo en los productos de la vista, con su etiqueta, en el orden en que se muestran. */
function universe(key: ListFacet, products: Product[], ctx: FacetContext): { id: string; label: string }[] {
  if (key === "goal") return ctx.goals.filter((g) => products.some((p) => p.goals?.includes(g.id))).map((g) => ({ id: g.id, label: g.name }));
  if (key === "badge") {
    const present = new Set(products.flatMap((p) => p.badges ?? []));
    return (Object.keys(BADGE_LABELS) as ProductBadge[]).filter((b) => present.has(b)).map((b) => ({ id: b, label: BADGE_LABELS[b] }));
  }
  if (key === "category") {
    return [...ctx.categories].sort((a, b) => a.sortOrder - b.sortOrder).filter((c) => products.some((p) => p.categorySlug === c.slug)).map((c) => ({ id: c.slug, label: c.name }));
  }
  const labels = new Map<string, string>();
  for (const p of products) {
    if (key === "brand" && p.brand) labels.set(brandId(p), labels.get(brandId(p)) ?? p.brand);
    if (key === "flavor") {
      for (const id of flavorsOf(p)) {
        const label = p.variants.find((v) => v.color && slugOf(v.color) === slugOf(id))?.color ?? id;
        labels.set(slugOf(id), labels.get(slugOf(id)) ?? label);
      }
    }
  }
  return [...labels].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function has(product: Product, key: ListFacet, id: string): boolean {
  return matchesFacet(product, { goal: [], brand: [], flavor: [], badge: [], category: [], pps: null, [key]: [id] }, key);
}

/** Grupos de filtros con sus opciones y cuentas, sobre los productos de la vista (todo el catálogo o una categoría). */
export function catalogFacets(products: Product[], filters: CatalogFilters, ctx: FacetContext): FacetGroup[] {
  // Orden de lectura: para qué, de quién y con qué sellos; después el rango, el sabor y, al final, la categoría (la más larga).
  const keys: ListFacet[] = ["goal", "brand", "badge", "flavor", ...(ctx.withCategory === false ? [] : ["category" as const])];
  const groups: FacetGroup[] = keys.map((key) => {
    // Los sellos se suman: la cuenta es sobre lo que ya queda. El resto son alternativas: sin contar su propio grupo.
    const base = filterCatalog(products, filters, key === "badge" ? undefined : key);
    const chosen: string[] = filters[key];
    const options = universe(key, products, ctx).map(({ id, label }) => ({ id, label, count: base.filter((p) => has(p, key, id)).length, checked: chosen.includes(id) }));
    // Lo que está puesto se muestra aunque ya no exista (un link viejo): así se puede sacar.
    for (const id of chosen) if (!options.some((o) => o.id === id)) options.push({ id, label: id, count: 0, checked: true });
    return { key, label: FACET_LABELS[key], kind: "check" as const, options };
  });
  const pps = products.map((p) => productMetrics(p).perServing).filter((n) => n !== null);
  if (pps.length) {
    const base = filterCatalog(products, filters, "pps");
    const current = filters.pps ? rangeId(filters.pps) : null;
    const options = PPS_BUCKETS.map((b) => ({ id: b.id, label: b.label, count: base.filter((p) => matchesFacet(p, { ...filters, pps: b.range }, "pps")).length, checked: current === b.id }));
    if (current && !options.some((o) => o.checked)) options.push({ id: current, label: rangeLabel(current), count: filterCatalog(products, filters).length, checked: true });
    groups.push({ key: "pps", label: FACET_LABELS.pps, kind: "radio", options });
  }
  const order: FacetKey[] = ["goal", "brand", "badge", "pps", "flavor", "category"];
  return groups.filter((g) => g.options.length > 0).sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

/** "300-800" → "$ 300 a $ 800" (rango escrito a mano en la URL). */
export function rangeLabel(id: string): string {
  const [min, max] = id.split("-").map((s) => (s ? Number(s).toLocaleString("es-AR") : ""));
  if (!max) return `Más de $ ${min}`;
  if (!min || min === "0") return `Hasta $ ${max}`;
  return `$ ${min} a $ ${max}`;
}

/** Los filtros puestos como chips (para sacarlos de a uno), con la etiqueta de su opción. */
export function activeChips(groups: FacetGroup[]): { key: FacetKey; id: string; label: string; group: string }[] {
  return groups.flatMap((g) => g.options.filter((o) => o.checked).map((o) => ({ key: g.key, id: o.id, label: o.label, group: g.label })));
}

