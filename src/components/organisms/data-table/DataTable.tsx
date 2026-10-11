"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { MouseEvent } from "react";
import { Pagination } from "@/components/molecules/Pagination";
import { applyFilters, facetCount, matchesQuery, paginate, sortRows } from "@/demo/admin/table";
import { cn } from "@/lib/cn";
import { DataTableFooter } from "./DataTableFooter";
import { DataTableHead } from "./DataTableHead";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableViewTools } from "./DataTableViewTools";
import type { Column, DataTableProps, ExportSheet } from "./types";

export function toSheet<T>(columns: Column<T>[], rows: T[]): ExportSheet {
  const cols = columns.filter((c) => c.exportValue);
  return [cols.map((c) => c.header), ...rows.map((r) => cols.map((c) => c.exportValue!(r)))];
}

const TONE = { warning: "bg-warning-soft/40", danger: "bg-danger-soft/40" };
/** Lo que tiene acción propia dentro de una fila: tocarlo no abre la ficha. */
const INNER = "a, button, input, select, textarea, label, summary, [role='switch'], [data-row-ignore]";
export const fromInner = (e: MouseEvent) => !!(e.target as HTMLElement).closest(INNER);

/**
 * Tabla común del panel (8.3.4): filtros con "Más filtros", buscar, ordenar, diez por página, selección, acciones
 * en lote, Excel y tarjetas en el celular. Toda la fila abre su ficha; checkbox, switches y botones no navegan.
 */
export function DataTable<T>(p: DataTableProps<T>) {
  const { state } = p;
  const router = useRouter();
  const size = p.pageSize ?? 10;
  const specs = p.filters ?? [];
  const queried = p.rows.filter((r) => matchesQuery(state.query, p.searchText(r)));
  const searched = applyFilters(queried, specs, state.filters);
  const sortCol = state.sort && p.columns.find((c) => c.id === state.sort!.id && c.sortValue);
  const sorted = sortCol ? sortRows(searched, sortCol.sortValue!, state.sort!.dir) : searched;
  const page = paginate(sorted, state.page, size);
  const visible = p.columns.filter((c) => c.pinned || !state.hidden.has(c.id));
  const keys = page.items.map(p.rowKey);
  const allSelected = keys.length > 0 && keys.every((k) => state.selected.has(k));
  const someSelected = keys.some((k) => state.selected.has(k));
  const chosen = sorted.filter((r) => state.selected.has(p.rowKey(r)));
  const open = p.rowHref ? (r: T) => router.push(p.rowHref!(r)) : p.onRowOpen;
  const toggle = (k: string) => {
    const next = new Set(state.selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    state.setSelected(next);
  };
  const toggleAll = () => {
    const next = new Set(state.selected);
    for (const k of keys) if (allSelected) next.delete(k); else next.add(k);
    state.setSelected(next);
  };
  const clear = () => state.setSelected(new Set());
  const pad = state.density === "compact" ? "py-2" : "py-3.5";
  const primary = (r: T, c: Column<T>) => {
    const cls = "text-left font-bold text-ink underline-offset-4 hover:text-primary hover:underline";
    if (p.rowHref) return <Link href={p.rowHref(r)} className={cls}>{c.cell(r)}</Link>;
    return p.onRowOpen ? <button type="button" onClick={() => p.onRowOpen!(r)} className={cls}>{c.cell(r)}</button> : c.cell(r);
  };
  return (
    <section aria-label={p.caption} className="overflow-hidden rounded-[1.75rem] bg-surface shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
      <DataTableToolbar searchLabel={p.searchLabel} searchPlaceholder={p.searchPlaceholder} query={state.query} onQuery={state.setQuery}
        filters={specs} values={state.filters} onFilter={state.setFilter} dirty={state.dirty} onReset={state.reset}
        count={(id, v) => facetCount(queried, specs, state.filters, id, v)} />
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 text-sm sm:px-5">
        <p aria-live="polite" className="text-muted"><strong className="tabular-nums text-ink">{sorted.length}</strong> {p.noun}{sorted.length !== p.rows.length ? ` de ${p.rows.length}` : ""}</p>
        <div className="flex flex-wrap items-center gap-2">
          {p.toolbarEnd}
          <DataTableViewTools columns={p.columns} hidden={state.hidden} onToggleColumn={state.toggleColumn} density={state.density} onDensity={state.setDensity} />
        </div>
      </div>
      {chosen.length > 0 && (
        <div role="region" aria-label="Acciones en lote" className="animate-fade-up mx-3 mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-night px-3 py-2.5 text-[#f6f1e8] sm:mx-4">
          <span className="pl-1 text-sm font-bold"><span className="tabular-nums">{chosen.length}</span> seleccionados</span>
          <div className="flex flex-1 flex-wrap items-center gap-2">{p.bulkActions?.(chosen, clear)}</div>
          <button type="button" onClick={clear} aria-label="Quitar selección" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"><X size={16} aria-hidden="true" /></button>
        </div>
      )}
      {sorted.length === 0 ? <div className="p-4">{p.empty}</div> : (
        <>
          {p.renderCard && (
            <ul className="flex flex-col gap-2 p-3 md:hidden">
              {page.items.map((r) => {
                const k = p.rowKey(r);
                return <li key={k}>{p.renderCard!({ row: r, selected: state.selected.has(k), onToggle: () => toggle(k), onOpen: open && (() => open(r)) })}</li>;
              })}
            </ul>
          )}
          <div className={cn("overflow-x-auto", p.renderCard && "hidden md:block")}>
            <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
              <caption className="sr-only">{p.caption}</caption>
              <DataTableHead columns={visible} sort={state.sort} onSort={state.setSort} allSelected={allSelected} someSelected={someSelected}
                onToggleAll={toggleAll} selectLabel={`Seleccionar los ${p.noun} de esta página`} />
              <tbody>
                {page.items.map((r) => {
                  const k = p.rowKey(r);
                  const on = state.selected.has(k);
                  const tone = p.rowTone?.(r);
                  return (
                    <tr key={k} onClick={open && ((e) => { if (!fromInner(e)) open(r); })}
                      className={cn("group border-b border-line/70 transition-colors last:border-0 hover:bg-accent/35", open && "cursor-pointer", on && "bg-primary/[0.06]", tone && TONE[tone])}>
                      <td className="w-12 pl-4"><input type="checkbox" checked={on} onChange={() => toggle(k)} aria-label={p.rowLabel(r)} className="h-4 w-4 accent-primary" /></td>
                      {visible.map((c) => (
                        <td key={c.id} className={cn("px-3 align-middle", pad, c.align === "right" && "text-right tabular-nums", c.align === "center" && "text-center", c.className)}>
                          {c.primary ? primary(r, c) : c.cell(r)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {p.footer?.(sorted)}
        </>
      )}
      <div className="px-3 pb-3 sm:px-4"><Pagination {...page} noun={p.noun} onPage={state.setPage} /></div>
      <DataTableFooter noun={p.noun} total={sorted.length} chosen={chosen.length} onExcel={p.onExcel}
        onExport={p.onExport && (() => p.onExport!(toSheet(p.columns, chosen.length ? chosen : sorted), chosen.length ? "selected" : "filtered"))} />
    </section>
  );
}
