import { describe, expect, it } from "vitest";
import { declaresProtein, isGearProduct, labelErrors, normalizeRnpa, RNPA_FORMAT } from "@/demo/admin/label-checks";
import { formatRange, marginInfo, productMarginRange, productServingRange, rangeOf, variantServingPrice, withSupplierCosts } from "@/demo/admin/product-metrics";
import { checkSteps, cleanProductDraft } from "@/demo/admin/product-steps";
import { productSheetSpec } from "@/demo/admin/sheet-specs";
import { stockMargin, stockRows } from "@/demo/admin/stock";
import { withVariantPrice } from "@/demo/admin/variant-prices";
import { defaultDemoData } from "@/demo/engine/source";
import { recipes } from "@/demo/fixtures/workshop";
import { formatARS } from "@/lib/money";

/** R2a · editor de producto: rótulo y RNPA validados, el equipamiento sin rótulo, precio por servicio y margen. */
const { products, categories } = defaultDemoData();
const whey = products.find((p) => p.slug === "ionic-whey")!;
const creatina = products.find((p) => p.slug === "creatina-monohidrato")!;
const straps = products.find((p) => p.slug === "straps-algodon")!;

describe("rótulo y RNPA", () => {
  it("el RNPA copiado del envase queda con el formato 00-000000; lo que no se puede acomodar no pasa", () => {
    expect(normalizeRnpa("RNPA N° 04 071204")).toBe("04-071204");
    expect(normalizeRnpa(" 04071204 ")).toBe("04-071204");
    expect(normalizeRnpa("r.n.p.a.: 00-072033")).toBe("00-072033");
    expect(normalizeRnpa("4-71204")).toBe("4-71204");
    expect(RNPA_FORMAT.test("4-71204")).toBe(false);
    expect(labelErrors({ ...whey, rnpa: "4-71204" })).toEqual(["El RNPA tiene que tener el formato 00-000000: dos números, guion y seis números."]);
    expect(labelErrors({ ...whey, rnpa: "00071204" })).toEqual([]);
  });

  it("la tabla necesita porción y proteínas: renglón con valor (aunque sea 0 g) o la leyenda de no significativo", () => {
    expect(declaresProtein(whey.nutrition!)).toBe(true);
    // La creatina pura no lista proteínas: lo dice la leyenda del rótulo argentino.
    expect(creatina.nutrition!.rows.some((r) => /prote/i.test(r.label))).toBe(false);
    expect(declaresProtein(creatina.nutrition!)).toBe(true);
    const sinProteina = { ...whey.nutrition!, rows: whey.nutrition!.rows.filter((r) => !/prote/i.test(r.label)) };
    expect(labelErrors({ ...whey, nutrition: { ...sinProteina, serving: " " } })).toEqual([
      "La tabla nutricional necesita la porción (por ejemplo, 1 scoop (30 g)).",
      "Falta el renglón de proteínas en la tabla nutricional (si no aporta, escribí 0 g).",
    ]);
  });

  it("todo el catálogo de muestra se puede guardar tal como está", () => {
    for (const p of products) expect(checkSteps(p, categories).revision.errors, p.slug).toEqual([]);
  });

  it("cada presentación de un suplemento necesita servicios; el equipamiento no (ni rótulo, ni RNPA, ni lotes)", () => {
    const sinServicios = { ...whey, variants: whey.variants.map((v, i) => (i === 0 ? { ...v, servings: undefined } : v)) };
    expect(checkSteps(sinServicios, categories).variantes.errors).toEqual(["Cada presentación necesita sus servicios por envase: de ahí sale el precio por servicio."]);
    expect(isGearProduct(straps, categories)).toBe(true);
    const gear = checkSteps({ ...straps, rnpa: undefined, nutrition: undefined, usage: undefined, variants: straps.variants.map((v) => ({ ...v, servings: undefined, lots: [{ code: "", expires: "", units: 3 }] })) }, categories);
    expect(gear.rotulo).toEqual({ errors: [], warnings: [], skipped: true, complete: true });
    expect(gear.variantes.errors).toEqual([]);
    expect(gear.revision.errors).toEqual([]);
  });

  it("al guardar: RNPA con formato, sin renglones vacíos ni leyenda en blanco", () => {
    const out = cleanProductDraft({ ...whey, rnpa: "RNPA 00071204", nutrition: { ...whey.nutrition!, note: " ", rows: [...whey.nutrition!.rows, { label: "", serving: "" }] } });
    expect(out.rnpa).toBe("00-071204");
    expect(out.nutrition!.rows).toHaveLength(whey.nutrition!.rows.length);
    expect(out.nutrition!.note).toBeUndefined();
    expect(cleanProductDraft({ ...whey, rnpa: "  " }).rnpa).toBeUndefined();
  });
});

describe("precio por servicio y margen (Productos y stock)", () => {
  it("rangos: uno solo, varios o ninguno", () => {
    expect(rangeOf([3, null, 1, undefined, 2])).toEqual({ min: 1, max: 3 });
    expect(rangeOf([null])).toBeNull();
    expect(formatRange({ min: 5, max: 5 }, String)).toBe("5");
    expect(formatRange({ min: 1, max: 2 }, (n) => `${n} %`)).toBe("1 % – 2 %");
    expect(formatRange(null, String)).toBe("—");
  });

  it("el precio por servicio sigue al precio final de cada presentación", () => {
    // Whey: 2 lb a $54.900 con 30 servicios y 5 lb a $116.900 con 75.
    expect(productServingRange(whey)).toEqual({ min: 1559, max: 1830 });
    const next = withVariantPrice(whey, 0, 60000);
    expect(variantServingPrice(next, next.variants[0]!)).toBe(2000);
    expect(productServingRange(straps)).toBeNull();
  });

  it("margen con el costo de la variante, el de Costos o uno estimado en proporción al precio", () => {
    const r = recipes["ionic-whey"]!;
    const two = whey.variants.find((v) => v.id === "iw-chocolate-2lb")!;
    expect(marginInfo(whey, two, r)).toEqual({ margin: 52, cost: 26400, estimated: false });
    expect(marginInfo(whey, { ...two, cost: 60000 }, r)!.margin).toBe(-9);
    expect(productMarginRange(whey, r)).toEqual({ min: 52, max: 55 });
    expect(productMarginRange(straps, undefined)).toEqual({ min: 45, max: 45 });
    expect(productMarginRange({ ...whey, slug: "sin-costos" }, undefined)).toBeNull();
  });

  it("las filas por variante traen precio por servicio y el costo del proveedor (estimado si hace falta)", () => {
    const rows = withSupplierCosts(stockRows(products, categories), products, recipes);
    const choco = rows.find((r) => r.variantId === "iw-chocolate-2lb")!;
    expect(choco).toMatchObject({ servings: 30, servingPrice: 1830, cost: 26400, costEstimated: false });
    expect(stockMargin(choco)).toBe(52);
    expect(rows.find((r) => r.productSlug === "straps-algodon")).toMatchObject({ servingPrice: null, cost: 8200 });
    const spec = productSheetSpec(categories);
    const pps = spec.columns.find((c) => c.id === "servingPrice")!;
    const margin = spec.columns.find((c) => c.id === "margin")!;
    expect(pps.parse).toBeUndefined();
    expect(pps.text!(pps.get(choco), choco)).toBe(formatARS(1830));
    expect(margin.text!(margin.get(choco), choco)).toBe("52 %");
  });
});
