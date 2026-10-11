import { describe, expect, it } from "vitest";
import { quoteCart } from "@/demo/engine/pricing";
import { validateCoupon } from "@/demo/engine/coupons";
import type { CartLine } from "@/demo/engine/cart-types";

const now = new Date("2026-10-04T12:00:00");
const bowl: CartLine = { id: "a", productSlug: "comedero-perro-globo", variantId: "cpg-rosa-g", quantity: 2 };
const engraved: CartLine = {
  id: "b", productSlug: "comedero-elevado-madera", variantId: "cem-natural", quantity: 1,
  personalization: { kind: "TEXT", text: "Ñoqui", approvedAt: now.toISOString() },
};

describe("precio", () => {
  it("suma variante y cantidad", () => {
    expect(quoteCart([bowl]).subtotal).toBe((18500 + 4500) * 2);
  });
  it("suma el recargo de personalización", () => {
    const q = quoteCart([engraved]);
    expect(q.subtotal).toBe(32000 + 2500);
    expect(q.personalizationTotal).toBe(2500);
  });
  it("aplica descuento por transferencia sobre subtotal menos cupón", () => {
    const c = validateCoupon("bienvenida10", { subtotal: 46000, isRegistered: false, now });
    if (!c.ok) throw new Error(c.message);
    const q = quoteCart([bowl], { coupon: c.coupon, paymentMethod: "BANK_TRANSFER", fulfillment: "PICKUP" });
    expect(q.couponDiscount).toBe(4600);
    expect(q.transferDiscount).toBe(Math.round((46000 - 4600) * 0.1));
    expect(q.total).toBe(46000 - 4600 - 4140);
  });
  it("envío gratis desde el umbral y retiro en 0", () => {
    const big: CartLine = { id: "c", productSlug: "velador-con-foto", variantId: "vcf-g", quantity: 2 };
    expect(quoteCart([big], { fulfillment: "SHIPPING" }).shippingCost).toBe(0);
    expect(quoteCart([bowl], { fulfillment: "SHIPPING" }).shippingCost).toBe(9800);
    expect(quoteCart([bowl], { fulfillment: "PICKUP" }).shippingCost).toBe(0);
  });
  it("el total nunca es negativo", () => {
    const tiny: CartLine = { id: "d", productSlug: "pieza-i-love-mdp", variantId: "mdp-unico", quantity: 1 };
    const fixed = { code: "X", type: "FIXED" as const, value: 999999, description: "" };
    expect(quoteCart([tiny], { coupon: fixed }).total).toBe(0);
  });
});

describe("cupones", () => {
  it("rechaza vencidos, inexistentes y los que exigen cuenta", () => {
    expect(validateCoupon("INVIERNO", { subtotal: 50000, isRegistered: true, now }).ok).toBe(false);
    expect(validateCoupon("NOEXISTE", { subtotal: 50000, isRegistered: true, now }).ok).toBe(false);
    expect(validateCoupon("ENVIOGRATIS", { subtotal: 50000, isRegistered: false, now }).ok).toBe(false);
    expect(validateCoupon("ENVIOGRATIS", { subtotal: 50000, isRegistered: true, now }).ok).toBe(true);
  });
  it("respeta el mínimo de compra", () => {
    expect(validateCoupon("FERIA2000", { subtotal: 10000, isRegistered: false, now }).ok).toBe(false);
    expect(validateCoupon(" feria 2000 ", { subtotal: 20000, isRegistered: false, now }).ok).toBe(true);
  });
});
