import type { Coupon, FulfillmentType, PaymentMethod } from "../types";
import type { CartLine } from "./cart-types";
import { getProduct, unitPrice, personalizationSurcharge } from "./catalog";
import { couponDiscount } from "./coupons";
import { demoData } from "./source";

/**
 * Cotización VISUAL de la demo. En producción el servidor recalcula todo al confirmar
 * (spec 5.1); el precio del navegador nunca se usa para cobrar.
 */
export interface QuotedLine {
  line: CartLine;
  unitPrice: number;
  lineTotal: number;
  surcharge: number;
}

export interface Quote {
  lines: QuotedLine[];
  units: number;
  subtotal: number;
  personalizationTotal: number;
  couponDiscount: number;
  transferDiscount: number;
  shippingCost: number | null;
  freeShippingApplied: boolean;
  total: number;
}

export interface QuoteOptions {
  coupon?: Coupon | null;
  paymentMethod?: PaymentMethod | null;
  fulfillment?: FulfillmentType | null;
}

export function quoteLines(lines: CartLine[]): QuotedLine[] {
  return lines.flatMap((line) => {
    const product = getProduct(line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) return [];
    const price = unitPrice(product, variant, Boolean(line.personalization), line.personalization?.collar);
    const surcharge = personalizationSurcharge(product, Boolean(line.personalization), line.personalization?.collar);
    return [{ line, unitPrice: price, lineTotal: price * line.quantity, surcharge: surcharge * line.quantity }];
  });
}

export function shippingFor(fulfillment: FulfillmentType | null | undefined): number | null {
  if (!fulfillment) return null;
  return demoData().zones.find((z) => z.type === fulfillment)?.price ?? null;
}

export function quoteCart(lines: CartLine[], options: QuoteOptions = {}): Quote {
  const quoted = quoteLines(lines);
  const subtotal = quoted.reduce((sum, q) => sum + q.lineTotal, 0);
  const personalizationTotal = quoted.reduce((sum, q) => sum + q.surcharge, 0);
  const settings = demoData().settings;
  const coupon = options.coupon ?? null;
  const discount = couponDiscount(coupon, subtotal);
  const manual = options.paymentMethod === "BANK_TRANSFER" || options.paymentMethod === "QR_MANUAL";
  const transferDiscount = manual ? Math.round(((subtotal - discount) * settings.transferDiscountPct) / 100) : 0;
  const baseShipping = shippingFor(options.fulfillment);
  const freeShippingApplied =
    baseShipping !== null && baseShipping > 0 && (coupon?.type === "FREE_SHIPPING" || subtotal >= settings.freeShippingFrom);
  const shippingCost = baseShipping === null ? null : freeShippingApplied ? 0 : baseShipping;
  const total = Math.max(0, subtotal - discount - transferDiscount + (shippingCost ?? 0));
  return {
    lines: quoted,
    units: quoted.reduce((sum, q) => sum + q.line.quantity, 0),
    subtotal,
    personalizationTotal,
    couponDiscount: discount,
    transferDiscount,
    shippingCost,
    freeShippingApplied,
    total,
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
