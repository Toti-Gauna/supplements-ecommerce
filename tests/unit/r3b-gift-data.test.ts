import { describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { giftCardRows, giftCardStats, giftRecordRows, giftStatusCounts } from "@/demo/admin/gift-views";
import { migrateAdminData } from "@/demo/admin/migrate";
import { withGiftData } from "@/demo/admin/migrate-gifts";
import { giftCardsFromCart, giftsFromLines } from "@/demo/engine/gift-build";
import { normalizeGiftCardCode } from "@/demo/engine/gift-cards";
import { decodeGift, encodeGift } from "@/demo/engine/gift-link";
import { normalizeGiftCode } from "@/demo/engine/gifts";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { sampleGiftCards, sampleGiftRecords } from "@/demo/fixtures/gift-cards";
import { ADMIN_STORE_VERSION } from "@/stores/storage";

const seq = (values: number[]) => { let i = 0; return () => values[i++ % values.length]!; };
const ctx = { orderCode: "VOL-1", now: new Date("2026-10-05T15:00:00.000Z"), eta: "2026-10-08", random: seq([0.1, 0.7, 0.3, 0.9, 0.5]) };
const sender = { to: "Juli", from: "Caro", message: "¡Dale!", occasion: "volta" as const };

describe("del carrito a los regalos (R3b)", () => {
  setDemoData(defaultDemoData());
  it("producto con sabor abierto: guarda lo abierto, la variante pagada y un rótulo sin precio", () => {
    const lines = [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1, gift: { ...sender, openChoice: { flavor: true, size: false }, opening: "locker" as const, lockerCode: "0510", cardDesign: "ring" } }];
    const [g] = giftsFromLines(lines, ctx);
    expect(g).toMatchObject({ openChoice: { flavor: true }, opening: "locker", lockerCode: "0510", cardDesign: "ring", item: { variant: "2 lb (907 g) · sabor a elección", variantId: "iw-chocolate-2lb", detail: "30 servicios" } });
    expect(JSON.stringify(g)).not.toMatch(/price|precio|54900/);
  });
  it("lo abierto que el producto no tiene se descarta", () => {
    const [g] = giftsFromLines([{ id: "a", productSlug: "omega-3", variantId: "o3-60", quantity: 1, gift: { ...sender, openChoice: { flavor: true } } }], ctx);
    expect(g!.openChoice).toBeUndefined();
  });
  it("las líneas de un pack marcadas como regalo son un solo regalo (stack) con todos sus productos", () => {
    const lines = ["creatina-monohidrato:cm-sin-sabor-300", "overvolt-pre:ov-limon-300"].map((s, i) => { const [p, v] = s.split(":"); return { id: `l${i}`, productSlug: p!, variantId: v!, quantity: 1, packId: "fuerza", gift: sender }; });
    const gifts = giftsFromLines([...lines, { id: "x", productSlug: "omega-3", variantId: "o3-60", quantity: 1 }], { ...ctx, packs: defaultDemoData().packs });
    expect(gifts).toHaveLength(1);
    expect(gifts[0]).toMatchObject({ kind: "stack", item: { name: "Pack Fuerza", variant: "2 productos" }, items: [{ slug: "creatina-monohidrato" }, { slug: "overvolt-pre" }] });
  });
  it("cada gift card del carrito se emite (código, 12 meses) y viaja en su regalo con el monto", () => {
    const { gifts, records } = giftCardsFromCart([{ id: "c", amount: 25_000, gift: { ...sender, cardDesign: "podio" } }, { id: "bad", amount: 10, gift: sender }], ctx);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ amount: 25_000, balance: 25_000, issuedAt: "2026-10-05", expires: "2027-10-05", from: "Caro", to: "Juli", orderCode: "VOL-1" });
    expect(normalizeGiftCardCode(records[0]!.code)).toBe(records[0]!.code);
    expect(gifts[0]).toMatchObject({ kind: "gift-card", cardDesign: "podio", giftCard: { amount: 25_000, code: records[0]!.code, expires: "2027-10-05", balance: 25_000 } });
    expect(records[0]!.giftCode).toBe(gifts[0]!.code);
    expect(normalizeGiftCode(gifts[0]!.code)).toBe(gifts[0]!.code);
  });
});

