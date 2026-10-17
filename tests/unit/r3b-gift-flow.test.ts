import { describe, expect, it } from "vitest";
import { getProduct } from "@/demo/engine/catalog";
import { choiceCandidates, choiceOptions, cleanOpenChoice, openChoiceAnchor, openChoiceLabel, validateGiftChoice } from "@/demo/engine/gift-choice";
import { applyGiftEvent, giftStatusLabel, recordFromGift, withGiftEvent } from "@/demo/engine/gift-status";
import { chooseGiftVariant } from "@/demo/engine/gift-receive";
import { defaultLockerCode, giftOptionsProblem, cleanGiftOptions } from "@/demo/engine/gift-options";
import { makeGiftCode, type Gift } from "@/demo/engine/gifts";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";

setDemoData(defaultDemoData());
const whey = getProduct("ionic-whey")!;
const v = (id: string) => whey.variants.find((x) => x.id === id)!;

describe("sabor y tamaño abiertos", () => {
  it("solo se abre lo que el producto tiene", () => {
    expect(choiceOptions(whey)).toEqual({ flavor: true, size: true });
    expect(choiceOptions(getProduct("overvolt-pre")!)).toEqual({ flavor: true, size: false });
    expect(choiceOptions(getProduct("creatina-monohidrato")!)).toEqual({ flavor: false, size: true });
    expect(cleanOpenChoice(getProduct("overvolt-pre")!, { flavor: true, size: true })).toEqual({ flavor: true });
    expect(cleanOpenChoice(getProduct("omega-3")!, { flavor: true })).toBeUndefined();
  });
  it("sabor abierto: mismo tamaño, cualquier sabor; tamaño abierto: se paga el más caro con stock", () => {
    const base = v("iw-vainilla-2lb");
    expect(choiceCandidates(whey, base, { flavor: true }).map((x) => x.id)).toEqual(["iw-chocolate-2lb", "iw-vainilla-2lb", "iw-frutilla-2lb", "iw-cookies-cream-2lb"]);
    expect(openChoiceAnchor(whey, base, { flavor: true }).id).toBe("iw-vainilla-2lb");
    expect(openChoiceAnchor(whey, base, { size: true }).id).toBe("iw-vainilla-5lb");
    // Frutilla 5 lb no tiene stock: con el tamaño abierto se ancla en el más caro que sí hay.
    expect(openChoiceAnchor(whey, v("iw-frutilla-2lb"), { size: true }).id).toBe("iw-frutilla-2lb");
    expect(openChoiceAnchor(whey, base, undefined)).toBe(base);
  });
  it("valida lo elegido: entre las posibles, sin costar más y con stock", () => {
    const anchor = v("iw-chocolate-2lb");
    expect(validateGiftChoice(whey, anchor, { flavor: true }, "iw-cookies-cream-2lb")).toMatchObject({ ok: true, variant: { id: "iw-cookies-cream-2lb" } });
    expect(validateGiftChoice(whey, anchor, { flavor: true }, "iw-chocolate-5lb")).toMatchObject({ ok: false, message: "Esa opción no está incluida en este regalo." });
    const big = v("iw-chocolate-5lb");
    expect(validateGiftChoice(whey, big, { flavor: true, size: true }, "iw-vainilla-2lb")).toMatchObject({ ok: true });
    expect(validateGiftChoice(whey, big, { flavor: true, size: true }, "iw-frutilla-5lb")).toMatchObject({ ok: false, message: expect.stringMatching(/sin stock/) });
    expect(validateGiftChoice(whey, anchor, undefined, "iw-vainilla-2lb")).toMatchObject({ ok: false });
  });
  it("rótulos sin precio para quien recibe", () => {
    expect(openChoiceLabel(v("iw-chocolate-2lb"), { flavor: true })).toBe("2 lb (907 g) · sabor a elección");
    expect(openChoiceLabel(v("iw-chocolate-2lb"), { size: true })).toBe("Chocolate · tamaño a elección");
    expect(openChoiceLabel(v("iw-chocolate-2lb"), { flavor: true, size: true })).toBe("Sabor y tamaño a elección");
  });
});

const gift: Gift = {
  code: makeGiftCode(() => 0.42), from: "Caro", to: "Juli", message: "", occasion: "volta", createdAt: "2026-10-05T12:00:00.000Z",
  item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "2 lb (907 g) · sabor a elección", variantId: "iw-chocolate-2lb" }, openChoice: { flavor: true },
};

