import { describe, expect, it } from "vitest";
import { quoteCart } from "@/demo/engine/pricing";
import { defaultDemoData } from "@/demo/engine/source";
import type { CartLine } from "@/demo/engine/cart-types";
import type { Coupon } from "@/demo/types";

/** Polish 8.2.10: con tarjeta no hay descuento por transferencia, y cupón + transferencia se aplican una sola vez. */
const lines: CartLine[] = [{ id: "a", productSlug: "comedero-perro-globo", variantId: "cpg-rosa-g", quantity: 2 }];
const coupon: Coupon = { code: "PRUEBA10", type: "PERCENT", value: 10 } as Coupon;
const pct = defaultDemoData().settings.transferDiscountPct;

describe("descuentos del checkout", () => {
  it("con tarjeta (Mercado Pago) solo el cupón; con transferencia o QR, el porcentaje sobre lo que queda", () => {
    const card = quoteCart(lines, { coupon, paymentMethod: "CHECKOUT_PRO", fulfillment: "PICKUP" });
    expect(card.transferDiscount).toBe(0);
    expect(card.total).toBe(card.subtotal - card.couponDiscount);
    for (const method of ["BANK_TRANSFER", "QR_MANUAL"] as const) {
      const manual = quoteCart(lines, { coupon, paymentMethod: method, fulfillment: "PICKUP" });
      expect(manual.couponDiscount).toBe(card.couponDiscount);
      expect(manual.transferDiscount).toBe(Math.round(((manual.subtotal - manual.couponDiscount) * pct) / 100));
      expect(manual.total).toBe(manual.subtotal - manual.couponDiscount - manual.transferDiscount);
    }
  });
  it("cambiar de medio de pago ida y vuelta no acumula descuentos", () => {
    const first = quoteCart(lines, { coupon, paymentMethod: "BANK_TRANSFER", fulfillment: "PICKUP" });
    quoteCart(lines, { coupon, paymentMethod: "CHECKOUT_PRO", fulfillment: "PICKUP" });
    const again = quoteCart(lines, { coupon, paymentMethod: "BANK_TRANSFER", fulfillment: "PICKUP" });
    expect(again).toEqual(first);
  });
});
