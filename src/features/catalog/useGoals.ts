"use client";
import { goals as defaultGoals, type GoalInfo } from "@/demo/fixtures/goals";
import type { Goal } from "@/demo/types";
import { useDemoData } from "@/stores/admin";

/** Objetivos vigentes (nombre, bajada y color se editan en el panel → Categorías): re-renderiza cuando cambian. */
export function useGoals(): GoalInfo[] {
  const edited = useDemoData((d) => d.goals);
  return Array.isArray(edited) && edited.length ? edited : defaultGoals;
}

export function useGoal(id: Goal | null | undefined): GoalInfo | undefined {
  const goals = useGoals();
  return id ? goals.find((g) => g.id === id) : undefined;
}
