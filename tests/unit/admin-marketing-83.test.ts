import { describe, expect, it } from "vitest";
import { checkMission, emptyMission } from "@/demo/admin/mission-form";
import { assignPrize, checkPrize, checkWheel, giftValue, makePrize, prizeDraft, prizeName, withPrizeCatalog } from "@/demo/admin/wheel-prizes";
import { pickSegment, prizeCoupon, probability } from "@/demo/engine/wheel";
import { defaultDemoData } from "@/demo/engine/source";
import { defaultWheel, type WheelConfig } from "@/demo/fixtures/wheel";

/** Polish 8.3 · Lote 6: misión en modal, catálogo de premios de la ruleta y validación. */
const { products } = defaultDemoData();
const prizes = defaultWheel.prizes!;

describe("misiones (8.3.23)", () => {
  it("mismas reglas que antes: título y premio de 3 letras o más, umbral entero mayor a 0", () => {
    expect(Object.keys(checkMission(emptyMission("m-x")))).toEqual(["title", "reward"]);
    expect(checkMission({ ...emptyMission("m-x"), title: "Comprá 3", reward: "Llavero", threshold: 0 })).toHaveProperty("threshold");
    expect(checkMission({ ...emptyMission("m-x"), title: "Comprá 3", reward: "Llavero", threshold: 3 })).toEqual({});
  });
});

describe("premios de la ruleta (8.3.25)", () => {
  it("el catálogo de muestra tiene IDs estables y cada gajo apunta a uno", () => {
    expect(defaultWheel.segments.map((s) => s.id)).toEqual(["w5", "wship", "wgrab", "w10", "w3000", "wkey", "w15", "wship2"]);
    expect(defaultWheel.segments.every((s) => prizes.some((p) => p.id === s.prizeId && p.name === s.label))).toBe(true);
    expect(defaultWheel.segments.filter((s) => s.prizeId === "p-envio")).toHaveLength(2);
  });
  it("el nombre sale de la plantilla y los datos, no de un texto libre", () => {
    expect(prizeName({ ...prizeDraft("percent"), value: 12 }, products)).toBe("12% OFF");
    expect(prizeName({ ...prizeDraft("fixed"), value: 4500 }, products)).toBe("$4.500 OFF");
    expect(prizeName(prizeDraft("shipping"), products)).toBe("Envío gratis");
    const p = products[0]!;
    expect(prizeName({ ...prizeDraft("gift"), productSlug: p.slug }, products)).toBe(`${p.name} de regalo`);
  });
  it("valida como un cupón: % de 1 a 100, montos enteros mayores a 0, mínimo 0 o más, producto existente y sin duplicados", () => {
    expect(checkPrize({ ...prizeDraft("percent"), value: 0 }, products, prizes)).toHaveProperty("value");
    expect(checkPrize({ ...prizeDraft("percent"), value: 101 }, products, prizes)).toHaveProperty("value");
    expect(checkPrize({ ...prizeDraft("fixed"), value: 10.5 }, products, prizes)).toHaveProperty("value");
    expect(checkPrize({ ...prizeDraft("shipping"), minSubtotal: -1 }, products, prizes)).toHaveProperty("minSubtotal");
    expect(checkPrize(prizeDraft("gift"), products, prizes)).toHaveProperty("productSlug");
    expect(checkPrize({ ...prizeDraft("percent"), value: 5 }, products, prizes)).toHaveProperty("template");
    expect(checkPrize({ ...prizeDraft("percent"), value: 5, minSubtotal: 10000 }, products, prizes)).toEqual({});
  });
  it("un producto de regalo vale su precio desde; envío gratis vale 0", () => {
    const p = products[0]!;
    expect(makePrize({ ...prizeDraft("gift"), productSlug: p.slug, minSubtotal: 30000 }, products, "p-x")).toMatchObject({ kind: "FIXED", value: giftValue(p), minSubtotal: 30000, productSlug: p.slug });
    expect(makePrize({ ...prizeDraft("shipping"), value: 999 }, products, "p-y")).toMatchObject({ kind: "FREE_SHIPPING", value: 0 });
  });
  it("elegir un premio en un gajo copia sus datos: el sorteo y el cupón salen igual que antes", () => {
    const fixed = makePrize({ ...prizeDraft("fixed"), value: 4500, minSubtotal: 20000 }, products, "p-4500");
    const seg = assignPrize(defaultWheel.segments[0]!, fixed);
    expect(seg).toMatchObject({ id: "w5", prizeId: "p-4500", label: "$4.500 OFF", kind: "FIXED", value: 4500, minSubtotal: 20000 });
    expect(prizeCoupon(seg, "abc", new Date("2026-10-04T12:00:00Z"), 7)).toMatchObject({ type: "FIXED", value: 4500, minSubtotal: 20000, maxUses: 1, endsAt: "2026-10-11" });
    expect(assignPrize(seg, prizes[0]!).minSubtotal).toBeUndefined();
  });
  it("una ruleta guardada antes de 8.3.25 arma su catálogo desde los gajos, sin cambiar IDs", () => {
    const old: WheelConfig = { active: true, validDays: 7, segments: defaultWheel.segments.map(({ prizeId: _p, ...s }) => { void _p; return s; }) };
    const w = withPrizeCatalog(old);
    expect(w.segments.map((s) => s.id)).toEqual(old.segments.map((s) => s.id));
    expect(w.prizes).toHaveLength(7);
    expect(w.segments.every((s) => w.prizes!.some((p) => p.id === s.prizeId))).toBe(true);
    expect(w.prizes!.find((p) => p.name === "Grabado gratis")?.template).toBe("engraving");
    expect(w.prizes!.find((p) => p.name === "Llavero de regalo")?.template).toBe("gift");
    expect(withPrizeCatalog(defaultWheel)).toBe(defaultWheel);
  });
  it("guardar exige vigencia, pesos válidos, premios del catálogo y peso positivo con la ruleta visible", () => {
    expect(checkWheel(defaultWheel)).toEqual([]);
    const zero = { ...defaultWheel, segments: defaultWheel.segments.map((s) => ({ ...s, weight: 0 })) };
    expect(checkWheel(zero)).toEqual(["Con la ruleta visible, al menos un gajo activo tiene que tener peso mayor a 0."]);
    expect(checkWheel({ ...zero, active: false })).toEqual([]);
    expect(pickSegment(zero)).toBeNull();
    expect(probability(zero, zero.segments[0]!)).toBe(0);
    expect(checkWheel({ ...defaultWheel, validDays: 0 })).toHaveLength(1);
    expect(checkWheel({ ...defaultWheel, segments: [{ ...defaultWheel.segments[0]!, prizeId: "no-existe" }] })).toEqual(["Cada gajo tiene que tener un premio del catálogo."]);
  });
});
