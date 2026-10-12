import { goalInfo } from "@/demo/engine/goals";
import { QUIZ_DAYS, QUIZ_RESTRICTIONS, QUIZ_TIMES, type QuizAnswers, type Restriction, type TrainingDays, type TrainingTime } from "@/demo/fixtures/stack-builder";
import type { Goal } from "@/demo/types";

/** Respuestas en curso: lo que falta todavía no se contestó (en restricciones, `[]` es "Ninguna"). */
export interface QuizDraft {
  goal?: Goal;
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

/** Las cuatro pantallas del quiz, en orden. */
export const QUIZ_STEPS: QuizStepInfo[] = [
  { id: "goal", label: "Objetivo", question: "¿Qué querés lograr?", hint: "Elegí el que más te importa hoy." },
  { id: "days", label: "Días", question: "¿Cuántos días por semana entrenás?", hint: "Con 5 o más sumamos algo para recuperarte." },
  { id: "time", label: "Horario", question: "¿A qué hora entrenás?", hint: "Lo usamos para elegir el pre-entreno." },
  { id: "restrictions", label: "Restricciones", question: "¿Tenés alguna restricción?", hint: "Podés marcar varias, o Ninguna." },
];

/** Índice de la pantalla de resultado (después de la última pregunta). */
export const RESULT_STEP = QUIZ_STEPS.length;

export const isAnswered = (draft: QuizDraft, id: QuizStepId) => draft[id] !== undefined;

export function completeAnswers(d: QuizDraft): QuizAnswers | null {
  return d.goal && d.days && d.time && d.restrictions ? { goal: d.goal, days: d.days, time: d.time, restrictions: d.restrictions } : null;
}

/** La respuesta en pocas palabras ("Fuerza", "3 o 4 días", "Sin restricciones"). */
export function answerLabel(draft: QuizDraft, id: QuizStepId): string {
  if (id === "goal") return draft.goal ? goalInfo(draft.goal)?.name ?? draft.goal : "";
  if (id === "days") return QUIZ_DAYS.find((d) => d.value === draft.days)?.label ?? "";
  if (id === "time") return QUIZ_TIMES.find((t) => t.value === draft.time)?.label ?? "";
  if (!draft.restrictions) return "";
  if (draft.restrictions.length === 0) return "Sin restricciones";
  return draft.restrictions.map((r) => QUIZ_RESTRICTIONS.find((x) => x.value === r)?.label ?? r).join(" · ");
}
