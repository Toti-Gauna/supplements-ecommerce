"use client";
import { Info, X } from "lucide-react";
import type { Help } from "@/demo/admin/help";
import { cn } from "@/lib/cn";

/** Botón "i" (8.3.10): abre o cierra la explicación; se usa con tap, clic o teclado. */
export function HelpButton({ label, open, controls, onToggle, className }: { label: string; open: boolean; controls: string; onToggle: () => void; className?: string }) {
  return (
    <button type="button" aria-label={`Qué significa: ${label}`} aria-expanded={open} aria-controls={controls} onClick={onToggle}
      className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-accent hover:text-ink aria-expanded:bg-primary/10 aria-expanded:text-primary", className)}>
      <Info size={16} aria-hidden="true" />
    </button>
  );
}

/**
 * Explicación de segmentos o estados. Va en el flujo de la página (debajo de los controles), así no tapa filtros ni
 * barras fijas, y solo ocupa lugar mientras está abierta. Escape la cierra.
 */
export function HelpPanel({ id, help, onClose, className }: { id: string; help: Help; onClose: () => void; className?: string }) {
  return (
    <section id={id} aria-label={help.title} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      className={cn("animate-fade-up rounded-2xl bg-bg p-4 text-sm ring-1 ring-ink/[0.06]", className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-bold">{help.title}</h3>
        <button type="button" onClick={onClose} aria-label="Cerrar explicación" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-accent"><X size={15} aria-hidden="true" /></button>
      </div>
      <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_minmax(0,1fr)]">
        {help.items.map((i) => (
          <div key={i.term} className="contents">
            <dt className="font-bold">{i.term}</dt>
            <dd className="mb-1 text-muted sm:mb-0">{i.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
