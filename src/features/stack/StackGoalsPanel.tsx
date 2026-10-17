"use client";
import { goalsPhrase, stackHeadline } from "@/demo/engine/stack-goals";
import { sportInfo } from "@/demo/engine/sports";
import type { Goal, SportId } from "@/demo/types";
import { useGoals } from "../catalog/useGoals";
import { GoalChips } from "./GoalChips";
import { QuizCard } from "./QuizCard";
import { SportChips } from "./SportChips";

interface StackGoalsPanelProps {
  goals: Goal[];
  sport: SportId | null;
  added: Goal[];
  capped: boolean;
  onToggleGoal: (goal: Goal) => void;
  onSport: (sport: SportId | null) => void;
}

/** Nombres vigentes (editables en el panel) de una lista de objetivos. */
function useGoalNames(ids: Goal[]): string[] {
  const all = useGoals();
  return ids.map((id) => all.find((g) => g.id === id)?.name ?? id);
}

/**
 * Paso 1 del armador: el titular con la combinación ("Tu stack para fuerza + salud"), hasta tres objetivos elegidos, el
 * deporte opcional (que siempre suma los suyos) y el acceso al quiz.
 */
export function StackGoalsPanel({ goals, sport, added, capped, onToggleGoal, onSport }: StackGoalsPanelProps) {
  const names = useGoalNames(goals);
  const addedNames = useGoalNames(added);
  const info = sport ? sportInfo(sport) : undefined;
  const note = !info ? null : added.length ? `${info.name} suma ${goalsPhrase(addedNames)}.` : `Tus objetivos ya cubren ${info.name.toLowerCase()}.`;
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <p aria-live="polite" className="font-display text-2xl leading-tight sm:text-3xl" data-stack-headline>
        {goals.length || info ? stackHeadline(names, info?.name) : "Elegí uno o más objetivos"}
      </p>
      <GoalChips value={goals} chosen={goals.length - added.length} onToggle={onToggleGoal} capped={capped} legend="1 · Elegí tus objetivos" />
      <SportChips value={sport} onChange={onSport} note={note} legend="2 · Tu deporte (opcional)" />
      <QuizCard />
    </div>
  );
}
