"use client";
import { useId, type CSSProperties } from "react";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { useGoals } from "../catalog/useGoals";
import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";

interface GoalChipsProps {
  value: Goal | null;
  onChange: (goal: Goal) => void;
  legend?: string;
  /** "night": sobre una banda oscura (bloque del inicio). */
  tone?: "surface" | "night";
  className?: string;
}

/**
 * Objetivos como chips (radios nativos): el ícono de cada objetivo en su color sobre un círculo noche. En el celular
 * se desliza de costado; en pantallas anchas se acomoda en varias filas.
 */
export function GoalChips({ value, onChange, legend = "Tu objetivo", tone = "surface", className }: GoalChipsProps) {
  const name = useId();
  const goals = useGoals();
  const idle = tone === "night" ? "border-white/15 bg-white/[0.04] text-on-night hover:border-white/35" : "border-line bg-surface text-ink hover:border-ink/30";
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={cn("eyebrow mb-3", tone === "night" ? "text-volt" : "text-volt-ink")}>{legend}</legend>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {goals.map((g) => {
          const on = value === g.id;
          return (
            <label key={g.id} style={{ "--hue": g.hue } as CSSProperties}
              className={cn("relative inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm font-bold transition-[background-color,border-color,box-shadow] duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
                on ? "border-[var(--hue)] bg-night text-on-night shadow-[0_0_0_1px_var(--hue),0_10px_26px_-12px_var(--hue)]" : idle)}>
              <input type="radio" name={name} value={g.id} checked={on} onChange={() => onChange(g.id)} className="absolute inset-0 z-10 cursor-pointer appearance-none rounded-full opacity-0" />
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-night ring-1 ring-white/10" style={{ color: "var(--hue)" }}>
                <GoalGlyph goal={g.id} className="h-[18px] w-[18px]" />
              </span>
              {g.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
