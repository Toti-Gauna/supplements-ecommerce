"use client";
import { X } from "lucide-react";
import { activeChips, type FacetGroup, type FacetKey } from "@/demo/engine/catalog-facets";
import { cn } from "@/lib/cn";

const CHIP = "inline-flex min-h-10 items-center gap-1.5 rounded-xs border border-primary bg-primary px-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-on-primary hover:bg-primary-hover sm:min-h-9";

/** Los filtros puestos como chips con su cruz y "Limpiar" (saca todos, deja el orden). */
export function ActiveFilters({ groups, onToggle, onClear, className }: {
  groups: FacetGroup[]; onToggle: (key: FacetKey, id: string) => void; onClear: () => void; className?: string;
}) {
  const chips = activeChips(groups);
  if (!chips.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <ul aria-label="Filtros puestos" className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <li key={`${c.key}:${c.id}`}>
            <button type="button" onClick={() => onToggle(c.key, c.id)} aria-label={`Quitar filtro ${c.group}: ${c.label}`} className={CHIP}>
              <span className="opacity-70">{c.group}:</span> {c.label}
              <X size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onClear} className="min-h-10 px-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4 sm:min-h-9">
        Limpiar
      </button>
    </div>
  );
}
