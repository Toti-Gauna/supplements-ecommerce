import { describe, expect, it } from "vitest";
import { categories } from "@/demo/fixtures/categories";
import { goals } from "@/demo/fixtures/goals";
import { products } from "@/demo/fixtures/products";
import { removeChip, searchCatalog, searchProducts } from "@/demo/engine/search";
import type { Product } from "@/demo/types";

const search = (q: string, list: Product[] = products) => searchCatalog(q, list, categories);
const slugs = (q: string) => search(q).results.map((r) => r.product.slug);
const chipKeys = (q: string) => search(q).chips.map((c) => c.key);

describe("búsqueda del rubro: casos reales del catálogo", () => {
  it("'proteina vegana sin tacc' entiende dos sellos y encuentra la proteína vegana", () => {
    const r = search("proteina vegana sin tacc");
    expect(r.chips.map((c) => [c.key, c.label, c.source])).toEqual([["badge:vegano", "Vegano", "vegana"], ["badge:sin-tacc", "Sin TACC", "sin tacc"]]);
    expect(r.terms).toEqual(["proteina"]);
    expect(r.results[0]?.product.slug).toBe("proteina-vegana");
    for (const { product } of r.results) expect(product.badges).toEqual(expect.arrayContaining(["vegano", "sin-tacc"]));
  });
  it("'whey chocolate': sinónimo de suero + sabor como filtro", () => {
    const r = search("whey chocolate");
    expect(r.chips.map((c) => [c.key, c.label])).toEqual([["flavor:chocolate", "Chocolate"]]);
    expect(r.results.map((x) => x.product.slug)).toEqual(["ionic-whey", "isolate-zero"]);
  });
  it("'pre sin cafeina' deja afuera el pre con cafeína", () => {
    expect(chipKeys("pre sin cafeina")).toEqual(["badge:sin-cafeina"]);
    expect(slugs("pre sin cafeina")).toEqual(["pump-flow"]);
    expect(slugs("pre-entreno")).toEqual(["overvolt-pre", "pump-flow"]);
  });
  it("'creatina gomitas' exige las dos palabras", () => {
    expect(slugs("creatina gomitas")).toEqual(["creatina-gomitas"]);
  });
  it("'algo para definir' es el objetivo Definición (las palabras vacías no cuentan)", () => {
    const r = search("algo para definir");
    expect(r.chips.map((c) => [c.kind, c.id, c.label])).toEqual([["goal", "definicion", "Definición"]]);
    expect(r.terms).toEqual([]);
    expect(slugs("algo para definir").sort()).toEqual(["isolate-zero", "l-carnitina", "termo-cut"]);
  });
});

describe("normalización, sinónimos y sabores", () => {
  it("plurales, tildes y mayúsculas", () => {
    expect(slugs("GOMITA")).toEqual(slugs("gomitas"));
    expect(slugs("Quemadores")).toEqual(expect.arrayContaining(["termo-cut", "l-carnitina"]));
  });
  it("sinónimos: bcaa ↔ aminoácidos, proteína de suero ↔ whey, quemador ↔ definición", () => {
    expect(slugs("bcaa").slice(0, 2)).toEqual(["bcaa-211", "glutamina"]);
    expect(slugs("proteina de suero")[0]).toBe("ionic-whey");
    expect(slugs("quemador").slice(0, 2).sort()).toEqual(["l-carnitina", "termo-cut"]);
  });
  it("sabores de varias palabras, alias y sabor escrito en el nombre", () => {
    expect(chipKeys("alfajor dulce de leche")).toEqual(["flavor:dulce de leche"]);
    expect(slugs("whey fresa")).toEqual(["ionic-whey"]);
    expect(slugs("creatina sin sabor").sort()).toEqual(["creatina-brava", "creatina-monohidrato"]);
    expect(slugs("mantequilla de maní")).toEqual(["mantequilla-mani"]);
  });
  it("varios sabores u objetivos suman opciones; los sellos se exigen todos", () => {
    expect(slugs("chocolate vainilla")).toEqual(expect.arrayContaining(["ionic-whey", "proteina-vegana"]));
    expect(slugs("fuerza resistencia")).toEqual(expect.arrayContaining(["creatina-brava", "gel-energetico"]));
    expect(slugs("vegano sin azucar").every((s) => ["bcaa-211", "l-carnitina", "mantequilla-mani", "electrolitos"].includes(s))).toBe(true);
  });
  it("'sin X' que no es sello no se busca al revés: se informa", () => {
    const r = search("proteina sin lactosa");
    expect(r.ignored).toEqual(["sin lactosa"]);
    expect(r.results.length).toBeGreaterThan(0);
  });
});

