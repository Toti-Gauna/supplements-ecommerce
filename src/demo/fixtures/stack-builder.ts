import type { Goal } from "../types";

/**
 * Armador de stack y quiz "¿Qué necesitás?" (Fase 3). Los lugares del estante, qué lugares lleva cada objetivo y las
 * preguntas del quiz. Textos de MUESTRA: orientan, no reemplazan a un profesional.
 */
export type StackSlotId = "base" | "creatina" | "energia" | "extra";

export interface StackSlot {
  id: StackSlotId;
  name: string;
  /** Categorías del catálogo que entran en este lugar. */
  categories: string[];
  hint: string;
}

export const STACK_SLOTS: StackSlot[] = [
  { id: "base", name: "Base de proteína", categories: ["proteinas", "ganadores"], hint: "Para llegar a la proteína del día." },
  { id: "creatina", name: "Creatina", categories: ["creatinas"], hint: "Fuerza y rendimiento, todos los días." },
  { id: "energia", name: "Pre-entreno", categories: ["pre-entrenos"], hint: "Energía y foco para entrenar." },
  { id: "extra", name: "Extra", categories: ["aminoacidos", "salud", "definicion", "hidratacion"], hint: "Recuperación, salud, definición o hidratación." },
];

/** Lugares que arma cada objetivo, en orden de importancia (los tres primeros ya dan el descuento stack). */
export const GOAL_SLOTS: Record<Goal, StackSlotId[]> = {
  "masa-muscular": ["base", "creatina", "extra"],
  fuerza: ["base", "creatina", "energia"],
  energia: ["energia", "creatina", "base"],
  recuperacion: ["base", "extra", "creatina"],
  definicion: ["base", "extra", "energia"],
  resistencia: ["extra", "energia", "base"],
  salud: ["extra", "base", "creatina"],
};

/** Para el lugar "Extra", qué categorías convienen primero según el objetivo. */
export const EXTRA_PREFERENCE: Record<Goal, string[]> = {
  "masa-muscular": ["aminoacidos", "salud"],
  fuerza: ["salud", "aminoacidos"],
  energia: ["hidratacion", "salud"],
  recuperacion: ["aminoacidos", "salud"],
  definicion: ["definicion", "aminoacidos"],
  resistencia: ["hidratacion", "aminoacidos"],
  salud: ["salud", "aminoacidos"],
};

export type TrainingDays = "1-2" | "3-4" | "5+";
export type TrainingTime = "manana" | "tarde" | "noche";
export type Restriction = "vegano" | "sin-tacc" | "sin-azucar" | "sin-cafeina";

export interface QuizAnswers {
  goal: Goal;
  days: TrainingDays;
  time: TrainingTime;
  restrictions: Restriction[];
}

export const QUIZ_DAYS: { value: TrainingDays; label: string; hint: string }[] = [
  { value: "1-2", label: "1 o 2 días", hint: "Arrancando o con poco tiempo" },
  { value: "3-4", label: "3 o 4 días", hint: "Rutina constante" },
  { value: "5+", label: "5 o más", hint: "Entrenás casi todos los días" },
];

export const QUIZ_TIMES: { value: TrainingTime; label: string }[] = [
  { value: "manana", label: "A la mañana" },
  { value: "tarde", label: "A la tarde" },
  { value: "noche", label: "A la noche" },
];

export const QUIZ_RESTRICTIONS: { value: Restriction; label: string }[] = [
  { value: "vegano", label: "Vegano" },
  { value: "sin-tacc", label: "Sin TACC" },
  { value: "sin-azucar", label: "Sin azúcar" },
  { value: "sin-cafeina", label: "Sin cafeína" },
];
