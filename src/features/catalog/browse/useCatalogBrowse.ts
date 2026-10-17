"use client";
import { useMemo } from "react";
import { catalogFacets, type FacetGroup, type FacetKey } from "@/demo/engine/catalog-facets";
import { activeCount, catalogQuery, EMPTY_FILTERS, filterCatalog, parseCatalogParams, PPS_BUCKETS, parseRange, rangeId, toggleFilter, type CatalogState } from "@/demo/engine/catalog-filters";
import { sortCatalog, type CatalogSort, type SortedCatalog } from "@/demo/engine/catalog-sort";
import type { Product } from "@/demo/types";
import { useUrlSearch } from "@/lib/useUrlSearch";
import { useDemoVersion } from "@/stores/admin";
import { useGoals } from "../useGoals";

export interface CatalogBrowse {
  state: CatalogState;
  groups: FacetGroup[];
  sorted: SortedCatalog;
  /** Productos que pasan los filtros. */
  total: number;
  active: number;
  toggle: (key: FacetKey, id: string) => void;
  setSort: (sort: CatalogSort) => void;
  clear: () => void;
}

/**
 * Catálogo con filtros de máquina sobre `scope` (todo el catálogo o una categoría). El estado vive en la URL: se
 * comparte, sobrevive a recargar y "Atrás" no junta un paso por cada filtro (se reemplaza la entrada).
 */
export function useCatalogBrowse(scope: Product[], withCategory: boolean): CatalogBrowse {
  const [search, replace] = useUrlSearch();
  const data = useDemoVersion();
  const goals = useGoals();
  const state = useMemo(() => parseCatalogParams(search), [search]);
  const groups = useMemo(() => catalogFacets(scope, state.filters, { goals, categories: data.categories, withCategory }), [scope, state.filters, goals, data.categories, withCategory]);
  const filtered = useMemo(() => filterCatalog(scope, state.filters), [scope, state.filters]);
  const sorted = useMemo(() => sortCatalog(filtered, state.sort), [filtered, state.sort]);
  const go = (next: CatalogState) => replace(catalogQuery(next));
  const toggle = (key: FacetKey, id: string) => {
    if (key !== "pps") return go({ ...state, filters: toggleFilter(state.filters, key, id) });
    // Rango: elegir uno reemplaza al anterior; "" (Cualquiera) o el mismo de nuevo lo sacan.
    const same = state.filters.pps !== null && rangeId(state.filters.pps) === id;
    const range = !id || same ? null : (PPS_BUCKETS.find((b) => b.id === id)?.range ?? parseRange(id));
    go({ ...state, filters: { ...state.filters, pps: range } });
  };
  return {
    state, groups, sorted, total: filtered.length, active: activeCount(state.filters), toggle,
    setSort: (sort) => go({ ...state, sort }),
    clear: () => go({ filters: EMPTY_FILTERS, sort: state.sort }),
  };
}
