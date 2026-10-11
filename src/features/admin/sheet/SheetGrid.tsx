"use client";
import { ArrowDown, ArrowUp, ArrowUpDown, Lock } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { SortDir } from "@/demo/admin/table";
import { cn } from "@/lib/cn";
import { useToasts } from "@/stores/toast";
import { SheetCell } from "./SheetCell";
import type { useSheetGrid } from "./useSheetGrid";

interface Props<R> {
  id: string;
  label: string;
  rows: R[];
  rowKey: (row: R) => string;
  g: ReturnType<typeof useSheetGrid<R>>;
  sort: { col: string; dir: SortDir } | null;
  onSort: (col: string) => void;
  onSave?: () => void;
}

/** La grilla de la vista Excel: teclado, rango con Shift, copiar y pegar con Excel, deshacer y edición validada. */
export function SheetGrid<R>({ id, label, rows, rowKey, g, sort, onSort, onSave }: Props<R>) {
  const push = useToasts((s) => s.push);
  const focusGrid = () => window.setTimeout(() => document.getElementById(id)?.focus(), 0);
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("input, select")) return;
    const mod = e.metaKey || e.ctrlKey;
    const { r, c } = g.focus;
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], Tab: [0, e.shiftKey ? -1 : 1] };
    if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); g.dispatch({ type: e.shiftKey ? "redo" : "undo" }); return; }
    if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); g.dispatch({ type: "redo" }); return; }
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); onSave?.(); return; }
    if (moves[e.key]) { e.preventDefault(); const [dr, dc] = moves[e.key]!; g.select({ r: r + dr, c: c + dc }, e.shiftKey && e.key !== "Tab"); return; }
    if (e.key === "Enter" || e.key === "F2" || e.key === " ") { e.preventDefault(); g.startEdit(g.focus); return; }
    if (!mod && e.key.length === 1) { e.preventDefault(); g.startEdit(g.focus, e.key); }
  };
  const onEditKey = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") { e.preventDefault(); if (g.commit({ r: 1, c: 0 })) focusGrid(); }
    if (e.key === "Tab") { e.preventDefault(); if (g.commit({ r: 0, c: e.shiftKey ? -1 : 1 })) focusGrid(); }
    if (e.key === "Escape") { e.preventDefault(); g.setEditing(null); focusGrid(); }
  };
  return (
    <div id={id} role="grid" aria-label={label} aria-rowcount={rows.length + 1} tabIndex={0} onKeyDown={onGridKey}
      onCopy={(e) => { if ((e.target as HTMLElement).closest("input")) return; e.preventDefault(); e.clipboardData.setData("text/plain", g.copyText()); push({ tone: "info", title: "Celdas copiadas", description: "Pegalas en Excel o en otra parte de la grilla." }); }}
      onPaste={(e) => {
        if ((e.target as HTMLElement).closest("input")) return;
        e.preventDefault();
        const r = g.paste(e.clipboardData.getData("text/plain"));
        const extra = [r.failed && `${r.failed} no entraron: revisá las marcadas en rojo.`, r.locked && `${r.locked} eran de solo lectura y no cambiaron.`].filter(Boolean).join(" ");
        push({ tone: r.failed ? "error" : "success", title: `${r.pasted} ${r.pasted === 1 ? "celda pegada" : "celdas pegadas"}`, description: extra || "Revisá y guardá cuando quieras." });
      }}
      className="max-h-[70dvh] overflow-auto rounded-[1.5rem] bg-surface text-[14px] shadow-[var(--shadow-card)] ring-1 ring-ink/[0.06] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
      <div role="row" className="sticky top-0 z-20 flex w-max min-w-full border-b border-line bg-accent/70 backdrop-blur">
        {g.cols.map((col, c) => (
          <div key={col.id} role="columnheader" aria-sort={sort?.col === col.id ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
            className={cn("flex-1 border-r border-line/70 px-2 py-2", col.width ?? "min-w-[8rem]", c === 0 && "sticky left-0 z-10 bg-accent")}>
            <button type="button" onClick={() => onSort(col.id)} className="flex w-full items-center gap-1 text-[12px] font-bold uppercase tracking-[0.06em] text-muted hover:text-ink">
              {!col.parse && <Lock size={11} aria-label="Solo lectura" className="shrink-0" />}
              <span className="truncate">{col.label}</span>
              {sort?.col === col.id ? (sort.dir === "asc" ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />) : <ArrowUpDown size={13} aria-hidden="true" className="shrink-0 opacity-40" />}
            </button>
          </div>
        ))}
      </div>
      {rows.map((row, r) => (
        <div key={rowKey(row)} role="row" aria-rowindex={r + 2} className="flex w-max min-w-full border-b border-line/60">
          {g.cols.map((col, c) => {
            const active = g.focus.r === r && g.focus.c === c;
            const editing = g.editing && g.editing.pos.r === r && g.editing.pos.c === c ? g.editing : undefined;
            return (
              <div key={col.id} role="gridcell" aria-selected={g.inRange(r, c)} aria-readonly={!col.parse || undefined}
                onMouseDown={(e) => { if (editing) return; e.preventDefault(); if (!g.commit()) return; if (active && !e.shiftKey) { g.startEdit({ r, c }); return; } g.select({ r, c }, e.shiftKey); document.getElementById(id)?.focus(); }}
                onDoubleClick={() => g.startEdit({ r, c })} className={cn("flex-1 cursor-cell border-r border-line/50", col.width ?? "min-w-[8rem]", c === 0 && "sticky left-0 z-10 bg-surface font-semibold")}>
                <SheetCell col={col} row={row} value={g.value(row, col)} active={active} selected={g.inRange(r, c)} dirty={g.isDirty(row, col)}
                  error={g.errors[g.key(row, col)]} editing={editing} onEditText={(text) => g.setEditing((x) => (x ? { ...x, text, error: undefined } : x))}
                  onEditKey={onEditKey} onEditBlur={() => g.commit()} />
              </div>
            );
          })}
        </div>
      ))}
      {rows.length === 0 && <p className="p-8 text-center text-muted">Nada coincide con la búsqueda o los filtros.</p>}
    </div>
  );
}
