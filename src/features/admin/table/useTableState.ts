"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Sort, TableState, TableView } from "@/components/organisms/data-table/types";
import type { FilterValues } from "@/demo/admin/table";
import { useTablePrefs } from "@/stores/tablePrefs";
import { rememberList } from "../listReturn";

interface Defaults {
  sort?: Sort | null;
  hidden?: string[];
  /** Filtros que viven en la URL (`?etapa=pagos&pagina=2`): Atrás, recargar y los enlaces los conservan. */
  filterIds?: string[];
  /** Parámetros viejos que todavía llegan por enlaces o rutas anteriores (se traducen y se limpian). */
  legacy?: { params: string[]; read: (p: URLSearchParams) => FilterValues };
}

interface UrlState { query: string; page: number; filters: FilterValues; view: TableView }

function read(p: URLSearchParams, d: Defaults): UrlState {
  const filters: FilterValues = { ...d.legacy?.read(p) };
  for (const id of d.filterIds ?? []) { const v = p.get(id); if (v) filters[id] = v; }
  return { query: p.get("q") ?? "", page: Math.max(1, Number(p.get("pagina")) || 1), filters, view: p.get("formato") === "excel" ? "excel" : "table" };
}

/**
 * Estado de una tabla del panel (8.3.4). Búsqueda, filtros, página y vista Excel van en la URL; orden, columnas
 * ocultas y densidad se recuerdan en este navegador. La selección no se guarda.
 */
export function useTableState(id: string, defaults: Defaults = {}): TableState {
  const params = useSearchParams();
  const pathname = usePathname();
  const current = params.toString();
  // La ficha que se abra desde esta lista vuelve con estos filtros y esta página.
  useEffect(() => { rememberList(pathname, current); }, [pathname, current]);
  const [s, setS] = useState(() => read(params, defaults));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Si la URL cambia desde afuera (un enlace a esta misma pantalla), se vuelve a leer; lo que escribió la tabla, no.
  const [sync, setSync] = useState({ seen: current, written: [current] });
  if (current !== sync.seen) {
    const external = !sync.written.includes(current);
    setSync({ seen: current, written: external ? [current] : sync.written });
    if (external) setS(read(params, defaults));
  }
  // Atrás y Adelante del navegador (por ejemplo, de la vista Excel a la tabla) siempre releen la URL.
  const ids = (defaults.filterIds ?? []).join(",");
  // Si la vista Excel se abrió desde la tabla, "Volver" usa Atrás (no apila otra entrada en el historial).
  const pushed = useRef(false);
  useEffect(() => {
    const onPop = () => { pushed.current = false; setS(read(new URLSearchParams(window.location.search), { filterIds: ids ? ids.split(",") : [] })); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [ids]);
  const saved = useTablePrefs((x) => x.prefs[id]);
  const save = useTablePrefs((x) => x.set);
  const hidden = saved?.hidden ?? defaults.hidden ?? [];
  const sort = saved?.sort === undefined ? (defaults.sort ?? null) : saved.sort;

  const commit = (next: UrlState, mode: "replace" | "push" = "replace") => {
    setS(next);
    const url = new URLSearchParams(window.location.search);
    for (const k of defaults.legacy?.params ?? []) url.delete(k);
    const put = (k: string, v: string) => (v ? url.set(k, v) : url.delete(k));
    put("q", next.query);
    put("pagina", next.page > 1 ? String(next.page) : "");
    for (const f of defaults.filterIds ?? []) put(f, next.filters[f] ?? "");
    put("formato", next.view === "excel" ? "excel" : "");
    const qs = url.toString();
    setSync((x) => ({ ...x, written: [...x.written.slice(-30), qs] }));
    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", qs ? `?${qs}` : window.location.pathname);
  };
  const dirty = !!s.query || Object.values(s.filters).some(Boolean) || JSON.stringify(sort) !== JSON.stringify(defaults.sort ?? null);

  return {
    query: s.query,
    setQuery: (query) => commit({ ...s, query, page: 1 }),
    filters: s.filters,
    setFilter: (f, value) => { commit({ ...s, filters: { ...s.filters, [f]: value }, page: 1 }); setSelected(new Set()); },
    dirty,
    reset: () => { commit({ ...s, query: "", filters: {}, page: 1 }); setSelected(new Set()); save(id, { sort: defaults.sort ?? null }); },
    sort,
    setSort: (next) => { save(id, { sort: next }); commit({ ...s, page: 1 }); },
    page: s.page,
    setPage: (page) => commit({ ...s, page }),
    view: s.view,
    setView: (view) => {
      if (view === "table" && pushed.current) { pushed.current = false; window.history.back(); return; }
      pushed.current = view === "excel";
      commit({ ...s, view }, view === "excel" ? "push" : "replace");
    },
    selected,
    setSelected,
    hidden: new Set(hidden),
    toggleColumn: (col) => save(id, { hidden: hidden.includes(col) ? hidden.filter((c) => c !== col) : [...hidden, col] }),
    density: saved?.density ?? "comfortable",
    setDensity: (density) => save(id, { density }),
  };
}
