import { beforeEach, describe, expect, it } from "vitest";
import { quoteCart } from "@/demo/engine/pricing";
import { validateCoupon } from "@/demo/engine/coupons";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import type { CartLine } from "@/demo/engine/cart-types";
import { engravingTemplate } from "@/demo/fixtures/templates";
import type { Product } from "@/demo/types";

const now = new Date("2026-10-04T12:00:00");
/** Creatina 500 g ($29.900 + $16.000) × 2 = $91.800: debajo del envío gratis ($120.000). */
const creatine: CartLine = { id: "a", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-500", quantity: 2 };

/** Ningún producto del catálogo se personaliza: el recargo se prueba con un shaker grabado armado acá. */
const engravedShaker: Product = {
  slug: "shaker-grabado", name: "Shaker grabado", short: "", description: "", categorySlug: "accesorios", brand: "VOLTA Lab",
  basePrice: 8900, art: "shaker", gallery: ["front"], faqs: [], featured: false, isNew: false, soldCount: 0, tags: [],
  variants: [{ id: "sg-grafito", label: "Grafito", priceDelta: 0, stock: 5 }],
  personalization: engravingTemplate,
};
const engraved: CartLine = {
  id: "b", productSlug: "shaker-grabado", variantId: "sg-grafito", quantity: 1,
  personalization: { kind: "TEXT", text: "Toti", approvedAt: now.toISOString() },
};

beforeEach(() => {
  const data = defaultDemoData();
  setDemoData({ ...data, products: [...data.products, engravedShaker] });
});

describe("precio", () => {
  it("suma variante y cantidad", () => {
    expect(quoteCart([creatine]).subtotal).toBe((29900 + 16000) * 2);
  });
  it("suma el recargo de personalización", () => {
    const q = quoteCart([engraved]);
    expect(q.subtotal).toBe(8900 + 2500);
    expect(q.personalizationTotal).toBe(2500);
  });
  it("aplica descuento por transferencia sobre subtotal menos cupón", () => {
    const c = validateCoupon("bienvenida10", { subtotal: 91800, isRegistered: false, now });
    if (!c.ok) throw new Error(c.message);
    const q = quoteCart([creatine], { coupon: c.coupon, paymentMethod: "BANK_TRANSFER", fulfillment: "PICKUP" });
    expect(q.couponDiscount).toBe(9180);
    expect(q.transferDiscount).toBe(Math.round((91800 - 9180) * 0.1));
    expect(q.total).toBe(91800 - 9180 - 8262);
  });
  it("envío gratis desde el umbral y retiro en 0", () => {
    const big: CartLine = { id: "c", productSlug: "isolate-zero", variantId: "iz-chocolate-2lb", quantity: 2 };
    expect(quoteCart([big], { fulfillment: "SHIPPING" }).shippingCost).toBe(0);
    expect(quoteCart([creatine], { fulfillment: "SHIPPING" }).shippingCost).toBe(9800);
    expect(quoteCart([creatine], { fulfillment: "PICKUP" }).shippingCost).toBe(0);
  });
  it("el total nunca es negativo", () => {
    const tiny: CartLine = { id: "d", productSlug: "magnesio-tiza", variantId: "mt-56", quantity: 1 };
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
