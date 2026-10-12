import { isPaidOrLater } from "../engine/orders";
import { daysLasting, runsOutOn } from "../engine/servings";
import { daysBetween } from "../engine/workdays";
import { MIN_TRACKED_SERVINGS, servingsPerWeek, type CustomerProfile, type NoticeChannel, type RepurchaseNotice } from "../fixtures/customers";
import type { Product, Variant } from "../types";
import { toDayKey } from "@/lib/date";
import type { CustomerRow } from "./customers";
import type { AdminOrder } from "./types";

/**
 * Recompra calculada (Fase 6): con los pedidos pagados del cliente, cuándo se le termina cada pote según los servicios
 * de la variante y el consumo de referencia de su categoría. Orientativo, igual que "¿Cuánto te dura?" de la tienda.
 */

/** "Se le termina esta semana": hoy y los 6 días que siguen. */
export const WEEK_DAYS = 7;
/** Hasta cuántos días después de terminarse se lo muestra como recompra atrasada; después ya es un cliente dormido. */
export const OVERDUE_DAYS = 30;

export type RepurchaseState = "overdue" | "week" | "later";

export interface RepurchaseItem {
  /** `${slug}:${runsOutOn}`: identifica el pote, así el mismo aviso no sale dos veces. */
  key: string;
  email: string;
  name: string;
  phone?: string;
  slug: string;
  product: string;
  variant: string;
  variantId?: string;
  /** Pedido de la última compra de ese producto. */
  orderCode: string;
  /** AAAA-MM-DD en que empezó este pote y en que se le termina. */
  startsOn: string;
  runsOutOn: string;
  /** Días desde hoy (negativo: ya se le terminó). */
  inDays: number;
  state: RepurchaseState;
}

/** Desde cuándo lo usa: el día que lo recibe (fecha de entrega o retiro) o, si no hay, el día de la compra. */
export function startOf(order: Pick<AdminOrder, "createdAt" | "promisedDate">): string {
  const bought = toDayKey(order.createdAt);
  return order.promisedDate && order.promisedDate > bought ? order.promisedDate : bought;
}

/** Días que dura lo comprado con el consumo de su categoría; null si no se sigue (accesorios, presentaciones chicas). */
export function lastingDays(product: Product, variant: Variant | undefined, quantity: number): number | null {
  const perWeek = servingsPerWeek[product.categorySlug];
  const servings = (variant?.servings ?? 0) * quantity;
  if (!perWeek || servings < MIN_TRACKED_SERVINGS) return null;
  // `daysLasting` cuenta servicios por día: en semanas, servicios × 7 sobre servicios por semana.
  return daysLasting(servings * 7, perWeek);
}

export function stateOf(inDays: number): RepurchaseState {
  return inDays < 0 ? "overdue" : inDays < WEEK_DAYS ? "week" : "later";
}

/**
 * Lo que se le termina a un cliente, del más próximo al más lejano. Si volvió a comprar lo mismo antes de terminarlo,
 * el pote nuevo arranca cuando se termina el anterior. Lo que se terminó hace más de `OVERDUE_DAYS` ya no aparece.
 */
export function repurchaseItems(customer: CustomerRow, products: Product[], today: string): RepurchaseItem[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const chains = new Map<string, { start: string; end: string; product: Product; variant: string; variantId?: string; order: string }>();
  const paid = customer.orders.filter((o) => isPaidOrLater(o.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
      return { key: `${product.slug}:${end}`, email: customer.email, name: customer.name, phone: customer.phone, slug: product.slug, product: product.name, variant, ...(variantId ? { variantId } : {}), orderCode: order, startsOn: start, runsOutOn: end, inDays, state: stateOf(inDays) };
    })
    .filter((i) => i.inDays >= -OVERDUE_DAYS)
    .sort((a, b) => a.runsOutOn.localeCompare(b.runsOutOn) || a.product.localeCompare(b.product));
}

/** Lo que le queda del pote hoy, de 100 (recién empezado) a 0 (terminado). Lo mismo que la batería de Mi cuenta. */
export function remainingPct(item: Pick<RepurchaseItem, "startsOn" | "runsOutOn">, today: string): number {
  const total = Math.max(1, daysBetween(item.startsOn, item.runsOutOn));
  return Math.round(Math.max(0, Math.min(100, 100 - (daysBetween(item.startsOn, today) / total) * 100)));
}

/** Recompras de todos los clientes (sin los bloqueados) en un estado, por fecha y nombre. */
export function repurchasesIn(customers: { blocked: boolean; repurchases: RepurchaseItem[] }[], state: RepurchaseState): RepurchaseItem[] {
  return customers
    .filter((c) => !c.blocked)
    .flatMap((c) => c.repurchases.filter((i) => i.state === state))
    .sort((a, b) => a.runsOutOn.localeCompare(b.runsOutOn) || a.name.localeCompare(b.name));
}

export function noticeFor(profile: CustomerProfile | undefined, item: Pick<RepurchaseItem, "key">): RepurchaseNotice | undefined {
  return profile?.notices?.find((n) => n.key === item.key);
}

/** Suma el aviso a la ficha; si ese pote ya tenía aviso, la ficha queda igual. */
export function withNotice(profile: CustomerProfile, key: string, channel: NoticeChannel, at: string): CustomerProfile {
  if (profile.notices?.some((n) => n.key === key)) return profile;
  return { ...profile, notices: [{ key, channel, at }, ...(profile.notices ?? [])] };
}
