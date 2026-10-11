"use client";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Switch } from "@/components/atoms/Switch";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable, toSheet } from "@/components/organisms/data-table/DataTable";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { categoryRows, type CategoryRow } from "@/demo/admin/categories";
import { applyCategoryDraft, categorySheetSpec } from "@/demo/admin/sheet-specs";
import { DEFAULT_LOW_STOCK } from "@/demo/admin/stock";
import type { FilterSpec } from "@/demo/admin/table";
import { useAdmin } from "@/stores/admin";
import { TableExcel } from "../table/TableExcel";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { useDemoSave } from "../useDemoSave";

export const categoryHref = (slug: string) => `/admin-demo/categorias/detalle/?slug=${slug}`;
const restockHref = (slug: string) => `/admin-demo/productos/?ver=variantes&categoria=${slug}&stock=reponer`;
const FILTERS: FilterSpec<CategoryRow>[] = [
  { id: "tienda", label: "En la tienda", allLabel: "Todas", options: [{ value: "visible", label: "Se muestran" }, { value: "oculta", label: "Ocultas (sin productos activos)" }], test: (c, v) => (v === "oculta" ? c.active === 0 : c.active > 0) },
  { id: "destacada", label: "Destacada", allLabel: "Todas", options: [{ value: "si", label: "Destacadas" }, { value: "no", label: "No destacadas" }], test: (c, v) => c.featured === (v === "si") },
  { id: "reponer", label: "Reposición", allLabel: "Todas", options: [{ value: "si", label: "Con variantes para reponer" }, { value: "no", label: "Sin pendientes" }], test: (c, v) => (c.reorder > 0) === (v === "si") },
];
const btn = "grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface disabled:opacity-30";

/**
 * Categorías con la tabla común (8.3.22). El orden de la tienda es global: Subir/Bajar solo aparecen con la tabla en
 * ese orden y sin filtros, así ordenar por otra columna o paginar nunca lo cambia sin querer.
 */
export function CategoriesTable() {
  const { data, moveCategory, toggleCategoryFeatured, updateCategories } = useAdmin();
  const save = useDemoSave();
  const onExport = useExport("categorias");
  const state = useTableState("categories", { sort: { id: "position", dir: "asc" }, filterIds: FILTERS.map((f) => f.id) });
  const rows = categoryRows(data.categories, data.products, data.settings.lowStockThreshold ?? DEFAULT_LOW_STOCK);
  const natural = state.sort?.id === "position" && state.sort.dir === "asc" && !state.query && !Object.values(state.filters).some(Boolean);
  const move = (c: CategoryRow, dir: -1 | 1) => save("Orden actualizado", () => moveCategory(c.slug, dir));
  const feature = (c: CategoryRow) => save("Categoría destacada actualizada", () => toggleCategoryFeatured(c.slug));
  const order = (c: CategoryRow) => (
    <span className="flex items-center gap-1">
      <span className="w-6 text-center font-extrabold tabular-nums text-muted">{c.position}</span>
      {natural && <button type="button" aria-label={`Subir ${c.name}`} disabled={c.position === 1} onClick={() => move(c, -1)} className={btn}><ArrowUp size={16} aria-hidden="true" /></button>}
      {natural && <button type="button" aria-label={`Bajar ${c.name}`} disabled={c.position === rows.length} onClick={() => move(c, 1)} className={btn}><ArrowDown size={16} aria-hidden="true" /></button>}
    </span>
  );
  const reorder = (c: CategoryRow) => (c.reorder ? <Link href={restockHref(c.slug)} className="font-bold text-warning underline">{c.reorder} {c.reorder === 1 ? "variante" : "variantes"}</Link> : <span className="text-muted">—</span>);
  const columns: Column<CategoryRow>[] = [
    { id: "position", header: "Orden", pinned: true, cell: order, sortValue: (c) => c.position, exportValue: (c) => c.position, className: "w-36" },
    { id: "name", header: "Nombre", pinned: true, primary: true, cell: (c) => <span className="flex flex-col">{c.name}{c.active === 0 && <span className="text-xs font-normal text-muted">No se muestra en la tienda (sin productos activos)</span>}</span>, sortValue: (c) => c.name, exportValue: (c) => c.name },
    { id: "active", header: "Productos activos", align: "right", cell: (c) => <>{c.active}<span className="text-muted"> / {c.total}</span></>, sortValue: (c) => c.active, exportValue: (c) => c.active },
    { id: "reorder", header: "Para reponer", cell: reorder, sortValue: (c) => c.reorder, exportValue: (c) => c.reorder },
    { id: "featured", header: "Destacada", cell: (c) => <Switch checked={c.featured} onChange={() => feature(c)} label="Destacada" ariaLabel={`Destacar ${c.name}`} />, sortValue: (c) => c.featured, exportValue: (c) => (c.featured ? "sí" : "no") },
  ];
  const Card = ({ row: c, selected, onToggle, onOpen }: RowCardProps<CategoryRow>) => (
    <div className={`flex flex-col gap-2 rounded-3xl bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${c.name}`} className="mt-1 h-5 w-5 accent-primary" />
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <span className="min-w-0 flex-1"><span className="block font-bold">{c.position}. {c.name}</span><span className="text-sm text-muted">{c.active} de {c.total} productos activos</span></span>
          <ChevronRight size={18} aria-hidden="true" className="mt-1 text-muted" />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">{order(c)}{reorder(c)}<Switch checked={c.featured} onChange={() => feature(c)} label="Destacada" ariaLabel={`Destacar ${c.name}`} /></div>
    </div>
  );
  const table = { searchLabel: "Buscar categoría", searchPlaceholder: "Velas, comederos…", searchText: (c: CategoryRow) => c.name, filters: FILTERS };
  if (state.view === "excel") {
    return (
      <TableExcel id="categories" title="Categorías" noun="categorías" state={state} rows={rows} {...table} spec={categorySheetSpec} onExport={(list) => onExport(toSheet(columns, list), "filtered")}
        onSave={(dirty) => { const n = Object.keys(dirty).length; updateCategories(applyCategoryDraft(data.categories, dirty), `Vista Excel: ${n} ${n === 1 ? "celda" : "celdas"} de categorías`); return "Los nombres y destacadas ya se ven en la tienda. El orden no cambió."; }} />
    );
  }
  return (
    <DataTable caption="Categorías en el orden de la tienda" noun="categorías" rows={rows} columns={columns} state={state} {...table}
      rowKey={(c) => c.slug} rowLabel={(c) => `Seleccionar ${c.name}`} rowHref={(c) => categoryHref(c.slug)} onExport={onExport} onExcel={() => state.setView("excel")} renderCard={Card}
      footer={() => (!natural ? <p className="border-t border-line px-5 py-3 text-sm text-muted">Para cambiar el orden de la tienda, ordená por “Orden” y quitá la búsqueda y los filtros.</p> : null)}
      empty={<EmptyState title="Ninguna categoría coincide">Probá con otro nombre o filtro, o tocá “Reiniciar”.</EmptyState>} />
  );
}
