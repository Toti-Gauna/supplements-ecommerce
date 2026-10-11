"use client";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useId, useState } from "react";
import type { FilterSpec, FilterValues } from "@/demo/admin/table";
import { cn } from "@/lib/cn";
import { HelpPanel } from "@/components/molecules/Help";
import { FilterControl } from "./FilterControl";

interface Props<T> {
  searchLabel: string;
  searchPlaceholder?: string;
  query: string;
  onQuery: (q: string) => void;
  filters: FilterSpec<T>[];
  values: FilterValues;
  onFilter: (id: string, value: string) => void;
  count?: (id: string, value: string) => number;
  dirty: boolean;
  onReset: () => void;
}

// Cuántos filtros entran en la barra según el ancho real de la tabla (container queries, sin medir con JS):
// el primero desde 50rem, el segundo desde 62rem, el tercero desde 73rem; del cuarto en adelante, siempre en "Más filtros".
const INLINE = ["hidden @min-[50rem]:flex", "hidden @min-[62rem]:flex", "hidden @min-[73rem]:flex"];
const IN_MORE = ["flex @min-[50rem]:hidden", "flex @min-[62rem]:hidden", "flex @min-[73rem]:hidden"];
const MORE_GONE = ["@min-[50rem]:hidden", "@min-[62rem]:hidden", "@min-[73rem]:hidden"];
// Contador del botón "Más filtros": cuántos filtros activos quedaron adentro, para cada tramo de ancho.
const TIER = ["inline @min-[50rem]:hidden", "hidden @min-[50rem]:inline @min-[62rem]:hidden", "hidden @min-[62rem]:inline @min-[73rem]:hidden", "hidden @min-[73rem]:inline"];

// Sin tailwind-merge: forma y colores van por separado para que nunca compitan dos fondos o dos bordes.
const shape = "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border px-3.5 text-sm font-bold transition-colors disabled:opacity-40";
const idle = "border-ink/12 bg-surface hover:border-ink/25";

/**
 * Barra común de las tablas del panel (8.3.4): buscar, filtros que entran en el ancho y el resto en "Más filtros",
 * y "Reiniciar". La búsqueda filtra mientras escribís; "Buscar" la confirma y cierra el teclado del celular.
 */
export function DataTableToolbar<T>(p: Props<T>) {
  const uid = useId();
  const [more, setMore] = useState(false);
  const [help, setHelp] = useState<string | null>(null);
  const helpSpec = p.filters.find((f) => f.id === help && f.help);
  const n = p.filters.length;
  const active = (from: number) => p.filters.slice(from).filter((f) => p.values[f.id]).length;
  const control = (f: FilterSpec<T>, i: number, where: "bar" | "more") => (
    <FilterControl key={f.id} spec={f} value={p.values[f.id] ?? ""} onChange={(v) => p.onFilter(f.id, v)} count={p.count && ((v) => p.count!(f.id, v))}
      idPrefix={`${uid}-${where}`} className={where === "bar" ? cn("w-44 shrink-0", INLINE[i] ?? "hidden") : (IN_MORE[i] ?? "flex")}
      help={{ open: help === f.id, controls: `${uid}-help`, onToggle: () => setHelp(help === f.id ? null : f.id) }} />
  );
  return (
    <form role="search" aria-label="Buscar y filtrar" onSubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement | null)?.blur(); }}
      className="@container flex flex-col gap-3 border-b border-line p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex min-w-[min(100%,21rem)] flex-1 flex-col gap-1 text-sm font-bold">
          <label htmlFor={`${uid}-q`}>{p.searchLabel}</label>
          <span className="flex gap-2">
            <span className="relative min-w-0 flex-1">
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id={`${uid}-q`} type="search" value={p.query} onChange={(e) => p.onQuery(e.target.value)} placeholder={p.searchPlaceholder} enterKeyHint="search"
                className="h-11 w-full rounded-2xl border border-ink/12 bg-bg pl-10 pr-10 text-[15px] font-medium placeholder:text-muted/60 focus:border-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/12" />
              {p.query && (
                <button type="button" onClick={() => p.onQuery("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-accent">
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </span>
            <button type="submit" className={cn(shape, "border-night bg-night text-[#f6f1e8] hover:bg-night/90")}>Buscar</button>
          </span>
        </div>
        {p.filters.map((f, i) => control(f, i, "bar"))}
        <div className="grid w-full grid-cols-2 gap-2 @min-[40rem]:flex @min-[40rem]:w-auto">
          {n > 0 && (
            <button type="button" aria-expanded={more} aria-controls={`${uid}-more`} onClick={() => setMore(!more)} className={cn(shape, more ? "border-primary bg-primary/[0.06]" : idle, n <= 3 && MORE_GONE[n - 1])}>
              <SlidersHorizontal size={16} aria-hidden="true" />Más filtros
              {TIER.map((cls, t) => active(t) > 0 && <span key={t} className={cn(cls, "rounded-full bg-primary px-1.5 text-[11px] tabular-nums text-on-primary")}>{active(t)}<span className="sr-only"> activos</span></span>)}
            </button>
          )}
          <button type="button" onClick={p.onReset} disabled={!p.dirty} className={cn(shape, idle)}><RotateCcw size={16} aria-hidden="true" />Reiniciar<span className="sr-only"> filtros</span></button>
        </div>
      </div>
      {n > 0 && more && (
        <div id={`${uid}-more`} role="group" aria-label="Más filtros" className={cn("grid gap-3 rounded-2xl bg-bg p-3 @min-[30rem]:grid-cols-2 @min-[48rem]:grid-cols-3", n <= 3 && MORE_GONE[n - 1])}>
          {p.filters.map((f, i) => control(f, i, "more"))}
        </div>
      )}
      {helpSpec?.help && <HelpPanel id={`${uid}-help`} help={helpSpec.help} onClose={() => setHelp(null)} />}
    </form>
  );
}
