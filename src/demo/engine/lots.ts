import type { Lot, Product, Variant } from "../types";

/**
 * Lotes y vencimientos. FEFO: sale primero el lote que vence primero. La liquidación por vencimiento baja el precio
 * de la variante mientras el lote liquidado sea el que sale primero. Puro y testeado; en producción, src/server/services.
 */
export const EXPIRY_WINDOW_DAYS = 60;
export const CLEARANCE_LIMITS = { min: 5, max: 70 } as const;

const DAY = 86_400_000;

/** "2026-11" → "2026-11-30": el envase vence el último día del mes impreso. */
export function expiryDate(expires: string): string {
  const [y, m] = expires.split("-").map(Number);
  const last = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
  return `${expires.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

/** "2026-11" → "11/2026", como está impreso en el envase. */
export function formatExpiry(expires: string): string {
  const [y, m] = expires.split("-");
  return `${m}/${y}`;
}

/** Días desde `today` (AAAA-MM-DD) hasta el último día del mes de vencimiento. Negativo: ya venció. */
export function daysToExpiry(expires: string, today: string): number {
  return Math.round((Date.parse(expiryDate(expires)) - Date.parse(today.slice(0, 10))) / DAY);
}

/** Orden FEFO: primero el que vence antes; a igual vencimiento, por código. */
export function fefo(lots: readonly Lot[]): Lot[] {
  return [...lots].sort((a, b) => a.expires.localeCompare(b.expires) || a.code.localeCompare(b.code));
}

export function lotUnits(lots: readonly Lot[]): number {
  return lots.reduce((sum, l) => sum + Math.max(0, l.units), 0);
}

/** El lote que sale primero: el de vencimiento más cercano que todavía tiene unidades. */
export function firstOutLot(variant: Variant): Lot | undefined {
  return fefo(variant.lots ?? []).find((l) => l.units > 0);
}

/** Precio de liquidación: lista menos el %, redondeado a $100 (nunca más que la lista ni menos de $100). */
export function clearancePrice(listPrice: number, pct: number): number {
  const p = Math.min(CLEARANCE_LIMITS.max, Math.max(CLEARANCE_LIMITS.min, Math.round(pct)));
  return Math.min(listPrice, Math.max(100, Math.round((listPrice * (100 - p)) / 10_000) * 100));
}

export interface Clearance {
  pct: number;
  lot: Lot;
  listPrice: number;
  price: number;
}

/** Liquidación vigente de la variante: solo si el lote que sale primero está liquidado. */
export function variantClearance(product: Product, variant: Variant): Clearance | null {
  const lot = firstOutLot(variant);
  if (!lot?.clearancePct) return null;
  const listPrice = product.basePrice + variant.priceDelta;
  return { pct: lot.clearancePct, lot, listPrice, price: clearancePrice(listPrice, lot.clearancePct) };
}
