import { describe, expect, it } from "vitest";
import { glyphFor, shortValue } from "@/components/illustrations/RewardGlyph";
import { checkPrize, giftName, giftValue, makePrize, prizeDraft, prizeName, SAMPLE_VALUE, withPrizeCatalog } from "@/demo/admin/wheel-prizes";
import { prizeCoupon } from "@/demo/engine/wheel";
import { defaultDemoData } from "@/demo/engine/source";
import { defaultWheel, type WheelConfig } from "@/demo/fixtures/wheel";

/** Fase 4 · Ruleta "Disco olímpico": premios de suplementos (muestra y shaker de regalo) en lugar de los de Velmar. */
const { products } = defaultDemoData();
const prizes = defaultWheel.prizes!;
const shaker = products.find((p) => p.slug === "shaker-volta")!;
const now = new Date("2026-10-11T12:00:00Z");

describe("premios de suplementos de la ruleta", () => {
  it("la muestra es un monto fijo con el valor de un sachet y el shaker sale del catálogo", () => {
    expect(prizes.find((p) => p.id === "p-muestra")).toMatchObject({ template: "sample", name: "Muestra de regalo", kind: "FIXED", value: SAMPLE_VALUE });
    expect(prizes.find((p) => p.id === "p-shaker")).toMatchObject({ template: "gift", name: "Shaker VOLTA de regalo", kind: "FIXED", productSlug: "shaker-volta", minSubtotal: 30000 });
    // Los datos de muestra salen igual que si se crearan desde el panel.
    const fromPanel = makePrize({ ...prizeDraft("gift"), productSlug: "shaker-volta", minSubtotal: 30000 }, products, "p-shaker");
    expect(prizes.find((p) => p.id === "p-shaker")).toEqual(fromPanel);
    expect(fromPanel.value).toBe(giftValue(shaker));
    expect(makePrize(prizeDraft("sample"), products, "p-muestra")).toEqual(prizes.find((p) => p.id === "p-muestra"));
  });

  it("no quedan premios de Velmar (grabado ni llavero)", () => {
    expect(prizes.some((p) => /grabado|llavero/i.test(p.name))).toBe(false);
    expect(defaultWheel.segments.some((s) => /grabado|llavero/i.test(s.label))).toBe(false);
  });

  it("el nombre del regalo deja afuera la medida del producto", () => {
    expect(giftName("Shaker VOLTA 700 ml")).toBe("Shaker VOLTA");
    expect(giftName("Mass Gainer 3 kg")).toBe("Mass Gainer");
    expect(giftName("Omega 3 1000 mg")).toBe("Omega 3");
    expect(giftName("BCAA 2:1:1")).toBe("BCAA 2:1:1");
    expect(prizeName({ ...prizeDraft("gift"), productSlug: "shaker-volta" }, products)).toBe("Shaker VOLTA de regalo");
    expect(prizeName(prizeDraft("sample"), products)).toBe("Muestra de regalo");
  });

  it("la muestra se valida como un monto: entero mayor a 0 y sin repetir la misma compra mínima", () => {
    expect(checkPrize({ ...prizeDraft("sample"), value: 0 }, products, prizes)).toHaveProperty("value");
    expect(checkPrize({ ...prizeDraft("sample"), value: 1500.5 }, products, prizes)).toHaveProperty("value");
    expect(checkPrize(prizeDraft("sample"), products, prizes)).toHaveProperty("template");
    expect(checkPrize({ ...prizeDraft("sample"), minSubtotal: 15000 }, products, prizes)).toEqual({});
    expect(makePrize({ ...prizeDraft("sample"), value: 1800 }, products, "p-x")).toEqual({ id: "p-x", template: "sample", name: "Muestra de regalo", kind: "FIXED", value: 1800 });
  });

  it("una ruleta sin catálogo reconoce la muestra y el producto de regalo por su nombre", () => {
    const old: WheelConfig = { active: true, validDays: 7, segments: defaultWheel.segments.map(({ prizeId: _p, ...s }) => { void _p; return s; }) };
    const w = withPrizeCatalog(old);
    expect(w.prizes!.find((p) => p.name === "Muestra de regalo")?.template).toBe("sample");
    expect(w.prizes!.find((p) => p.name === "Shaker VOLTA de regalo")?.template).toBe("gift");
  });

  it("cada premio se entrega como cupón de un uso que el carrito entiende", () => {
    const sample = defaultWheel.segments.find((s) => s.id === "wmuestra")!;
    const gift = defaultWheel.segments.find((s) => s.id === "wshaker")!;
    expect(prizeCoupon(sample, "m1", now, 7)).toMatchObject({ type: "FIXED", value: 2500, description: "Ruleta: Muestra de regalo", maxUses: 1, endsAt: "2026-10-18" });
    expect(prizeCoupon(gift, "s1", now, 7)).toMatchObject({ type: "FIXED", value: giftValue(shaker), minSubtotal: 30000, description: "Ruleta: Shaker VOLTA de regalo desde $30.000" });
  });

  it("el ícono y el valor corto salen del tipo y del nombre del premio (gajo, ticket y cupón)", () => {
    const cases: [Parameters<typeof glyphFor>[0], number, string, string, string][] = [
      ["PERCENT", 10, "Ruleta: 10% OFF", "percent", "10%"],
      ["FREE_SHIPPING", 0, "Ruleta: Envío gratis", "truck", "Envío"],
      ["FIXED", 2500, "Ruleta: Muestra de regalo", "sample", "Muestra"],
      ["FIXED", 8900, "Ruleta: Shaker VOLTA de regalo desde $30.000", "shaker", "Shaker"],
      ["FIXED", 41900, "Mass Gainer de regalo", "gift", "Regalo"],
      ["FIXED", 3000, "Ruleta: $3.000 OFF desde $25.000", "coin", "$3.000"],
    ];
    for (const [kind, value, label, glyph, short] of cases) {
      expect(glyphFor(kind, label), label).toBe(glyph);
      expect(shortValue(kind, value, label), label).toBe(short);
    }
  });
});
