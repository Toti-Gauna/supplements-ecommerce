"use client";
import { useRef, useState } from "react";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { MAX_GOALS } from "@/demo/fixtures/stack-builder";
import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";
import { useGoals } from "../catalog/useGoals";
import { QuizChoice } from "./QuizChoice";
import { toggleGoal } from "./quiz-steps";

interface Props {
  chosen: Goal[];
  onChange: (goals: Goal[]) => void;
}

/**
 * Objetivos: hasta tres, cada uno con su ícono y su color. Debajo, cuántos van (tres celdas que se encienden). Con el
 * tope lleno los demás se apagan y, si igual tocan un cuarto, no se marca y el aviso dice qué hacer (no se descarta
 * ninguno en silencio). El aviso es una región viva: el lector de pantalla también lo dice.
 */
export function QuizGoalOptions({ chosen, onChange }: Props) {
  const goals = useGoals();
  const [blocked, setBlocked] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);
  const full = chosen.length >= MAX_GOALS;
  const toggle = (goal: Goal, on: boolean) => {
    const next = toggleGoal(chosen, goal, on);
    setBlocked(next.blocked);
    if (next.blocked) status.current?.scrollIntoView({ block: "nearest" });
    else onChange(next.goals);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 min-[420px]:grid-cols-2 min-[420px]:[&>*:last-child:nth-child(odd)]:col-span-2">
        {goals.map((g) => {
          const on = chosen.includes(g.id);
          return (
            <QuizChoice key={g.id} type="checkbox" name="goals" value={g.id} hue={g.hue} checked={on} onChange={(v) => toggle(g.id, v)}
              icon={<GoalGlyph goal={g.id} />} title={g.name} description={g.pitch}
              className={cn(full && !on && "[&>[aria-hidden=true]]:opacity-35")} />
          );
        })}
      </div>
      <p ref={status} role="status" data-goal-count={chosen.length}
        className={cn("flex min-h-11 items-center gap-3 rounded-sm px-3.5 py-2 text-sm font-bold transition-colors", blocked ? "bg-warning-soft text-warning" : "bg-white/[0.05] text-on-night ring-1 ring-white/10")}>
        <span aria-hidden="true" className="flex gap-1">
          {Array.from({ length: MAX_GOALS }, (_, i) => (
            <span key={i} className={cn("h-3 w-2 rounded-[1px]", i < chosen.length ? (blocked ? "bg-warning" : "bg-volt shadow-[0_0_6px_var(--color-volt)]") : "bg-white/20")} />
          ))}
        </span>
        {blocked ? `Ya elegiste ${MAX_GOALS}. Sacá uno para sumar otro.` : `${chosen.length} de ${MAX_GOALS} objetivos elegidos`}
      </p>
    </div>
  );
}
