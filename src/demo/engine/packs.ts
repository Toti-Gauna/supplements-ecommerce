import type { Pack, PackItem, Product, Variant } from "../types";
import type { CartLine } from "./cart-types";
import { getProduct, isGear, unitPrice } from "./catalog";
import { daysLasting } from "./servings";

/**
 * Packs (L3). Reglas puras, en pesos enteros. Un pack es una lista de productos con un descuento por llevarlos juntos
 * y un extra por recibirlos todos los meses. Los suplementos se repiten cada mes; el equipamiento (no se consume)
 * viaja solo en la primera entrega. El descuento del pack vale solo si el pack está completo en el carrito.
 */

export interface PackLineView {
  item: PackItem;
  product: Product;
  variant: Variant;
  unitPrice: number;
  lineTotal: number;
  /** Se repite todos los meses (suplementos). El equipamiento va solo en la primera entrega. */
  recurring: boolean;
}

export interface PackQuote {
  pack: Pack;
  lines: PackLineView[];
  /** Algún producto no existe, está pausado o sin stock: no se puede comprar. */
  available: boolean;
  /** Nombres de lo que falta, para avisar. */
  missing: string[];
  subtotal: number;
  discount: number;
  /** Primera entrega (todo el pack) con el descuento por llevarlo junto. */
  price: number;
  /** Cada mes (solo suplementos) con los dos descuentos. */
  monthlySubtotal: number;
  monthlyPrice: number;
  /** Lo que se ahorra por mes frente a comprar lo mismo suelto. */
  monthlySaving: number;
  /** Días que dura lo que se repite cada mes (el que se termina primero), a un servicio por día. null si no informa servicios. */
  lastsDays: number | null;
}

const pct = (amount: number, p: number) => Math.round((amount * p) / 100);

/** La variante de un producto del pack: la pedida si tiene stock; si no, la primera con stock. */
export function resolveVariant(product: Product, item: PackItem, choices?: Record<string, string>): Variant | undefined {
  const wanted = choices?.[item.productSlug] ?? item.variantId;
  const inStock = (v: Variant) => v.stock !== 0;
  return product.variants.find((v) => v.id === wanted && inStock(v)) ?? product.variants.find(inStock);
}

