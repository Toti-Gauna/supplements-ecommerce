import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

export interface SalesBar {
  key: string;
  label: string;
  amount: number;
  orders: number;
}

interface Props {
  title: string;
  bars: SalesBar[];
  /** Día elegido (barra o fila de la tabla) y qué hacer al elegir otro. */
  selected?: string | null;
  onSelect?: (key: string) => void;
  /** Detalle del día elegido, debajo del gráfico (sin popovers que se recorten). */
  detail?: ReactNode;
}

const pedidos = (n: number) => `${n} ${n === 1 ? "pedido" : "pedidos"}`;

/**
 * Barras de una sola serie (ventas de muestra por día). Cada barra es un botón: con clic, toque o teclado muestra el
 * detalle del día (8.3.1). "Ver como tabla" usa los mismos datos y suma el mismo total.
 */
export function SalesChart({ title, bars, selected = null, onSelect, detail }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.amount));
  const total = bars.reduce((s, b) => s + b.amount, 0);
  const count = bars.reduce((s, b) => s + b.orders, 0);
  return (
    <figure className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <figcaption className="font-display mb-4 text-2xl">Ventas por día <span className="block text-sm font-sans text-muted">{title}</span></figcaption>
      <div role="group" aria-label="Ventas por día: elegí un día para ver sus pedidos" className="relative flex h-48 items-end gap-0.5 border-b border-line">
        {[0.5, 1].map((t) => <span key={t} aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/70" style={{ bottom: `${t * 100}%` }} />)}
        {bars.map((b) => {
          const on = selected === b.key;
          return (
            <button key={b.key} type="button" onClick={() => onSelect?.(b.key)} aria-pressed={on}
              aria-label={`${b.label}: ${formatARS(b.amount)}, ${pedidos(b.orders)} (demo)`}
              className="group relative flex h-full flex-1 items-end justify-center rounded-t-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <span aria-hidden="true" className={cn("block w-full max-w-10 rounded-t-[4px] transition-[opacity,background-color]", on ? "bg-brass-ink" : "bg-primary group-hover:opacity-85")}
                style={{ height: b.amount > 0 ? `${Math.max(3, (b.amount / max) * 100)}%` : "2px", opacity: b.amount > 0 || on ? 1 : 0.25 }} />
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-0.5 text-center text-[11px] text-muted" aria-hidden="true">
        {bars.map((b) => <span key={b.key} className={cn("flex-1", selected === b.key && "font-bold text-ink")}>{b.label}</span>)}
      </div>
      {detail}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-bold text-primary">Ver como tabla</summary>
        <table className="mt-2 w-full text-left">
          <thead><tr className="text-muted"><th className="py-1 font-semibold">Día</th><th className="font-semibold">Ventas (demo)</th><th className="font-semibold">Pedidos</th></tr></thead>
          <tbody>
            {bars.map((b) => (
              <tr key={b.key} className={cn("border-t border-line", selected === b.key && "bg-accent/50")}>
                <td className="py-1"><button type="button" onClick={() => onSelect?.(b.key)} className="font-semibold text-primary underline-offset-2 hover:underline">{b.label}</button></td>
                <td className="tabular-nums">{formatARS(b.amount)}</td><td className="tabular-nums">{b.orders}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t-2 border-line font-bold"><td className="py-1">Total 7 días</td><td className="tabular-nums">{formatARS(total)}</td><td className="tabular-nums">{count}</td></tr></tfoot>
        </table>
      </details>
    </figure>
  );
}
