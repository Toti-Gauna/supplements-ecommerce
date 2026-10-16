"use client";
import { useId, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { MAX_GOALS } from "@/demo/fixtures/stack-builder";
import { useGoals } from "../catalog/useGoals";
import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";

interface GoalChipsProps {
  value: Goal[];
  onToggle: (goal: Goal) => void;
  /** Intentó sumar uno más del máximo: se muestra el aviso. */
  capped?: boolean;
  legend?: string;
  /** "night": sobre una banda oscura (bloque del inicio). */
  tone?: "surface" | "night";
  className?: string;
}

/**
 * Objetivos como chips (casillas nativas, hasta tres a la vez): el ícono de cada objetivo en su color sobre un círculo
 * noche. En el celular se desliza de costado; en pantallas anchas se acomoda en varias filas. Intentar un cuarto deja
 * el aviso en una región viva.
 */
export function GoalChips({ value, onToggle, capped = false, legend = "Tus objetivos", tone = "surface", className }: GoalChipsProps) {
  const hintId = useId();
  const goals = useGoals();
  const night = tone === "night";
  const idle = night ? "border-white/15 bg-white/[0.04] text-on-night hover:border-white/35" : "border-line bg-surface text-ink hover:border-ink/30";
  return (
    <fieldset className={cn("min-w-0", className)} aria-describedby={hintId}>
      <legend className="mb-3 flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn("eyebrow", night ? "text-volt" : "text-volt-ink")}>{legend}</span>
        <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]", night ? "bg-white/10 text-on-night" : "bg-accent text-ink")}>Hasta {MAX_GOALS}</span>
      </legend>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {goals.map((g) => {
          const on = value.includes(g.id);
          return (
            <label key={g.id} style={{ "--hue": g.hue } as CSSProperties}
              className={cn("relative inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-sm border py-1 pl-1 pr-3 text-sm font-bold transition-[background-color,border-color,box-shadow] duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
                on ? "border-[var(--hue)] bg-night text-on-night shadow-[0_0_0_1px_var(--hue),0_10px_26px_-12px_var(--hue)]" : idle)}>
              <input type="checkbox" value={g.id} checked={on} onChange={() => onToggle(g.id)} className="absolute inset-0 z-10 cursor-pointer appearance-none rounded-sm opacity-0" />
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-sm bg-night ring-1 ring-white/10" style={{ color: "var(--hue)" }}>
                <GoalGlyph goal={g.id} className="h-[18px] w-[18px]" />
              </span>
              {g.name}
              <span aria-hidden="true" className={cn("grid h-4 w-4 place-items-center rounded-[2px] border transition-colors", on ? "border-[var(--hue)] bg-[var(--hue)] text-night" : night ? "border-white/30" : "border-ink/25")}>
                {on && <Check size={12} strokeWidth={3.5} />}
              </span>
            </label>
          );
        })}
      </div>
      <p id={hintId} aria-live="polite" className={cn("mt-2 min-h-5 text-[13px] leading-snug", capped ? (night ? "font-bold text-volt" : "font-bold text-danger") : night ? "text-night-muted" : "text-muted")}>
        {capped ? `Ya tenés ${MAX_GOALS} objetivos: sacá uno para sumar otro.` : `Combinalos: ${value.length} de ${MAX_GOALS} elegidos.`}
      </p>
    </fieldset>
  );
}