export function quotePack(pack: Pack, choices?: Record<string, string>): PackQuote {
  const lines: PackLineView[] = [];
  const missing: string[] = [];
  for (const item of pack.items) {
    const product = getProduct(item.productSlug);
    const variant = product && product.active !== false ? resolveVariant(product, item, choices) : undefined;
    if (!product || !variant) { missing.push(product?.name ?? item.productSlug); continue; }
    const price = unitPrice(product, variant);
    lines.push({ item, product, variant, unitPrice: price, lineTotal: price * item.qty, recurring: !isGear(product) });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const discount = pct(subtotal, pack.discountPct);
  const monthlySubtotal = lines.filter((l) => l.recurring).reduce((s, l) => s + l.lineTotal, 0);
  const monthlyPrice = monthlySubtotal - pct(monthlySubtotal, pack.discountPct + pack.monthlyPct);
  const durations = lines.filter((l) => l.recurring && (l.variant.servings ?? 0) > 1).map((l) => daysLasting((l.variant.servings ?? 0) * l.item.qty, 1));
  return {
    pack, lines, available: missing.length === 0 && lines.length > 0, missing,
    subtotal, discount, price: subtotal - discount,
    monthlySubtotal, monthlyPrice, monthlySaving: monthlySubtotal - monthlyPrice,
    lastsDays: durations.length ? Math.min(...durations) : null,
  };
}

/** Líneas del carrito de un pack. Con `monthlyDay`, la compra es una suscripción simulada. */
export function packCartLines(quote: PackQuote, monthlyDay?: number): Omit<CartLine, "id">[] {
  return quote.lines.map((l) => ({
    productSlug: l.product.slug, variantId: l.variant.id, quantity: l.item.qty, packId: quote.pack.id,
    ...(monthlyDay ? { monthlyDay } : {}),
  }));
}

export interface PackDiscountEntry {
  packId: string;
  name: string;
  /** Porcentaje aplicado (el del pack más el mensual si es suscripción). */
  pct: number;
  monthly: boolean;
  discount: number;
}

export interface PackDiscount {
  discount: number;
  entries: PackDiscountEntry[];
  /** Líneas del carrito (id) que quedaron dentro de un pack completo: no suman al descuento stack. */
  coveredLineIds: string[];
}

export const NO_PACK_DISCOUNT: PackDiscount = { discount: 0, entries: [], coveredLineIds: [] };

/**
 * Descuento de los packs del carrito. Un pack cuenta solo si están todos sus productos (con su cantidad): si falta uno,
 * no hay descuento. `quoted` trae el total de cada línea ya cotizado; `packs` es el catálogo de packs vigente.
 */
export function packDiscount(quoted: { line: CartLine; lineTotal: number }[], packs: Pack[]): PackDiscount {
  const byPack = new Map<string, typeof quoted>();
  for (const q of quoted) if (q.line.packId) byPack.set(q.line.packId, [...(byPack.get(q.line.packId) ?? []), q]);
  const result: PackDiscount = { discount: 0, entries: [], coveredLineIds: [] };
  for (const [packId, group] of byPack) {
    const pack = packs.find((p) => p.id === packId);
    if (!pack || pack.active === false) continue;
    const complete = pack.items.every((it) => group.filter((g) => g.line.productSlug === it.productSlug).reduce((s, g) => s + g.line.quantity, 0) >= it.qty);
    if (!complete) continue;
    const monthly = group.some((g) => g.line.monthlyDay !== undefined);
    const rate = pack.discountPct + (monthly ? pack.monthlyPct : 0);
    const base = group.reduce((s, g) => s + g.lineTotal, 0);
    const discount = pct(base, rate);
    result.discount += discount;
    result.entries.push({ packId, name: pack.name, pct: rate, monthly, discount });
    result.coveredLineIds.push(...group.map((g) => g.line.id));
  }
  return result;
}

/** Lo que falta para completar un pack en el carrito (nombres de producto), o [] si está completo o no hay pack. */
export function packMissingItems(lines: CartLine[], pack: Pack): string[] {
  const group = lines.filter((l) => l.packId === pack.id);
  if (!group.length) return [];
  return pack.items
    .filter((it) => group.filter((l) => l.productSlug === it.productSlug).reduce((s, l) => s + l.quantity, 0) < it.qty)
    .map((it) => getProduct(it.productSlug)?.name ?? it.productSlug);
}

/** Validación del pack para guardarlo desde el panel: devuelve los errores en español. */
export function validatePack(pack: Pack, others: Pack[]): string[] {
  const errors: string[] = [];
  if (!pack.name.trim()) errors.push("El pack necesita un nombre.");
  if (others.some((o) => o.id !== pack.id && o.name.trim().toLowerCase() === pack.name.trim().toLowerCase())) errors.push("Ya hay un pack con ese nombre.");
  if (pack.items.length < 2) errors.push("Un pack lleva al menos dos productos.");
  const slugs = pack.items.map((i) => i.productSlug);
  if (new Set(slugs).size !== slugs.length) errors.push("Un producto no puede estar dos veces en el mismo pack.");
  if (pack.items.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 5)) errors.push("La cantidad de cada producto es de 1 a 5.");
  if (!pack.items.some((i) => { const p = getProduct(i.productSlug); return p && !isGear(p); })) errors.push("Para un pack mensual hace falta al menos un suplemento (el equipamiento no se repite).");
  for (const [label, value, max] of [["El descuento del pack", pack.discountPct, 40], ["El extra mensual", pack.monthlyPct, 20]] as const) {
    if (!Number.isFinite(value) || value < 0 || value > max) errors.push(`${label} va de 0 a ${max} %.`);
  }
  return errors;
}

/** Slug (id) de un pack nuevo a partir de su nombre, sin repetir los existentes. */
export function packId(name: string, existing: Pack[]): string {
  const base = name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pack";
  let id = base;
  for (let n = 2; existing.some((p) => p.id === id); n++) id = `${base}-${n}`;
  return id;
}
