import { beforeEach, describe, expect, it } from "vitest";
import { seasonalThemes, themeCoupons, themeSettings } from "@/demo/fixtures/themes";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";
import { cardDeal, currentTheme, inSeason, nextTheme, offerPrice, themeForDate, themeOffer, themeProducts } from "@/demo/engine/themes";
import { walletCoupons } from "@/demo/engine/wallet";
import type { SeasonId } from "@/demo/types";
import { AMBIENT } from "@/features/themes/ambient";
import { SKINS } from "@/features/themes/skins";

const at = (iso: string) => new Date(`${iso}T12:00:00`);
const id = (iso: string) => themeForDate(demoData().themes, at(iso))?.id ?? null;

const IDS: SeasonId[] = [
  "dia-de-la-madre", "halloween", "cyber-monday", "black-friday", "navidad", "ano-nuevo",
  "san-valentin", "vuelta-al-gym", "hot-sale", "dia-del-padre", "dia-del-amigo", "operacion-verano",
];

describe("temáticas fitness (Fase 5)", () => {
  beforeEach(() => setDemoData(defaultDemoData()));

  it("son las doce del plan, cada una con su acento, su piel, su fondo y su cupón propio", () => {
    expect(seasonalThemes.map((t) => t.id).sort()).toEqual([...IDS].sort());
    for (const t of seasonalThemes) {
      expect(SKINS[t.id].decor, t.id).toHaveLength(5);
      expect(AMBIENT[t.id].length, t.id).toBeGreaterThan(0);
      const coupon = themeCoupons.find((c) => c.code === t.couponCode);
      expect(coupon?.themeId, t.id).toBe(t.id);
      expect(Number.isInteger(coupon!.value)).toBe(true);
    }
    expect(new Set(themeCoupons.map((c) => c.code)).size).toBe(12);
  });

  it("cada temática ofrece cinco productos activos del catálogo, sin repetir", () => {
    for (const t of demoData().themes) {
      expect(new Set(t.productSlugs).size, t.id).toBe(5);
      expect(themeProducts(t).map((p) => p.slug), t.id).toEqual(t.productSlugs);
    }
    // Con sentido: el Día del Padre lleva creatina, whey y shaker; Operación verano, L-carnitina, termogénico e isolate.
    expect(demoData().themes.find((t) => t.id === "dia-del-padre")!.productSlugs).toEqual(expect.arrayContaining(["creatina-monohidrato", "ionic-whey", "shaker-volta"]));
    expect(demoData().themes.find((t) => t.id === "operacion-verano")!.productSlugs).toEqual(expect.arrayContaining(["l-carnitina", "termo-cut", "isolate-zero"]));
  });

  it("elige la temática por fecha y se repite cada año", () => {
    expect(id("2026-10-05")).toBe("dia-de-la-madre");
    expect(id("2026-10-31")).toBe("halloween");
    expect(id("2031-10-25")).toBe("halloween");
    expect(id("2026-11-03")).toBe("cyber-monday");
    expect(id("2026-11-27")).toBe("black-friday");
    expect(id("2026-12-24")).toBe("navidad");
    expect(id("2026-12-31")).toBe("ano-nuevo");
    expect(id("2027-01-06")).toBe("ano-nuevo");
    expect(id("2027-02-14")).toBe("san-valentin");
    expect(id("2027-02-15")).toBe("vuelta-al-gym");
    expect(id("2027-03-15")).toBe("vuelta-al-gym");
    expect(id("2027-05-11")).toBe("hot-sale");
    expect(id("2027-06-20")).toBe("dia-del-padre");
    expect(id("2027-07-20")).toBe("dia-del-amigo");
    expect(id("2027-09-21")).toBe("operacion-verano");
    // Entre fechas no hay temática.
    expect(id("2026-11-10")).toBeNull();
    expect(id("2027-04-15")).toBeNull();
    expect(id("2027-08-10")).toBeNull();
  });

  it("ninguna fecha cae en dos temáticas a la vez (la primera ocultaría a la otra en el modo automático)", () => {
    const days = Array.from({ length: 366 }, (_, i) => new Date(2028, 0, 1 + i));
    for (const day of days) expect(demoData().themes.filter((t) => inSeason(t, day)).length, day.toDateString()).toBeLessThanOrEqual(1);
  });

  it("contempla rangos que cruzan el año", () => {
    const range = { startsOn: "2026-12-26", endsOn: "2027-01-06" };
    expect(inSeason(range, at("2026-12-31"))).toBe(true);
    expect(inSeason(range, at("2027-01-03"))).toBe(true);
    expect(inSeason(range, at("2027-01-07"))).toBe(false);
  });

  it("la demo arranca en modo automático con Probar temáticas: en octubre sale el Día de la Madre", () => {
    expect(themeSettings).toMatchObject({ mode: "auto", showTryButton: true });
    expect(currentTheme(at("2026-10-12"), null)?.id).toBe("dia-de-la-madre");
  });

  it("la vista previa manda; después el modo del panel", () => {
    const now = at("2026-10-05");
    expect(currentTheme(now, "navidad")?.id).toBe("navidad");
    expect(currentTheme(now, "original")).toBeNull();
    // Una vista previa que ya no existe (una temática de Velmar guardada antes de la Fase 5) no tapa la del día.
    expect(currentTheme(now, "orgullo" as never)?.id).toBe("dia-de-la-madre");
    setDemoData({ ...demoData(), themeSettings: { mode: "fixed", fixedId: "cyber-monday", showTryButton: true } });
    expect(currentTheme(now, null)?.id).toBe("cyber-monday");
    setDemoData({ ...demoData(), themeSettings: { mode: "off", fixedId: "cyber-monday", showTryButton: true } });
    expect(currentTheme(now, null)).toBeNull();
  });

  it("una temática deshabilitada no entra en el modo automático", () => {
    setDemoData({ ...demoData(), themes: demoData().themes.map((t) => (t.id === "halloween" ? { ...t, active: false } : t)) });
    expect(id("2026-10-25")).toBeNull();
    expect(nextTheme(at("2026-10-20"))?.id).toBe("cyber-monday");
  });

  it("arma la oferta desde su cupón y calcula el precio con descuento", () => {
    const halloween = demoData().themes.find((t) => t.id === "halloween")!;
    const offer = themeOffer(halloween)!;
    expect(offer.label).toBe("20% OFF");
    expect(offerPrice(10000, offer)).toBe(8000);
    const black = themeOffer(demoData().themes.find((t) => t.id === "black-friday")!)!;
    expect(black.condition).toBe("Desde $40.000 de compra");
    expect(offerPrice(10000, black)).toBeNull();
    expect(themeOffer(demoData().themes.find((t) => t.id === "dia-del-amigo")!)!.label).toBe("$5.000 OFF");
    setDemoData({ ...demoData(), coupons: demoData().coupons.map((c) => (c.code === "MONSTER20" ? { ...c, active: false } : c)) });
    expect(themeOffer(halloween)).toBeNull();
  });

  it("la tarjeta no promete el descuento cuando el cupón pide un mínimo: la insignia dice la condición", () => {
    const offerOf = (id: string) => themeOffer(demoData().themes.find((t) => t.id === id)!)!;
    const nbsp = (s: string) => s.replace(/\s/g, " ");
    expect(cardDeal(10000, offerOf("halloween"))).toEqual({ price: 8000, label: "20% OFF" });
    const black = cardDeal(72500, offerOf("black-friday"));
    expect(black.price).toBeNull();
    expect(nbsp(black.label)).toBe("−30 % desde $ 40.000");
    expect(nbsp(cardDeal(9000, offerOf("dia-del-amigo")).label)).toBe("−$ 5.000 desde $ 35.000");
    expect(cardDeal(9000, offerOf("dia-del-amigo")).price).toBeNull();
  });

  it("omite productos pausados de la oferta", () => {
    const halloween = demoData().themes.find((t) => t.id === "halloween")!;
    setDemoData({ ...demoData(), products: demoData().products.map((p) => (p.slug === "pump-flow" ? { ...p, active: false } : p)) });
    expect(themeProducts(halloween).map((p) => p.slug)).not.toContain("pump-flow");
    expect(themeProducts(halloween)).toHaveLength(4);
  });

  it("el cupón de una temática solo aparece en Mis cupones mientras está puesta", () => {
    const ctx = { subtotal: 50000, isRegistered: false, now: at("2026-10-25"), wheelCode: null };
    expect(walletCoupons(ctx).some((w) => w.coupon.code === "MONSTER20")).toBe(false);
    expect(walletCoupons({ ...ctx, themeId: "halloween" }).some((w) => w.coupon.code === "MONSTER20")).toBe(true);
  });
});
