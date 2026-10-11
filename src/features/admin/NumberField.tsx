"use client";
import { useRef, useState } from "react";
import { Input } from "@/components/atoms/Field";

/** Campo numérico entero (montos en pesos enteros, unidades, días). */
export function NumberField({ id, label, value, onChange, min = 0, suffix, hint }: { id: string; label: string; value: number | undefined; onChange: (v: number) => void; min?: number; suffix?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold">{label}{suffix && <span className="font-normal text-muted"> ({suffix})</span>}</label>
      <Input id={id} type="number" inputMode="numeric" step={1} min={min} value={value ?? ""} aria-describedby={hint ? `${id}-h` : undefined}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(min, Math.round(Number(e.target.value))))} />
      {hint && <p id={`${id}-h`} className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

/**
 * Número que se guarda al salir del campo o con Enter (no en cada tecla): evita un aviso por dígito.
 * Escape vuelve al valor guardado.
 */
export function CommitNumberField({ id, label, value, onCommit, min = 0, max, suffix, hint, step = 1, className }: { id: string; label: string; value: number; onCommit: (v: number) => void; min?: number; max?: number; suffix?: string; hint?: string; step?: number; className?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const commit = () => {
    const text = draft;
    setDraft(null);
    if (cancelled.current) { cancelled.current = false; return; }
    if (text === null || text.trim() === "") return;
    const n = Number(text.replace(",", "."));
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(max ?? Infinity, Math.max(min, step === 1 ? Math.round(n) : n));
    if (clamped !== value) onCommit(clamped);
  };
  return (
    <div className={className ?? "flex flex-col gap-1"}>
      <label htmlFor={id} className="text-sm font-bold">{label}{suffix && <span className="font-normal text-muted"> ({suffix})</span>}</label>
      <Input id={id} type="number" inputMode={step === 1 ? "numeric" : "decimal"} step={step} min={min} max={max} value={draft ?? value} aria-describedby={hint ? `${id}-h` : undefined}
        onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { cancelled.current = true; e.currentTarget.blur(); } }} />
      {hint && <p id={`${id}-h`} className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
