import { pricePerServing } from "../engine/servings";
import type { Product, Variant } from "../types";

/**
 * Precio propio por presentación (R2): el dueño escribe el precio final de cada presentación y el catálogo lo guarda
 * como base + diferencia (el modelo que leen la tienda, la lista del proveedor y "Aumentar precios"). La base es el
 * precio más bajo, así ninguna diferencia queda negativa. Puro y testeado.
 */
export const finalPrice = (p: Product, v: Variant): number => p.basePrice + v.priceDelta;

/** Pone los precios finales (uno por variante, en orden) y recalcula la base y las diferencias sin cambiar ninguno. */
export function withFinalPrices(p: Product, prices: readonly number[]): Product {
  const finals = p.variants.map((v, i) => Math.max(0, Math.round(prices[i] ?? finalPrice(p, v))));
  const positive = finals.filter((n) => n > 0);
  const basePrice = positive.length ? Math.min(...positive) : 0;
  return { ...p, basePrice, variants: p.variants.map((v, i) => ({ ...v, priceDelta: finals[i]! - basePrice })) };
}

/** Cambia el precio final de una presentación; las otras quedan igual. */
export function withVariantPrice(p: Product, index: number, price: number): Product {
  return withFinalPrices(p, p.variants.map((v, i) => (i === index ? price : finalPrice(p, v))));
}

/** Presentaciones sin precio (0): bloquean el guardado. */
export function unpricedVariants(p: Product): Variant[] {
  return p.variants.filter((v) => finalPrice(p, v) <= 0);
}

/** Precio por servicio que ve el dueño mientras carga la presentación (null sin servicios). */
export function editorServingPrice(p: Product, v: Variant): number | null {
  return v.servings && v.servings > 1 ? pricePerServing(finalPrice(p, v), v.servings) : null;
}
