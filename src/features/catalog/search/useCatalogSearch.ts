"use client";
import { useMemo } from "react";
import type { RackRowData } from "@/components/molecules/RackRow";
import { searchCatalog, type SearchOutcome } from "@/demo/engine/search";
import { chipOptions, type ChipGroups } from "@/demo/engine/search-facets";
import { searchRowFacts } from "@/demo/engine/search-row";
import type { Product } from "@/demo/types";
import { useDemoVersion } from "@/stores/admin";
import { useGoals } from "../useGoals";

/** Datos de la fila de rack de un producto (todo calculado en el engine). */
export function toRackRow(product: Product): RackRowData {
  return {
    name: product.name, brand: product.brand || undefined, art: product.art, pack: product.pack,
    photoUrl: product.photoDataUrl, tint: product.variants[0]?.colorHex, facts: searchRowFacts(product),
  };
}

/**
 * Búsqueda del rubro sobre el catálogo vigente (con lo editado en el panel): resultados, chips entendidos,
 * sugerencias y los filtros para tocar. Comparten el buscador superpuesto y /buscar.
 */
export function useCatalogSearch(query: string): { outcome: SearchOutcome; options: ChipGroups; products: Product[] } {
  const data = useDemoVersion();
  const goals = useGoals();
  const products = useMemo(() => data.products.filter((p) => p.active !== false), [data.products]);
  const outcome = useMemo(() => searchCatalog(query, products, data.categories, { goals }), [query, products, data.categories, goals]);
  const options = useMemo(() => chipOptions(products, goals), [products, goals]);
  return { outcome, options, products };
}
