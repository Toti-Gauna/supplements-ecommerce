import type { Coupon, FulfillmentType, Pack, PaymentMethod } from "../types";
import type { CartLine } from "./cart-types";
import { getProduct, unitPrice } from "./catalog";
import { couponDiscount } from "./coupons";
import { giftCardApplicable } from "./gift-cards";
import { demoData } from "./source";
import { NO_PACK_DISCOUNT, packDiscount, type PackDiscount } from "./packs";
import { DEFAULT_STACK_RULE, stackDiscount, type StackResult } from "./stack";

/**
 * Cotización VISUAL de la demo. En producción el servidor recalcula todo al confirmar
 * (spec 5.1); el precio del navegador nunca se usa para cobrar.
 */
export interface QuotedLine {
  line: CartLine;
  unitPrice: number;
  lineTotal: number;
}

export interface Quote {
  lines: QuotedLine[];
  units: number;
  subtotal: number;
  /** Descuento "stack" por llevar suplementos de varias categorías (ver engine/stack.ts). */
  stack: StackResult;
  /** Descuento de los packs completos del carrito (L3) y, si es suscripción, el extra mensual. */
  pack: PackDiscount;
  couponDiscount: number;
  transferDiscount: number;
  shippingCost: number | null;
  freeShippingApplied: boolean;
  /** Gift cards que se compran en este carrito (R3b): sin descuentos ni envío. */
  giftCardSales: number;
  /** Saldo de gift card usado en esta compra: un renglón de descuento, nunca un pago acreditado. */
  giftCardUsed: number;
  total: number;
}

export interface QuoteOptions {
  coupon?: Coupon | null;
  paymentMethod?: PaymentMethod | null;
  fulfillment?: FulfillmentType | null;
  /** Packs a medida del carrito (el programa del quiz, L4), además de los del catálogo. */
  packs?: Pack[];
  /** Montos de las gift cards que se compran (R3b). */
  giftCards?: number[];
  /** Saldo disponible de la gift card aplicada (ya validada con engine/gift-cards.ts). */
  giftCardBalance?: number;
}

export function quoteLines(lines: CartLine[]): QuotedLine[] {
  return lines.flatMap((line) => {
    const product = getProduct(line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) return [];
    const price = unitPrice(product, variant);
    return [{ line, unitPrice: price, lineTotal: price * line.quantity }];
  });
}

export function shippingFor(fulfillment: FulfillmentType | null | undefined): number | null {
  if (!fulfillment) return null;
  return demoData().zones.find((z) => z.type === fulfillment)?.price ?? null;
}

export function quoteCart(lines: CartLine[], options: QuoteOptions = {}): Quote {
  const quoted = quoteLines(lines);
  const subtotal = quoted.reduce((sum, q) => sum + q.lineTotal, 0);
  const settings = demoData().settings;
  // Lo que está en un pack completo tiene su propio descuento y no suma al stack (no se acumulan los dos).
  const pack = quoted.some((q) => q.line.packId) ? packDiscount(quoted, [...(demoData().packs ?? []), ...(options.packs ?? [])]) : NO_PACK_DISCOUNT;
  const covered = new Set(pack.coveredLineIds);
  const stackLines = quoted.flatMap((q) => { const product = getProduct(q.line.productSlug); return product && !covered.has(q.line.id) ? [{ product, lineTotal: q.lineTotal }] : []; });
  const stack = stackDiscount(stackLines, settings.stack ?? DEFAULT_STACK_RULE);
  // El cupón se calcula sobre lo que queda después del pack y del stack; la transferencia, sobre lo que queda después de todos.
  const afterStack = subtotal - stack.discount - pack.discount;
  const coupon = options.coupon ?? null;
  const discount = couponDiscount(coupon, afterStack);
  const manual = options.paymentMethod === "BANK_TRANSFER" || options.paymentMethod === "QR_MANUAL";
  const transferDiscount = manual ? Math.round(((afterStack - discount) * settings.transferDiscountPct) / 100) : 0;
  const baseShipping = shippingFor(options.fulfillment);
  const freeShippingApplied =
    baseShipping !== null && baseShipping > 0 && (coupon?.type === "FREE_SHIPPING" || subtotal >= settings.freeShippingFrom);
  // Solo gift cards (sin productos): no hay nada que enviar.
  const shippingCost = baseShipping === null ? null : freeShippingApplied || !quoted.length ? 0 : baseShipping;
  const goods = Math.max(0, afterStack - discount - transferDiscount + (shippingCost ?? 0));
  // El saldo de una gift card paga productos y envío, no otra gift card.
  const giftCardUsed = giftCardApplicable(options.giftCardBalance ?? 0, goods);
  const giftCardSales = (options.giftCards ?? []).reduce((sum, a) => sum + Math.max(0, Math.round(a)), 0);
  return {
    lines: quoted,
    units: quoted.reduce((sum, q) => sum + q.line.quantity, 0),
    subtotal,
    stack,
    pack,
    couponDiscount: discount,
    transferDiscount,
    shippingCost,
    freeShippingApplied,
    giftCardSales,
    giftCardUsed,
    total: goods - giftCardUsed + giftCardSales,
  };
}

export function missingForFreeShipping(subtotal: number): number {
  return Math.max(0, demoData().settings.freeShippingFrom - subtotal);
}

export function totalsOf(quote: Quote): Omit<Quote, "lines"> {
  const { lines, ...totals } = quote;
  void lines;
  return totals;
}
