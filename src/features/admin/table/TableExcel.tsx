"use client";
import type { ReactNode } from "react";
import { DataTableToolbar } from "@/components/organisms/data-table/DataTableToolbar";
import type { Column, TableState } from "@/components/organisms/data-table/types";
import type { Draft, SheetSpec } from "@/demo/admin/sheet";
import { applyFilters, facetCount, matchesQuery, type FilterSpec } from "@/demo/admin/table";
import { SheetView } from "../sheet/SheetView";

interface Props<R> {
  id: string;
  title: string;
  noun: string;
  state: TableState;
  rows: R[];
  filters: FilterSpec<R>[];
  searchText: (row: R) => string;
  searchLabel: string;
  searchPlaceholder?: string;
  spec: SheetSpec<R>;
  onSave?: (dirty: Draft) => string;
  onExport?: (rows: R[]) => void;
  summary?: (rows: R[]) => ReactNode;
}

/** Vista Excel de una tabla del panel: la misma barra de filtros y las mismas filas que la tabla (8.3.4). */
export function TableExcel<R>({ state, rows, filters, searchText, searchLabel, searchPlaceholder, onExport, ...sheet }: Props<R>) {
  const queried = rows.filter((r) => matchesQuery(state.query, searchText(r)));
  const filtered = applyFilters(queried, filters, state.filters);
  return (
    <SheetView {...sheet} rows={filtered} allRows={rows} onBack={() => state.setView("table")} onExport={onExport && (() => onExport(filtered))}
      toolbar={<DataTableToolbar searchLabel={searchLabel} searchPlaceholder={searchPlaceholder} query={state.query} onQuery={state.setQuery} filters={filters}
        values={state.filters} onFilter={state.setFilter} dirty={state.dirty} onReset={state.reset} count={(f, v) => facetCount(queried, filters, state.filters, f, v)} />} />
  );
}

/** Vista Excel de solo lectura armada con las columnas exportables de la tabla (pedidos, clientes, costos). */
export function specFromColumns<R>(columns: Column<R>[], rowKey: (row: R) => string): SheetSpec<R> {
  return {
    rowKey,
    columns: columns.filter((c) => c.exportValue).map((c) => ({
      id: c.id, label: c.header, get: (r: R) => c.exportValue!(r), numeric: c.align === "right", money: c.money,
      width: c.pinned ? "min-w-[11rem] sm:min-w-[14rem]" : "min-w-[8.5rem]",
    })),
  };
}
