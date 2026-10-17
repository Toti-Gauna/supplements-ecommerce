import { describe, expect, it } from "vitest";
import { activeCount, catalogQuery, EMPTY_FILTERS, filterCatalog, parseCatalogParams, parseRange, toggleFilter } from "@/demo/engine/catalog-filters";
import { activeChips, catalogFacets, rangeLabel } from "@/demo/engine/catalog-facets";
import { productMetrics, proteinGrams, restNote, sortCatalog } from "@/demo/engine/catalog-sort";
import { categories } from "@/demo/fixtures/categories";
import { goals } from "@/demo/fixtures/goals";
import { products } from "@/demo/fixtures/products";

const slugs = (list: { slug: string }[]) => list.map((p) => p.slug);
const ctx = { goals, categories };
const get = (slug: string) => products.find((p) => p.slug === slug)!;

describe("filtros del catálogo en la URL", () => {
  it("lee listas separadas por coma, el rango y el orden; ignora lo vacío o repetido", () => {
    const s = parseCatalogParams("?marca=krono-nutrition,ozono,ozono&sello=sin-tacc&sabor=&porserv=500-1000&orden=rendidor");
    expect(s.filters).toEqual({ ...EMPTY_FILTERS, brand: ["krono-nutrition", "ozono"], badge: ["sin-tacc"], pps: { min: 500, max: 1000 } });
    expect(s.sort).toBe("value");
    expect(parseCatalogParams("orden=cualquiera").sort).toBe("relevance");
  });
  it("escribe la URL en un orden fijo y vuelve a leerla igual", () => {
    const state = { filters: { ...EMPTY_FILTERS, badge: ["vegano" as const], brand: ["volta-lab"], category: ["creatinas"], pps: { min: null, max: 500 } }, sort: "protein" as const };
    const q = catalogQuery(state);
    expect(q).toBe("?categoria=creatinas&marca=volta-lab&sello=vegano&porserv=0-500&orden=proteina");
    expect(parseCatalogParams(q)).toEqual(state);
    expect(catalogQuery({ filters: EMPTY_FILTERS, sort: "relevance" })).toBe("");
  });
  it("rangos: abiertos de un lado, inválidos sin filtro", () => {
    expect(parseRange("2000-")).toEqual({ min: 2000, max: null });
    expect(parseRange("-800")).toEqual({ min: null, max: 800 });
    expect(parseRange("900-100")).toBeNull();
    expect(parseRange("abc")).toBeNull();
    expect(rangeLabel("300-800")).toBe("$ 300 a $ 800");
  });
});

describe("filtrar", () => {
  it("dentro de un grupo son alternativas; los sellos se suman", () => {
    const krono = filterCatalog(products, { ...EMPTY_FILTERS, brand: ["krono-nutrition"] });
    expect(slugs(krono).sort()).toEqual(["bcaa-211", "colageno", "isolate-zero", "l-carnitina"]);
    const two = filterCatalog(products, { ...EMPTY_FILTERS, brand: ["krono-nutrition", "ozono"] });
    expect(two.length).toBeGreaterThan(krono.length);
    const vegSinTacc = filterCatalog(products, { ...EMPTY_FILTERS, badge: ["vegano", "sin-tacc"] });
    expect(vegSinTacc.every((p) => p.badges?.includes("vegano") && p.badges.includes("sin-tacc"))).toBe(true);
  });
  it("sabor por id de URL (incluye los de dos palabras) y nunca el color de un accesorio", () => {
    expect(slugs(filterCatalog(products, { ...EMPTY_FILTERS, flavor: ["cookies-cream"] })).sort()).toEqual(["barra-proteica", "ionic-whey"]);
    expect(filterCatalog(products, { ...EMPTY_FILTERS, flavor: ["negro"] })).toEqual([]);
  });
  it("el precio por servicio deja afuera al equipamiento y respeta los bordes", () => {
    const cheap = filterCatalog(products, { ...EMPTY_FILTERS, pps: { min: null, max: 500 } });
    expect(cheap.every((p) => productMetrics(p).perServing! <= 500)).toBe(true);
    expect(slugs(cheap)).toContain("creatina-monohidrato");
    expect(cheap.some((p) => productMetrics(p).gear)).toBe(false);
  });
  it("cuenta los filtros puestos y los saca de a uno", () => {
    const f = toggleFilter(toggleFilter(EMPTY_FILTERS, "brand", "ozono"), "badge", "vegano");
    expect(activeCount({ ...f, pps: { min: 0, max: 500 } })).toBe(3);
    expect(toggleFilter(f, "brand", "ozono").brand).toEqual([]);
  });
});

