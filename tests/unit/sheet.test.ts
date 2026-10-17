import { describe, expect, it } from "vitest";
import { finalPrice, unpricedVariants, withFinalPrices, withVariantPrice, editorServingPrice } from "@/demo/admin/variant-prices";
import { fromPrice, listPrice } from "@/demo/engine/catalog";
import { compareAlternatives, priceOptions, servingActive, sheetScore, sizePlates } from "@/demo/engine/sheet";
import { gearReadouts, scoreReadouts } from "@/demo/engine/sheet-readouts";
import { products } from "@/demo/fixtures/products";

/** R2 · ficha "hoja técnica" y precio propio por presentación en el editor. */
const get = (slug: string) => products.find((p) => p.slug === slug)!;
const whey = get("ionic-whey");

describe("marcador de la ficha", () => {
  it("el activo por servicio: proteína, si no el activo del rótulo, si no los carbohidratos", () => {
    expect(servingActive(whey.nutrition)).toEqual({ label: "Proteína", amount: "24", unit: "g" });
    expect(servingActive(get("creatina-monohidrato").nutrition)).toEqual({ label: "Creatina", amount: "5", unit: "g" });
    expect(servingActive(get("overvolt-pre").nutrition)).toEqual({ label: "Cafeína", amount: "200", unit: "mg" });
    expect(servingActive(get("l-carnitina").nutrition)).toEqual({ label: "L-carnitina", amount: "3.000", unit: "mg" });
    expect(servingActive(get("gel-energetico").nutrition)).toEqual({ label: "Cafeína", amount: "50", unit: "mg" });
    expect(servingActive(get("mass-gainer").nutrition)).toMatchObject({ label: "Proteína", amount: "32" });
    const carbsOnly = { serving: "1 gel", ingredients: "", rows: [{ label: "Carbohidratos", serving: "25 g" }, { label: "Proteínas", serving: "0 g" }] };
    expect(servingActive(carbsOnly)).toEqual({ label: "Carbohidratos", amount: "25", unit: "g" });
    expect(servingActive(get("electrolitos").nutrition)).toEqual({ label: "Potasio", amount: "200", unit: "mg" });
    expect(servingActive(undefined)).toBeNull();
  });

  it("precio por servicio, servicios y cuánto dura según servicios por día", () => {
    const choco2 = whey.variants.find((v) => v.id === "iw-chocolate-2lb")!;
    expect(sheetScore(whey, choco2)).toMatchObject({ price: 54900, perServing: 1830, servings: 30, days: 30 });
    expect(sheetScore(whey, choco2, 2).days).toBe(15);
    const shaker = products.find((p) => p.categorySlug === "accesorios")!;
    expect(sheetScore(shaker, shaker.variants[0]!)).toMatchObject({ perServing: null, servings: null, days: null });
  });

  it("L1: debajo del total, la tira chica de cuánto rinde; el equipamiento no tiene tira", () => {
    const choco2 = whey.variants.find((v) => v.id === "iw-chocolate-2lb")!;
    const r = scoreReadouts(sheetScore(whey, choco2, 2), 2);
    expect(r.map((x) => [x.key, x.value, x.unit])).toEqual([["per-serving", "1830", undefined], ["active", "24", "g"], ["servings", "30", undefined], ["days", "15", "días"]]);
    expect(r[0]).toMatchObject({ amount: 1830, reading: "$ 1.830 por servicio" });
    expect(r[3]!.reading).toBe("Te dura 15 días con 2 servicios por día");
    const gloves = get("guantes-boxeo");
    expect(scoreReadouts(sheetScore(gloves, gloves.variants[0]!))).toEqual([]);
    // El equipamiento tiene su propia tira: colores, de qué peso a cuál, medidas y peso neto.
    expect(gearReadouts(gloves).map((x) => [x.label, x.value])).toEqual([["Colores", "3"], ["Peso", "10–16 oz"], ["Medidas", "30×20×15 cm"], ["Peso neto", "680 g"]]);
    expect(gearReadouts({ ...gloves, dims: undefined, variants: gloves.variants.filter((v) => v.color === gloves.variants[0]!.color) }).map((x) => x.key)).toEqual([]);
    const talles = { ...gloves, optionNames: { size: "Talle" }, variants: ["S", "M", "XL"].map((size, i) => ({ ...gloves.variants[i]!, size })) };
    expect(gearReadouts(talles).find((x) => x.key === "sizes")!.value).toBe("S a XL");
    // Un suplemento de una sola toma: solo el activo, sin precio por servicio ni días.
    const gel = get("gel-energetico");
    expect(scoreReadouts(sheetScore(gel, { ...gel.variants[0]!, servings: 1 })).map((x) => x.key)).toEqual(["active"]);
  });

  it("dos precios explicados: transferencia con el descuento y tarjeta en cuotas redondeadas hacia arriba", () => {
    expect(priceOptions(54900, 10)).toEqual({ transfer: 49410, transferPct: 10, savings: 5490, card: 54900, installments: 3, perInstallment: 18300 });
    expect(priceOptions(10001, 0, 3)).toMatchObject({ transfer: 10001, savings: 0, perInstallment: 3334 });
  });

  it("placas de tamaño con su precio por servicio y la que más rinde marcada", () => {
    const plates = sizePlates(whey, "Chocolate");
    expect(plates.map((p) => [p.size, p.perServing, p.best])).toEqual([["2 lb (907 g)", 1830, false], ["5 lb (2,27 kg)", 1559, true]]);
    // Frutilla 5 lb está sin stock: la placa se marca.
    expect(sizePlates(whey, "Frutilla").find((p) => p.size.startsWith("5 lb"))!.soldOut).toBe(true);
  });

  it("Comparalo con: primero la misma categoría, del que más rinde por servicio al que menos, sin el propio", () => {
    const list = compareAlternatives(whey, 4, products);
    expect(list.map((p) => p.slug)).not.toContain("ionic-whey");
    expect(list.slice(0, 3).every((p) => p.categorySlug === "proteinas")).toBe(true);
    const creatinas = compareAlternatives(get("creatina-monohidrato"), 2, products);
    expect(creatinas.map((p) => p.slug).sort()).toEqual(["creatina-brava", "creatina-gomitas"]);
    expect(creatinas[0]!.slug).toBe("creatina-brava");
  });
});

