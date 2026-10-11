"use client";
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";

interface Props {
  /** Pasos con datos que faltan, solo después de intentar guardar. */
  missing: number;
  dirty: boolean;
  isNew: boolean;
  onShowMissing: () => void;
  onDiscard: () => void;
  onPreview: () => void;
}

/**
 * Barra de guardado del editor (8.3.20): queda a la vista encima de las pestañas del celular, y al final del
 * formulario ocupa su propio lugar (no tapa el último bloque). Ver en tienda nunca guarda ni publica.
 */
export function EditorBar({ missing, dirty, isNew, onShowMissing, onDiscard, onPreview }: Props) {
  const status = missing > 0
    ? <>Faltan datos en {missing} {missing === 1 ? "paso" : "pasos"}. <button type="button" onClick={onShowMissing} className="underline">Ver qué falta</button></>
    : dirty ? "Cambios sin guardar. Se conservan si vas a la vista previa." : isNew ? "Completá los pasos y guardá para crearlo." : "Sin cambios.";
  return (
    <div data-editor-bar className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center gap-2 rounded-[1.5rem] bg-surface/95 p-3 shadow-[0_18px_40px_-18px_rgb(28_32_22/0.45)] ring-1 ring-ink/[0.08] backdrop-blur desk:bottom-4">
      <p role="status" className={cn("min-w-0 basis-full text-xs font-bold sm:flex-1 sm:basis-auto", missing > 0 ? "text-danger" : dirty ? "text-warning" : "text-muted")}>{status}</p>
      <div className="flex flex-1 flex-wrap justify-end gap-2 sm:flex-none">
        {dirty && <Button variant="ghost" onClick={onDiscard} className="px-4">Descartar</Button>}
        <Button variant="secondary" onClick={onPreview} className="px-4"><Eye size={17} aria-hidden="true" />Ver en tienda</Button>
        <Button type="submit" className="px-5"><Save size={17} aria-hidden="true" /><span>Guardar<span className="max-sm:sr-only"> (solo en esta demo)</span></span></Button>
      </div>
    </div>
  );
}
