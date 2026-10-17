import { EXTRA_PREFERENCE, GOAL_SLOTS, STACK_SLOTS, type Restriction, type StackSlotId } from "../fixtures/stack-builder";
import type { Goal, Product, Variant } from "../types";
import { unitPrice } from "./catalog";
import { daysLasting, pricePerServing } from "./servings";
import { DEFAULT_STACK_RULE, stackDiscount, type StackResult, type StackRule } from "./stack";

/** Un producto en un lugar del estante. */
export interface StackPick {
  slot: StackSlotId;
  slug: string;
  variantId: string;
  /** Unidades (1 si falta). "Igualar duración" puede subirlas para que todo dure lo mismo. */
  qty?: number;
}

export interface StackLineView {
  slot: StackSlotId;
  product: Product;
  variant: Variant;
  qty: number;
  /** Precio de una unidad. */
  unitPrice: number;
  /** Lo que suma la línea (unidad × cantidad). */
  price: number;
  perServing: number | null;
  /** Días que dura con un servicio por día, o null si no informa servicios. */
  days: number | null;
}

export interface StackSummary {
  lines: StackLineView[];
  subtotal: number;
  stack: StackResult;
  total: number;
  /** Lo que cuesta el stack por día tomando un servicio de cada producto (pesos enteros), o null si no se puede. */
  perDay: number | null;
}

/** El producto tiene cafeína (por su nombre o su rótulo) y no tiene el sello "sin cafeína". */
export function hasCaffeine(p: Product): boolean {
  if (p.badges?.includes("sin-cafeina")) return false;
  const text = [p.name, p.short, ...(p.nutrition?.rows.map((r) => r.label) ?? [])].join(" ");
  return /cafe[ií]na/i.test(text);
}

/** Cumple las restricciones del quiz: sellos de vegano, sin TACC o sin azúcar, y sin cafeína. */
export function meetsRestrictions(p: Product, restrictions: Restriction[]): boolean {
  return restrictions.every((r) => (r === "sin-cafeina" ? !hasCaffeine(p) : (p.badges ?? []).includes(r)));
}

/** Uno o varios objetivos, sin repetir y sin vacíos. */
export const goalList = (goal: Goal | Goal[] | null | undefined): Goal[] => [...new Set(goal == null ? [] : Array.isArray(goal) ? goal : [goal])];

/**
 * Lugares del estante para varios objetivos (L4): primero el más importante de cada uno, después el segundo, y así,
 * sin repetir. "Fuerza + Salud" arma base, extra, creatina y pre-entreno: un producto por lugar, nunca dos iguales.
 */
export function goalSlots(goal: Goal | Goal[]): StackSlotId[] {
  const list = goalList(goal);
  const out: StackSlotId[] = [];
  for (let rank = 0; rank < 4; rank++) for (const g of list) { const s = GOAL_SLOTS[g][rank]; if (s && !out.includes(s)) out.push(s); }
  return out;
}

/** Categorías que convienen en "Extra" para varios objetivos, en el orden de los objetivos. */
export function extraPreference(goal: Goal | Goal[] | null): string[] {
  const list = goalList(goal);
  const out: string[] = [];
  for (let rank = 0; rank < 2; rank++) for (const g of list) { const c = EXTRA_PREFERENCE[g][rank]; if (c && !out.includes(c)) out.push(c); }
  return out;
}

export const firstInStock = (p: Product): Variant | undefined => p.variants.find((v) => v.stock !== 0);

/**
 * Opciones de un lugar del estante: activas, con stock y que cumplen las restricciones; primero las del objetivo (en
 * "Extra", además, según la categoría que conviene) y después las más vendidas.
 */
export function slotOptions(slotId: StackSlotId, goal: Goal | Goal[] | null, catalog: Product[], restrictions: Restriction[] = []): Product[] {
  const slot = STACK_SLOTS.find((s) => s.id === slotId)!;
  const list = goalList(goal);
  const prefs = slotId === "extra" ? extraPreference(list) : [];
  const score = (p: Product) => {
    // Cuantos más objetivos cubre, mejor; a igualdad, el del objetivo más importante.
    const goalMatch = list.reduce((s, g, i) => s + (p.goals?.includes(g) ? 10 - i : 0), 0);
    const pref = prefs.indexOf(p.categorySlug);
    return goalMatch + (pref >= 0 ? (prefs.length - pref) * 3 : 0) + p.soldCount / 1000;
  };
  return catalog
    .filter((p) => p.active !== false && slot.categories.includes(p.categorySlug) && firstInStock(p) && meetsRestrictions(p, restrictions))
    .sort((a, b) => score(b) - score(a) || a.slug.localeCompare(b.slug));
}

/** El stack sugerido para uno o varios objetivos: el mejor producto de cada lugar que arman. */
export function defaultStack(goal: Goal | Goal[], catalog: Product[], restrictions: Restriction[] = [], slots: StackSlotId[] = goalSlots(goal)): StackPick[] {
  return slots.flatMap((slot) => {
    const p = slotOptions(slot, goal, catalog, restrictions)[0];
    const v = p && firstInStock(p);
    return p && v ? [{ slot, slug: p.slug, variantId: v.id }] : [];
  });
}

/** Precio, descuento stack y costo por día del estante, con la misma regla que el carrito. */
export function stackSummary(picks: StackPick[], catalog: Product[], rule: StackRule = DEFAULT_STACK_RULE): StackSummary {
  const lines = picks.flatMap((pick): StackLineView[] => {
    const product = catalog.find((p) => p.slug === pick.slug);
    const variant = product?.variants.find((v) => v.id === pick.variantId);
    if (!product || !variant) return [];
    const unit = unitPrice(product, variant);
    const qty = Math.max(1, pick.qty ?? 1);
    const days = variant.servings ? daysLasting(variant.servings * qty, 1) : null;
    return [{ slot: pick.slot, product, variant, qty, unitPrice: unit, price: unit * qty, perServing: pricePerServing(unit, variant.servings), days }];
  });
  const subtotal = lines.reduce((s, l) => s + l.price, 0);
  const stack = stackDiscount(lines.map((l) => ({ product: l.product, lineTotal: l.price })), rule);
  const perDay = lines.length && lines.every((l) => l.perServing !== null)
    ? Math.round(lines.reduce((s, l) => s + l.perServing!, 0) * (1 - stack.discount / Math.max(1, subtotal)))
    : null;
  return { lines, subtotal, stack, total: subtotal - stack.discount, perDay };
}

export { decodeGoals, decodeSport, decodeStack, encodeStack } from "./stack-link";