describe("precio propio por presentación (editor)", () => {
  it("el dueño escribe el precio final; se guarda como base + diferencia sin tocar las demás", () => {
    const i = whey.variants.findIndex((v) => v.id === "iw-chocolate-5lb");
    const next = withVariantPrice(whey, i, 119900);
    expect(finalPrice(next, next.variants[i]!)).toBe(119900);
    next.variants.forEach((v, k) => { if (k !== i) expect(listPrice(next, v)).toBe(listPrice(whey, whey.variants[k]!)); });
    expect(next.variants.every((v) => v.priceDelta >= 0)).toBe(true);
  });

  it("bajar la presentación más barata mueve la base: ninguna diferencia queda negativa y el 'desde' acompaña", () => {
    const next = withVariantPrice(whey, 0, 49900);
    expect(next.basePrice).toBe(49900);
    expect(fromPrice(next)).toBe(49900);
    expect(next.variants.every((v) => v.priceDelta >= 0)).toBe(true);
    expect(finalPrice(next, next.variants[1]!)).toBe(finalPrice(whey, whey.variants[1]!));
  });

  it("una presentación sin precio queda en 0 y bloquea; precio por servicio a la vista", () => {
    const p = withFinalPrices({ ...whey, variants: whey.variants.slice(0, 2) }, [0, 116900]);
    expect(finalPrice(p, p.variants[0]!)).toBe(0);
    expect(unpricedVariants(p)).toHaveLength(1);
    expect(editorServingPrice(p, p.variants[1]!)).toBe(1559);
    expect(editorServingPrice(p, { ...p.variants[1]!, servings: 1 })).toBeNull();
  });
});
