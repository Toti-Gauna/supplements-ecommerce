import { goals as defaultGoals, type GoalInfo } from "../fixtures/goals";
import type { Goal } from "../types";
import { demoData } from "./source";

/**
 * Objetivos de entrenamiento vigentes: los del panel (nombre, bajada y color editables) o los de muestra. Los ids y
 * el arte son fijos: filtran el catálogo, arman stacks y guardan las respuestas del quiz.
 */
export function goalList(): GoalInfo[] {
  const edited = demoData().goals;
  return Array.isArray(edited) && edited.length ? edited : defaultGoals;
}

export function goalInfo(id: Goal): GoalInfo | undefined {
  return goalList().find((g) => g.id === id);
}

/** Nombre, bajada y color se pueden cambiar; vacíos o con color inválido vuelven al de muestra. */
export function normalizeGoals(list: GoalInfo[]): GoalInfo[] {
  return defaultGoals.map((d) => {
    const g = list.find((x) => x.id === d.id);
    if (!g) return d;
    return { ...d, name: g.name.trim() || d.name, pitch: g.pitch.trim() || d.pitch, hue: /^#[0-9a-f]{6}$/i.test(g.hue) ? g.hue.toLowerCase() : d.hue };
  });
}

/** Errores del formulario de objetivos (el nombre es obligatorio y corto; la bajada, una línea). */
export function goalErrors(g: GoalInfo): string[] {
  const out: string[] = [];
  if (!g.name.trim()) out.push("Escribí el nombre del objetivo.");
  if (g.name.trim().length > 24) out.push("El nombre tiene que tener 24 letras o menos.");
  if (g.pitch.trim().length > 70) out.push("La bajada tiene que tener 70 letras o menos.");
  if (!/^#[0-9a-f]{6}$/i.test(g.hue)) out.push("Elegí un color.");
  return out;
}
