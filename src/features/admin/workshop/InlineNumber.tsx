"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Número editable dentro de una tabla: guarda al salir o con Enter; Escape cancela. Acepta coma decimal. */
export function InlineNumber({ value, label, onCommit, min = 0, decimals = false, className }: { value: number; label: string; onCommit: (v: number) => void; min?: number; decimals?: boolean; className?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const commit = () => {
    const text = draft;
    setDraft(null);
    if (cancelled.current) { cancelled.current = false; return; }
    if (text === null || text.trim() === "") return;
    const n = Number(text.replace(/\./g, decimals ? "." : "").replace(",", "."));
    if (!Number.isFinite(n)) return;
    const next = Math.max(min, decimals ? Math.round(n * 100) / 100 : Math.round(n));
    if (next !== value) onCommit(next);
  };
  return (
    <input type="text" inputMode={decimals ? "decimal" : "numeric"} aria-label={label} value={draft ?? String(value).replace(".", ",")}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit} onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { cancelled.current = true; e.currentTarget.blur(); } }}
      className={cn("h-9 w-24 rounded-xl border border-ink/12 bg-bg px-2 text-right font-bold tabular-nums focus:border-primary focus:outline-none", className)} />
  );
}
