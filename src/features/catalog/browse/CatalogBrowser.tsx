"use client";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { CATALOG_SORTS, type CatalogSort } from "@/demo/engine/catalog-sort";
import type { Product } from "@/demo/types";
import { plural } from "@/lib/plural";
import { ActiveFilters } from "./ActiveFilters";
import { CatalogResults } from "./CatalogResults";
import { FilterGroups } from "./FilterGroups";
import { useCatalogBrowse } from "./useCatalogBrowse";

const SELECT = "min-h-11 min-w-0 max-w-full rounded-sm border border-line bg-surface pl-3 pr-8 font-mono text-[12px] font-bold uppercase tracking-[0.04em] text-ink hover:border-ink/40 focus:border-primary focus:outline-none";
const SORT_HINT: Partial<Record<CatalogSort, string>> = {
  value: "Del menor precio por servicio al mayor.",
  protein: "De más a menos gramos de proteína por cada peso (según el rótulo).",
};

/**
 * Catálogo con filtros de máquina (R2a): en el escritorio, la columna de filtros a la izquierda; en el celular, un
 * panel que sube desde abajo con "Ver N productos". Arriba de la grilla, los filtros puestos como chips, cuántos
 * productos quedan y el orden (incluye "Más rendidor" y "Más proteína por $"). Todo se refleja en la URL.
 */
export function CatalogBrowser({ scope, withCategory, label = "Filtros del catálogo" }: { scope: Product[]; withCategory: boolean; label?: string }) {
  const browse = useCatalogBrowse(scope, withCategory);
  const { state, groups, total, active, toggle, clear } = browse;
  const [sheet, setSheet] = useState(false);
  const hint = SORT_HINT[state.sort];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-10">
      <aside aria-label={label} className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
        <p className="eyebrow mb-4 flex items-center gap-2 text-volt-ink"><SlidersHorizontal size={14} aria-hidden="true" /> Filtros</p>
        <FilterGroups groups={groups} onToggle={toggle} />
      </aside>
      <div className="min-w-0">
        <div className="plate mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border border-line px-3 py-2">
          <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog"
            className="bevel inline-flex min-h-11 items-center gap-2 rounded-xs border border-line bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-ink lg:hidden">
            <SlidersHorizontal size={16} aria-hidden="true" /> Filtros{active ? <span className="bg-primary px-1.5 text-on-primary">{active}</span> : null}
          </button>
          <p aria-live="polite" className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted max-sm:order-last max-sm:w-full">{plural(total, "producto", "productos")}</p>
          <label className="flex min-w-0 flex-1 items-center justify-end gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            <span className="max-sm:sr-only">Ordenar por</span>
            <select value={state.sort} onChange={(e) => browse.setSort(e.target.value as CatalogSort)} className={`${SELECT} max-sm:flex-1`}>
              {CATALOG_SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <ActiveFilters groups={groups} onToggle={toggle} onClear={clear} className="mb-4" />
        {hint && <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-volt-ink">{hint}</p>}
        <CatalogResults sorted={browse.sorted} sort={state.sort} onClear={active ? clear : undefined} />
      </div>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Filtros" side="bottom" className="h-[88dvh]">
        <div className="plate flex h-14 shrink-0 items-center gap-3 border-b border-line pl-4 pr-16">
          <span className="eyebrow text-volt-ink">Filtros</span>
          {active > 0 && <span className="font-mono text-[11px] text-muted">{plural(active, "puesto", "puestos")}</span>}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
          <FilterGroups groups={groups} onToggle={toggle} />
        </div>
        <div className="flex shrink-0 gap-2 border-t border-line bg-surface p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button variant="secondary" onClick={clear} disabled={!active} className="flex-1">Limpiar</Button>
          <Button onClick={() => setSheet(false)} className="flex-[2]">Ver {plural(total, "producto", "productos")}</Button>
        </div>
      </Sheet>
    </div>
  );
}
