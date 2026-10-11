"use client";
import { Infinity as InfinityIcon, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";

/** Stock editable en la tabla: − / + rápidos, número directo y "a pedido". Guarda al salir o con Enter. */
export function StockEditor({ value, label, onChange }: { value: number; label: string; onChange: (stock: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const shown = draft ?? (value < 0 ? "" : String(value));
  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setDraft(null); return; }
    if (draft === null) return;
    const n = Number(draft);
    if (draft.trim() !== "" && Number.isInteger(n) && n >= 0 && n !== value) onChange(n);
    setDraft(null);
  };
  const base = "grid h-9 w-9 place-items-center rounded-xl border transition-colors disabled:opacity-30";
  const btn = `${base} border-ink/12 bg-surface hover:border-ink/30`;
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Stock de ${label}`}>
      <button type="button" className={btn} aria-label={`Restar 1 a ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}><Minus size={15} aria-hidden="true" /></button>
      <input inputMode="numeric" aria-label={`Unidades de ${label}`} value={shown} placeholder="∞" onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { cancelled.current = true; e.currentTarget.blur(); } }}
        className="h-9 w-16 rounded-xl border border-ink/12 bg-bg text-center text-sm font-bold tabular-nums focus:border-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/12" />
      <button type="button" className={btn} aria-label={`Sumar 1 a ${label}`} onClick={() => onChange(Math.max(0, value) + 1)}><Plus size={15} aria-hidden="true" /></button>
      <button type="button" aria-pressed={value < 0} title="A pedido (sin límite)" aria-label={`${label} a pedido`} onClick={() => onChange(value < 0 ? 0 : -1)}
        className={value < 0 ? `${base} border-primary bg-primary text-on-primary` : btn}><InfinityIcon size={15} aria-hidden="true" /></button>
    </div>
  );
}
