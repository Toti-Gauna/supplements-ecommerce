import { describe, expect, it } from "vitest";
import { applyPriceChange, brandsOf, parsePct, previewPriceChange, priceChangeLabel, roundPrice, undoPriceChange } from "@/demo/admin/bulk-price";
import { listPrice } from "@/demo/engine/catalog";
import { defaultDemoData } from "@/demo/engine/source";
import type { Product } from "@/demo/types";

const data = () => defaultDemoData();
const prices = (list: Product[]) => Object.fromEntries(list.flatMap((p) => p.variants.map((v) => [`${p.slug}::${v.id}`, listPrice(p, v)])));

describe("aumento masivo de precios", () => {
  it("redondea al múltiplo más cercano (y nunca a 0)", () => {
    expect(roundPrice(59292, 100)).toBe(59300);
    expect(roundPrice(59292, 500)).toBe(59500);
    expect(roundPrice(59249, 500)).toBe(59000);
    expect(roundPrice(59292.4, 1)).toBe(59292);
    expect(roundPrice(30, 100)).toBe(100);
  });
  it("lee el porcentaje como lo escribe el dueño", () => {
    expect(parsePct("8")).toEqual({ ok: true, value: 8 });
    expect(parsePct("+8 %")).toEqual({ ok: true, value: 8 });
    expect(parsePct("7,5")).toEqual({ ok: true, value: 7.5 });
    expect(parsePct("-10")).toEqual({ ok: true, value: -10 });
    expect(parsePct("0").ok).toBe(false);
    expect(parsePct("ocho").ok).toBe(false);
    expect(parsePct("-95").ok).toBe(false);
  });
  it("vista previa: +8 % a una marca, precio actual → nuevo de cada variante, solo de esa marca", () => {
    const { products } = data();
    const lines = previewPriceChange(products, { kind: "brand", brand: "Brava Sport" }, 8, 100);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.brand === "Brava Sport")).toBe(true);
    const casein = lines.find((l) => l.key === "night-casein::nc-chocolate-2lb")!;
    expect(casein).toMatchObject({ from: 64900, to: 70100 });
  });
  it("aplicar deja cada variante exactamente en su precio nuevo y no toca lo que no se eligió", () => {
    const { products } = data();
    const before = prices(products);
    const lines = previewPriceChange(products, { kind: "brand", brand: "Brava Sport" }, 8, 100);
    const { products: next, undo } = applyPriceChange(products, { kind: "brand", brand: "Brava Sport" }, 8, 100, "+8 % a Brava Sport");
    const after = prices(next);
    for (const l of lines) expect(after[l.key], l.key).toBe(l.to);
    for (const k of Object.keys(before)) if (!lines.some((l) => l.key === k)) expect(after[k], k).toBe(before[k]);
    expect(undo.count).toBe(lines.length);
    expect(Object.keys(undo.prices).sort()).toEqual([...new Set(lines.map((l) => l.productSlug))].sort());
  });
  it("por categoría, todo el catálogo y rebaja con redondeo a $500", () => {
    const { products } = data();
    const cat = previewPriceChange(products, { kind: "category", slug: "creatinas" }, 10, 500);
    expect(new Set(cat.map((l) => l.productSlug))).toEqual(new Set(products.filter((p) => p.categorySlug === "creatinas").map((p) => p.slug)));
    expect(cat.every((l) => l.to % 500 === 0)).toBe(true);
    expect(previewPriceChange(products, { kind: "all" }, -10, 100).every((l) => l.to <= l.from)).toBe(true);
    expect(previewPriceChange(products, { kind: "all" }, 5, 1)).toHaveLength(products.flatMap((p) => p.variants).length);
  });
  it("deshacer vuelve exacto, aunque se haya editado el stock o creado una variante después", () => {
    const { products } = data();
    const { products: raised, undo } = applyPriceChange(products, { kind: "all" }, 12.5, 1, "+12,5 %");
    const edited = raised.map((p) => (p.slug !== "ionic-whey" ? p : {
      ...p, variants: [...p.variants.map((v) => ({ ...v, stock: 99 })), { id: "iw-nueva", label: "Nueva", priceDelta: 1000, stock: 1 }],
    }));
    const back = undoPriceChange(edited, undo);
    const original = prices(products);
    const restored = prices(back);
    for (const k of Object.keys(original)) expect(restored[k], k).toBe(original[k]);
    const whey = back.find((p) => p.slug === "ionic-whey")!;
    expect(whey.variants[0]!.stock).toBe(99);
    expect(listPrice(whey, whey.variants.at(-1)!)).toBe(listPrice(raised.find((p) => p.slug === "ionic-whey")!, { id: "x", label: "x", priceDelta: 1000, stock: 0 }));
  });
  it("etiquetas y marcas para el formulario", () => {
    const { products, categories } = data();
    expect(priceChangeLabel({ kind: "brand", brand: "Forja" }, 8, categories)).toBe("+8 % a Forja");
    expect(priceChangeLabel({ kind: "category", slug: "proteinas" }, -7.5, categories)).toBe("−7,5 % a Proteínas");
    expect(priceChangeLabel({ kind: "all" }, 5, categories)).toBe("+5 % a todo el catálogo");
    expect(brandsOf(products)).toEqual(["Brava Sport", "Doce Rounds", "Forja", "Hierro", "Krono Nutrition", "Ozono", "Pulso", "VOLTA Lab"]);
  });
});
