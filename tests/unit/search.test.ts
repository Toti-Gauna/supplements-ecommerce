import { describe, expect, it } from "vitest";
import { categories } from "@/demo/fixtures/categories";
import { products } from "@/demo/fixtures/products";
import { normalize, searchProducts, suggestTerm } from "@/demo/engine/search";

const slugs = (q: string) => searchProducts(q, products, categories).map((r) => r.product.slug);

describe("búsqueda", () => {
  it("normaliza acentos y mayúsculas", () => {
    expect(normalize("Iluminación  ÚNICA")).toBe("iluminacion unica");
  });
  it("encuentra sin acentos lo que tiene acento", () => {
    // El gel solo se relaciona con "Hidratación" por el nombre de su categoría.
    expect(slugs("hidratacion")).toContain("gel-energetico");
    expect(slugs("proteinas")).toEqual(expect.arrayContaining(["ionic-whey", "isolate-zero", "proteina-vegana", "night-casein"]));
  });
  it("tolera errores: 'cretina' encuentra creatinas", () => {
    const found = slugs("cretina");
    expect(found).toContain("creatina-monohidrato");
    expect(found).toContain("creatina-gomitas");
    expect(found).toContain("creatina-brava");
  });
  it("busca por categoría y por etiquetas", () => {
    expect(slugs("aminoacidos")).toEqual(expect.arrayContaining(["bcaa-211", "glutamina"]));
  });
  it("busca por marca y por objetivo", () => {
    expect(slugs("krono")).toEqual(expect.arrayContaining(["isolate-zero", "bcaa-211", "colageno", "l-carnitina"]));
    expect(slugs("recuperacion")).toEqual(expect.arrayContaining(["night-casein", "glutamina", "magnesio-bisglicinato"]));
  });
  it("sin resultados devuelve lista vacía y sugiere un término", () => {
    expect(slugs("zzzzqqq")).toEqual([]);
    expect(suggestTerm("glutamna", products)).toBe("glutamina");
  });
});
