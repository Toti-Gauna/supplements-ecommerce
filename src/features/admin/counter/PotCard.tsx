import { Plus } from "lucide-react";
import type { CounterPot, PotState } from "@/demo/engine/counter";
import { formatExpiry } from "@/demo/engine/lots";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

const STOCK_TONE: Record<PotState, string> = { ok: "text-success", low: "text-warning", out: "text-danger", "on-order": "text-muted" };

/** "Stock 16", "Quedan 2", "Sin stock" o "A pedido" (lo que queda descontando el ticket). */
export function stockLabel(pot: Pick<CounterPot, "state" | "left">): string {
  if (pot.state === "on-order") return "A pedido";
  if (pot.state === "out") return "Sin stock";
  return pot.state === "low" ? `Quedan ${pot.left}` : `Stock ${pot.left}`;
}

/** "Sale lote VL-2603-W · vence 11/2026" (con los días si vence pronto); el equipamiento no tiene lote. */
export function lotLabel(pot: Pick<CounterPot, "nextLot">): string | null {
  const lot = pot.nextLot;
  if (!lot) return null;
  return `Sale lote ${lot.code} · vence ${formatExpiry(lot.expires)}${lot.soon ? ` (en ${lot.days} días)` : ""}`;
}

interface PotCardProps {
  pot: CounterPot;
  /** Unidades de este pote en el ticket. */
  inTicket: number;
  onAdd: (pot: CounterPot) => void;
  className?: string;
}

/**
 * Pote del mostrador: un toque lo suma al ticket. Muestra el precio (el de liquidación tachando el de lista), lo que
 * queda y el lote que sale (FEFO), en ámbar si vence pronto. Sin stock queda deshabilitado.
 */
export function PotCard({ pot, inTicket, onAdd, className }: PotCardProps) {
  const lot = lotLabel(pot);
  const disabled = pot.left === 0;
  return (
    <button type="button" onClick={() => onAdd(pot)} disabled={disabled} data-pot={pot.key}
      className={cn("plate group relative flex h-full w-full min-w-0 flex-col gap-2 rounded-sm border border-line p-3.5 text-left transition-[border-color,box-shadow] duration-150 hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55",
        inTicket > 0 && "border-volt-ink shadow-[inset_3px_0_0_var(--color-volt-ink)]", className)}>
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="sr-only">Sumar al ticket: </span>
          <span className="block font-extrabold leading-tight">{pot.productName}</span>
          <span className="block text-sm text-muted">{pot.variantLabel}</span>
        </span>
        {inTicket > 0
          ? <span className="shrink-0 rounded-xs bg-primary px-2 py-0.5 font-mono text-[12px] font-bold text-on-primary">×{inTicket}<span className="sr-only"> en el ticket</span></span>
          : !disabled && <Plus size={20} aria-hidden="true" className="shrink-0 text-muted group-hover:text-ink" />}
      </span>
      <span className="mt-auto flex flex-wrap items-baseline gap-x-2">
        <span className="font-lab text-2xl font-bold tabular-nums">{formatARS(pot.price)}</span>
        {pot.clearancePct ? <span className="text-sm text-muted"><s>{formatARS(pot.listPrice)}</s> <span className="font-bold text-warning">−{pot.clearancePct} %</span></span> : null}
      </span>
      <span className="flex flex-col gap-0.5 font-mono text-[11px] leading-snug">
        <span className={cn("font-bold uppercase tracking-[0.04em]", STOCK_TONE[pot.state])}>{stockLabel(pot)}</span>
        {lot && <span className={pot.nextLot?.soon ? "font-bold text-warning" : "text-muted"}>{lot}</span>}
      </span>
    </button>
  );
}
