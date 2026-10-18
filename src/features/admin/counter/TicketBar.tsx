"use client";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { Ticket } from "@/demo/engine/counter-ticket";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";

interface TicketBarProps {
  ticket: Ticket;
  onOpen: () => void;
  onCharge: () => void;
}

/**
 * El ticket siempre a la vista en el celular y la tablet: una barra fija arriba de las pestañas con el total, "Ver
 * ticket" (lo abre para editarlo) y "Cobrar". En pantallas anchas el ticket va en su columna y esta barra no se ve.
 */
export function TicketBar({ ticket, onOpen, onCharge }: TicketBarProps) {
  const empty = ticket.rows.length === 0;
  const short = ticket.rows.some((r) => r.short > 0);
  return (
    <div role="region" aria-label="Ticket en curso" className="fixed inset-x-2 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-lg lg:hidden">
      <div className="flex items-center gap-2 rounded-sm border border-line bg-surface p-2 pl-3 shadow-[var(--shadow-lift)]">
        <button type="button" onClick={onOpen} className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-sm text-left hover:bg-accent/60">
          <ReceiptText size={22} aria-hidden="true" className="shrink-0 text-volt-ink" />
          <span className="min-w-0">
            <span className="sr-only">Ver el </span>
            <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted">{empty ? "Ticket vacío" : `Ticket · ${plural(ticket.units, "pote", "potes")}`}</span>
            <span data-bar-total className="block font-lab text-xl font-bold tabular-nums">{formatARS(ticket.total)}</span>
          </span>
        </button>
        <Button onClick={onCharge} disabled={empty || short} className="shrink-0">Cobrar</Button>
      </div>
    </div>
  );
}
