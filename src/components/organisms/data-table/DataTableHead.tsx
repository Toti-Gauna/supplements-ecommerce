"use client";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Column, Sort } from "./types";

interface Props<T> {
  columns: Column<T>[];
  sort: Sort | null;
  onSort: (s: Sort | null) => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  selectLabel: string;
}

/** Encabezado: checkbox de "seleccionar página" y columnas ordenables (asc → desc → sin orden). */
export function DataTableHead<T>({ columns, sort, onSort, allSelected, someSelected, onToggleAll, selectLabel }: Props<T>) {
  const cycle = (id: string) => {
    if (sort?.id !== id) return onSort({ id, dir: "asc" });
    onSort(sort.dir === "asc" ? { id, dir: "desc" } : null);
  };
  return (
    <thead className="sticky top-0 z-10 bg-surface text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
      <tr className="border-b border-line">
        <th scope="col" className="w-12 pl-4">
          <input type="checkbox" aria-label={selectLabel} checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
            onChange={onToggleAll} className="h-4 w-4 accent-primary" />
        </th>
        {columns.map((c) => {
          const active = sort?.id === c.id;
          const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
          return (
            <th key={c.id} scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
              className={cn("whitespace-nowrap px-3 py-3", c.align === "right" && "text-right", c.align === "center" && "text-center", c.className)}>
              {c.sortValue ? (
                <button type="button" onClick={() => cycle(c.id)} className={cn("inline-flex items-center gap-1.5 rounded-md uppercase transition-colors hover:text-ink", active && "text-ink", c.align === "right" && "flex-row-reverse")}>
                  {c.header}<Icon size={13} aria-hidden="true" className={active ? "text-primary" : "opacity-40"} />
                </button>
              ) : c.header}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
