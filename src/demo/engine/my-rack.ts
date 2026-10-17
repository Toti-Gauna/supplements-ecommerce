import { STACK_SLOTS } from "../fixtures/stack-builder";
import type { Product, Variant } from "../types";
import { rackFacts } from "./rack";
import { DEFAULT_STACK_RULE, stackDiscount, type StackResult, type StackRule } from "./stack";
import { encodeStack, type StackPick } from "./stack-builder";

/**
 * "Mi rack" (R2c): los favoritos como el estante propio. Cada pote con la presentación que manda en su tarjeta (la de
 * mejor precio por servicio entre las que hay), el total de lo que se puede llevar hoy con el descuento stack que
 * tendría en el carrito, y el pasaje al armador. Puro; en producción lo calcula el servidor con la misma regla.
 */
export interface MyRackItem {
  product: Product;
  variant: Variant;
  price: number;
  perServing: number | null;
  servings: number | null;
  /** Hay stock o se trae a pedido: entra en "Agregar todo". */
  available: boolean;
}

export interface MyRackSummary {
  items: MyRackItem[];
  /** Lo que entra en "Agregar todo" (una unidad de cada uno). */
  buyable: MyRackItem[];
  subtotal: number;
  stack: StackResult;
  total: number;
}

/** Los favoritos que siguen en la tienda (los borrados o desactivados en el panel no se muestran). */
export function rackProducts(slugs: string[], catalog: Product[]): Product[] {
  return slugs.flatMap((s) => catalog.find((p) => p.slug === s && p.active !== false) ?? []);
}

export function myRackSummary(slugs: string[], catalog: Product[], rule: StackRule = DEFAULT_STACK_RULE): MyRackSummary {
  const items = rackProducts(slugs, catalog).map((product): MyRackItem => {
    const f = rackFacts(product);
    const servings = (f.lead.servings ?? 0) > 1 ? f.lead.servings! : null;
    return { product, variant: f.lead, price: f.price, perServing: servings ? f.perServing : null, servings, available: f.buyable.length > 0 };
  });
  const buyable = items.filter((i) => i.available);
  const subtotal = buyable.reduce((s, i) => s + i.price, 0);
  const stack = stackDiscount(buyable.map((i) => ({ product: i.product, lineTotal: i.price })), rule);
  return { items, buyable, subtotal, stack, total: subtotal - stack.discount };
}

export interface RackStack {
  /** Un favorito por lugar del estante, en el orden del armador. */
  picks: StackPick[];
  /** Los que no entran: equipamiento, sin stock o con su lugar ya ocupado por otro favorito anterior. */
  left: Product[];
}

/**
 * Del rack al armador: cada favorito va al lugar del estante que admite su categoría (base, creatina, pre-entreno o
 * extra); si dos compiten por el mismo lugar, gana el que se guardó primero en la lista. Solo presentaciones con stock.
 */
export function rackToStack(slugs: string[], catalog: Product[]): RackStack {
  const picks: StackPick[] = [];
  const left: Product[] = [];
  for (const product of rackProducts(slugs, catalog)) {
    const slot = STACK_SLOTS.find((s) => s.categories.includes(product.categorySlug));
    const variant = rackFacts(product).lead;
    if (!slot || variant.stock === 0 || picks.some((p) => p.slot === slot.id)) left.push(product);
    else picks.push({ slot: slot.id, slug: product.slug, variantId: variant.id });
  }
  const order = (id: string) => STACK_SLOTS.findIndex((s) => s.id === id);
  return { picks: picks.sort((a, b) => order(a.slot) - order(b.slot)), left };
}

/** Link al armador con los favoritos en sus lugares, o null si ninguno entra. */
export function rackStackHref(slugs: string[], catalog: Product[]): string | null {
  const { picks } = rackToStack(slugs, catalog);
  return picks.length ? `/crear/?${encodeStack(null, picks)}` : null;
}
