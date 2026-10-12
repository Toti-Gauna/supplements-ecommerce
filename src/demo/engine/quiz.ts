import { GOAL_SLOTS, QUIZ_RESTRICTIONS, type QuizAnswers, type Restriction, type StackSlotId } from "../fixtures/stack-builder";
import { goalById } from "../fixtures/goals";
import type { Product } from "../types";
import { defaultStack, type StackPick } from "./stack-builder";

export interface QuizPick extends StackPick {
  /** Por qué va este producto, en frases cortas. */
  reasons: string[];
}

export interface QuizResult {
  picks: QuizPick[];
  /** Ajustes que hizo el quiz por las respuestas (se muestran arriba del resultado). */
  notes: string[];
}

const SLOT_REASON: Record<StackSlotId, string> = {
  base: "Te ayuda a llegar a la proteína del día",
  creatina: "La más estudiada para fuerza: se toma todos los días, también los que no entrenás",
  energia: "Energía y foco para la sesión",
  extra: "Suma donde tu objetivo lo pide",
};

const EXTRA_REASON: Record<string, string> = {
  aminoacidos: "Para recuperarte entre sesiones",
  salud: "Una base de salud para todos los días",
  definicion: "Acompaña el plan de definición",
  hidratacion: "Repone sales en entrenamientos largos",
};

/**
 * Stack recomendado por el quiz "¿Qué necesitás?". Parte de los lugares del objetivo; con 5 o más días suma el
 * "Extra" de recuperación; de noche o con "sin cafeína" el pre-entreno va sin estimulantes. Siempre orientativo.
 */
export function recommendStack(answers: QuizAnswers, catalog: Product[]): QuizResult {
  const notes: string[] = [];
  const slots = [...GOAL_SLOTS[answers.goal]];
  if (answers.days === "5+" && !slots.includes("extra")) {
    slots.push("extra");
    notes.push("Entrenás 5 o más días: sumamos un extra para recuperarte.");
  }
  const restrictions: Restriction[] = [...answers.restrictions];
  if (answers.time === "noche" && !restrictions.includes("sin-cafeina")) {
    restrictions.push("sin-cafeina");
    if (slots.includes("energia")) notes.push("Entrenás de noche: el pre va sin cafeína para que duermas bien.");
  }
  if (answers.restrictions.length) {
    // Solo la inicial en minúscula: "sin TACC", no "sin tacc".
    const labels = answers.restrictions.map((r) => { const l = QUIZ_RESTRICTIONS.find((x) => x.value === r)?.label ?? r; return l.charAt(0).toLowerCase() + l.slice(1); });
    notes.push(`Solo productos ${new Intl.ListFormat("es", { type: "conjunction" }).format(labels)}.`);
  }
  const goal = goalById(answers.goal)?.name.toLowerCase() ?? answers.goal;
  const picks = defaultStack(answers.goal, catalog, restrictions, slots).map((pick): QuizPick => {
    const product = catalog.find((p) => p.slug === pick.slug)!;
    const reasons = [pick.slot === "extra" ? EXTRA_REASON[product.categorySlug] ?? SLOT_REASON.extra : SLOT_REASON[pick.slot]];
    if (product.goals?.includes(answers.goal)) reasons.push(`Pensado para ${goal}`);
    if (pick.slot === "energia" && !product.badges?.includes("sin-cafeina") && answers.time !== "noche") reasons.push("Tomalo 30 minutos antes de entrenar");
    if (pick.slot === "energia" && product.badges?.includes("sin-cafeina")) reasons.push("Sin estimulantes");
    for (const r of answers.restrictions) if (r !== "sin-cafeina" && product.badges?.includes(r)) reasons.push(QUIZ_RESTRICTIONS.find((x) => x.value === r)!.label);
    return { ...pick, reasons };
  });
  const missing = slots.filter((s) => !picks.some((p) => p.slot === s));
  if (missing.length) notes.push("Con tus restricciones no encontramos opción para todo: podés completar el estante a mano.");
  return { picks, notes };
}
