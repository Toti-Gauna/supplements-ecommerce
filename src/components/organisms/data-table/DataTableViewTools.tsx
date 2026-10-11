"use client";
import { Columns3, Rows3, Rows4 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Column, Density } from "./types";

interface Props<T> {
  columns: Column<T>[];
  hidden: Set<string>;
  onToggleColumn: (id: string) => void;
  density: Density;
  onDensity: (d: Density) => void;
}

const tool = "inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-ink/12 bg-surface px-3 text-sm font-bold transition-colors hover:border-ink/25";

/** Cómo se ve la tabla (no qué muestra): columnas visibles y densidad. Solo desde la tablet, donde hay tabla. */
export function DataTableViewTools<T>(p: Props<T>) {
  const hideable = p.columns.filter((c) => !c.pinned);
  return (
    <>
      {hideable.length > 0 && (
        <details className="relative hidden md:block">
          <summary className={cn(tool, "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}><Columns3 size={16} aria-hidden="true" />Columnas</summary>
          <fieldset className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow-lift)]">
            <legend className="sr-only">Columnas visibles</legend>
            {hideable.map((c) => (
              <label key={c.id} className="flex min-h-10 items-center gap-3 rounded-xl px-2 text-sm font-semibold hover:bg-accent/60">
                <input type="checkbox" checked={!p.hidden.has(c.id)} onChange={() => p.onToggleColumn(c.id)} className="h-4 w-4 accent-primary" />{c.header}
              </label>
            ))}
          </fieldset>
        </details>
      )}
      <button type="button" onClick={() => p.onDensity(p.density === "compact" ? "comfortable" : "compact")} aria-pressed={p.density === "compact"}
        className={cn(tool, "hidden md:inline-flex")} title="Densidad de filas">
        {p.density === "compact" ? <Rows4 size={16} aria-hidden="true" /> : <Rows3 size={16} aria-hidden="true" />}
        <span>{p.density === "compact" ? "Compacta" : "Cómoda"}</span>
      </button>
    </>
  );
}
