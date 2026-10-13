"use client";
import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Ticker de una línea arriba del header: aviso de demo, cuándo llega el cadete y el beneficio por transferencia.
 * Se puede ocultar (en la maqueta solo por esta visita). No se mueve solo: en el celular se desliza con el dedo.
 */
export function Ticker({ items }: { items: { key: string; label: string; text: string }[] }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="flex h-8 items-stretch border-b border-(--bx-steel) bg-(--bx-carbon) font-mono text-[11px] uppercase tracking-[0.12em]">
      <ul aria-label="Avisos de la tienda" className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto whitespace-nowrap px-4 [scrollbar-width:none] sm:justify-center sm:px-8">
        {items.map((it, i) => (
          <li key={it.key} className={cn("flex items-center gap-2", i > 0 && "before:mr-4 before:h-3 before:w-px before:bg-(--bx-steel) before:content-['']")}>
            <span className="font-bold text-(--bx-volt)">{it.label}</span>
            <span className="text-(--bx-chalk)">{it.text}</span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setOpen(false)} aria-label="Ocultar avisos" className="grid w-10 shrink-0 place-items-center border-l border-(--bx-steel) text-(--bx-dim) hover:text-(--bx-chalk) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--bx-volt)">
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
