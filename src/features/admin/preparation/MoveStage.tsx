"use client";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import type { AdminOrder } from "@/demo/admin/types";
import { PREP_COLUMNS, prepMove, type PrepColumn } from "@/demo/admin/workshop/preparation";
import { cn } from "@/lib/cn";

/**
 * "Mover etapa" (8.3.16): las etapas a las que puede ir el pedido según las reglas, sin arrastrar (teclado y celular).
 * "Listo para despachar" aparece desde Control de lote aunque falten los lotes: abre el control.
 */
export function MoveStage({ order, column, onMove }: { order: AdminOrder; column: PrepColumn; onMove: (to: PrepColumn) => void }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const targets = PREP_COLUMNS.filter((c) => {
    if (c.id === column) return false;
    const m = prepMove(order, c.id);
    return m.ok || !!m.lots;
  });
  if (!targets.length) return null;
  const close = () => { setOpen(false); button.current?.focus(); };
  return (
    <div className="relative" onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); close(); } }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}>
      <button ref={button} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`mover-${order.code}`}
        className="inline-flex h-9 items-center gap-1 rounded-sm border border-ink/15 px-3 text-xs font-bold hover:bg-accent/50">
        Mover etapa<span className="sr-only"> de {order.code}</span> <ChevronDown size={14} aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <ul id={`mover-${order.code}`} aria-label={`Mover ${order.code} a`} className="absolute bottom-full left-0 z-20 mb-1 flex min-w-48 flex-col gap-0.5 rounded-sm bg-surface p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-ink/10">
          {targets.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => { setOpen(false); onMove(c.id); }} aria-label={`Mover ${order.code} a ${c.label}`}
                className="flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm font-bold hover:bg-accent/60">
                {c.label}<span className="text-xs font-normal text-muted">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
