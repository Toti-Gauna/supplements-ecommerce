"use client";
import { useState, type Dispatch } from "react";
import { cellKey, parseTsv, specPrune, specText, toTsv, type Draft, type SheetAction, type SheetHistory, type SheetSpec, type SheetSpecColumn, type SheetValue } from "@/demo/admin/sheet";

export interface Pos { r: number; c: number }

/**
 * Estado de una vista Excel: borrador con historial, celda activa, rango seleccionado y edición.
 * `rows` llega ya filtrado y ordenado; los cambios se guardan por clave de fila, no por posición.
 * Las columnas sin `parse` son de solo lectura: se seleccionan y se copian, pero no se editan ni se pegan.
 */
export function useSheetGrid<R>(spec: SheetSpec<R>, rows: R[], allRows: R[], history: SheetHistory, dispatch: Dispatch<SheetAction>) {
  const [anchor, setAnchor] = useState<Pos>({ r: 0, c: 0 });
  const [focus, setFocus] = useState<Pos>({ r: 0, c: 0 });
  const [editing, setEditing] = useState<{ pos: Pos; text: string; error?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const cols = spec.columns;
  const maxR = Math.max(0, rows.length - 1);
  const maxC = cols.length - 1;
  const clamp = (p: Pos): Pos => ({ r: Math.min(maxR, Math.max(0, p.r)), c: Math.min(maxC, Math.max(0, p.c)) });
  const key = (row: R, col: SheetSpecColumn<R>) => cellKey(spec.rowKey(row), col.id);
  const value = (row: R, col: SheetSpecColumn<R>): SheetValue => history.draft[key(row, col)] ?? col.get(row);
  const text = (row: R, col: SheetSpecColumn<R>) => (col.money ? String(value(row, col)) : specText(col, value(row, col), row));
  const dirty = specPrune(spec, allRows, history.draft);
  const isDirty = (row: R, col: SheetSpecColumn<R>) => key(row, col) in dirty;

  const select = (p: Pos, extend = false) => { const q = clamp(p); setFocus(q); if (!extend) setAnchor(q); };
  const range = { r1: Math.min(anchor.r, focus.r), r2: Math.max(anchor.r, focus.r), c1: Math.min(anchor.c, focus.c), c2: Math.max(anchor.c, focus.c) };
  const inRange = (r: number, c: number) => r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2;

  /** Guarda celdas ya validadas (y las que arrastran, como el nombre de un producto en todas sus variantes). */
  const setCells = (cells: { row: R; col: SheetSpecColumn<R>; value: SheetValue }[]) => {
    const next: Draft = {};
    for (const x of cells) Object.assign(next, spec.expand ? spec.expand(allRows, spec.rowKey(x.row), x.col.id, x.value) : { [key(x.row, x.col)]: x.value });
    if (Object.keys(next).length) dispatch({ type: "set", cells: next });
  };

  const startEdit = (p: Pos, initial?: string) => {
    const row = rows[p.r];
    const col = cols[p.c];
    if (!row || !col?.parse) return;
    if (col.input === "toggle") return setCells([{ row, col, value: !value(row, col) }]);
    setEditing({ pos: p, text: col.input === "select" ? String(value(row, col)) : (initial ?? text(row, col)) });
  };
  /** Valida y guarda la edición. Devuelve false si el texto no es válido (la celda sigue abierta con el error). */
  const commit = (move?: Pos): boolean => {
    if (!editing) return true;
    const row = rows[editing.pos.r];
    const col = cols[editing.pos.c];
    if (!row || !col?.parse) { setEditing(null); return true; }
    const parsed = col.parse(editing.text, row);
    if (!parsed.ok) { setEditing({ ...editing, error: parsed.error }); return false; }
    setCells([{ row, col, value: parsed.value }]);
    setErrors((e) => { const n = { ...e }; delete n[key(row, col)]; return n; });
    setEditing(null);
    if (move) select({ r: editing.pos.r + move.r, c: editing.pos.c + move.c });
    return true;
  };

  const copyText = () => toTsv(rows.slice(range.r1, range.r2 + 1).map((row) => cols.slice(range.c1, range.c2 + 1).map((col) => text(row, col))));

  /** Pega texto de Excel desde la celda activa. Las columnas de solo lectura se saltean y se cuentan aparte. */
  const paste = (raw: string) => {
    const grid = parseTsv(raw);
    const ok: { row: R; col: SheetSpecColumn<R>; value: SheetValue }[] = [];
    const bad: Record<string, string> = {};
    let locked = 0;
    grid.forEach((line, dr) => line.forEach((cell, dc) => {
      const row = rows[range.r1 + dr];
      const col = cols[range.c1 + dc];
      if (!row || !col) return;
      if (!col.parse) { locked++; return; }
      const parsed = col.parse(cell, row);
      if (parsed.ok) ok.push({ row, col, value: parsed.value }); else bad[key(row, col)] = parsed.error;
    }));
    setCells(ok);
    setErrors((e) => ({ ...e, ...bad }));
    select({ r: range.r1, c: range.c1 });
    select({ r: Math.min(maxR, range.r1 + grid.length - 1), c: Math.min(maxC, range.c1 + (grid[0]?.length ?? 1) - 1) }, true);
    return { pasted: ok.length, failed: Object.keys(bad).length, locked };
  };

  return {
    cols, history, dispatch, dirty, isDirty, value, key, focus, select, inRange, editing, setEditing, startEdit, commit, copyText, paste, errors,
    clearErrors: () => setErrors({}), maxR, maxC,
  };
}
