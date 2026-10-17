import { describe, expect, it } from "vitest";
import {
  GIFT_CARD_RULES, addMonths, checkGiftCard, giftCardAmountProblem, giftCardApplicable, giftCardStatus, issueGiftCard, makeGiftCardCode,
  normalizeGiftCardCode, redeemGiftCard, type GiftCardRecord,
} from "@/demo/engine/gift-cards";
import { spendGiftCard } from "@/demo/engine/gift-receive";
import { quoteCart } from "@/demo/engine/pricing";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { DEMO_GIFT_CARD, sampleGiftCards, sampleGiftRecords } from "@/demo/fixtures/gift-cards";

const seq = (values: number[]) => { let i = 0; return () => values[i++ % values.length]!; };
const card = (over: Partial<GiftCardRecord> = {}): GiftCardRecord => ({ ...issueGiftCard({ amount: 25_000, code: makeGiftCardCode(seq([0.3, 0.6])), today: "2026-10-05", from: "Lu", to: "Sofi" })!, ...over });

describe("gift card: monto y vencimiento", () => {
  it("pide pesos enteros entre el mínimo y el máximo, en múltiplos de $ 500", () => {
    expect(giftCardAmountProblem(25_000)).toBeNull();
    for (const preset of GIFT_CARD_RULES.presets) expect(giftCardAmountProblem(preset)).toBeNull();
    expect(giftCardAmountProblem(2_000)).toMatch(/mínimo/);
    expect(giftCardAmountProblem(900_000)).toMatch(/máximo/);
    expect(giftCardAmountProblem(10_250)).toMatch(/múltiplo/);
    expect(giftCardAmountProblem(10_000.5)).toMatch(/sin centavos/);
    expect(giftCardAmountProblem(-5_000)).toMatch(/sin centavos/);
  });
  it("vence a los 12 meses, y un 31 cae en el último día del mes", () => {
    expect(addMonths("2026-10-05", 12)).toBe("2027-10-05");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2027-12-15", 3)).toBe("2028-03-15");
    expect(card().expires).toBe("2027-10-05");
  });
  it("emite con todo el saldo y un código válido; un monto inválido no emite", () => {
    const c = card();
    expect(c).toMatchObject({ amount: 25_000, balance: 25_000, issuedAt: "2026-10-05", redemptions: [] });
    expect(normalizeGiftCardCode(c.code.toLowerCase().replace(/-/g, ""))).toBe(c.code);
    expect(issueGiftCard({ amount: 100, code: c.code, today: "2026-10-05", from: "a", to: "b" })).toBeNull();
    expect(issueGiftCard({ amount: 10_000, code: "GIFT-AAAA-AAAA", today: "2026-10-05", from: "a", to: "b" })).toBeNull();
  });
  it("estado: sin usar, con saldo, usada completa y vencida (por la fecha de la demo)", () => {
    expect(giftCardStatus(card(), "2026-10-05")).toBe("activa");
    expect(giftCardStatus(card({ balance: 100 }), "2026-10-05")).toBe("en-uso");
    expect(giftCardStatus(card({ balance: 0 }), "2026-10-05")).toBe("agotada");
    expect(giftCardStatus(card(), "2027-10-05")).toBe("activa");
    expect(giftCardStatus(card(), "2027-10-06")).toBe("vencida");
  });
});

