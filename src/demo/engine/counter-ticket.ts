import type { Product } from "../types";
import { unitPrice } from "./catalog";
import { fefoTake, lineKey, type CounterLine, type LotTake } from "./counter";
import { DEFAULT_STACK_RULE, stackDiscount, type StackResult, type StackRule } from "./stack";

/**
 * Ticket del mostrador (R4b): cada pote a su precio (el de liquidación si su lote está liquidado), los lotes que salen
 * y el descuento stack con la misma regla de la tienda (`stack.ts`, sin duplicarla). Puro y testeado.
 */
export interface TicketRow {
  key: string;
  line: CounterLine;
  productName: string;
  variantLabel: string;
  categorySlug: string;
  unitPrice: number;
  total: number;
  /** Lotes que salen con esta línea (FEFO). */
  lots: LotTake[];
  /** Stock de la variante (-1 = a pedido): el tope de la cantidad. */
  stock: number;
  /** Unidades pedidas por encima del stock (0 si alcanza o es a pedido). */
  short: number;
}

export interface Ticket {
  rows: TicketRow[];
  units: number;
  subtotal: number;
  /** El mismo descuento stack de la tienda (`stack.ts`) con la regla de los ajustes. */
  stack: StackResult;
  total: number;
}

/** Ticket del mostrador: precio de cada pote (el de liquidación si su lote está liquidado) y el descuento stack. */
export function buildTicket(lines: readonly CounterLine[], products: readonly Product[], rule: StackRule = DEFAULT_STACK_RULE): Ticket {
  const rows = lines.flatMap((line): TicketRow[] => {
    const product = products.find((p) => p.slug === line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant || line.qty <= 0) return [];
    const price = unitPrice(product, variant);
    return [{
      key: lineKey(product.slug, variant.id), line, productName: product.name, variantLabel: variant.label, categorySlug: product.categorySlug,
      unitPrice: price, total: price * line.qty, lots: fefoTake(variant, line.qty), stock: variant.stock, short: variant.stock < 0 ? 0 : Math.max(0, line.qty - variant.stock),
    }];
  });
  const subtotal = rows.reduce((s, r) => s + r.total, 0);
  const stack = stackDiscount(rows.map((r) => ({ product: { slug: r.line.productSlug, categorySlug: r.categorySlug }, lineTotal: r.total })), rule);
  return { rows, units: rows.reduce((s, r) => s + r.line.qty, 0), subtotal, stack, total: subtotal - stack.discount };
}

/** Suma unidades de un pote al ticket (si ya está, suma a su línea). */
export function addLine(lines: readonly CounterLine[], productSlug: string, variantId: string, qty = 1): CounterLine[] {
  const key = lineKey(productSlug, variantId);
  if (!lines.some((l) => lineKey(l.productSlug, l.variantId) === key)) return [...lines, { productSlug, variantId, qty }];
  return lines.map((l) => (lineKey(l.productSlug, l.variantId) === key ? { ...l, qty: l.qty + qty } : l));
}

/** Cambia la cantidad de una línea; con 0 o menos, la saca. */
export function setLineQty(lines: readonly CounterLine[], key: string, qty: number): CounterLine[] {
  return qty <= 0 ? lines.filter((l) => lineKey(l.productSlug, l.variantId) !== key) : lines.map((l) => (lineKey(l.productSlug, l.variantId) === key ? { ...l, qty: Math.floor(qty) } : l));
}
