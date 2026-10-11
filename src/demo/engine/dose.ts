import type { Goal } from "../types";

/**
 * Calculadoras ORIENTATIVAS de la ficha (Fase 2). Valores de referencia generales para personas sanas que entrenan,
 * redondeados y con topes: no son una indicación médica y la ficha lo dice. En producción los textos los revisa
 * un profesional de la tienda.
 */

export const WEIGHT_RANGE = { min: 40, max: 160 } as const;

const clampWeight = (kg: number) => Math.min(WEIGHT_RANGE.max, Math.max(WEIGHT_RANGE.min, Math.round(kg)));

/** Creatina de mantenimiento: 0,05 g/kg/día redondeado a medio gramo, dentro del rango habitual de 3 a 5 g. */
export function creatineGrams(weightKg: number): number {
  const g = Math.round(clampWeight(weightKg) * 0.05 * 2) / 2;
  return Math.min(5, Math.max(3, g));
}

/** Gramos de proteína por kilo y por día según el objetivo (rango de referencia para quien entrena). */
export const PROTEIN_PER_KG: Partial<Record<Goal, [number, number]>> = {
  "masa-muscular": [1.6, 2.2],
  fuerza: [1.6, 2],
  definicion: [1.8, 2.4],
  recuperacion: [1.4, 1.8],
  resistencia: [1.2, 1.6],
  salud: [1, 1.4],
  energia: [1.2, 1.6],
};

export interface ProteinPlan {
  /** Proteína total del día, en gramos (rango). */
  dayMin: number;
  dayMax: number;
  /** Cuánto suma un servicio, en % del mínimo del día. */
  servingShare: number;
}

/** Proteína del día y cuánto aporta un servicio del suplemento (`proteinPerServing` en gramos). */
export function proteinPlan(weightKg: number, goal: Goal, proteinPerServing: number): ProteinPlan {
  const kg = clampWeight(weightKg);
  const [lo, hi] = PROTEIN_PER_KG[goal] ?? [1.2, 1.6];
  const dayMin = Math.round(kg * lo);
  const dayMax = Math.round(kg * hi);
  return { dayMin, dayMax, servingShare: dayMin > 0 ? Math.round((proteinPerServing / dayMin) * 100) : 0 };
}

/** Gramos de proteína de un servicio, leídos del rótulo ("24 g" → 24). null si no figura. */
export function proteinFromLabel(rows: { label: string; serving: string }[] | undefined): number | null {
  const row = rows?.find((r) => r.label.toLowerCase().startsWith("proteínas"));
  if (!row) return null;
  const n = Number(row.serving.replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
