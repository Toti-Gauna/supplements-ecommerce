import type { Nutrition, NutritionRow } from "../types";

/**
 * Arma la información nutricional con formato de rótulo argentino (porción, 100 g y %VD sobre una dieta de
 * 2.000 kcal / 8.400 kJ, valores de referencia del Código Alimentario Argentino). Todos los valores son de MUESTRA.
 */
const VD = { kcal: 2000, carbs: 300, protein: 75, fat: 55, sat: 22, fiber: 25, sodium: 2400 } as const;

const fmt = (n: number, unit: string) => `${Number.isInteger(n) ? n : n.toFixed(1).replace(".", ",")} ${unit}`;
const pct = (n: number, ref: number) => `${Math.round((n / ref) * 100)}%`;

export interface Macros {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  sat?: number;
  fiber?: number;
  sodium: number;
  sugars?: number;
}

/** `grams`: peso de la porción (para la columna de 100 g). `extra`: activos (creatina, cafeína, vitaminas…). */
export function nutrition(serving: string, grams: number, m: Macros, ingredients: string, opts: { allergens?: string; extra?: NutritionRow[] } = {}): Nutrition {
  const k = 100 / grams;
  const row = (label: string, v: number, unit: string, ref?: number, sub = false): NutritionRow => ({
    label, serving: fmt(v, unit), per100: fmt(Math.round(v * k * 10) / 10, unit), dv: ref ? pct(v, ref) : undefined, sub,
  });
  const rows: NutritionRow[] = [
    { label: "Valor energético", serving: `${m.kcal} kcal = ${Math.round(m.kcal * 4.2)} kJ`, per100: `${Math.round(m.kcal * k)} kcal`, dv: pct(m.kcal, VD.kcal) },
    row("Carbohidratos", m.carbs, "g", VD.carbs),
    ...(m.sugars !== undefined ? [row("de los cuales azúcares", m.sugars, "g", undefined, true)] : []),
    row("Proteínas", m.protein, "g", VD.protein),
    row("Grasas totales", m.fat, "g", VD.fat),
    row("Grasas saturadas", m.sat ?? 0, "g", VD.sat, true),
    { label: "Grasas trans", serving: "0 g", per100: "0 g", sub: true },
    row("Fibra alimentaria", m.fiber ?? 0, "g", VD.fiber),
    row("Sodio", m.sodium, "mg", VD.sodium),
    ...(opts.extra ?? []),
  ];
  return { serving, rows, ingredients, allergens: opts.allergens };
}

/** Rótulo de cápsulas o comprimidos: solo los activos por porción (sin aporte energético significativo). */
export function actives(serving: string, rows: [string, string, string?][], ingredients: string, allergens?: string): Nutrition {
  return {
    serving,
    rows: [{ label: "Valor energético", serving: "0 kcal", dv: "0%" }, ...rows.map(([label, value, dv]) => ({ label, serving: value, dv }))],
    ingredients,
    allergens,
  };
}
