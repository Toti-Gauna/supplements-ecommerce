import { describe, expect, it } from "vitest";
import { categories } from "@/demo/fixtures/categories";
import { goals } from "@/demo/fixtures/goals";
import { products } from "@/demo/fixtures/products";
import { popularSearches } from "@/demo/fixtures/search";
import { searchCatalog } from "@/demo/engine/search";
import { addChipPhrase, chipOptions } from "@/demo/engine/search-facets";
import { searchRowFacts } from "@/demo/engine/search-row";
import type { Product } from "@/demo/types";

const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;
const withStock = (p: Product, stock: number[]): Product => ({ ...p, variants: p.variants.map((v, i) => ({ ...v, stock: stock[i] ?? stock.at(-1)! })) });

describe("filtros para tocar del buscador", () => {
  const options = chipOptions(products, goals);
  it("todos los objetivos vigentes, los sellos presentes y los sabores más repetidos", () => {
    expect(options.goal.map((o) => o.label)).toEqual(goals.map((g) => g.name));
    expect(options.badge.map((o) => o.key)).toContain("badge:sin-tacc");
    expect(options.flavor[0]).toMatchObject({ key: "flavor:chocolate", label: "Chocolate" });
    expect(options.flavor.length).toBeLessThanOrEqual(6);
  });
  it("cada opción, sumada a la consulta, el motor la entiende como su chip", () => {
    for (const o of [...options.goal, ...options.badge, ...options.flavor]) {
      const r = searchCatalog(addChipPhrase("", o), products, categories, { goals });
      expect(r.chips.map((c) => c.key)).toEqual([o.key]);
    }
    expect(addChipPhrase("proteína ", options.badge[0]!)).toBe("proteína sin tacc");
  });
  it("con el nombre de un objetivo editado en el panel, la etiqueta cambia y la frase sigue andando", () => {
    const edited = goals.map((g) => (g.id === "definicion" ? { ...g, name: "Corte" } : g));
    const def = chipOptions(products, edited).goal.find((o) => o.key === "goal:definicion")!;
    expect(def.label).toBe("Corte");
    expect(searchCatalog(def.phrase, products, categories, { goals: edited }).chips[0]?.label).toBe("Corte");
  });
});

describe("búsquedas populares", () => {
  it("todas dan resultados", () => {
    for (const q of popularSearches) expect(searchCatalog(q, products, categories).results.length, q).toBeGreaterThan(0);
  });
});

describe("fila de rack: el dato que vende", () => {
  it("la presentación con mejor precio por servicio manda, y el precio es 'desde' si cambia", () => {
    const f = searchRowFacts(bySlug("ionic-whey"));
    expect(f).toMatchObject({ perServing: 1559, price: 116900, servings: 75, from: true, stock: "ok" });
    expect(searchRowFacts(bySlug("proteina-vegana")).from).toBe(false);
  });
  it("sin servicios no hay precio por servicio", () => {
    expect(searchRowFacts(bySlug("shaker-volta")).perServing).toBeNull();
  });
  it("luz de stock: quedan pocas, sin stock y a pedido", () => {
    const whey = bySlug("ionic-whey");
    expect(searchRowFacts(withStock(whey, [2, 0])).stock).toBe("low");
    expect(searchRowFacts(withStock(whey, [0])).stock).toBe("out");
    expect(searchRowFacts(withStock(whey, [-1])).stock).toBe("made-to-order");
  });
  it("lo que no está a la venta no manda el precio, salvo que no haya nada a la venta", () => {
    const whey = bySlug("ionic-whey");
    const stock = whey.variants.map((v) => (v.servings === 75 ? 0 : 5));
    expect(searchRowFacts(withStock(whey, stock)).perServing).not.toBe(1559);
    expect(searchRowFacts(withStock(whey, [0])).perServing).toBe(1559);
  });
});
