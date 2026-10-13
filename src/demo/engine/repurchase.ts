import { MIN_TRACKED_SERVINGS, servingsPerWeek } from "../fixtures/customers";
import type { Product, Variant } from "../types";
import type { CartLine } from "./cart-types";
import { isPaidOrLater, type OrderStatus } from "./orders";
import { daysLasting, reminderOn, runsOutOn } from "./servings";
import { daysBetween } from "./workdays";
import { toDayKey } from "@/lib/date";

/**
 * Recompra calculada, compartida por la tienda ("Mi box", confirmación) y el panel (Clientes): con los pedidos pagados,
 * cuándo se termina cada pote según los servicios de la variante y el consumo de referencia de su categoría.
 * Orientativo, igual que "¿Cuánto te dura?" de la ficha. En producción lo calcula el servidor.
 */

/** "Se le termina esta semana": hoy y los 6 días que siguen. */
export const WEEK_DAYS = 7;
/** Hasta cuántos días después de terminarse se lo muestra como recompra atrasada; después ya es un cliente dormido. */
export const OVERDUE_DAYS = 30;
/** El aviso sale unos días antes de que se termine. */
export const REMIND_BEFORE_DAYS = 5;

export type RepurchaseState = "overdue" | "week" | "later";

/** Lo mínimo de un pedido para seguir sus potes (sirve el del panel y el de la tienda). */
export interface PotOrder {
  code: string;
  createdAt: string;
  promisedDate?: string;
  status: OrderStatus;
  lines: CartLine[];
}

export interface Pot {
  slug: string;
  product: string;
  variant: string;
  variantId?: string;
  /** Pedido de la última compra de ese producto. */
  orderCode: string;
  /** AAAA-MM-DD en que empezó este pote y en que se termina. */
  startsOn: string;
  runsOutOn: string;
  /** Días desde hoy (negativo: ya se terminó). */
  inDays: number;
  state: RepurchaseState;
}

/** Desde cuándo lo usa: el día que lo recibe (fecha de entrega o retiro) o, si no hay, el día de la compra. */
export function startOf(order: Pick<PotOrder, "createdAt" | "promisedDate">): string {
  const bought = toDayKey(order.createdAt);
  return order.promisedDate && order.promisedDate > bought ? order.promisedDate : bought;
}

/** Servicios por semana de referencia de un producto, o null si no se sigue (accesorios). */
export const perWeekOf = (product: Pick<Product, "categorySlug">): number | null => servingsPerWeek[product.categorySlug] ?? null;

/** Días que dura lo comprado con el consumo de su categoría; null si no se sigue (accesorios, presentaciones chicas). */
export function lastingDays(product: Product, variant: Variant | undefined, quantity: number): number | null {
  const perWeek = perWeekOf(product);
  const servings = (variant?.servings ?? 0) * quantity;
  if (!perWeek || servings < MIN_TRACKED_SERVINGS) return null;
  // `daysLasting` cuenta servicios por día: en semanas, servicios × 7 sobre servicios por semana.
  return daysLasting(servings * 7, perWeek);
}

export function stateOf(inDays: number): RepurchaseState {
  return inDays < 0 ? "overdue" : inDays < WEEK_DAYS ? "week" : "later";
}

/**
 * Potes en uso, del más próximo a terminarse al más lejano. Si se volvió a comprar lo mismo antes de terminarlo, el pote
 * nuevo arranca cuando se termina el anterior. Solo cuentan los pedidos pagados; lo terminado hace más de
 * `OVERDUE_DAYS` ya no aparece.
 */
export function potsInUse(orders: PotOrder[], products: Product[], today: string): Pot[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const chains = new Map<string, { start: string; end: string; product: Product; variant: string; variantId?: string; order: string }>();
  const paid = orders.filter((o) => isPaidOrLater(o.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const order of paid) {
    for (const line of order.lines) {
      const product = bySlug.get(line.productSlug);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      const days = product ? lastingDays(product, variant, line.quantity) : null;
      if (!product || days === null) continue;
      const prev = chains.get(product.slug);
      const start = startOf(order);
      const from = prev && prev.end > start ? prev.end : start;
      chains.set(product.slug, { start: from, end: runsOutOn(from, days), product, variant: variant?.label ?? "", variantId: variant?.id, order: order.code });
    }
  }
  return [...chains.values()]
    .map(({ start, end, product, variant, variantId, order }) => {
      const inDays = daysBetween(today, end);
      return { slug: product.slug, product: product.name, variant, ...(variantId ? { variantId } : {}), orderCode: order, startsOn: start, runsOutOn: end, inDays, state: stateOf(inDays) };
    })
    .filter((i) => i.inDays >= -OVERDUE_DAYS)
    .sort((a, b) => a.runsOutOn.localeCompare(b.runsOutOn) || a.product.localeCompare(b.product));
}

/** Lo que queda del pote hoy, de 100 (recién empezado) a 0 (terminado). */
export function remainingPct(item: Pick<Pot, "startsOn" | "runsOutOn">, today: string): number {
  const total = Math.max(1, daysBetween(item.startsOn, item.runsOutOn));
  return Math.round(Math.max(0, Math.min(100, 100 - (daysBetween(item.startsOn, today) / total) * 100)));
}

/** Aviso de recompra (mismo formato que el que se pide desde la ficha). */
export interface ReminderDraft {
  id: string;
  slug: string;
  variantId: string;
  name: string;
  variant: string;
  startsOn: string;
  runsOutOn: string;
  remindOn: string;
  /** Servicios por día de referencia (puede ser menos de 1: 4 por semana). */
  perDay: number;
}

/** Avisos de recompra de un pedido: uno por producto que se sigue, desde el día en que se recibe. */
export function orderReminders(lines: CartLine[], start: string, products: Product[]): ReminderDraft[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return lines.flatMap((line) => {
    const product = bySlug.get(line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    const days = product && variant ? lastingDays(product, variant, line.quantity) : null;
    if (!product || !variant || days === null) return [];
    const perDay = Math.round((perWeekOf(product)! / 7) * 100) / 100;
    return [{ id: `${product.slug}:${variant.id}`, slug: product.slug, variantId: variant.id, name: product.name, variant: variant.label, startsOn: start, runsOutOn: runsOutOn(start, days), remindOn: reminderOn(start, days, REMIND_BEFORE_DAYS), perDay }];
  });
}
