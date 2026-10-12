import { unitPrice } from "../engine/catalog";
import { stackDiscount, type StackRule } from "../engine/stack";
import { firstInStock } from "../engine/stack-builder";
import type { Product } from "../types";

/**
 * Editor de la regla del descuento stack (Fase 3, Marketing → "Descuento stack"): límites, validación y el ejemplo
 * real del catálogo que se muestra en la vista previa. El descuento lo sigue calculando `stackDiscount` (engine).
 */
export const STACK_RULE_LIMITS = { pct: { min: 0, max: 30 }, minCategories: { min: 2, max: 5 } } as const;

export interface StackRuleErrors {
  pct?: string;
  minCategories?: string;
}

const inRange = (n: number, { min, max }: { min: number; max: number }) => Number.isInteger(n) && n >= min && n <= max;

/** Errores por campo (vacío = se puede guardar). */
export function checkStackRule(rule: StackRule): StackRuleErrors {
  const errors: StackRuleErrors = {};
  if (!inRange(rule.pct, STACK_RULE_LIMITS.pct)) errors.pct = "El descuento va de 0 a 30 %, en números enteros.";
  if (!inRange(rule.minCategories, STACK_RULE_LIMITS.minCategories)) errors.minCategories = "Pedí de 2 a 5 categorías distintas.";
  return errors;
}

export const hasStackRuleErrors = (e: StackRuleErrors) => Boolean(e.pct || e.minCategories);

/** Cómo se lee la regla en una línea ("10 % desde 3 categorías"; con 0 % queda apagada). */
export function stackRuleLabel(rule: StackRule): string {
  return rule.pct > 0 ? `${rule.pct} % desde ${rule.minCategories} categorías` : "Apagado (0 %)";
}

/** Orden de un stack típico: proteína, creatina, pre y después los extras. */
const EXAMPLE_ORDER = ["proteinas", "creatinas", "pre-entrenos", "aminoacidos", "salud", "hidratacion", "definicion", "ganadores"];

export interface StackRuleExample {
  products: Product[];
  subtotal: number;
  discount: number;
  total: number;
  /** El catálogo activo alcanza para un ejemplo con la cantidad de categorías que pide la regla. */
  complete: boolean;
}

/**
 * Ejemplo real para la vista previa: el más vendido (activo y con stock) de cada categoría, en el orden de un stack
 * típico, hasta llegar a las categorías que pide la regla. Precio de la primera variante con stock.
 */
export function stackRuleExample(rule: StackRule, catalog: Product[]): StackRuleExample {
  const products = EXAMPLE_ORDER.flatMap((cat) => {
    const best = catalog.filter((p) => p.active !== false && p.categorySlug === cat && firstInStock(p)).sort((a, b) => b.soldCount - a.soldCount)[0];
    return best ? [best] : [];
  }).slice(0, Math.max(0, rule.minCategories));
  const lines = products.map((p) => ({ product: p, lineTotal: unitPrice(p, firstInStock(p)!) }));
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const { discount } = stackDiscount(lines, rule);
  return { products, subtotal, discount, total: subtotal - discount, complete: products.length === rule.minCategories };
}
