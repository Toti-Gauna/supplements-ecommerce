"use client";
import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import type { TicketRow } from "@/demo/engine/counter-ticket";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/** "Lote VL-2603-W ×5 · VL-2609-W ×1": de qué lotes sale la línea (FEFO). */
export function lotsText(row: Pick<TicketRow, "lots">): string | null {
  if (!row.lots.length) return null;
  return `Lote ${row.lots.map((l) => (row.lots.length > 1 ? `${l.code} ×${l.units}` : l.code)).join(" · ")}`;
}

interface TicketLinesProps {
  rows: TicketRow[];
  onQty: (key: string, qty: number) => void;
  /** Nombre del grupo para los botones (“ticket”, “pedido”). */
  noun?: string;
  className?: string;
}

/** Líneas editables: producto, lote que sale, cantidad (con el stock como tope), quitar y subtotal de la línea. */
export function TicketLines({ rows, onQty, noun = "ticket", className }: TicketLinesProps) {
  return (
    <ul className={cn("flex flex-col divide-y divide-line", className)}>
      {rows.map((r) => {
        const lots = lotsText(r);
        const name = `${r.productName} (${r.variantLabel})`;
        return (
          <li key={r.key} data-line={r.key} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold leading-tight">{r.productName}</p>
                <p className="text-sm text-muted">{r.variantLabel}</p>
                {lots && <p className="font-mono text-[11px] text-muted">{lots}</p>}
              </div>
              <p className="shrink-0 font-lab font-bold tabular-nums">{formatARS(r.total)}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <QuantityStepper size="sm" value={r.line.qty} min={1} max={r.stock < 0 ? 99 : Math.max(r.line.qty, r.stock)} onChange={(q) => onQty(r.key, q)} label={`Cantidad de ${name}`} />
              <span className="font-mono text-[11px] text-muted">{formatARS(r.unitPrice)} c/u</span>
              <button type="button" onClick={() => onQty(r.key, 0)} aria-label={`Sacar ${name} del ${noun}`}
                className="grid h-10 w-10 place-items-center rounded-sm text-muted transition-colors hover:bg-danger-soft hover:text-danger">
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
            {r.short > 0 && <p role="alert" className="text-sm font-bold text-danger">Quedan {r.line.qty - r.short}: bajá la cantidad.</p>}
          </li>
        );
      })}
    </ul>
  );
}
