import { clearancePrice } from "../engine/lots";
import type { CounterSale } from "../engine/counter-sale";
import { isPaidOrLater } from "../engine/orders";
import { daysBetween } from "../engine/workdays";
import { COST_DATES, DEFAULT_COST_SINCE } from "../fixtures/live-costs";
import type { Recipe } from "../fixtures/workshop";
import type { Product, Variant } from "../types";
import { toDayKey } from "@/lib/date";
import type { AdminOrder } from "./types";

/**
 * "Costos vivos" (R4c): desde cuándo rige cada costo, para cuántos días alcanza el stock y qué se gana (o se pierde) al
 * liquidar un lote que vence. Puro y testeado; en producción lo calcula el servidor con las ventas reales.
 */
export const SALES_WINDOW_DAYS = 56;
/** Un costo sin actualizar hace más de esto se marca como viejo. */
export const COST_STALE_DAYS = 60;
/** Cobertura corta (se acaba pronto) y larga (capital parado). */
export const COVERAGE_SHORT_DAYS = 14;
export const COVERAGE_LONG_DAYS = 120;

const counts = (o: Pick<AdminOrder, "status" | "prevStatus">) => isPaidOrLater(o.status) || (o.status === "IN_CLAIM" && !!o.prevStatus && isPaidOrLater(o.prevStatus));
const inWindow = (day: string, today: string, days: number) => { const ago = daysBetween(day, today); return ago >= 0 && ago < days; };

/** Unidades vendidas por día de cada variante (clave `producto::variante`): pedidos pagados y mostrador de las últimas 8 semanas. */
export function dailySales(orders: Pick<AdminOrder, "status" | "prevStatus" | "createdAt" | "lines">[], counterSales: Pick<CounterSale, "day" | "lines">[], today: string, days = SALES_WINDOW_DAYS): Map<string, number> {
  const units = new Map<string, number>();
  const add = (slug: string, variantId: string, qty: number) => units.set(`${slug}::${variantId}`, (units.get(`${slug}::${variantId}`) ?? 0) + qty);
  for (const o of orders) if (counts(o) && inWindow(toDayKey(o.createdAt), today, days)) for (const l of o.lines) add(l.productSlug, l.variantId, l.quantity);
  for (const s of counterSales) if (inWindow(s.day, today, days)) for (const l of s.lines) add(l.productSlug, l.variantId, l.qty);
  return new Map([...units].map(([k, n]) => [k, n / days]));
}

export type CoverageState = "a-pedido" | "sin-stock" | "sin-ventas" | "corta" | "ok" | "larga";
export interface Coverage { days: number | null; state: CoverageState }

/** Días que alcanza el stock al ritmo de venta diario promedio (stock / venta por día, para abajo). */
export function coverage(stock: number, perDay: number): Coverage {
  if (stock < 0) return { days: null, state: "a-pedido" };
  if (stock === 0) return { days: 0, state: "sin-stock" };
  if (!(perDay > 0)) return { days: null, state: "sin-ventas" };
  const days = Math.floor(stock / perDay);
  return { days, state: days <= COVERAGE_SHORT_DAYS ? "corta" : days > COVERAGE_LONG_DAYS ? "larga" : "ok" };
}

export const COVERAGE_LABEL: Record<CoverageState, string> = { "a-pedido": "A pedido", "sin-stock": "Sin stock", "sin-ventas": "Sin ventas", corta: "Se acaba pronto", ok: "Alcanza", larga: "Stock de sobra" };

/** Desde cuándo rige el costo de la variante: el de la lista del proveedor, el de su receta o el de muestra. */
export function costSince(product: Product, variant: Variant, recipe: Recipe | undefined): string {
  const own = variant.cost !== undefined ? variant.costSince : recipe?.costSince;
  return own ?? COST_DATES[product.slug] ?? DEFAULT_COST_SINCE;
}

export const costAge = (since: string, today: string) => Math.max(0, daysBetween(since, today));

export interface Liquidation {
  pct: number;
  /** Precio de liquidación y unidades del lote. */
  price: number;
  units: number;
  /** Ganancia (o pérdida, si es negativa) de vender todo el lote con el descuento; null sin costo. */
  profit: number | null;
  /** Lo que se pierde si el lote vence sin venderse: el costo de todas las unidades. */
  ifExpires: number | null;
  /** Lo que entra en caja si se vende todo. */
  revenue: number;
}

/** Ganancia de liquidar un lote: unidades × (precio de liquidación − costo puesto en el local). Pesos enteros. */
export function liquidationProfit(units: number, listPrice: number, landed: number | null, pct: number): Liquidation {
  const price = clearancePrice(listPrice, pct);
  return { pct, price, units, revenue: price * units, profit: landed === null ? null : (price - landed) * units, ifExpires: landed === null ? null : -landed * units };
}
