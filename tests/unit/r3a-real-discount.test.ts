import { describe, expect, it } from "vitest";
import { applyPriceChange } from "@/demo/admin/bulk-price";
import { withPriceLog } from "@/demo/admin/price-log";
import { campaignCountdown, countdownCells, coverCrop, pieceFileName, pieceLayout, CAMPAIGN_PIECES } from "@/demo/admin/studio/campaign-pieces";
import { defaultDemoData } from "@/demo/engine/source";
import { fakeDiscounts, lowestInWindow, lowestPrice30, priceChangesBetween, priceHistory, simulatedHistory, variantKey } from "@/demo/engine/price-history";
import { products } from "@/demo/fixtures/products";
import { seasonalThemes, themeCoupons } from "@/demo/fixtures/themes";

const TODAY = "2026-10-05";
const listOf = (slug: string) => { const p = products.find((x) => x.slug === slug)!; return { p, v: p.variants[0]!, price: p.basePrice + p.variants[0]!.priceDelta }; };

describe("historia de precios de 30 días", () => {
  it("es determinista y termina en el precio actual", () => {
    const a = simulatedHistory("isolate-zero::x", 72500, TODAY);
    expect(simulatedHistory("isolate-zero::x", 72500, TODAY)).toEqual(a);
    expect(a.at(-1)!.price).toBe(72500);
    expect(a[0]!.day < "2026-09-05").toBe(true);
  });

  it("la simulación nunca vuelve falso un descuento de 10 % o más", () => {
    for (const p of products) for (const v of p.variants) {
      const price = p.basePrice + v.priceDelta;
      const low = lowestPrice30(p.slug, v.id, price, [], TODAY);
      expect(low).toBeLessThanOrEqual(price);
      expect(Math.round(price * 0.9)).toBeLessThan(low);
    }
  });

  it("toma el precio vigente al empezar la ventana y los cambios de adentro", () => {
    const pts = [{ day: "2026-08-01", price: 100 }, { day: "2026-09-01", price: 80 }, { day: "2026-09-20", price: 120 }];
    expect(lowestInWindow(pts, TODAY)).toBe(80); // el 5/9 regía $80
    expect(lowestInWindow(pts, "2026-10-25")).toBe(120); // ya pasaron 30 días del cambio a $120
    expect(lowestInWindow([{ day: "2026-10-04", price: 90 }, { day: "2026-10-04", price: 140 }], TODAY)).toBe(90);
  });

  it("los cambios del dueño quedan como historia desde el día del cambio", () => {
    const { p, v, price } = listOf("isolate-zero");
    const changes = [{ key: variantKey(p.slug, v.id), day: TODAY, from: price, to: price * 2 }];
    const hist = priceHistory(variantKey(p.slug, v.id), price * 2, changes, TODAY);
    expect(hist.at(-1)).toEqual({ day: TODAY, price: price * 2 });
    expect(lowestPrice30(p.slug, v.id, price * 2, changes, TODAY)).toBeLessThanOrEqual(price);
    // Un precio cambiado sin registro vale desde hoy (no inventa una rebaja).
    expect(lowestPrice30(p.slug, v.id, price * 2, [], TODAY)).toBeLessThanOrEqual(price);
  });
});

