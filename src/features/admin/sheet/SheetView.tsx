"use client";
import { ArrowLeft, Download, Redo2, Save, Undo2 } from "lucide-react";
import { useEffect, useReducer, useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { sheetReducer, type Draft, type SheetHistory, type SheetSpec } from "@/demo/admin/sheet";
import { sortRows, type SortDir } from "@/demo/admin/table";
import { cn } from "@/lib/cn";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { SheetGrid } from "./SheetGrid";
import { useSheetGrid } from "./useSheetGrid";

interface Props<R> {
  /** Identifica la grilla y su borrador en esta pestaña del navegador. */
  id: string;
  title: string;
  noun: string;
  spec: SheetSpec<R>;
  /** Filas con los mismos filtros y búsqueda que la tabla. */
  rows: R[];
  allRows: R[];
  toolbar: ReactNode;
  onBack: () => void;
  /** Guarda el borrador en el engine (una sola vez) y devuelve el texto del aviso. Sin esto, la vista es de solo lectura. */
  onSave?: (dirty: Draft) => string;
  onExport?: () => void;
  summary?: (rows: R[]) => ReactNode;
}

const draftKey = (id: string) => `volta-ui:sheet:${id}`;
function loadDraft(id: string): SheetHistory {
  try { return { draft: JSON.parse(sessionStorage.getItem(draftKey(id)) ?? "{}") as Draft, past: [], future: [] }; } catch { return { draft: {}, past: [], future: [] }; }
}

/**
 * "Ver en formato Excel" (8.3.4): grilla de Volta con los datos y filtros de la tabla. Lo editable se valida y se
 * guarda todo junto por el engine; lo demás es de solo lectura (candado). El borrador sobrevive a salir y volver.
 */
export function SheetView<R>(p: Props<R>) {
  const push = useToasts((s) => s.push);
  const [history, dispatch] = useReducer(sheetReducer, p.id, loadDraft);
  const [restored] = useState(() => Object.keys(history.draft).length);
  const [sort, setSort] = useState<{ col: string; dir: SortDir; keys: string[] } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const order = new Map(sort?.keys.map((k, i) => [k, i]));
  const rows = sort ? [...p.rows].sort((a, b) => (order.get(p.spec.rowKey(a)) ?? Infinity) - (order.get(p.spec.rowKey(b)) ?? Infinity)) : p.rows;
  const g = useSheetGrid(p.spec, rows, p.allRows, history, dispatch);
  const changes = Object.keys(g.dirty).length;
  const editable = !!p.onSave && p.spec.columns.some((c) => c.parse);
  useEffect(() => {
    try { if (Object.keys(history.draft).length) sessionStorage.setItem(draftKey(p.id), JSON.stringify(history.draft)); else sessionStorage.removeItem(draftKey(p.id)); } catch { /* sin almacenamiento: el borrador vive mientras la vista esté abierta */ }
  }, [history.draft, p.id]);
  useEffect(() => {
    if (!changes) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changes]);

  const discard = () => { g.dispatch({ type: "reset" }); g.clearErrors(); };
  const save = () => {
    if (!changes || !p.onSave) return;
    const description = p.onSave(g.dirty);
    discard();
    push({ tone: "success", title: "Cambios guardados", description });
  };
  const toggleSort = (col: string) => {
    const c = p.spec.columns.find((x) => x.id === col)!;
    const by = (dir: SortDir) => ({ col, dir, keys: sortRows(p.allRows, (r) => { const v = g.value(r, c); return typeof v === "boolean" ? Number(v) : v; }, dir).map(p.spec.rowKey) });
    setSort(sort?.col !== col ? by("asc") : sort.dir === "asc" ? by("desc") : null);
  };
  const back = () => (changes ? setLeaving(true) : p.onBack());
  const tool = "grid h-11 w-11 place-items-center rounded-sm border border-ink/12 bg-surface transition-colors hover:border-ink/25 disabled:opacity-30";
  return (
    <>
      <AdminPageHeader title={`${p.title} · formato Excel`} actions={editable ? (
        <div className="flex flex-wrap items-center gap-2">
          <span aria-live="polite" className={cn("text-sm font-bold", changes ? "text-warning" : "text-muted")}>{changes ? `${changes} ${changes === 1 ? "cambio" : "cambios"} sin guardar` : "Todo guardado"}</span>
          <Button variant="ghost" disabled={!changes} onClick={discard}>Descartar</Button>
          <Button disabled={!changes} onClick={save}><Save size={17} aria-hidden="true" /> Guardar cambios</Button>
        </div>
      ) : undefined}>
        {editable
          ? `Como un Excel, pero conectado a la demo: escribí sobre una celda, pegá desde tu planilla, ordená y filtrá.${p.spec.columns.some((c) => !c.parse) ? " Las columnas con candado se calculan solas." : ""} Nada cambia hasta que guardás.`
          : "Vista de solo lectura: ordená, elegí celdas y copialas a Excel. Los estados se cambian desde la ficha de cada uno, con sus reglas."}
      </AdminPageHeader>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={back}><ArrowLeft size={17} aria-hidden="true" /> Volver a la tabla</Button>
        {editable && <button type="button" className={tool} aria-label="Deshacer (Ctrl+Z)" disabled={!history.past.length} onClick={() => g.dispatch({ type: "undo" })}><Undo2 size={18} aria-hidden="true" /></button>}
        {editable && <button type="button" className={tool} aria-label="Rehacer (Ctrl+Y)" disabled={!history.future.length} onClick={() => g.dispatch({ type: "redo" })}><Redo2 size={18} aria-hidden="true" /></button>}
        {restored > 0 && changes > 0 && <p role="status" className="text-sm font-bold text-warning">Recuperamos los cambios sin guardar de la última vez.</p>}
      </div>
      {leaving && (
        <div role="alertdialog" aria-label="Cambios sin guardar" className="mb-3 flex flex-wrap items-center gap-2 rounded-sm bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
          <p className="flex-1 font-bold text-warning">Tenés {changes} {changes === 1 ? "cambio" : "cambios"} sin guardar.</p>
          <Button size="sm" onClick={() => { save(); p.onBack(); }}>Guardar y volver</Button>
          <Button size="sm" variant="secondary" onClick={() => { discard(); p.onBack(); }}>Descartar y volver</Button>
          <Button size="sm" variant="ghost" onClick={() => setLeaving(false)}>Seguir editando</Button>
        </div>
      )}
      <div className="mb-3 overflow-hidden rounded-sm bg-surface shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">{p.toolbar}</div>
      <SheetGrid id={`sheet-${p.id}`} label={`${p.title} en formato Excel`} rows={rows} rowKey={p.spec.rowKey} g={g} sort={sort} onSort={toggleSort} onSave={editable ? save : undefined} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted">Flechas para moverte · Shift + flechas para elegir varias · Ctrl+C / Ctrl+V con Excel{editable ? " · Enter o escribir para editar · Ctrl+Z deshacer" : ""}</p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-muted"><strong className="tabular-nums text-ink">{rows.length}</strong> {p.noun}</span>
          {p.summary?.(rows)}
          {p.onExport && (
            <Button variant="secondary" size="sm" disabled={changes > 0} onClick={p.onExport} title={changes ? "Guardá o descartá los cambios para descargar" : undefined}>
              <Download size={16} aria-hidden="true" /> Descargar Excel (.xlsx)
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
