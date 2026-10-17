import { MAX_GOALS, STACK_SLOTS, type StackSlotId } from "../fixtures/stack-builder";
import { goals as goalFixtures } from "../fixtures/goals";
import { isSportId } from "../fixtures/sports";
import type { Goal, Product, SportId } from "../types";
import type { StackPick } from "./stack-builder";

/** Hasta cuántas unidades de un mismo producto lleva un lugar del estante ("Igualar duración" no pasa de acá). */
export const MAX_QTY = 3;

const goalList = (goal: Goal | Goal[] | null): Goal[] => [...new Set(goal == null ? [] : Array.isArray(goal) ? goal : [goal])];

/**
 * El estante en la URL (`?objetivo=fuerza,salud&stack=base.ionic-whey.iw-chocolate-2lb.2,…`), para compartirlo o venir
 * del quiz. La cantidad va al final solo si es más de una (los links de antes siguen valiendo).
 */
export function encodeStack(goal: Goal | Goal[] | null, picks: StackPick[], sport?: SportId | null): string {
  const q = new URLSearchParams();
  const list = goalList(goal);
  if (list.length) q.set("objetivo", list.join(","));
  if (sport) q.set("deporte", sport);
  if (picks.length) q.set("stack", picks.map((p) => [p.slot, p.slug, p.variantId, ...((p.qty ?? 1) > 1 ? [p.qty] : [])].join(".")).join(","));
  return q.toString();
}

/** Cantidad del link: entera entre 1 y el tope; lo demás vale 1. */
function decodeQty(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? Math.min(MAX_QTY, n) : 1;
}

/** Lee el estante de la URL y descarta lo que no existe, no tiene stock o no va en ese lugar. */
export function decodeStack(raw: string | null, catalog: Product[]): StackPick[] {
  if (!raw) return [];
  const seen = new Set<StackSlotId>();
  return raw.split(",").flatMap((part): StackPick[] => {
    const [slot, slug, variantId, qtyRaw] = part.split(".") as [StackSlotId, string, string, string | undefined];
    const slotDef = STACK_SLOTS.find((s) => s.id === slot);
    const product = catalog.find((p) => p.slug === slug && p.active !== false);
    const variant = product?.variants.find((v) => v.id === variantId && v.stock !== 0);
    if (!slotDef || !product || !variant || seen.has(slot) || !slotDef.categories.includes(product.categorySlug)) return [];
    seen.add(slot);
    const qty = Math.min(decodeQty(qtyRaw), variant.stock < 0 ? MAX_QTY : variant.stock);
    return [qty > 1 ? { slot, slug, variantId, qty } : { slot, slug, variantId }];
  });
}

/** Los objetivos de la URL (`objetivo=fuerza,salud`), sin los que no existen ni repetidos. */
export function decodeGoals(raw: string | null): Goal[] {
  if (!raw) return [];
  // Hasta 3 elegidos más los que suma un deporte (dos como mucho).
  return [...new Set(raw.split(","))].filter((g): g is Goal => goalFixtures.some((x) => x.id === g)).slice(0, MAX_GOALS + 2);
}

export const decodeSport = (raw: string | null): SportId | null => (isSportId(raw) ? raw : null);
