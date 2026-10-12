import { EXTRA_PREFERENCE, GOAL_SLOTS, STACK_SLOTS, type Restriction, type StackSlotId } from "../fixtures/stack-builder";
import type { Goal, Product, Variant } from "../types";
import { unitPrice } from "./catalog";
import { pricePerServing } from "./servings";
import { DEFAULT_STACK_RULE, stackDiscount, type StackResult, type StackRule } from "./stack";

/** Un producto en un lugar del estante. */
export interface StackPick {
  slot: StackSlotId;
  slug: string;
  variantId: string;
}

export interface StackLineView {
  slot: StackSlotId;
  product: Product;
  variant: Variant;
  price: number;
  perServing: number | null;
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

export const firstInStock = (p: Product): Variant | undefined => p.variants.find((v) => v.stock !== 0);

/**
 * Opciones de un lugar del estante: activas, con stock y que cumplen las restricciones; primero las del objetivo (en
 * "Extra", además, según la categoría que conviene) y después las más vendidas.
 */
export function slotOptions(slotId: StackSlotId, goal: Goal | null, catalog: Product[], restrictions: Restriction[] = []): Product[] {
  const slot = STACK_SLOTS.find((s) => s.id === slotId)!;
  const prefs = goal && slotId === "extra" ? EXTRA_PREFERENCE[goal] : [];
  const score = (p: Product) => {
    const goalMatch = goal && p.goals?.includes(goal) ? 10 : 0;
    const pref = prefs.indexOf(p.categorySlug);
    return goalMatch + (pref >= 0 ? (prefs.length - pref) * 3 : 0) + p.soldCount / 1000;
  };
  return catalog
    .filter((p) => p.active !== false && slot.categories.includes(p.categorySlug) && firstInStock(p) && meetsRestrictions(p, restrictions))
    .sort((a, b) => score(b) - score(a) || a.slug.localeCompare(b.slug));
}

/** El stack sugerido para un objetivo: el mejor producto de cada lugar que arma ese objetivo. */
export function defaultStack(goal: Goal, catalog: Product[], restrictions: Restriction[] = [], slots: StackSlotId[] = GOAL_SLOTS[goal]): StackPick[] {
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
    const price = unitPrice(product, variant);
    return [{ slot: pick.slot, product, variant, price, perServing: pricePerServing(price, variant.servings) }];
  });
  const subtotal = lines.reduce((s, l) => s + l.price, 0);
  const stack = stackDiscount(lines.map((l) => ({ product: l.product, lineTotal: l.price })), rule);
  const perDay = lines.length && lines.every((l) => l.perServing !== null)
    ? Math.round(lines.reduce((s, l) => s + l.perServing!, 0) * (1 - stack.discount / Math.max(1, subtotal)))
    : null;
  return { lines, subtotal, stack, total: subtotal - stack.discount, perDay };
}

/** El estante en la URL (`?objetivo=fuerza&stack=base.ionic-whey.iw-chocolate-2lb,…`), para compartirlo o venir del quiz. */
export function encodeStack(goal: Goal | null, picks: StackPick[]): string {
  const q = new URLSearchParams();
  if (goal) q.set("objetivo", goal);
  if (picks.length) q.set("stack", picks.map((p) => `${p.slot}.${p.slug}.${p.variantId}`).join(","));
  return q.toString();
}

/** Lee el estante de la URL y descarta lo que no existe, no tiene stock o no va en ese lugar. */
export function decodeStack(raw: string | null, catalog: Product[]): StackPick[] {
  if (!raw) return [];
  const seen = new Set<StackSlotId>();
  return raw.split(",").flatMap((part): StackPick[] => {
    const [slot, slug, variantId] = part.split(".") as [StackSlotId, string, string];
    const slotDef = STACK_SLOTS.find((s) => s.id === slot);
    const product = catalog.find((p) => p.slug === slug && p.active !== false);
    const variant = product?.variants.find((v) => v.id === variantId && v.stock !== 0);
    if (!slotDef || !product || !variant || seen.has(slot) || !slotDef.categories.includes(product.categorySlug)) return [];
    seen.add(slot);
    return [{ slot, slug, variantId }];
  });
}
