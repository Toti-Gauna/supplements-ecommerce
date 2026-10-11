import { normalize } from "../engine/search";
import type { Help } from "./help";

/** Reglas puras de las tablas del panel: orden, búsqueda y paginado. Sin React. */
export type SortDir = "asc" | "desc";
export type SortValue = string | number | boolean | null | undefined;

const collator = new Intl.Collator("es-AR", { numeric: true, sensitivity: "base" });

/** Compara valores mezclados: vacíos siempre al final, números como números y texto en español. */
export function compareValues(a: SortValue, b: SortValue): number {
  const emptyA = a === null || a === undefined || a === "";
  const emptyB = b === null || b === undefined || b === "";
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(b) - Number(a);
  return collator.compare(String(a), String(b));
}

/** Orden estable; los vacíos quedan al final en ambos sentidos. */
export function sortRows<T>(rows: T[], get: (row: T) => SortValue, dir: SortDir): T[] {
  return rows
    .map((row, i) => ({ row, i, v: get(row) }))
    .sort((x, y) => {
      const emptyX = x.v === null || x.v === undefined || x.v === "";
      const emptyY = y.v === null || y.v === undefined || y.v === "";
      if (emptyX !== emptyY) return emptyX ? 1 : -1;
      const c = compareValues(x.v, y.v);
      return (dir === "asc" ? c : -c) || x.i - y.i;
    })
    .map((x) => x.row);
}

/** Búsqueda sin tildes ni mayúsculas: todas las palabras tienen que aparecer en alguno de los textos. */
export function matchesQuery(query: string, ...texts: (string | undefined | null)[]): boolean {
  const words = normalize(query).split(" ").filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(texts.filter(Boolean).join(" "));
  return words.every((w) => haystack.includes(w));
}

export interface Page<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
  from: number;
  to: number;
}

export function paginate<T>(rows: T[], page: number, size: number): Page<T> {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return {
    items: rows.slice((current - 1) * size, current * size),
    page: current,
    pages,
    total: rows.length,
    from: rows.length ? (current - 1) * size + 1 : 0,
    to: Math.min(rows.length, current * size),
  };
}

/** Nombre de archivo de exportación: "volta-pedidos-2026-10-09.xlsx". */
export function exportFileName(entity: string, now = new Date()): string {
  const day = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return `volta-${normalize(entity).replace(/\s+/g, "-")}-${day}.xlsx`;
}

/**
 * Filtro de una tabla (8.3.4): un select o una fecha que deja pasar las filas que cumplen `test`.
 * El valor vacío significa "sin filtrar"; así la URL solo guarda lo que el usuario eligió.
 */
export interface FilterSpec<T> {
  id: string;
  label: string;
  kind?: "select" | "date";
  /** Opciones del select, sin la de "todas" (la agrega la tabla con `allLabel`). */
  options?: { value: string; label: string }[];
  allLabel?: string;
  /** Qué significa cada opción (botón "i" al lado del nombre del filtro, 8.3.10). */
  help?: Help;
  test: (row: T, value: string) => boolean;
}

export type FilterValues = Record<string, string>;

export function applyFilters<T>(rows: T[], specs: FilterSpec<T>[], values: FilterValues): T[] {
  const active = specs.filter((s) => values[s.id]);
  return active.length ? rows.filter((r) => active.every((s) => s.test(r, values[s.id]!))) : rows;
}

/** Cuántas filas quedarían si ese filtro tomara `value`, con el resto de los filtros como están. */
export function facetCount<T>(rows: T[], specs: FilterSpec<T>[], values: FilterValues, id: string, value: string): number {
  return applyFilters(rows, specs, { ...values, [id]: value }).length;
}

/** Filtros + búsqueda: lo mismo que ven la tabla, la vista Excel y la exportación. */
export function filterRows<T>(rows: T[], specs: FilterSpec<T>[], values: FilterValues, query: string, searchText: (row: T) => string): T[] {
  return applyFilters(rows, specs, values).filter((r) => matchesQuery(query, searchText(r)));
}
