import { beforeEach, describe, expect, it } from "vitest";
import { getProduct } from "@/demo/engine/catalog";
import { recommendForCart, recommendForProduct } from "@/demo/engine/recommend";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";

beforeEach(() => setDemoData(defaultDemoData()));

describe("recomendaciones", () => {
  it("para un producto prioriza su categoría y nunca se recomienda a sí mismo", () => {
    const recs = recommendForProduct(getProduct("comedero-perro-globo")!);
    expect(recs.map((p) => p.slug)).not.toContain("comedero-perro-globo");
    expect(recs[0]?.categorySlug).toBe("comederos");
  });
  it("para el carrito excluye lo que ya está y lo sin stock", () => {
    const recs = recommendForCart([{ id: "a", productSlug: "vela-caniche", variantId: "vc-vainilla", quantity: 1 }], 6);
    expect(recs.map((p) => p.slug)).not.toContain("vela-caniche");
    expect(recs.every((p) => p.variants.some((v) => v.stock !== 0))).toBe(true);
  });
  it("con carrito vacío devuelve los más elegidos", () => {
    expect(recommendForCart([], 3)).toHaveLength(3);
  });
});