describe("descuento real", () => {
  const black = themeCoupons.find((c) => c.code === "BLACK30")!;
  const bfProducts = () => products.filter((p) => seasonalThemes.find((t) => t.id === "black-friday")!.productSlugs.includes(p.slug));

  it("con los precios de muestra, ninguna campaña tiene un descuento falso", () => {
    for (const t of seasonalThemes) {
      const coupon = themeCoupons.find((c) => c.code === t.couponCode)!;
      expect(fakeDiscounts(products.filter((p) => t.productSlugs.includes(p.slug)), coupon, [], TODAY)).toEqual([]);
    }
  });

  it("subir 50 % una marca antes del 30 % de Black Friday deja la lista de productos afectados", () => {
    const data = defaultDemoData();
    const { products: raised } = applyPriceChange(data.products, { kind: "brand", brand: "Krono Nutrition" }, 50, 100, "+50 %");
    const logged = withPriceLog(data, raised, TODAY);
    expect(logged.priceChanges.length).toBeGreaterThan(0);
    const hits = fakeDiscounts(logged.products.filter((p) => bfProducts().some((b) => b.slug === p.slug)), black, logged.priceChanges, TODAY);
    expect(hits.map((h) => h.slug)).toContain("isolate-zero");
    for (const h of hits) for (const v of h.variants) expect(v.final).toBeGreaterThanOrEqual(v.lowest);
    // Monto fijo o envío gratis: es por compra, no se compara por producto.
    expect(fakeDiscounts(logged.products, { type: "FIXED", value: 5000 }, logged.priceChanges, TODAY)).toEqual([]);
  });

  it("solo registra las variantes que cambiaron de precio", () => {
    const data = defaultDemoData();
    expect(priceChangesBetween(data.products, data.products, TODAY)).toEqual([]);
    const { products: next } = applyPriceChange(data.products, { kind: "brand", brand: "Krono Nutrition" }, 10, 100, "+10 %");
    const changes = priceChangesBetween(data.products, next, TODAY);
    expect(changes.every((c) => c.to > c.from && c.day === TODAY && c.key.includes("::"))).toBe(true);
  });
});

describe("piezas de la campaña", () => {
  it("post 1:1, historia 9:16 y gift card con el key visual 4:5", () => {
    expect(CAMPAIGN_PIECES.map((p) => [p.id, p.W / p.H])).toEqual([["post", 1], ["story", 1080 / 1920], ["giftcard", 1.6]]);
    const story = pieceLayout("story");
    expect(story.art.w / story.art.h).toBe(0.8); // entra entero
    expect(story.countdown).not.toBeNull();
    expect(pieceLayout("post").countdown).toBeNull();
    for (const p of CAMPAIGN_PIECES) {
      const l = pieceLayout(p.id);
      expect(l.pad + l.textW).toBeLessThanOrEqual(p.W);
      expect(l.couponY).toBeLessThan(p.H);
      // De arriba hacia abajo sin pisarse: titular, número del descuento (alto ≈ 0,75 del tamaño) y cupón.
      expect(l.headlineY).toBeLessThan(l.discountY - l.discountSize * 0.75);
      expect(l.discountY).toBeLessThan(l.countdown?.y ?? l.couponY);
      if (l.countdown) expect(l.countdown.y + l.countdown.h).toBeLessThan(l.couponY);
    }
  });

  it("recorte cover sin deformar", () => {
    const c = coverCrop(800, 1000, { w: 1080, h: 1080 });
    expect([c.x, c.w, c.h]).toEqual([0, 800, 800]);
    expect(c.y).toBe(100);
  });

  it("cuenta regresiva al inicio o al final, también si cruza el año", () => {
    const bf = seasonalThemes.find((t) => t.id === "black-friday")!;
    const c = campaignCountdown(bf, "2026-10-05T12:30:00-03:00");
    expect([c.phase, c.days, c.hours, c.minutes, c.target]).toEqual(["before", 48, 11, 30, "2026-11-23"]);
    expect(countdownCells(c).map((x) => x.value)).toEqual(["48", "11", "30"]);
    expect(campaignCountdown(bf, "2026-11-28T10:00:00-03:00")).toMatchObject({ phase: "live", days: 2, label: "Termina en 2 días" });
    const ny = seasonalThemes.find((t) => t.id === "ano-nuevo")!;
    expect(campaignCountdown(ny, "2027-01-03T12:00:00-03:00")).toMatchObject({ phase: "live", target: "2027-01-06" });
    expect(campaignCountdown(ny, "2026-10-05T12:00:00-03:00").target).toBe("2026-12-26");
    expect(pieceFileName("black-friday", "story")).toBe("volta-black-friday-historia-9x16.png");
  });
});
