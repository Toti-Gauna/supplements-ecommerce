import { normalize } from "../engine/search";
import type { Category, Product, Variant } from "../types";
import type { Parsed } from "./import/cells";

/**
 * Aumento (o rebaja) masivo de precios por %: por marca, por categoría o todo el catálogo, con redondeo, vista previa
 * por variante y deshacer exacto del último cambio. Puro y testeado; en producción lo recalcula el servidor.
 */
export type PriceScope = { kind: "all" } | { kind: "brand"; brand: string } | { kind: "category"; slug: string };
/** Redondeo al múltiplo más cercano: $100, $500 o al peso (sin redondeo). */
export type Rounding = 1 | 100 | 500;

export const ROUNDING_LABEL: Record<Rounding, string> = { 100: "A $100", 500: "A $500", 1: "Sin redondeo" };
export const PCT_LIMITS = { min: -90, max: 200 } as const;

export interface PriceLine {
  key: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  brand: string;
  from: number;
  to: number;
}

/** Precios de antes, por producto: deshacer los deja exactamente como estaban. */
export interface PriceUndo {
  at: string;
  label: string;
  count: number;
  prices: Record<string, { basePrice: number; deltas: Record<string, number> }>;
  /** Costos de antes (lista del proveedor, R4c), por `producto::variante`: sin costo o fecha, no tenía. */
  costs?: Record<string, { cost?: number; since?: string }>;
}

export function inScope(p: Product, scope: PriceScope): boolean {
  if (scope.kind === "brand") return normalize(p.brand) === normalize(scope.brand);
  if (scope.kind === "category") return p.categorySlug === scope.slug;
  return true;
}

export function roundPrice(amount: number, step: Rounding): number {
  return Math.max(step, Math.round(amount / step) * step);
}

const bump = (price: number, pct: number, step: Rounding) => roundPrice((price * (100 + pct)) / 100, step);

/** "8", "+8 %", "7,5", "-10" → número. Entre -90 % y +200 %, distinto de 0. */
export function parsePct(text: string): Parsed<number> {
  const raw = text.replace(/%|\s/g, "").replace(",", ".");
  if (!raw) return { ok: false, error: "Escribí el porcentaje" };
  if (!/^[+-]?\d+(\.\d+)?$/.test(raw)) return { ok: false, error: `“${text.trim()}” no es un porcentaje válido` };
  const n = Number(raw);
  if (n === 0) return { ok: false, error: "El porcentaje no puede ser 0" };
  if (n < PCT_LIMITS.min || n > PCT_LIMITS.max) return { ok: false, error: `Tiene que estar entre ${PCT_LIMITS.min} % y +${PCT_LIMITS.max} %` };
  return { ok: true, value: n };
}

/** Precio actual → nuevo de cada variante alcanzada. Las que no cambian (redondeo) igual se listan. */
export function previewPriceChange(products: Product[], scope: PriceScope, pct: number, step: Rounding): PriceLine[] {
  return products.filter((p) => inScope(p, scope)).flatMap((p) => p.variants.map((v) => {
    const from = p.basePrice + v.priceDelta;
    return { key: `${p.slug}::${v.id}`, productSlug: p.slug, productName: p.name, variantLabel: v.label, brand: p.brand, from, to: bump(from, pct, step) };
  }));
}

/** Aplica el cambio: cada variante queda exactamente en su precio nuevo redondeado (base y recargos se recalculan). */
export function applyPriceChange(products: Product[], scope: PriceScope, pct: number, step: Rounding, label: string, at = new Date().toISOString()): { products: Product[]; undo: PriceUndo } {
  const undo: PriceUndo = { at, label, count: 0, prices: {} };
  const next = products.map((p) => {
    if (!inScope(p, scope)) return p;
    undo.prices[p.slug] = { basePrice: p.basePrice, deltas: Object.fromEntries(p.variants.map((v) => [v.id, v.priceDelta])) };
    undo.count += p.variants.length;
    const basePrice = bump(p.basePrice, pct, step);
    return { ...p, basePrice, variants: p.variants.map((v) => ({ ...v, priceDelta: bump(p.basePrice + v.priceDelta, pct, step) - basePrice })) };
  });
  return { products: next, undo };
}

/** Costo y fecha de antes (la lista del proveedor los cambia junto con el precio); sin dato guardado, no se toca. */
function restoreCost(v: Variant, before: { cost?: number; since?: string } | undefined): Variant {
  if (!before) return v;
  const { cost, costSince, ...rest } = v;
  void cost; void costSince;
  return { ...rest, ...(before.cost !== undefined ? { cost: before.cost } : {}), ...(before.since ? { costSince: before.since } : {}) };
}

/** Vuelve los precios de lo alcanzado a como estaban; lo demás (stock, nombres, productos nuevos) no se toca. */
export function undoPriceChange(products: Product[], undo: PriceUndo): Product[] {
  return products.map((p) => {
    const before = undo.prices[p.slug];
    if (!before) return p;
    // Una variante creada después del aumento conserva su precio (su recargo se ajusta a la base de antes).
    const keep = (price: number) => price - before.basePrice;
    return {
      ...p, basePrice: before.basePrice,
      variants: p.variants.map((v) => restoreCost({ ...v, priceDelta: v.id in before.deltas ? before.deltas[v.id]! : keep(p.basePrice + v.priceDelta) }, undo.costs?.[`${p.slug}::${v.id}`])),
    };
  });
}

/** "Brava Sport", "Proteínas" o "todo el catálogo". */
export function scopeLabel(scope: PriceScope, categories: Category[]): string {
  return scope.kind === "brand" ? scope.brand : scope.kind === "category" ? categories.find((c) => c.slug === scope.slug)?.name ?? scope.slug : "todo el catálogo";
}

/** "+8 % a Brava Sport", "−10 % a Proteínas", "+5 % a todo el catálogo". */
export function priceChangeLabel(scope: PriceScope, pct: number, categories: Category[]): string {
  const sign = pct > 0 ? "+" : "−";
  return `${sign}${String(Math.abs(pct)).replace(".", ",")} % a ${scopeLabel(scope, categories)}`;
}

export function brandsOf(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.brand.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}
