import { sampleReviews, type ProductReviews } from "../fixtures/reviews";
import type { Nutrition, Product, Variant } from "../types";
import { activeProducts, findVariant, unitPrice } from "./catalog";
import { searchRowFacts } from "./search-row";
import { bestValueSize, daysLasting, pricePerServing } from "./servings";

/**
 * Datos de la ficha "hoja técnica" (R2): el marcador (precio, activo y servicios), los dos precios explicados, las
 * placas de tamaño y el riel "Comparalo con…". Puro y testeado; en producción, src/server/services.
 */

/** Renglones de macronutrientes del rótulo: todo lo demás es un activo (creatina, cafeína, vitaminas…). */
const MACROS = ["valor energético", "carbohidratos", "de los cuales azúcares", "proteínas", "grasas totales", "grasas saturadas", "grasas trans", "fibra alimentaria", "sodio"];

export interface ServingActive {
  /** "Proteína", "Creatina", "Cafeína"… */
  label: string;
  /** Cifra tal como figura en el rótulo ("24", "3,2", "3.000"). */
  amount: string;
  unit: string;
}

function parse(label: string, printed: string): ServingActive | null {
  const m = printed.match(/^([\d.,]+)\s*([^\s=]*)/);
  return m ? { label, amount: m[1]!, unit: m[2] ?? "" } : null;
}
const grams = (a: ServingActive | null) => (a ? Number(a.amount.replace(/\./g, "").replace(",", ".")) : 0);
const shortName = (label: string) => label.split(/[\s(]/)[0]!.replace(/^./, (c) => c.toUpperCase());

/**
 * El activo que vende el producto, por servicio: la proteína si aporta 5 g o más; si no, el primer activo del rótulo
 * (creatina, cafeína, L-carnitina…); si no, los carbohidratos de un gel o ganador (10 g o más). null si no hay rótulo.
 */
export function servingActive(nutrition?: Nutrition): ServingActive | null {
  if (!nutrition) return null;
  const row = (name: string) => nutrition.rows.find((r) => r.label.toLowerCase() === name);
  const protein = row("proteínas");
  const p = protein ? parse("Proteína", protein.serving) : null;
  if (grams(p) >= 5) return p;
  const active = nutrition.rows.find((r) => !MACROS.includes(r.label.toLowerCase()));
  if (active) return parse(shortName(active.label), active.serving);
  const carbs = row("carbohidratos");
  const c = carbs ? parse("Carbohidratos", carbs.serving) : null;
  return grams(c) >= 10 ? c : null;
}

/** Cuotas de muestra con tarjeta (las define Mercado Pago en su pantalla; la demo no cobra). */
export const CARD_INSTALLMENTS = 3;

export interface PriceOptions {
  /** Precio con transferencia o QR (descuento del panel). */
  transfer: number;
  transferPct: number;
  savings: number;
  /** Con tarjeta o Mercado Pago: el precio de lista, y la cuota redondeada hacia arriba al peso. */
  card: number;
  installments: number;
  perInstallment: number;
}

export function priceOptions(price: number, transferPct: number, installments = CARD_INSTALLMENTS): PriceOptions {
  const transfer = Math.round(price * (1 - transferPct / 100));
  const n = Math.max(1, Math.round(installments));
  return { transfer, transferPct, savings: price - transfer, card: price, installments: n, perInstallment: Math.ceil(price / n) };
}

export interface SheetScore {
  price: number;
  perServing: number | null;
  servings: number | null;
  active: ServingActive | null;
  /** Días que dura el envase con `perDay` servicios por día (null sin servicios). */
  days: number | null;
}

/** El marcador de la ficha para la presentación elegida. */
export function sheetScore(product: Product, variant: Variant, perDay = 1): SheetScore {
  const price = unitPrice(product, variant);
  const servings = variant.servings && variant.servings > 1 ? variant.servings : null;
  return {
    price,
    perServing: servings ? pricePerServing(price, servings) : null,
    servings,
    active: servingActive(product.nutrition),
    days: servings ? daysLasting(servings, perDay) : null,
  };
}

export interface SizePlate {
  size: string;
  variant: Variant;
  price: number;
  servings: number | null;
  perServing: number | null;
  /** La que mejor rinde por servicio (si ahorra de verdad). */
  best: boolean;
  soldOut: boolean;
}

/** Tamaños del sabor elegido como placas, cada uno con su precio y su precio por servicio. */
export function sizePlates(product: Product, color?: string): SizePlate[] {
  const best = bestValueSize(product, color);
  const sizes = [...new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s))];
  return sizes.flatMap((size) => {
    const variant = findVariant(product, color, size) ?? findVariant(product, undefined, size);
    if (!variant) return [];
    const price = unitPrice(product, variant);
    const servings = variant.servings && variant.servings > 1 ? variant.servings : null;
    return [{ size, variant, price, servings, perServing: servings ? pricePerServing(price, servings) : null, best: size === best, soldOut: variant.stock === 0 }];
  });
}

/**
 * "Comparalo con…": otros productos de la misma categoría (si no alcanzan, los que comparten objetivo), con stock
 * primero y del que más rinde por servicio al que menos. Es la respuesta a "¿y cuál me conviene?".
 */
export function compareAlternatives(product: Product, n = 4, catalog: Product[] = activeProducts()): Product[] {
  const pool = catalog.filter((p) => p.slug !== product.slug && p.active !== false);
  const same = pool.filter((p) => p.categorySlug === product.categorySlug);
  const goals = new Set(product.goals ?? []);
  const near = pool.filter((p) => p.categorySlug !== product.categorySlug && (p.goals ?? []).some((g) => goals.has(g)));
  const facts = new Map(pool.map((p) => [p.slug, searchRowFacts(p)]));
  const order = (list: Product[]) => [...list].sort((a, b) => {
    const fa = facts.get(a.slug)!, fb = facts.get(b.slug)!;
    return Number(fa.stock === "out") - Number(fb.stock === "out") || (fa.perServing ?? fa.price) - (fb.perServing ?? fb.price) || a.slug.localeCompare(b.slug);
  });
  return [...order(same), ...order(near)].slice(0, n);
}

/** Reseñas por atributo (sabor, mezcla, efecto) del producto, si las hay (MUESTRA). */
export function reviewsFor(slug: string): ProductReviews | null {
  return sampleReviews.find((r) => r.productSlug === slug) ?? null;
}
