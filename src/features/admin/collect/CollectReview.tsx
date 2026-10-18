"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import type { AdminOrder } from "@/demo/admin/types";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { CollectCard } from "./CollectCard";

interface Props {
  items: AdminOrder[];
  /** Pedido con el que arranca (enlace desde Hoy con `?codigo=`). */
  initial?: string | null;
}

/**
 * Modo revisión de Por cobrar (R4b): un pedido por vez, con Anterior y Siguiente, y la fila completa abajo para saltar
 * a cualquiera. Al aprobar, rechazar o cancelar, el pedido sale de la fila y queda a la vista el que seguía.
 */
export function CollectReview({ items, initial = null }: Props) {
  const [focus, setFocus] = useState<{ code: string | null; pos: number }>({ code: initial, pos: 0 });
  const found = items.findIndex((o) => o.code === focus.code);
  const at = found >= 0 ? found : Math.min(focus.pos, items.length - 1);
  const current = items[at]!;
  const go = (i: number) => setFocus({ code: items[i]!.code, pos: i });
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Revisión de a uno" className="grid grid-cols-2 items-center gap-2 sm:flex">
        <p aria-live="polite" className="col-span-2 text-sm font-bold sm:mr-auto">Revisando <span className="tabular-nums">{at + 1}</span> de <span className="tabular-nums">{items.length}</span></p>
        <Button variant="secondary" size="sm" disabled={at === 0} onClick={() => go(at - 1)}><ChevronLeft size={15} aria-hidden="true" /> Anterior</Button>
        <Button variant="secondary" size="sm" disabled={at >= items.length - 1} onClick={() => go(at + 1)}>Siguiente <ChevronRight size={15} aria-hidden="true" /></Button>
      </nav>
      <CollectCard key={current.code} order={current} />
      <section aria-labelledby="fila-cobros">
        <h2 id="fila-cobros" className="eyebrow mb-2 text-muted">En la fila · {items.length}</h2>
        <ol className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">
          {items.map((o, i) => (
            <li key={o.code}>
              <button type="button" onClick={() => go(i)} aria-current={i === at ? "true" : undefined} aria-label={`Revisar ${o.code} de ${o.customer.name}`}
                className={cn("flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left text-sm transition-colors", i === at ? "bg-accent" : "bg-surface hover:bg-accent/50")}>
                <span className="font-extrabold tabular-nums">{o.code}</span>
                <span className="min-w-0 flex-1 truncate">{o.customer.name}</span>
                <span className="text-xs font-bold text-muted">{STATUS_LABEL[o.status]}</span>
                <span className="w-24 text-right font-extrabold tabular-nums">{formatARS(o.total)}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
