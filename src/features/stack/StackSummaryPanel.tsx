"use client";
import { Link2, ShoppingBag } from "lucide-react";
import type { Ref } from "react";
import { Button } from "@/components/atoms/Button";
import { OrderSummary, type SummaryRow } from "@/components/molecules/OrderSummary";
import type { StackSummary } from "@/demo/engine/stack-builder";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { StackNudge } from "../cart/StackNudge";
import { SLOT_SHORT } from "./slot-labels";

interface StackSummaryPanelProps {
  summary: StackSummary;
  onAdd: () => void;
  onCopy: () => void;
  className?: string;
  /** La placa fija del celular se va cuando este resumen aparece. */
  ref?: Ref<HTMLDivElement>;
}

/** Costo por día (un servicio de cada producto, con el descuento) y el precio por servicio de cada uno. */
function PerDay({ summary }: { summary: StackSummary }) {
  if (summary.perDay === null) return null;
  return (
    <div className="rounded-sm bg-night px-4 py-3 text-on-night ring-1 ring-white/10">
      <p className="flex items-baseline justify-between gap-3">
        <span className="eyebrow text-[10px] text-night-muted">Te sale por día</span>
        <span className="font-lab text-2xl font-bold text-volt" data-per-day>{formatARS(summary.perDay)}</span>
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Precio por servicio">
        {summary.lines.map((l) => l.perServing !== null && (
          <li key={l.slot} className="font-lab rounded-sm bg-white/[0.07] px-2 py-0.5 text-[11px] text-night-muted">
            {SLOT_SHORT[l.slot]} <span className="text-on-night">{formatARS(l.perServing)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Resumen del estante con el mismo cálculo y las mismas filas que el carrito: batería de categorías hacia el descuento
 * stack, subtotal, descuento, total, costo por día y las acciones (agregar todo y copiar el link).
 */
export function StackSummaryPanel({ summary, onAdd, onCopy, className, ref }: StackSummaryPanelProps) {
  const units = summary.lines.reduce((s, l) => s + l.qty, 0);
  const empty = units === 0;
  const rows: SummaryRow[] = [
    { label: `Subtotal (${units} ${units === 1 ? "producto" : "productos"})`, amount: summary.subtotal },
    ...(summary.stack.discount > 0 ? [{ label: `Descuento stack (${summary.stack.pct} %)`, amount: summary.stack.discount, negative: true }] : []),
  ];
  return (
    <div ref={ref} className={cn("flex flex-col gap-3", className)}>
      <StackNudge stack={summary.stack} compact />
      <OrderSummary title="Resumen de tu stack" rows={rows} total={summary.total}
        totalNote={empty ? "Tu estante está vacío: elegí un objetivo o sumá algo en cada lugar." : undefined}>
        <div className="flex flex-col gap-2">
          <PerDay summary={summary} />
          <Button size="lg" className="mt-1 w-full" onClick={onAdd} disabled={empty}><ShoppingBag size={18} aria-hidden="true" />Agregar el stack al carrito</Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={onCopy} disabled={empty}><Link2 size={16} aria-hidden="true" />Copiar link de mi stack</Button>
          {!empty && <p className="text-center text-[11px] leading-snug text-muted">Por día: un servicio de cada uno, con el descuento. Orientativo, no reemplaza a un profesional.</p>}
        </div>
      </OrderSummary>
    </div>
  );
}
