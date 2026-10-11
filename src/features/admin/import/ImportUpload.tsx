"use client";
import { Download, FileSpreadsheet, Sparkles, Undo2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { ImportSnapshot } from "@/demo/admin/catalog-slice";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/cn";

interface Props {
  busy: boolean;
  error: string | null;
  last: ImportSnapshot | null;
  onFile: (file: File) => void;
  onSample: () => void;
  onTemplate: () => void;
  onUndo: () => void;
}

/** Paso 1: arrastrar o elegir el Excel/CSV, bajar la plantilla con el catálogo actual o probar con un ejemplo. */
export function ImportUpload({ busy, error, last, onFile, onSample, onTemplate, onUndo }: Props) {
  const [over, setOver] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      {last && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-accent/60 px-4 py-3 text-sm">
          <Undo2 size={17} aria-hidden="true" className="text-primary" />
          <span className="flex-1"><strong>Última importación</strong> · {last.fileName} · {formatDateTime(last.at)} · {last.summary}</span>
          <UndoImportButton onUndo={onUndo} />
        </div>
      )}
      <label onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        className={cn("flex cursor-pointer flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed px-6 py-14 text-center transition-colors",
          over ? "border-primary bg-primary/[0.06]" : "border-ink/15 bg-surface hover:border-primary/60")}>
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-accent text-primary"><UploadCloud size={30} aria-hidden="true" /></span>
        <span className="font-display text-3xl">{busy ? "Leyendo tu planilla…" : "Arrastrá tu Excel acá"}</span>
        <span className="max-w-md text-sm text-muted">o tocá para elegirlo. Sirve .xlsx o .csv, con categorías, productos, variantes, precios y stock. Se lee en este navegador: el archivo no se sube a ningún lado.</span>
        <input type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" aria-label="Elegir archivo de Excel o CSV"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <span className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-3 text-sm font-bold text-[#f6f1e8]"><FileSpreadsheet size={16} aria-hidden="true" /> Elegir archivo</span>
      </label>
      {error && <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onTemplate} className="flex items-start gap-3 rounded-3xl bg-surface p-4 text-left shadow-[var(--shadow-card)] hover:ring-1 hover:ring-primary">
          <Download size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
          <span><span className="block font-bold">Bajar mi catálogo como plantilla</span><span className="text-sm text-muted">Un Excel con todos tus productos y stock. Lo editás y lo volvés a subir.</span></span>
        </button>
        <button type="button" onClick={onSample} className="flex items-start gap-3 rounded-3xl bg-surface p-4 text-left shadow-[var(--shadow-card)] hover:ring-1 hover:ring-primary">
          <Sparkles size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-brass" />
          <span><span className="block font-bold">Probar con una planilla de ejemplo</span><span className="text-sm text-muted">Como la que muchos talleres tienen hoy: columnas con otros nombres, montos con $ y una fila con error.</span></span>
        </button>
      </div>
    </div>
  );
}

/** Deshacer vuelve el catálogo al estado previo a la importación: también revierte lo que se cambió después. */
export function UndoImportButton({ onUndo, variant = "secondary" }: { onUndo: () => void; variant?: "secondary" | "ghost" }) {
  return (
    <ConfirmButton size="sm" variant={variant} title="¿Deshacer la importación?" confirmLabel="Deshacer"
      description="Productos, stock y categorías vuelven a como estaban antes de importar. Lo que hayas cambiado en el catálogo después de la importación también se pierde."
      onConfirm={onUndo}>
      Deshacer importación
    </ConfirmButton>
  );
}
