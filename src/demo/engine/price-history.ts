import { products as sampleProducts } from "../fixtures/products";
import type { Coupon, Product } from "../types";

/**
 * "Descuento real" (R3, plan-rediseno §10): historia de 30 días del precio de lista de cada variante y el precio más bajo
 * de esa ventana. Un descuento es real solo si el precio final queda por debajo de ese mínimo: subir el precio antes de
 * la campaña no cuenta como rebaja. Puro; en producción la historia sale de la tabla de precios del servidor.
 *
 * La historia anterior a la demo se SIMULA de forma determinista a partir de la clave de la variante (sin azar). Desde
 * ahí, cada cambio que hace el dueño en el panel (aumento masivo o editor de producto) queda como un `PriceChange`.
 */
export interface PriceChange {
  /** `producto::variante`. */
  key: string;
  /** Día del cambio, AAAA-MM-DD. */
  day: string;
  from: number;
  to: number;
}

export interface PricePoint { day: string; price: number }

export const PRICE_WINDOW_DAYS = 30;
/** Tope de cambios guardados en el navegador (los más viejos se descartan). */
export const PRICE_LOG_LIMIT = 1500;

const DAY = 86_400_000;
const shiftDay = (day: string, days: number) => new Date(Date.parse(`${day}T12:00:00Z`) + days * DAY).toISOString().slice(0, 10);
const round100 = (n: number) => Math.max(100, Math.round(n / 100) * 100);

/** Hash estable (FNV-1a) para que la simulación sea igual en cada carga y en cada equipo. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
  return h;
}

/**
 * Historia de muestra hasta `until` (el día en que se conoce `price`). Seis de cada diez variantes no cambiaron; tres
 * subieron entre 3 % y 6 % (inflación) en algún día de las últimas semanas; una tuvo una promo corta del 5 %.
 */
export function simulatedHistory(key: string, price: number, until: string): PricePoint[] {
  const h = hash(key);
  const start = shiftDay(until, -(PRICE_WINDOW_DAYS + 15));
  const bucket = h % 10;
  const ago = 5 + ((h >>> 4) % 21);
  if (bucket < 6) return [{ day: start, price }];
  if (bucket < 9) return [{ day: start, price: round100(price / (1 + (3 + ((h >>> 9) % 4)) / 100)) }, { day: shiftDay(until, -ago), price }];
  return [{ day: start, price }, { day: shiftDay(until, -ago), price: round100(price * 0.95) }, { day: shiftDay(until, -ago + 4), price }];
}

let samples: Map<string, number> | null = null;
/** Precio de lista de muestra (fixtures) de una variante: de ahí sale la historia simulada. */
function samplePrice(key: string): number | undefined {
  samples ??= new Map(sampleProducts.flatMap((p) => p.variants.map((v) => [`${p.slug}::${v.id}`, p.basePrice + v.priceDelta] as const)));
  return samples.get(key);
}

/**
 * Historia completa de una variante: la simulada (con el precio de muestra) hasta el primer cambio del dueño y después
 * sus cambios, en orden. Un precio distinto sin registro (importación, datos viejos del navegador) vale desde hoy.
 */
export function priceHistory(key: string, current: number, changes: PriceChange[], today: string): PricePoint[] {
  const mine = changes.filter((c) => c.key === key).sort((a, b) => a.day.localeCompare(b.day));
  const first = mine[0];
  const points = simulatedHistory(key, first ? first.from : (samplePrice(key) ?? current), first ? first.day : today);
  for (const c of mine) points.push({ day: c.day, price: c.to });
  if (points[points.length - 1]!.price !== current) points.push({ day: today, price: current });
  return points;
}

/** Precio más bajo vigente en algún momento de los últimos 30 días (incluye el precio que regía al empezar la ventana). */
export function lowestInWindow(points: PricePoint[], today: string, days = PRICE_WINDOW_DAYS): number {
  const from = shiftDay(today, -days);
  let atStart: number | null = null;
  const inside: number[] = [];
  for (const p of points) {
    if (p.day > today) continue;
    if (p.day <= from) atStart = p.price;
    else inside.push(p.price);
  }
  const all = atStart === null ? inside : [atStart, ...inside];
  return all.length ? Math.min(...all) : points[points.length - 1]!.price;
}

export const variantKey = (slug: string, variantId: string) => `${slug}::${variantId}`;

/** Precio más bajo de los últimos 30 días de una variante con su precio de lista actual. */
export function lowestPrice30(slug: string, variantId: string, current: number, changes: PriceChange[], today: string): number {
  return lowestInWindow(priceHistory(variantKey(slug, variantId), current, changes, today), today);
}

/** Cambios de precio de un aumento masivo o del editor: solo las variantes cuyo precio cambió. */
export function priceChangesBetween(before: Product[], after: Product[], day: string): PriceChange[] {
  const old = new Map(before.flatMap((p) => p.variants.map((v) => [variantKey(p.slug, v.id), p.basePrice + v.priceDelta] as const)));
  return after.flatMap((p) => p.variants.flatMap((v) => {
    const key = variantKey(p.slug, v.id);
    const from = old.get(key);
    const to = p.basePrice + v.priceDelta;
    return from !== undefined && from !== to ? [{ key, day, from, to }] : [];
  }));
}

export function appendPriceChanges(log: PriceChange[] | undefined, next: PriceChange[]): PriceChange[] {
  return next.length ? [...(log ?? []), ...next].slice(-PRICE_LOG_LIMIT) : (log ?? []);
}

export interface FakeDiscount {
  slug: string;
  name: string;
  variants: { label: string; price: number; final: number; lowest: number }[];
}

/** Precio por unidad con el cupón (solo porcentaje: el monto fijo y el envío gratis son por compra). */
export function couponUnitPrice(price: number, coupon: Pick<Coupon, "type" | "value">): number | null {
  return coupon.type === "PERCENT" ? Math.round(price * (1 - coupon.value / 100)) : null;
}

/**
 * Productos donde el descuento del cupón NO es real: el precio final con el cupón queda igual o por encima del más bajo
 * de los últimos 30 días (se subió el precio antes de la rebaja). Lista solo las variantes afectadas.
 */
export function fakeDiscounts(products: Product[], coupon: Pick<Coupon, "type" | "value">, changes: PriceChange[], today: string): FakeDiscount[] {
  if (coupon.type !== "PERCENT") return [];
  return products.flatMap((p) => {
    const variants = p.variants.flatMap((v) => {
      const price = p.basePrice + v.priceDelta;
      const final = couponUnitPrice(price, coupon)!;
      const lowest = lowestPrice30(p.slug, v.id, price, changes, today);
      return final >= lowest ? [{ label: v.label, price, final, lowest }] : [];
    });
    return variants.length ? [{ slug: p.slug, name: p.name, variants }] : [];
  });
}
