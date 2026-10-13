import { beforeEach, describe, expect, it } from "vitest";
import { bestSellers, getProduct } from "@/demo/engine/catalog";
import { recommendForCart, recommendForHome, recommendForProduct } from "@/demo/engine/recommend";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";

beforeEach(() => setDemoData(defaultDemoData()));

describe("recomendaciones", () => {
  it("para un producto prioriza su categoría y nunca se recomienda a sí mismo", () => {
    const recs = recommendForProduct(getProduct("creatina-monohidrato")!);
    expect(recs.map((p) => p.slug)).not.toContain("creatina-monohidrato");
    expect(recs[0]?.categorySlug).toBe("creatinas");
  });
  it("para el carrito excluye lo que ya está y lo sin stock", () => {
    const recs = recommendForCart([{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }], 6);
    expect(recs.map((p) => p.slug)).not.toContain("ionic-whey");
    expect(recs.every((p) => p.variants.some((v) => v.stock !== 0))).toBe(true);
  });
  it("con carrito vacío devuelve los más elegidos", () => {
    expect(recommendForCart([], 3)).toHaveLength(3);
  });
  it("en el inicio, con carrito vacío, no repite el riel de más vendidos", () => {
    const best = new Set(bestSellers(8).map((p) => p.slug));
    const recs = recommendForHome([], 8, 8);
    expect(recs).toHaveLength(8);
    expect(recs.filter((p) => best.has(p.slug))).toEqual([]);
    expect(recs.every((p) => p.variants.some((v) => v.stock !== 0))).toBe(true);
  });
  it("en el inicio, con carrito, recomienda lo que lo completa", () => {
    const lines = [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }];
    expect(recommendForHome(lines, 6)).toEqual(recommendForCart(lines, 6));
  });
});
