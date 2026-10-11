"use client";
import { useState } from "react";
import { DateInput } from "@/components/atoms/DateInput";

/**
 * Fecha que se aplica con un botón: el calendario nativo dispara un cambio por cada dígito que se escribe
 * (el año pasa por 0002, 0020…), así que mover el pedido en cada tecla dejaba fechas y avisos intermedios.
 */
export function PickDate({ id, label, value, min, action, onPick }: { id: string; label: string; value: string; min?: string; action: string; onPick: (day: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const pending = draft !== null && /^\d{4}-\d{2}-\d{2}$/.test(draft) && draft !== value;
  const apply = () => { if (pending) { onPick(draft); setDraft(null); } };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      <div className="flex gap-2">
        <span className="min-w-0 flex-1">
          <DateInput id={id} min={min} value={draft ?? value} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }} className="font-semibold" />
        </span>
        <button type="button" onClick={apply} disabled={!pending}
          className="h-12 shrink-0 rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover disabled:opacity-40">{action}</button>
      </div>
    </div>
  );
}