describe("coincidencia parcial, errores y ranking", () => {
  it("mientras se escribe: prefijos en nombre y sabores", () => {
    expect(slugs("prot")).toEqual(expect.arrayContaining(["ionic-whey", "proteina-vegana"]));
    expect(slugs("whey cho")[0]).toBe("ionic-whey");
  });
  it("tolera errores leves, pero no en la descripción ('caseina' no es 'cafeína')", () => {
    expect(slugs("colagneo")).toEqual(["colageno"]);
    expect(slugs("caseina noche")).toEqual(["night-casein"]);
  });
  it("nombre > categoría o sinónimo > descripción", () => {
    const r = search("magnesio").results;
    const score = (slug: string) => r.find((x) => x.product.slug === slug)!.score;
    expect(score("magnesio-bisglicinato")).toBeGreaterThan(score("electrolitos"));
    expect(slugs("hidratacion")).toEqual(expect.arrayContaining(["electrolitos", "gel-energetico"]));
  });
  it("lo sin stock va al final", () => {
    const soldOut = products.map((p) => (p.slug === "ionic-whey" ? { ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) } : p));
    const r = search("whey", soldOut).results;
    expect(r.at(-1)).toMatchObject({ inStock: false, product: { slug: "ionic-whey" } });
    expect(r[0]?.inStock).toBe(true);
  });
  it("la etiqueta del objetivo sale de los objetivos vigentes (editados en el panel)", () => {
    const edited = goals.map((g) => (g.id === "definicion" ? { ...g, name: "Corte" } : g));
    expect(searchCatalog("definir", products, categories, { goals: edited }).chips[0]?.label).toBe("Corte");
    expect(searchProducts("definir", products, categories)).toHaveLength(3);
  });
});

describe("chips y sugerencias", () => {
  it("sacar un chip devuelve la consulta sin esas palabras", () => {
    const q = "Proteína vegana sin TACC";
    const r = search(q);
    expect(removeChip(q, r.chips[1]!)).toBe("Proteína vegana");
    expect(removeChip(q, r.chips[0]!)).toBe("Proteína sin TACC");
  });
  it("con 0 resultados sugiere consultas que sí dan resultados", () => {
    const r = search("creatina vainilla");
    expect(r.results).toEqual([]);
    expect(r.suggestions).toContainEqual(expect.objectContaining({ kind: "drop-chip", query: "creatina", count: slugs("creatina").length }));
    expect(r.suggestions).toContainEqual(expect.objectContaining({ kind: "drop-term", term: "creatina", query: "vainilla" }));
    for (const s of r.suggestions) expect(search(s.query).results).toHaveLength(s.count);
  });
  it("corrige el tipeo que la tolerancia no alcanza (palabras cortas)", () => {
    const r = search("wey chocolate");
    expect(r.results).toEqual([]);
    expect(r.suggestions[0]).toMatchObject({ kind: "spelling", query: "whey chocolate", count: 2 });
    expect(search("zzzzqqq").suggestions).toEqual([]);
  });
  it("con resultados no hay sugerencias, y una consulta de palabras vacías no busca nada", () => {
    expect(search("whey").suggestions).toEqual([]);
    expect(search("algo para").results).toEqual([]);
  });
});
