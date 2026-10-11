"use client";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { formatDay } from "@/lib/date";

export interface PendingMove { code: string; customer: string; from?: string; to: string; warnings: string[] }

/**
 * Soltar un pedido en otro día cambia su fecha comprometida: se confirma antes (8.3.15), así un arrastre sin querer
 * no reprograma nada.
 */
export function MoveConfirm({ move, onConfirm, onClose }: { move: PendingMove | null; onConfirm: () => void; onClose: () => void }) {
  return (
    <Sheet open={!!move} onClose={onClose} title={move ? `Mover ${move.code}` : "Mover pedido"} side="dialog" className="bg-bg sm:w-[min(94vw,520px)]">
      {move && (
        <div className="flex flex-col gap-4 p-6 pt-7">
          <h2 className="pr-12 font-display text-2xl">¿Mover {move.code}?</h2>
          <p className="text-sm text-muted">{move.customer}</p>
          <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface p-3 font-bold shadow-[var(--shadow-card)]">
            <span className="first-letter:uppercase">{move.from ? formatDay(move.from) : "Sin fecha"}</span><ArrowRight size={16} aria-hidden="true" /><span className="text-primary first-letter:uppercase">{formatDay(move.to, "long")}</span>
          </p>
          {move.warnings.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-2xl bg-warning-soft p-3 text-sm font-semibold text-warning">
              {move.warnings.map((w) => <li key={w} className="flex gap-2"><TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />{w}</li>)}
            </ul>
          )}
          <p className="text-xs text-muted">En producción el cliente recibiría un aviso con la fecha nueva.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={onConfirm} data-autofocus>Mover al {formatDay(move.to)}</Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