describe("estado del regalo", () => {
  it("enviado → abierto → elegido → canjeado; nunca vuelve atrás", () => {
    const r0 = recordFromGift(gift);
    expect(r0).toMatchObject({ status: "enviado", kind: "producto", productSlug: "ionic-whey", openChoice: { flavor: true } });
    expect(applyGiftEvent(r0, { type: "redeem" }, "t")).toMatchObject({ ok: false });
    expect(applyGiftEvent(r0, { type: "choose", variantId: "x", label: "x" }, "t")).toMatchObject({ ok: false, message: "Primero hay que abrir el regalo." });
    const r1 = applyGiftEvent(r0, { type: "open" }, "t1");
    if (!r1.ok) throw new Error();
    expect(r1.record).toMatchObject({ status: "abierto", openedAt: "t1" });
    expect(applyGiftEvent(r1.record, { type: "open" }, "t9")).toEqual({ ok: true, record: r1.record });
    expect(applyGiftEvent(r1.record, { type: "redeem" }, "t")).toMatchObject({ ok: false, message: "Elegí primero el sabor o el tamaño." });
    const r2 = applyGiftEvent(r1.record, { type: "choose", variantId: "iw-vainilla-2lb", label: "Vainilla" }, "t2");
    if (!r2.ok) throw new Error();
    expect(giftStatusLabel(r2.record.status, r2.record.openChoice)).toBe("Sabor elegido");
    const r3 = applyGiftEvent(r2.record, { type: "redeem" }, "t3");
    if (!r3.ok) throw new Error();
    expect(r3.record).toMatchObject({ status: "canjeado", chosenLabel: "Vainilla", redeemedAt: "t3" });
    expect(applyGiftEvent(r3.record, { type: "choose", variantId: "x", label: "x" }, "t")).toMatchObject({ ok: false });
    expect(applyGiftEvent(r3.record, { type: "open" }, "t").ok && applyGiftEvent(r3.record, { type: "open" }, "t")).toMatchObject({ record: { status: "canjeado" } });
  });
  it("sin nada abierto se canjea al abrir y guardar; el registro se crea si llegó por link", () => {
    const fixed = { ...gift, code: "REGALO-T4M4-N0X2", openChoice: undefined };
    const opened = withGiftEvent([], fixed, { type: "open" }, "t1");
    expect(opened.records).toHaveLength(1);
    const done = withGiftEvent(opened.records, fixed, { type: "redeem" }, "t2");
    expect(done.records[0]).toMatchObject({ status: "canjeado" });
    expect(giftStatusLabel("elegido", { size: true })).toBe("Tamaño elegido");
  });
  it("elegir valida contra el catálogo y el stock de ese momento", () => {
    const data = defaultDemoData();
    expect(chooseGiftVariant(data, gift, "iw-vainilla-2lb", "t")).toMatchObject({ ok: true, variant: { id: "iw-vainilla-2lb" } });
    // Uno ya canjeado (de muestra) no se puede cambiar.
    expect(chooseGiftVariant(data, { ...gift, code: "REGALO-CH0C-01TT" }, "iw-vainilla-2lb", "t")).toMatchObject({ ok: false, message: "El regalo ya se canjeó." });
    const out = chooseGiftVariant(data, gift, "iw-vainilla-2lb", "t");
    if (!out.ok) throw new Error();
    expect(out.records.find((r) => r.code === gift.code)).toMatchObject({ status: "elegido", chosenVariantId: "iw-vainilla-2lb", openedAt: expect.any(String) });
    const empty = { ...data, products: data.products.map((p) => (p.slug === "ionic-whey" ? { ...p, variants: p.variants.map((x) => (x.id === "iw-vainilla-2lb" ? { ...x, stock: 0 } : x)) } : p)) };
    expect(chooseGiftVariant(empty, gift, "iw-vainilla-2lb", "t")).toMatchObject({ ok: false, message: expect.stringMatching(/sin stock/) });
  });
});

describe("opciones de quien regala", () => {
  it("el locker abre por defecto con el día y mes del regalo; la combinación son 4 números", () => {
    expect(defaultLockerCode("2026-10-05")).toBe("0510");
    expect(defaultLockerCode("2026-12-24T15:00:00.000Z")).toBe("2412");
    expect(giftOptionsProblem({ opening: "locker", lockerCode: "12a4" })).toMatch(/4 números/);
    expect(giftOptionsProblem({ opening: "bolsa" })).toBeNull();
    expect(cleanGiftOptions({ opening: "locker", lockerCode: "0510", cardDesign: "ring" })).toEqual({ opening: "locker", lockerCode: "0510", cardDesign: "ring" });
    expect(cleanGiftOptions({ opening: "bolsa", lockerCode: "0510", cardDesign: "nope" })).toEqual({ opening: "bolsa" });
  });
});
