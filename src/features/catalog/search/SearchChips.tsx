"use client";
import { Plus, X } from "lucide-react";
import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { removeChip, type SearchChip } from "@/demo/engine/search";
import { addChipPhrase, type ChipGroups, type ChipOption } from "@/demo/engine/search-facets";
import type { Goal, ProductBadge } from "@/demo/types";
import { cn } from "@/lib/cn";

const CHIP = "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xs border px-3 font-mono text-[12px] sm:min-h-9 sm:px-2.5 sm:text-[11px] font-bold uppercase tracking-[0.06em] transition-colors";
const KIND_LABEL: Record<SearchChip["kind"], string> = { goal: "Objetivo", badge: "Sello", flavor: "Sabor" };

function ChipIcon({ kind, id }: { kind: SearchChip["kind"]; id: string }) {
  if (kind === "goal") return <GoalGlyph goal={id as Goal} className="size-4" />;
  if (kind === "badge") return <BadgeGlyph badge={id as ProductBadge} className="size-4" />;
  return <span aria-hidden="true" className="size-2.5 rotate-45 border border-current" />;
}

/** Filtros que el buscador entendió, cada uno con su cruz: sacarlo borra esas palabras de la consulta. */
export function DetectedChips({ query, chips, onQuery, className }: { query: string; chips: SearchChip[]; onQuery: (q: string) => void; className?: string }) {
  if (!chips.length) return null;
  return (
    <ul aria-label="Filtros entendidos" className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <button type="button" onClick={() => onQuery(removeChip(query, chip))} aria-label={`Quitar filtro ${chip.label}`}
            className={cn(CHIP, "border-primary bg-primary text-on-primary hover:bg-primary-hover")}>
            <span className="sr-only">{KIND_LABEL[chip.kind]}: </span>
            <ChipIcon kind={chip.kind} id={chip.id} />
            {chip.label}
            <X size={14} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Filtros para tocar por grupo (objetivo, sello, sabor). Los que ya están en la consulta no se repiten: se sacan
 * desde `DetectedChips`. En el celular cada grupo es un carril que se desliza; desde `sm` los chips bajan de línea y,
 * con `panel` (/buscar), desde `lg` son una columna de filtros con el rótulo arriba.
 */
export function ChipToggles({ query, groups, active, onQuery, variant = "rails", className }: {
  query: string; groups: ChipGroups; active: SearchChip[]; onQuery: (q: string) => void; variant?: "rails" | "panel"; className?: string;
}) {
  const used = new Set(active.map((c) => c.key));
  const rows: [SearchChip["kind"], ChipOption[]][] = [["goal", groups.goal], ["badge", groups.badge], ["flavor", groups.flavor]];
  const panel = variant === "panel";
  return (
    <div className={cn("flex flex-col gap-2", panel && "lg:gap-5", className)}>
      {rows.map(([kind, options]) => {
        const free = options.filter((o) => !used.has(o.key));
        if (!free.length) return null;
        return (
          <div key={kind} role="group" aria-label={`Sumar ${KIND_LABEL[kind].toLowerCase()}`} className={cn("flex items-center gap-2", panel && "lg:flex-col lg:items-start")}>
            <span aria-hidden="true" className={cn("w-16 shrink-0 self-start pt-3.5 sm:pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted", panel && "lg:lane lg:w-full lg:pb-2 lg:pt-0")}>{KIND_LABEL[kind]}</span>
            <ul className={cn("no-scrollbar -mr-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0")}>
              {free.map((o) => (
                <li key={o.key} className="shrink-0">
                  <button type="button" onClick={() => onQuery(addChipPhrase(query, o))} className={cn(CHIP, "border-line bg-surface text-ink hover:border-ink/50")}>
                    <Plus size={13} aria-hidden="true" className="text-volt-ink" />
                    <ChipIcon kind={o.kind} id={o.id} />
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
