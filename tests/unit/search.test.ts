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
    expect(slugs("iluminacion")).toContain("velador-con-foto");
  });
  it("tolera errores: 'comedro' encuentra comederos", () => {
    const found = slugs("comedro");
    expect(found).toContain("comedero-perro-globo");
    expect(found).toContain("comedero-elevado-madera");
  });
  it("busca por categoría y por etiquetas", () => {
    expect(slugs("nfc")).toEqual(expect.arrayContaining(["placa-nfc", "placa-nfc-instagram"]));
  });
  it("sin resultados devuelve lista vacía y sugiere un término", () => {
    expect(slugs("zzzzqqq")).toEqual([]);
    expect(suggestTerm("lampra", products)).toBe("lampara");
  });
});
