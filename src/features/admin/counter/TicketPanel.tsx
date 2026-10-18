"use client";
import { Layers } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { Ticket } from "@/demo/engine/counter-ticket";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { TicketLines } from "./TicketLines";

/** El stack aplicado o cuánto falta (con la misma regla de la tienda). */
export function StackNote({ stack }: { stack: Ticket["stack"] }) {
  if (stack.discount > 0) return <p className="flex items-center gap-2 text-sm font-bold text-success"><Layers size={16} aria-hidden="true" />Descuento stack −{stack.pct} % ({stack.categories.length} categorías)</p>;
  if (!stack.categories.length || stack.pct <= 0) return null;
  return <p className="flex items-center gap-2 text-sm text-muted"><Layers size={16} aria-hidden="true" />Sumá {plural(stack.missing, "categoría", "categorías")} más de suplementos y baja {stack.pct} %.</p>;
}

interface TicketPanelProps {
  ticket: Ticket;
  onQty: (key: string, qty: number) => void;
  onClear: () => void;
  onCharge: () => void;
  /** Id del título (para nombrar el panel que lo contiene). */
  titleId?: string;
  className?: string;
  /** `lines`: el área de las líneas (con un alto tope, se desplaza sola y el total y "Cobrar" quedan a la vista). */
  classNames?: { lines?: string };
}

/** Ticket del mostrador: líneas editables, descuento stack, total y "Cobrar". */
export function TicketPanel({ ticket, onQty, onClear, onCharge, titleId = "ticket-titulo", className, classNames }: TicketPanelProps) {
  const empty = ticket.rows.length === 0;
  const short = ticket.rows.some((r) => r.short > 0);
  return (
    <section aria-labelledby={titleId} data-ticket className={cn("flex flex-col gap-4 rounded-sm border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5", className)}>
      <header className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="font-display text-3xl">Ticket</h2>
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{plural(ticket.units, "pote", "potes")}</span>
      </header>
      {empty
        ? <p className="rounded-sm border border-dashed border-line p-4 text-sm text-muted">Tocá un pote para sumarlo al ticket.</p>
        : <TicketLines rows={ticket.rows} onQty={onQty} className={classNames?.lines} />}
      <StackNote stack={ticket.stack} />
      <dl className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted">Subtotal</dt><dd className="font-lab tabular-nums">{formatARS(ticket.subtotal)}</dd></div>
        {ticket.stack.discount > 0 && <div className="flex justify-between gap-3 text-success"><dt>Descuento stack</dt><dd className="font-lab font-bold tabular-nums">−{formatARS(ticket.stack.discount)}</dd></div>}
        <div className="mt-1 flex items-end justify-between gap-3"><dt className="eyebrow text-ink">Total</dt><dd data-ticket-total className="font-lab text-3xl font-bold tabular-nums">{formatARS(ticket.total)}</dd></div>
      </dl>
      <Button size="lg" onClick={onCharge} disabled={empty || short} className="w-full">Cobrar {formatARS(ticket.total)}</Button>
      {!empty && <button type="button" onClick={onClear} className="self-center text-sm font-bold text-muted underline hover:text-ink">Vaciar el ticket</button>}
    </section>
  );
}
