"use client";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { cellText, type Cell } from "@/demo/admin/import/cells";
import type { ReadSheet } from "../table/excel";

/** Letra de columna como en Excel: 0 → A, 25 → Z, 26 → AA. */
const letter = (i: number): string => (i >= 26 ? letter(Math.floor(i / 26) - 1) : "") + String.fromCharCode(65 + (i % 26));
const select = "h-11 w-full rounded-sm border border-ink/12 bg-bg px-3 text-sm font-bold";

interface Props<F extends string> {
  sheets: ReadSheet[];
  sheetIndex: number;
  onSheet: (i: number) => void;
  header: number;
  /** Campos que entiende el tipo de planilla elegido (catálogo o lista de proveedor), con sus nombres. */
  fields: readonly F[];
  labels: Record<F, string>;
  required: F[];
  mapping: Record<F, number | null>;
  onMapping: (m: Record<F, number | null>) => void;
  /** Arriba de todo: qué tipo de planilla es (lo detecta solo; se puede cambiar). */
  kindSwitch?: ReactNode;
  onBack: () => void;
  onNext: () => void;
}

/** Paso 2: qué columna de la planilla es cada dato. Viene detectado; se puede corregir. */
export function ImportMapping<F extends string>({ sheets, sheetIndex, onSheet, header, fields, labels, required, mapping, onMapping, kindSwitch, onBack, onNext }: Props<F>) {
  const rows: Cell[][] = sheets[sheetIndex]?.rows ?? [];
  const head = rows[header] ?? [];
  const width = Math.max(...rows.slice(0, 20).map((r) => r.length), 0);
  const missing = required.filter((f) => mapping[f] === null);
  return (
    <div className="flex flex-col gap-5">
      {kindSwitch}
      {sheets.length > 1 && (
        <div className="flex max-w-sm flex-col gap-1 text-sm font-bold"><label htmlFor="map-sheet">Hoja del archivo</label>
          <select id="map-sheet" value={sheetIndex} onChange={(e) => onSheet(Number(e.target.value))} className={select}>{sheets.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}</select>
        </div>
      )}
      <div className="grid gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((f) => (
          <div key={f} className="flex flex-col gap-1 text-sm font-bold">
            <label htmlFor={`map-${f}`}>{labels[f]}{required.includes(f) && <span className="sr-only"> (obligatorio)</span>}</label>
            <select id={`map-${f}`} value={mapping[f] ?? ""} onChange={(e) => onMapping({ ...mapping, [f]: e.target.value === "" ? null : Number(e.target.value) })} className={select} aria-invalid={missing.includes(f) || undefined}>
              <option value="">— No está en la planilla —</option>
              {Array.from({ length: width }, (_, i) => <option key={i} value={i}>{letter(i)} · {cellText(head[i]) || "(sin título)"}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-sm bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <caption className="px-4 pt-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted">Primeras filas de “{sheets[sheetIndex]?.name}”</caption>
          <tbody>
            {rows.slice(header, header + 5).map((r, i) => (
              <tr key={i} className={i === 0 ? "font-bold" : "border-t border-line"}>
                {Array.from({ length: width }, (_, c) => <td key={c} className="whitespace-nowrap px-4 py-2">{cellText(r[c])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {missing.length > 0 && <p role="alert" className="text-sm font-semibold text-danger">Elegí qué columna es “{labels[missing[0]!]}”: sin eso no se puede importar.</p>}
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>Elegir otro archivo</Button>
        <Button onClick={onNext} disabled={missing.length > 0}>Ver vista previa <ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
    </div>
  );
}
