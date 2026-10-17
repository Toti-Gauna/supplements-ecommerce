import type { Nutrition, Product } from "../types";
import { isGear, sortProducts, type SortKey } from "./catalog";
import { rackFacts } from "./rack";

/**
 * Datos "de máquina" del catálogo (R2a): precio por servicio, proteína por servicio y proteína por peso, calculados
 * sobre la presentación que manda (la de la tarjeta). Los órdenes "Más rendidor" y "Más proteína por $" dejan al final
 * lo que no tiene ese dato (equipamiento, envases de un servicio, productos sin proteína). Puro y testeado.
 */
export type CatalogSort = SortKey | "value" | "protein";

export const CATALOG_SORTS: { value: CatalogSort; label: string; param: string }[] = [
  { value: "relevance", label: "Relevancia", param: "" },
  { value: "value", label: "Más rendidor", param: "rendidor" },
  { value: "protein", label: "Más proteína por $", param: "proteina" },
  { value: "price-asc", label: "Menor precio", param: "menor-precio" },
  { value: "price-desc", label: "Mayor precio", param: "mayor-precio" },
  { value: "new", label: "Nuevos primero", param: "nuevos" },
];

/** Gramos de proteína por servicio según el rótulo ("24 g", "5,4 g"); null sin rótulo o sin renglón de proteínas. */
export function proteinGrams(nutrition?: Nutrition): number | null {
  const row = nutrition?.rows.find((r) => r.label.toLowerCase() === "proteínas");
  const m = row?.serving.match(/^([\d.,]+)\s*g\b/i);
  if (!m) return null;
  const grams = Number(m[1]!.replace(/\./g, "").replace(",", "."));
  return grams > 0 ? grams : null;
}

/** Desde cuántos gramos por servicio la proteína cuenta para ordenar (la gelatina de una gomita no es proteína). */
export const PROTEIN_MIN = 5;

export interface ProductMetrics {
  /** Precio del envase que manda (el que se cobra). */
  price: number;
  /** Precio por servicio (null en equipamiento o envases de un solo servicio). */
  perServing: number | null;
  servings: number | null;
  /** Proteína por servicio en gramos. */
  protein: number | null;
  /** Gramos de proteína cada $ 1.000 (con un decimal): el orden "Más proteína por $". Solo desde 5 g por servicio. */
  proteinPerK: number | null;
  gear: boolean;
}

export function productMetrics(product: Product): ProductMetrics {
  const f = rackFacts(product);
  const gear = isGear(product);
  const servings = !gear && (f.lead.servings ?? 0) > 1 ? f.lead.servings! : null;
  const protein = gear ? null : proteinGrams(product.nutrition);
  const proteinPerK = protein && protein >= PROTEIN_MIN && servings && f.price > 0 ? Math.round(((protein * servings) / f.price) * 10_000) / 10 : null;
  return { price: f.price, perServing: servings ? f.perServing : null, servings, protein, proteinPerK, gear };
}

export interface SortedCatalog {
  /** Los que tienen el dato del orden, del mejor al peor (o todos, en los órdenes comunes). */
  ranked: Product[];
  /** Los que no se pueden ordenar por ese dato: van aparte, al final, en el orden de relevancia. */
  rest: Product[];
}

/** Ordena el catálogo. "Más rendidor": menor precio por servicio; "Más proteína por $": más gramos por peso. */
export function sortCatalog(list: Product[], sort: CatalogSort): SortedCatalog {
  if (sort !== "value" && sort !== "protein") return { ranked: sortProducts(list, sort), rest: [] };
  const metric = (p: Product) => (sort === "value" ? productMetrics(p).perServing : productMetrics(p).proteinPerK);
  const scored = sortProducts(list, "relevance").map((p) => ({ p, m: metric(p) }));
  const ranked = scored.filter((s) => s.m !== null).sort((a, b) => (sort === "value" ? a.m! - b.m! : b.m! - a.m!) || a.p.slug.localeCompare(b.p.slug));
  return { ranked: ranked.map((s) => s.p), rest: scored.filter((s) => s.m === null).map((s) => s.p) };
}

/** Por qué quedaron aparte, para el aviso del catálogo. */
export function restNote(sort: CatalogSort): string | null {
  if (sort === "value") return "Sin precio por servicio (equipamiento y envases de un uso): no entran en este orden.";
  if (sort === "protein") return "Sin proteína en el rótulo (o equipamiento): no entran en este orden.";
  return null;
}

export function sortFromParam(param: string | null): CatalogSort {
  return CATALOG_SORTS.find((s) => s.param && s.param === param)?.value ?? "relevance";
}

export function sortParam(sort: CatalogSort): string {
  return CATALOG_SORTS.find((s) => s.value === sort)?.param ?? "";
}