describe("gift card: canje", () => {
  it("valida el código, la existencia, el vencimiento y el saldo", () => {
    expect(checkGiftCard(sampleGiftCards, DEMO_GIFT_CARD.toLowerCase(), "2026-10-05")).toMatchObject({ ok: true });
    expect(checkGiftCard(sampleGiftCards, "GIFT-1234", "2026-10-05")).toMatchObject({ ok: false, message: expect.stringMatching(/Revisá/) });
    expect(checkGiftCard(sampleGiftCards, makeGiftCardCode(seq([0.9])), "2026-10-05")).toMatchObject({ ok: false, message: "No encontramos esa gift card." });
    expect(checkGiftCard(sampleGiftCards, "GIFT-VENC-1D4N", "2026-10-05")).toMatchObject({ ok: false, message: expect.stringMatching(/venció el 20\/09\/2026/) });
    expect(checkGiftCard(sampleGiftCards, "GIFT-B0XE-0R46", "2026-10-05")).toMatchObject({ ok: false, message: expect.stringMatching(/sin saldo|no tiene saldo/) });
  });
  it("usa hasta el saldo y hasta lo que hay que pagar, nunca negativo", () => {
    expect(giftCardApplicable(6_600, 50_000)).toBe(6_600);
    expect(giftCardApplicable(25_000, 12_000)).toBe(12_000);
    expect(giftCardApplicable(-5, 100)).toBe(0);
    const once = redeemGiftCard(card(), { orderCode: "VOL-1", amount: 40_000, at: "t", today: "2026-10-05" });
    expect(once).toMatchObject({ ok: true, used: 25_000 });
    if (!once.ok) throw new Error();
    expect(once.card.balance).toBe(0);
    expect(redeemGiftCard(once.card, { orderCode: "VOL-2", amount: 1_000, at: "t", today: "2026-10-05" })).toMatchObject({ ok: false });
  });
  it("es idempotente por compra: repetir el mismo pedido no descuenta dos veces", () => {
    const first = redeemGiftCard(card(), { orderCode: "VOL-1", amount: 10_000, at: "a", today: "2026-10-05", key: "k1" });
    if (!first.ok) throw new Error();
    const again = redeemGiftCard(first.card, { orderCode: "VOL-1", amount: 10_000, at: "b", today: "2026-10-05", key: "k1" });
    expect(again).toMatchObject({ ok: true, used: 10_000 });
    if (!again.ok) throw new Error();
    expect(again.card).toBe(first.card);
    const other = redeemGiftCard(first.card, { orderCode: "VOL-1", amount: 10_000, at: "c", today: "2026-10-05", key: "k2" });
    if (!other.ok) throw new Error();
    expect(other.card.balance).toBe(5_000);
    expect(other.card.redemptions).toHaveLength(2);
  });
  it("vencida no se usa", () => {
    expect(redeemGiftCard(card(), { orderCode: "VOL-1", amount: 1_000, at: "t", today: "2028-01-01" })).toMatchObject({ ok: false, message: expect.stringMatching(/vencida/) });
  });
  it("al usarla por primera vez su regalo queda canjeado", () => {
    const out = spendGiftCard({ giftCards: sampleGiftCards, giftRecords: sampleGiftRecords }, { code: "GIFT-EQV1-P0ZR", orderCode: "VOL-9", amount: 10_000, at: "2026-10-05T15:00:00.000Z", today: "2026-10-05" });
    expect(out.result).toMatchObject({ ok: true, used: 10_000 });
    expect(out.giftCards.find((c) => c.code === "GIFT-EQV1-P0ZR")!.balance).toBe(50_000);
    expect(out.giftRecords.find((r) => r.giftCardCode === "GIFT-EQV1-P0ZR")).toMatchObject({ status: "canjeado", redeemedAt: "2026-10-05T15:00:00.000Z" });
    expect(sampleGiftCards.find((c) => c.code === "GIFT-EQV1-P0ZR")!.balance).toBe(60_000);
  });
});

describe("precio con gift cards", () => {
  it("la gift card comprada suma sin descuentos ni envío; el saldo descuenta productos y envío", () => {
    setDemoData(defaultDemoData());
    const lines = [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }];
    const plain = quoteCart(lines, { fulfillment: "PICKUP" });
    const withCard = quoteCart(lines, { fulfillment: "PICKUP", giftCards: [25_000], giftCardBalance: 6_600, paymentMethod: "BANK_TRANSFER" });
    expect(withCard.giftCardSales).toBe(25_000);
    expect(withCard.giftCardUsed).toBe(6_600);
    expect(withCard.transferDiscount).toBe(quoteCart(lines, { fulfillment: "PICKUP", paymentMethod: "BANK_TRANSFER" }).transferDiscount);
    expect(withCard.total).toBe(plain.total - withCard.transferDiscount - 6_600 + 25_000);
    const big = quoteCart(lines, { fulfillment: "PICKUP", giftCardBalance: 999_000 });
    expect(big.giftCardUsed).toBe(plain.total);
    expect(big.total).toBe(0);
  });
  it("solo gift cards: no hay envío y el saldo de otra gift card no la paga", () => {
    setDemoData(defaultDemoData());
    const q = quoteCart([], { fulfillment: "SHIPPING", giftCards: [15_000, 40_000], giftCardBalance: 6_600 });
    expect(q).toMatchObject({ shippingCost: 0, giftCardSales: 55_000, giftCardUsed: 0, total: 55_000 });
  });
});
