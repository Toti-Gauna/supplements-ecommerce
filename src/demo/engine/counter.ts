import type { Category, Product, Variant } from "../types";
import { listPrice, unitPrice } from "./catalog";
import { daysToExpiry, EXPIRY_WINDOW_DAYS, fefo, variantClearance } from "./lots";
import { searchCatalog } from "./search";
import { normalize } from "./search-text";

/**
 * Modo mostrador (R4b): los potes que se venden en el local y el lote que sale de cada uno (FEFO: el que vence primero).
 * Puro y testeado. El ticket con el descuento stack está en `counter-ticket.ts`, el cobro en `counter-pay.ts`, la venta
 * en `counter-sale.ts`, el cierre en `counter-close.ts`, la consulta para WhatsApp en `counter-text.ts` y el pedido por
 * chat en `counter-chat.ts`.
 */
export interface CounterLine {
  productSlug: string;
  variantId: string;
  qty: number;
}

/** Unidades que salen de un lote. */
export interface LotTake {
  code: string;
  expires: string;
  units: number;
}

export type PotState = "ok" | "low" | "out" | "on-order";

/** Un pote (variante) como tarjeta del mostrador. */
export interface CounterPot {
  key: string;
  productSlug: string;
  productName: string;
  brand: string;
  variantId: string;
  variantLabel: string;
  price: number;
  listPrice: number;
  /** % de liquidación del lote que sale, si está liquidado. */
  clearancePct?: number;
  /** Lo que queda para vender, descontado lo que ya está en el ticket. -1 = a pedido. */
  left: number;
  state: PotState;
  /** Lote del próximo pote que sale y cuánto le falta para vencer. Equipamiento: sin lote. */
  nextLot: (LotTake & { days: number; soon: boolean }) | null;
  gear: boolean;
}

export const lineKey = (slug: string, variantId: string) => `${slug}::${variantId}`;

/** Lotes que salen al vender `qty` unidades en orden FEFO, salteando las `skip` primeras (ya están en el ticket). */
export function fefoTake(variant: Variant, qty: number, skip = 0): LotTake[] {
  const out: LotTake[] = [];
  let toSkip = Math.max(0, skip);
  let toTake = Math.max(0, qty);
  for (const lot of fefo(variant.lots ?? [])) {
    if (toTake <= 0) break;
    let units = Math.max(0, lot.units);
    const skipped = Math.min(units, toSkip);
    units -= skipped;
    toSkip -= skipped;
    const taken = Math.min(units, toTake);
    if (taken > 0) out.push({ code: lot.code, expires: lot.expires, units: taken });
    toTake -= taken;
  }
  return out;
}

/** Unidades de esa variante que ya están en el ticket. */
export function inTicket(lines: readonly CounterLine[], slug: string, variantId: string): number {
  return lines.filter((l) => l.productSlug === slug && l.variantId === variantId).reduce((s, l) => s + l.qty, 0);
}

export interface PotQuery {
  /** Día de la demo (AAAA-MM-DD) para contar los días al vencimiento. */
  today: string;
  lines?: readonly CounterLine[];
  /** Pocas unidades desde este número (el aviso de stock bajo del panel). */
  low?: number;
  limit?: number;
}

const isGearIn = (categories: readonly Category[], p: Product) => categories.find((c) => c.slug === p.categorySlug)?.kind === "gear";

export function potFor(product: Product, variant: Variant, categories: readonly Category[], q: PotQuery): CounterPot {
  const taken = inTicket(q.lines ?? [], product.slug, variant.id);
  const left = variant.stock < 0 ? -1 : Math.max(0, variant.stock - taken);
  const state: PotState = variant.stock < 0 ? "on-order" : left === 0 ? "out" : left <= (q.low ?? 3) ? "low" : "ok";
  const next = fefoTake(variant, 1, taken)[0];
  const days = next ? daysToExpiry(next.expires, q.today) : 0;
  return {
    key: lineKey(product.slug, variant.id), productSlug: product.slug, productName: product.name, brand: product.brand,
    variantId: variant.id, variantLabel: variant.label, price: unitPrice(product, variant), listPrice: listPrice(product, variant),
    clearancePct: variantClearance(product, variant)?.pct, left, state,
    nextLot: next ? { ...next, days, soon: days < EXPIRY_WINDOW_DAYS } : null, gear: isGearIn(categories, product),
  };
}

/**
 * Potes para lo que se escribió, con el buscador de la tienda (sinónimos, sellos, sabores y errores leves). Un sabor
 * escrito ("whey chocolate") deja solo los potes de ese sabor. Sin texto: lo que más se vende, con stock.
 */
export function searchPots(query: string, products: readonly Product[], categories: readonly Category[], q: PotQuery): CounterPot[] {
  const visible = products.filter((p) => p.active !== false);
  const limit = q.limit ?? 24;
  const pots = (p: Product, variants = p.variants) => variants.map((v) => potFor(p, v, categories, q));
  if (!query.trim()) {
    return [...visible].sort((a, b) => b.soldCount - a.soldCount).flatMap((p) => pots(p).filter((pot) => pot.state !== "out")).slice(0, limit);
  }
  const outcome = searchCatalog(query, visible, [...categories]);
  const flavors = outcome.chips.filter((c) => c.kind === "flavor").map((c) => c.id);
  return outcome.results.flatMap(({ product }) => {
    const chosen = flavors.length ? product.variants.filter((v) => flavors.includes(normalize(v.color ?? ""))) : [];
    return pots(product, chosen.length ? chosen : product.variants);
  }).slice(0, limit);
}