describe("link v2", () => {
  it("lleva tipo, opciones, lo abierto, el stack y la gift card; vuelve igual", () => {
    setDemoData(defaultDemoData());
    const [product] = giftsFromLines([{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-5lb", quantity: 1, gift: { ...sender, openChoice: { flavor: true, size: true }, opening: "locker", lockerCode: "1234", cardDesign: "tiza" } }], ctx);
    expect(decodeGift(encodeGift(product!))).toEqual({ ...product, toEmail: undefined, orderCode: undefined, createdAt: "2026-10-05T12:00:00.000Z" });
    const { gifts } = giftCardsFromCart([{ id: "c", amount: 40_000, gift: sender }], ctx);
    const back = decodeGift(encodeGift(gifts[0]!))!;
    expect(back).toMatchObject({ kind: "gift-card", giftCard: gifts[0]!.giftCard });
  });
  it("un link v2 con la gift card rota o un locker inválido no abre o descarta lo inválido", () => {
    const { gifts } = giftCardsFromCart([{ id: "c", amount: 40_000, gift: sender }], ctx);
    const broken = { ...gifts[0]!, giftCard: { ...gifts[0]!.giftCard!, code: "GIFT-AAAA-AAAA" } };
    expect(decodeGift(encodeGift(broken))).toBeNull();
    const odd = decodeGift(encodeGift({ ...gifts[0]!, opening: "locker", lockerCode: "12" }))!;
    expect(odd.lockerCode).toBeUndefined();
  });
});

describe("v17: gift cards y regalos en un panel guardado", () => {
  const savedV16 = (): AdminData => { const base = defaultAdminData(); const data = { ...base.data } as Partial<AdminData["data"]>; delete data.giftCards; delete data.giftRecords; return { ...base, data: data as AdminData["data"] }; };
  it("la versión sube a 17 (o más) y la migración suma las de muestra", () => {
    expect(ADMIN_STORE_VERSION).toBeGreaterThanOrEqual(17);
    const out = migrateAdminData(savedV16(), 16).data!;
    expect(out.giftCards).toHaveLength(sampleGiftCards.length);
    expect(out.giftRecords).toHaveLength(sampleGiftRecords.length);
  });
  it("conserva lo emitido desde la tienda sin repetir códigos y no se repite desde v17", () => {
    const mine = { ...sampleGiftCards[0]!, balance: 100 };
    const saved = savedV16();
    const withMine = { ...saved, data: { ...saved.data, giftCards: [mine] } };
    const out = withGiftData(withMine).data!;
    expect(out.giftCards.filter((c) => c.code === mine.code)).toEqual([mine]);
    expect(out.giftCards).toHaveLength(sampleGiftCards.length);
    expect(migrateAdminData(withMine, 17).data!.giftCards).toEqual([mine]);
  });
});

describe("panel → regalos", () => {
  it("números de las gift cards: emitidas, saldo vivo, canjeado, vencidas y por vencer", () => {
    const stats = giftCardStats(sampleGiftCards, "2026-10-05");
    expect(stats).toEqual({ issued: 5, issuedAmount: 160_000, outstanding: 106_600, redeemedAmount: 33_400, redeemedCount: 2, expiringSoon: 0, expired: 1 });
    expect(giftCardStats(sampleGiftCards, "2027-09-01").expiringSoon).toBe(2);
    const rows = giftCardRows(sampleGiftCards, "2026-10-05");
    expect(rows[0]!.card.issuedAt >= rows[1]!.card.issuedAt).toBe(true);
    expect(rows.find((r) => r.card.code === "GIFT-VENC-1D4N")).toMatchObject({ status: "vencida", daysLeft: -15 });
  });
  it("regalos con su estado y lo que eligió quien lo recibió", () => {
    const rows = giftRecordRows(sampleGiftRecords);
    expect(rows.find((r) => r.record.code === "REGALO-CH0C-01TT")).toMatchObject({ statusLabel: "Canjeado", choice: "Cookies & cream · 2 lb (907 g)" });
    expect(rows.find((r) => r.record.code === "REGALO-T4M4-N0X2")).toMatchObject({ statusLabel: "Sabor y tamaño elegidos", step: 2 });
    expect(rows.find((r) => r.record.code === "REGALO-SAB0-R01D")!.choice).toBe("Falta elegir");
    expect(rows.find((r) => r.record.code === "REGALO-P3XE-1KCP")!.choice).toBe("—");
    expect(giftStatusCounts(sampleGiftRecords)).toEqual({ enviado: 2, abierto: 1, elegido: 1, canjeado: 4 });
  });
});
