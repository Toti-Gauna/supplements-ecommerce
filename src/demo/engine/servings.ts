import type { Product, Variant } from "../types";

/**
 * Servicios y duración del envase (Fase 2). Reglas puras, en pesos enteros. Lo que dice "cuánto te dura" es
 * orientativo: depende de cuántos servicios por día use cada persona.
 */

/** Precio por servicio de una variante, redondeado al peso. null si la variante no informa servicios. */
export function pricePerServing(price: number, servings: number | undefined): number | null {
  if (!servings || servings <= 0) return null;
  return Math.round(price / servings);
}

/** Precio de lista de una variante (base + recargo), sin cupones ni descuentos. */
export function variantPrice(product: Product, variant: Variant): number {
  return product.basePrice + variant.priceDelta;
}

/**
 * La presentación con mejor precio por servicio, entre las del mismo sabor (o todas si no hay sabores).
 * Solo cuenta si hay al menos dos presentaciones con servicios y la mejor ahorra algo de verdad (≥ 1 %).
 */
export function bestValueSize(product: Product, color?: string): string | null {
  const candidates = product.variants
    .filter((v) => (color === undefined || v.color === color) && v.size && v.servings)
    .map((v) => ({ size: v.size!, pps: pricePerServing(variantPrice(product, v), v.servings)! }));
  const sizes = new Map<string, number>();
  for (const c of candidates) sizes.set(c.size, Math.min(sizes.get(c.size) ?? Infinity, c.pps));
  if (sizes.size < 2) return null;
  const sorted = [...sizes].sort((a, b) => a[1] - b[1]);
  const [best, next] = [sorted[0]!, sorted[1]!];
  return best[1] <= next[1] * 0.99 ? best[0] : null;
}

/** Ahorro por servicio de la mejor presentación frente a la más cara, en % entero (para "ahorrás 23 %"). */
export function servingSavingsPct(product: Product, color?: string): number | null {
  const pps = product.variants
    .filter((v) => (color === undefined || v.color === color) && v.servings)
    .map((v) => pricePerServing(variantPrice(product, v), v.servings)!);
  if (pps.length < 2) return null;
  const max = Math.max(...pps);
  const min = Math.min(...pps);
  return max > 0 ? Math.round(((max - min) / max) * 100) : null;
}

/** Días que dura un envase según cuántos servicios por día (mínimo 1 día). */
export function daysLasting(servings: number, perDay: number): number {
  if (servings <= 0 || perDay <= 0) return 0;
  return Math.max(1, Math.floor(servings / perDay));
}

/** Fecha (AAAA-MM-DD) en que se termina el envase si se empieza `from` (AAAA-MM-DD). */
export function runsOutOn(from: string, days: number): string {
  const d = new Date(`${from}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Aviso de recompra: unos días antes de que se termine (5 por defecto, nunca antes de empezar). */
export function reminderOn(from: string, days: number, before = 5): string {
  return runsOutOn(from, Math.max(0, days - before));
}
