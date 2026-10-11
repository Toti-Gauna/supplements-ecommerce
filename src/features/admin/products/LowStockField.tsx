"use client";
import { useState } from "react";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

/** Umbral de reposición configurable: avisar cuando una variante tiene estas unidades o menos. */
export function LowStockField({ value }: { value: number }) {
  const saveSettings = useAdmin((s) => s.saveSettings);
  const save = useDemoSave();
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    const n = Number(draft);
    if (draft !== null && draft.trim() !== "" && Number.isInteger(n) && n >= 0 && n !== value) save(`Aviso de stock bajo: ${n} o menos`, () => saveSettings({ lowStockThreshold: n }));
    setDraft(null);
  };
  return (
    <label className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-sm font-bold shadow-[var(--shadow-card)]">
      Avisar con
      <input type="number" min={0} max={99} value={draft ?? value} aria-label="Avisar de stock bajo con estas unidades o menos" onChange={(e) => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} className="h-9 w-16 rounded-xl border border-ink/12 bg-bg text-center tabular-nums" />
      o menos
    </label>
  );
}
