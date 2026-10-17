import type { GoalInfo } from "../fixtures/goals";
import { MAX_GOALS, STACK_SLOTS } from "../fixtures/stack-builder";
import { sportInfo, sportList } from "./sports";
import type { Goal, Product, SportId, Variant } from "../types";
import { quizGoals } from "./quiz";
import { defaultStack, encodeStack, firstInStock, goalList, stackSummary, type StackPick, type StackSummary } from "./stack-builder";
import { DEFAULT_STACK_RULE, type StackRule } from "./stack";

/**
 * Objetivos y deporte del armador (L4): hasta tres objetivos elegidos y un deporte opcional que suma los suyos después
 * (la misma regla que el quiz, `quizGoals`: el tope es de los elegidos, el deporte siempre suma). `added` son los que
 * sumó el deporte: al cambiarlo o sacarlo, se van con él.
 */
export interface GoalSelection {
  goals: Goal[];
  added: Goal[];
  sport: SportId | null;
}

export const EMPTY_SELECTION: GoalSelection = { goals: [], added: [], sport: null };

/** Los objetivos que eligió la persona (sin los que sumó el deporte). */
export const chosenGoals = (sel: GoalSelection): Goal[] => sel.goals.filter((g) => !sel.added.includes(g));

/** Prende o apaga un objetivo. Con el máximo de elegidos no suma otro y avisa (`capped`). */
export function toggleGoal(sel: GoalSelection, goal: Goal, max = MAX_GOALS): { selection: GoalSelection; capped: boolean } {
  if (sel.goals.includes(goal)) {
    return { selection: { ...sel, goals: sel.goals.filter((g) => g !== goal), added: sel.added.filter((g) => g !== goal) }, capped: false };
  }
  const chosen = chosenGoals(sel);
  if (chosen.length >= max) return { selection: sel, capped: true };
  return { selection: { ...sel, goals: [...chosen, goal, ...sel.added] }, capped: false };
}

/** Elige (o saca, con null) el deporte: salen los objetivos que había sumado el anterior y entran los del nuevo. */
export function chooseSport(sel: GoalSelection, sport: SportId | null): GoalSelection {
  const chosen = chosenGoals(sel);
  const goals = quizGoals({ goals: chosen, sport });
  return { goals, added: goals.filter((g) => !chosen.includes(g)), sport };
}

/**
 * Lo que trae la URL (`objetivo=` y `deporte=`). Los objetivos del deporte que ya vienen en el link se toman como
 * sumados por él; si el link trae solo el deporte, se suman sus objetivos.
 */
export function selectionFromUrl(goals: Goal[], sport: SportId | null, max = MAX_GOALS): GoalSelection {
  const sportGoals = sport ? sportInfo(sport)?.goals ?? [] : [];
  const chosen = goalList(goals).filter((g) => !sportGoals.includes(g)).slice(0, max);
  const list = quizGoals({ goals: chosen, sport });
  return { goals: list, added: list.filter((g) => !chosen.includes(g)), sport };
}

/** Equipamiento sugerido del deporte que está activo y tiene stock, con su primera variante disponible. */
export function sportGear(sport: SportId | null, catalog: Product[]): { product: Product; variant: Variant }[] {
  const info = sport ? sportInfo(sport) : undefined;
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
  return sportList().map((s) => ({
    id: s.id, name: s.name, pitch: s.pitch, hue: s.hue, goals: s.goals, packId: s.packId,
    href: builderHref(s.goals, s.id),
    summary: stackSummary(defaultStack(s.goals, catalog), catalog, rule),
  }));
}

/**
 * El stack de un objetivo en el inicio: el sugerido, con el producto que el dueño destacó para ese objetivo en su lugar
 * del estante (o sumado, si el objetivo no usa ese lugar). Es el mismo que abre el armador desde la tarjeta.
 */
export function goalStack(goal: Goal, featured: string | undefined, catalog: Product[]): StackPick[] {
  const picks = defaultStack(goal, catalog);
  const product = featured ? catalog.find((p) => p.slug === featured && p.active !== false) : undefined;
  const variant = product && firstInStock(product);
  const slot = product && STACK_SLOTS.find((s) => s.categories.includes(product.categorySlug))?.id;
  if (!product || !variant || !slot) return picks;
  const pick = { slot, slug: product.slug, variantId: variant.id };
  return picks.some((p) => p.slot === slot) ? picks.map((p) => (p.slot === slot ? pick : p)) : [...picks, pick];
}

export interface GoalCard {
  id: Goal;
  name: string;
  pitch: string;
  hue: string;
  /** El producto destacado por el dueño, si está en el estante. */
  featured?: Product;
  href: string;
  summary: StackSummary;
}

/** Tarjetas "Entrená por objetivo": mismo criterio que las de deporte (el total del stack y el link al armador). */
export function goalCards(goals: GoalInfo[], catalog: Product[], rule: StackRule = DEFAULT_STACK_RULE): GoalCard[] {
  return goals.map((g) => {
    const picks = goalStack(g.id, g.productSlug, catalog);
    const featured = catalog.find((p) => p.slug === g.productSlug && picks.some((x) => x.slug === p.slug));
    return { id: g.id, name: g.name, pitch: g.pitch, hue: g.hue, featured, href: `/crear/?${encodeStack(g.id, picks)}`, summary: stackSummary(picks, catalog, rule) };
  });
}
