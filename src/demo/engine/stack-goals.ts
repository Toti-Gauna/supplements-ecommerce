import { MAX_GOALS } from "../fixtures/stack-builder";
import { sportById, sports } from "../fixtures/sports";
import type { Goal, Product, SportId, Variant } from "../types";
import { quizGoals } from "./quiz";
import { defaultStack, encodeStack, firstInStock, goalList, stackSummary, type StackSummary } from "./stack-builder";
import { DEFAULT_STACK_RULE, type StackRule } from "./stack";

/**
 * Objetivos y deporte del armador (L4): hasta tres objetivos a la vez y un deporte opcional que suma los suyos después
 * de los elegidos (la misma regla que el quiz, `quizGoals`). `added` son los que sumó el deporte: al cambiarlo o
 * sacarlo, se van con él.
 */
export interface GoalSelection {
  goals: Goal[];
  added: Goal[];
  sport: SportId | null;
}

export const EMPTY_SELECTION: GoalSelection = { goals: [], added: [], sport: null };

/** Prende o apaga un objetivo. Con el máximo ya elegido no suma otro y avisa (`capped`). */
export function toggleGoal(sel: GoalSelection, goal: Goal, max = MAX_GOALS): { selection: GoalSelection; capped: boolean } {
  if (sel.goals.includes(goal)) {
    return { selection: { ...sel, goals: sel.goals.filter((g) => g !== goal), added: sel.added.filter((g) => g !== goal) }, capped: false };
  }
  if (sel.goals.length >= max) return { selection: sel, capped: true };
  return { selection: { ...sel, goals: [...sel.goals, goal] }, capped: false };
}

/**
 * Elige (o saca, con null) el deporte: primero salen los objetivos que había sumado el anterior; después se suman los
 * del nuevo detrás de los elegidos, hasta el máximo.
 */
export function chooseSport(sel: GoalSelection, sport: SportId | null, max = MAX_GOALS): GoalSelection {
  const chosen = sel.goals.filter((g) => !sel.added.includes(g));
  const goals = quizGoals({ goals: chosen, sport }).slice(0, max);
  return { goals, added: goals.filter((g) => !chosen.includes(g)), sport };
}

/**
 * Lo que trae la URL (`objetivo=` y `deporte=`). Los objetivos del deporte que ya vienen en el link se toman como
 * sumados por él; si el link trae solo el deporte, se suman sus objetivos.
 */
export function selectionFromUrl(goals: Goal[], sport: SportId | null, max = MAX_GOALS): GoalSelection {
  const list = quizGoals({ goals: goalList(goals), sport }).slice(0, max);
  const sportGoals = sport ? sportById(sport)?.goals ?? [] : [];
  return { goals: list, added: list.filter((g) => sportGoals.includes(g)), sport };
}

/** Equipamiento sugerido del deporte que está activo y tiene stock, con su primera variante disponible. */
export function sportGear(sport: SportId | null, catalog: Product[]): { product: Product; variant: Variant }[] {
  const info = sport ? sportById(sport) : undefined;
  return (info?.gear ?? []).flatMap((slug) => {
    const product = catalog.find((p) => p.slug === slug && p.active !== false);
    const variant = product && firstInStock(product);
    return product && variant ? [{ product, variant }] : [];
  });
}

/** "fuerza + salud" (en minúscula, como va dentro de una frase). */
export const goalsPhrase = (names: string[]) => names.map((n) => n.toLowerCase()).join(" + ");

/** Titular del estante: "Tu stack para fuerza + salud" o, con deporte, "Tu stack para fútbol: resistencia + recuperación". */
export function stackHeadline(goalNames: string[], sportName?: string | null): string {
  if (!goalNames.length) return sportName ? `Tu stack para ${sportName.toLowerCase()}` : "Tu stack";
  return sportName ? `Tu stack para ${sportName.toLowerCase()}: ${goalsPhrase(goalNames)}` : `Tu stack para ${goalsPhrase(goalNames)}`;
}

/** Link al armador con esos objetivos y deporte (`/crear/?objetivo=…&deporte=…`). */
export function builderHref(goals: Goal | Goal[], sport?: SportId | null): string {
  const query = encodeStack(goals, [], sport);
  return query ? `/crear/?${query}` : "/crear/";
}

export interface SportCard {
  id: SportId;
  name: string;
  pitch: string;
  hue: string;
  goals: Goal[];
  packId?: string;
  href: string;
  summary: StackSummary;
}

/** Tarjetas "Entrená por deporte": el stack sugerido de cada deporte, con el total y el link al armador. */
export function sportCards(catalog: Product[], rule: StackRule = DEFAULT_STACK_RULE): SportCard[] {
  return sports.map((s) => ({
    id: s.id, name: s.name, pitch: s.pitch, hue: s.hue, goals: s.goals, packId: s.packId,
    href: builderHref(s.goals, s.id),
    summary: stackSummary(defaultStack(s.goals, catalog), catalog, rule),
  }));
}
