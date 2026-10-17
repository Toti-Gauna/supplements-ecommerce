import { goalInfo } from "@/demo/engine/goals";
import { MAX_GOALS, QUIZ_DAYS, QUIZ_RESTRICTIONS, QUIZ_TIMES, type QuizAnswers, type Restriction, type TrainingDays, type TrainingTime } from "@/demo/fixtures/stack-builder";
import { sportInfo } from "@/demo/engine/sports";
import type { Goal, SportId } from "@/demo/types";

/** Respuestas en curso: lo que falta todavía no se contestó (en restricciones, `[]` es "Ninguna"). */
export interface QuizDraft {
  goals?: Goal[];
  /** null es "Solo gimnasio". */
  sport?: SportId | null;
  days?: TrainingDays;
  time?: TrainingTime;
  restrictions?: Restriction[];
}

export type QuizStepId = keyof QuizDraft;

export interface QuizStepInfo {
  id: QuizStepId;
  /** Rótulo corto de la batería de avance. */
  label: string;
  question: string;
  hint: string;
}

/** Las cinco pantallas del quiz, en orden. */
export const QUIZ_STEPS: QuizStepInfo[] = [
  { id: "goals", label: "Objetivos", question: "¿Qué querés lograr?", hint: "Elegí hasta 3. Armamos un solo programa, sin repetir productos." },
  { id: "sport", label: "Deporte", question: "¿Hacés algún deporte?", hint: "Sumamos lo que tu deporte pide y el equipamiento que usás. Si no, elegí Solo gimnasio." },
  { id: "days", label: "Días", question: "¿Cuántos días por semana entrenás?", hint: "Con 5 o más sumamos algo para recuperarte." },
  { id: "time", label: "Horario", question: "¿A qué hora entrenás?", hint: "Lo usamos para elegir el pre-entreno." },
  { id: "restrictions", label: "Restricciones", question: "¿Tenés alguna restricción?", hint: "Podés marcar varias, o Ninguna." },
];

/** Índice de la pantalla de resultado (después de la última pregunta). */
export const RESULT_STEP = QUIZ_STEPS.length;

export const isAnswered = (draft: QuizDraft, id: QuizStepId) => (id === "goals" ? !!draft.goals?.length : draft[id] !== undefined);

/**
 * Marcar o desmarcar un objetivo. Con el tope lleno, marcar otro NO reemplaza a ninguno (eso confunde): queda como
 * estaba y `blocked` pide avisar "sacá uno para sumar otro".
 */
export function toggleGoal(chosen: Goal[], goal: Goal, on: boolean, max = MAX_GOALS): { goals: Goal[]; blocked: boolean } {
  const rest = chosen.filter((g) => g !== goal);
  if (!on) return { goals: rest, blocked: false };
  if (chosen.includes(goal)) return { goals: chosen, blocked: false };
  if (chosen.length >= max) return { goals: chosen, blocked: true };
  return { goals: [...chosen, goal], blocked: false };
}

export function completeAnswers(d: QuizDraft): QuizAnswers | null {
  return d.goals?.length && d.sport !== undefined && d.days && d.time && d.restrictions
    ? { goals: d.goals, sport: d.sport, days: d.days, time: d.time, restrictions: d.restrictions }
    : null;
}

/** La respuesta en pocas palabras ("Fuerza", "3 o 4 días", "Sin restricciones"). */
export function answerLabel(draft: QuizDraft, id: QuizStepId): string {
  if (id === "goals") return (draft.goals ?? []).map((g) => goalInfo(g)?.name ?? g).join(" + ");
  if (id === "sport") return draft.sport === undefined ? "" : draft.sport === null ? "Solo gimnasio" : sportInfo(draft.sport)?.name ?? draft.sport;
  if (id === "days") return QUIZ_DAYS.find((d) => d.value === draft.days)?.label ?? "";
  if (id === "time") return QUIZ_TIMES.find((t) => t.value === draft.time)?.label ?? "";
  if (!draft.restrictions) return "";
  if (draft.restrictions.length === 0) return "Sin restricciones";
  return draft.restrictions.map((r) => QUIZ_RESTRICTIONS.find((x) => x.value === r)?.label ?? r).join(" · ");
}

/** Un nombre dentro de la frase: en minúscula, salvo marcas con mayúscula adentro ("CrossFit"). */
const inSentence = (name: string) => (/[A-ZÁÉÍÓÚÑ]/.test(name.slice(1)) ? name : name.toLowerCase());

/** Título del resultado: "Tu programa para fuerza, salud y fútbol" (los objetivos elegidos y el deporte). */
export function programTitle(goalNames: string[], sportName?: string | null): string {
  const parts = [...goalNames, ...(sportName ? [sportName] : [])].map(inSentence);
  return parts.length ? `Tu programa para ${new Intl.ListFormat("es", { type: "conjunction" }).format(parts)}` : "Tu programa";
}
