import { QUIZ_RESTRICTIONS, type QuizAnswers, type Restriction, type StackSlotId } from "../fixtures/stack-builder";
import type { SportInfo } from "../fixtures/sports";
import { sportInfo } from "./sports";
import { goalInfo } from "./goals";
import type { Goal, Product, Variant } from "../types";
import { defaultStack, firstInStock, goalSlots, type StackPick } from "./stack-builder";

export interface QuizPick extends StackPick {
  /** Por qué va este producto, en frases cortas. */
  reasons: string[];
}

export interface QuizResult {
  /** Los objetivos con los que se armó: los elegidos y, después, los que pide el deporte. */
  goals: Goal[];
  /** Los que eligió (sin los que sumó el deporte). */
  chosen: Goal[];
  sport: SportInfo | null;
  picks: QuizPick[];
  /** Equipamiento sugerido para el deporte (con stock), aparte del stack. */
  gear: { product: Product; variant: Variant }[];
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

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const list = (items: string[]) => new Intl.ListFormat("es", { type: "conjunction" }).format(items);

/** Los objetivos del quiz: los elegidos, en su orden, y después los del deporte que falten. */
export function quizGoals(answers: Pick<QuizAnswers, "goals" | "sport">): Goal[] {
  const sport = answers.sport ? sportInfo(answers.sport) : undefined;
  return [...new Set([...answers.goals, ...(sport?.goals ?? [])])];
}

/**
 * Stack recomendado por el quiz "¿Qué necesitás?". Parte de los lugares de los objetivos (los elegidos y los del
 * deporte); con 5 o más días suma el "Extra" de recuperación; de noche o con "sin cafeína" el pre-entreno va sin
 * estimulantes. El deporte suma su equipamiento aparte. Siempre orientativo.
 */
export function recommendStack(answers: QuizAnswers, catalog: Product[]): QuizResult {
  const notes: string[] = [];
  const goals = quizGoals(answers);
  const sport = answers.sport ? sportInfo(answers.sport) ?? null : null;
  const added = goals.filter((g) => !answers.goals.includes(g));
  if (sport && added.length) notes.push(`Para ${sport.name.toLowerCase()} sumamos ${list(added.map((g) => (goalInfo(g)?.name ?? g).toLowerCase()))}.`);
  const slots = goals.length ? goalSlots(goals) : [];
  if (answers.days === "5+" && slots.length && !slots.includes("extra")) {
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
    notes.push(`Solo productos ${list(answers.restrictions.map((r) => lower(QUIZ_RESTRICTIONS.find((x) => x.value === r)?.label ?? r)))}.`);
  }
  const picks = (goals.length ? defaultStack(goals, catalog, restrictions, slots) : []).map((pick): QuizPick => {
    const product = catalog.find((p) => p.slug === pick.slug)!;
    const reasons = [pick.slot === "extra" ? EXTRA_REASON[product.categorySlug] ?? SLOT_REASON.extra : SLOT_REASON[pick.slot]];
    const forGoals = answers.goals.filter((g) => product.goals?.includes(g)).map((g) => (goalInfo(g)?.name ?? g).toLowerCase());
    if (forGoals.length) reasons.push(`Pensado para ${list(forGoals)}`);
    if (sport && sport.goals.some((g) => product.goals?.includes(g))) reasons.push(`Te sirve para ${sport.name.toLowerCase()}`);
    if (pick.slot === "energia" && !product.badges?.includes("sin-cafeina") && answers.time !== "noche") reasons.push("Tomalo 30 minutos antes de entrenar");
    if (pick.slot === "energia" && product.badges?.includes("sin-cafeina")) reasons.push("Sin estimulantes");
    for (const r of answers.restrictions) if (r !== "sin-cafeina" && product.badges?.includes(r)) reasons.push(QUIZ_RESTRICTIONS.find((x) => x.value === r)!.label);
    return { ...pick, reasons };
  });
  const missing = slots.filter((s) => !picks.some((p) => p.slot === s));
  if (missing.length) notes.push("Con tus restricciones no encontramos opción para todo: podés completar el estante a mano.");
  const gear = (sport?.gear ?? []).flatMap((slug) => {
    const product = catalog.find((p) => p.slug === slug && p.active !== false);
    const variant = product && firstInStock(product);
    return product && variant ? [{ product, variant }] : [];
  });
  return { goals, chosen: answers.goals, sport, picks, gear, notes };
}
