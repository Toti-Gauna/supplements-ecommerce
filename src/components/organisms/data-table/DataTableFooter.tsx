"use client";
import { Download, Sheet } from "lucide-react";

const tool = "inline-flex h-11 items-center gap-2 rounded-2xl border border-ink/12 bg-surface px-4 text-sm font-bold transition-colors hover:border-ink/25";

interface Props {
  noun: string;
  total: number;
  chosen: number;
  onExcel?: () => void;
  onExport?: () => void;
}

/**
 * Pie de la tabla (8.3.4): "Ver en formato Excel" abre la grilla de Volta con los mismos filtros, y la descarga
 * .xlsx lleva todas las filas filtradas (no solo la página), o las elegidas si hay selección.
 */
export function DataTableFooter({ noun, total, chosen, onExcel, onExport }: Props) {
  if (!onExcel && !onExport) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line px-3 py-3 sm:px-4">
      {onExcel && <button type="button" onClick={onExcel} className={tool}><Sheet size={17} aria-hidden="true" />Ver en formato Excel</button>}
      {onExport && <button type="button" onClick={onExport} className={tool}><Download size={17} aria-hidden="true" />{chosen ? `Descargar selección (${chosen})` : "Descargar Excel (.xlsx)"}</button>}
      {onExport && (
        <p className="min-w-0 flex-1 basis-56 text-xs text-muted">
          {chosen ? `El archivo .xlsx lleva solo la selección: ${chosen} ${noun}.` : `El archivo .xlsx lleva ${total} ${noun}: todo lo que muestran los filtros, de todas las páginas. Se abre en Excel con su propio aspecto.`}
        </p>
      )}
    </div>
  );
}