describe("cuentas de cada opción", () => {
  it("cuentan con los otros grupos puestos (el propio grupo no achica a sus alternativas)", () => {
    const filters = { ...EMPTY_FILTERS, brand: ["krono-nutrition"] };
    const groups = catalogFacets(products, filters, ctx);
    const brand = groups.find((g) => g.key === "brand")!;
    expect(brand.options.find((o) => o.id === "ozono")!.count).toBe(filterCatalog(products, { ...EMPTY_FILTERS, brand: ["ozono"] }).length);
    const badge = groups.find((g) => g.key === "badge")!;
    expect(badge.options.find((o) => o.id === "sin-azucar")!.count).toBe(4);
    expect(badge.options.find((o) => o.id === "marca-propia")!.count).toBe(0);
    expect(activeChips(groups)).toEqual([{ key: "brand", id: "krono-nutrition", label: "Krono Nutrition", group: "Marca" }]);
  });
  it("en una categoría de equipamiento no hay sabores ni precio por servicio; sin el grupo de categoría", () => {
    const gear = products.filter((p) => p.categorySlug === "boxeo");
    const keys = catalogFacets(gear, EMPTY_FILTERS, { ...ctx, withCategory: false }).map((g) => g.key);
    expect(keys).not.toContain("flavor");
    expect(keys).not.toContain("pps");
    expect(keys).not.toContain("category");
    expect(keys).toContain("brand");
  });
  it("un filtro de un link viejo se muestra puesto, para poder sacarlo", () => {
    const groups = catalogFacets(products, { ...EMPTY_FILTERS, brand: ["marca-que-no-esta"] }, ctx);
    expect(activeChips(groups).map((c) => c.id)).toEqual(["marca-que-no-esta"]);
  });
});

describe("órdenes de máquina", () => {
  it("«Más rendidor»: menor precio por servicio primero, el equipamiento aparte al final", () => {
    const { ranked, rest } = sortCatalog(products, "value");
    const pps = ranked.map((p) => productMetrics(p).perServing!);
    expect(pps).toEqual([...pps].sort((a, b) => a - b));
    expect(rest.every((p) => productMetrics(p).perServing === null)).toBe(true);
    expect(slugs(rest)).toContain("guantes-boxeo");
    expect(slugs(rest)).toContain("magnesio-tiza");
    expect(restNote("value")).toMatch(/equipamiento/);
  });
  it("«Más proteína por $»: gramos de proteína por peso según el rótulo", () => {
    expect(proteinGrams(get("ionic-whey").nutrition)).toBe(24);
    expect(proteinGrams(get("mantequilla-mani").nutrition)).toBe(5.4);
    expect(proteinGrams(get("creatina-monohidrato").nutrition)).toBeNull();
    expect(productMetrics(get("ionic-whey")).proteinPerK).toBe(15.4);
    const { ranked, rest } = sortCatalog(products.filter((p) => p.categorySlug === "proteinas" || p.categorySlug === "creatinas"), "protein");
    expect(slugs(ranked).slice(0, 2)).toEqual(["ionic-whey", "proteina-vegana"]);
    expect(slugs(rest).sort()).toEqual(["creatina-brava", "creatina-gomitas", "creatina-monohidrato"]);
  });
  it("los órdenes comunes no separan nada", () => {
    const { ranked, rest } = sortCatalog(products, "price-asc");
    expect(rest).toEqual([]);
    expect(ranked).toHaveLength(products.length);
  });
});
