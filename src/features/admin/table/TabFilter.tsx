"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Pestañas de filtro con contador (por estado, por stock…). */
export function TabFilter<T extends string>({ label, tabs, value, onChange }: { label: string; tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto overflow-y-hidden px-1 pb-1">
      {tabs.map((t) => (
        <button key={t.id} type="button" aria-pressed={value === t.id} onClick={() => onChange(t.id)}
          className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors",
            value === t.id ? "bg-night text-[#f6f1e8] shadow-[var(--shadow-card)]" : "bg-surface text-ink/75 ring-1 ring-ink/10 hover:bg-accent")}>
          {t.label}
          {t.count !== undefined && <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] tabular-nums", value === t.id ? "bg-white/15" : "bg-accent")}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Botón claro para la barra de acciones en lote (fondo oscuro). */
export function BulkButton({ children, onClick, tone = "default" }: { children: ReactNode; onClick: () => void; tone?: "default" | "danger" }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors", tone === "danger" ? "bg-danger/90 text-white hover:bg-danger" : "bg-white/10 hover:bg-white/20")}>
      {children}
    </button>
  );
}
