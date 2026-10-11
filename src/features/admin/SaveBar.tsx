"use client";
import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { cn } from "@/lib/cn";

interface Props {
  dirty: boolean;
  /** "Guardar carrusel", "Guardar contacto"… */
  label: string;
  /** Qué se pierde al descartar (para el aviso de confirmación). */
  discardText: string;
  onDiscard: () => void;
  onSave: () => void;
  status?: ReactNode;
}

/**
 * Barra de guardado de una subpágina (8.3.28/8.3.29): con cambios queda a la vista encima de las pestañas del celular
 * (sin cambios va al final, en su lugar); descartar pide confirmación. No tapa el último campo. Va fuera de un <form>:
 * la confirmación es un <dialog> con su propio formulario.
 */
export function SaveBar({ dirty, label, discardText, onDiscard, onSave, status }: Props) {
  return (
    <div data-save-bar className={cn("z-20 mt-6 flex flex-wrap items-center gap-2 rounded-[1.5rem] bg-surface/95 p-3 shadow-[0_18px_40px_-18px_rgb(28_32_22/0.45)] ring-1 ring-ink/[0.08] backdrop-blur", dirty && "sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] desk:bottom-4")}>
      <p role="status" className={cn("min-w-0 basis-full text-xs font-bold sm:flex-1 sm:basis-auto", dirty ? "text-warning" : "text-muted")}>
        {status ?? (dirty ? "Cambios sin guardar. Se conservan si salís y volvés a esta página." : "Sin cambios.")}
      </p>
      <div className="flex flex-1 flex-wrap justify-end gap-2 sm:flex-none">
        {dirty && <ConfirmButton variant="ghost" title="Descartar los cambios" confirmLabel="Descartar" description={discardText} onConfirm={onDiscard}>Descartar</ConfirmButton>}
        <Button disabled={!dirty} onClick={onSave} className="px-5"><Save size={17} aria-hidden="true" /><span>{label}</span></Button>
      </div>
    </div>
  );
}
