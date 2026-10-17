"use client";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { Button } from "@/components/atoms/Button";
import type { StackSummary } from "@/demo/engine/stack-builder";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/**
 * Placa de compra del armador en el celular: la misma placa de acero que el dock, apoyada ARRIBA de él (el dock sigue a
 * la vista y se puede usar). Mismo alto que deja la bandeja del comparador.
 */
const ABOVE_DOCK =
  "fixed inset-x-2 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] mx-auto flex max-w-md items-center gap-2 rounded-sm border border-line bg-surface p-2 pl-4 shadow-[inset_0_2px_0_var(--season-accent),var(--shadow-lift)]";

/** Ya se llegó (o se pasó) al elemento: el resumen de la página está a la vista y la placa sobra. */
function useReached(target: RefObject<HTMLElement | null>): boolean {
  const [reached, setReached] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setReached(!!e && (e.isIntersecting || e.boundingClientRect.top < 0)));
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return reached;
}

interface Props {
  summary: StackSummary;
  /** El resumen de la página: cuando aparece, la placa se va (tiene el mismo total y el mismo botón). */
  summaryRef: RefObject<HTMLElement | null>;
  onAdd: () => void;
}

/**
 * Total del stack fijo abajo en el celular mientras se arma: el total primero y grande (con el descuento stack), lo
 * que sale por día chico debajo, y "Agregar el stack". Con el estante vacío no aparece.
 */
export function StackBuyBar({ summary, summaryRef, onAdd }: Props) {
  const reached = useReached(summaryRef);
  const units = summary.lines.reduce((s, l) => s + l.qty, 0);
  if (!summary.lines.length) return null;
  return (
    <div role="region" aria-label="Total de tu stack" data-stack-bar hidden={reached} className={cn(ABOVE_DOCK, "z-30 animate-fade-up lg:hidden")}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted">Total{summary.stack.discount > 0 ? ` · −${summary.stack.pct} % stack` : ""}</p>
        <p data-stack-bar-total className="text-xl font-extrabold leading-tight tabular-nums">{formatARS(summary.total)}</p>
        {summary.perDay !== null && <p className="font-lab whitespace-nowrap text-[11px] text-muted">≈ {formatARS(summary.perDay)}/día</p>}
      </div>
      <Button onClick={onAdd} className="shrink-0" aria-label={`Agregar el stack (${units} ${units === 1 ? "producto" : "productos"})`}>
        <ShoppingBag size={17} aria-hidden="true" />Agregar el stack
      </Button>
    </div>
  );
}
