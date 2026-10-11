"use client";
import { TriangleAlert } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import type { ScheduleImpact } from "@/demo/admin/workshop/schedule";
import { formatDay } from "@/lib/date";

export function impactLines(i: ScheduleImpact): string[] {
  return [
    ...i.closed.map((c) => `${c.code} queda en un día cerrado (${formatDay(c.day)} · ${c.reason}).`),
    ...i.overloaded.map((d) => `El ${formatDay(d.day)} queda sobrecargado (${d.used} de ${d.capacity} pedidos).`),
  ];
}

interface ConfirmProps { label: string; title: string; action: string; cancel?: string; onConfirm: () => void; onCancel: () => void; children?: ReactNode }

/** Confirmación en el lugar (sin otro modal encima): el foco va al botón que confirma y Cancelar vuelve atrás. */
export function InlineConfirm({ label, title, action, cancel = "Seguir editando", onConfirm, onCancel, children }: ConfirmProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div role="alertdialog" aria-label={label} className="flex flex-col gap-3 rounded-2xl bg-warning-soft p-4 text-sm ring-1 ring-warning/30">
      <p className="flex items-center gap-2 font-bold text-warning"><TriangleAlert size={17} aria-hidden="true" className="shrink-0" />{title}</p>
      {children}
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>{cancel}</Button>
        <Button ref={ref} size="sm" variant="danger" onClick={onConfirm}>{action}</Button>
      </div>
    </div>
  );
}

/**
 * Confirmación de un cambio de días o capacidad que toca entregas ya comprometidas (8.3.14). Los pedidos no se
 * mueven solos: quedan marcados en el calendario para reprogramarlos.
 */
export function ImpactConfirm({ impact, action, onConfirm, onCancel }: { impact: ScheduleImpact; action: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <InlineConfirm label="Cambio que toca entregas" title="Esto toca entregas ya comprometidas" action={action} onConfirm={onConfirm} onCancel={onCancel}>
      <ul className="flex list-disc flex-col gap-1 pl-5 font-semibold text-ink">{impactLines(impact).map((l) => <li key={l}>{l}</li>)}</ul>
      <p className="text-muted">Ningún pedido se mueve solo: quedan marcados en el calendario para que los reprogrames.</p>
    </InlineConfirm>
  );
}
