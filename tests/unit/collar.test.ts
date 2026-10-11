import { beforeEach, describe, expect, it } from "vitest";
import { collarLineDetail, unitPrice } from "@/demo/engine/catalog";
import { collarPieces, collarSurcharge, describeCollar, sizeForNeck } from "@/demo/engine/collar";
import { quoteCart } from "@/demo/engine/pricing";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { collarPresets, collarSpec, defaultCollarConfig } from "@/demo/fixtures/collar";
import { collarTemplate } from "@/demo/fixtures/templates";
import type { Product } from "@/demo/types";

/** Ningún producto del catálogo usa el configurador: se prueba con un collar armado acá, con un talle por variante. */
const product: Product = {
  slug: "collar-con-nombre", name: "Collar con nombre", short: "", description: "", categorySlug: "accesorios", brand: "VOLTA Lab",
  basePrice: 14900, art: "box", gallery: ["front"], faqs: [], featured: false, isNew: false, soldCount: 0, tags: [],
  variants: [
    { id: "col-xs", label: "Mini (20–27 cm)", priceDelta: 0, stock: -1 },
    { id: "col-s", label: "Chico (28–35 cm)", priceDelta: 0, stock: -1 },
    { id: "col-m", label: "Mediano (36–45 cm)", priceDelta: 1500, stock: -1 },
    { id: "col-l", label: "Grande (46–55 cm)", priceDelta: 2500, stock: -1 },
    { id: "col-xl", label: "Extra grande (56–65 cm)", priceDelta: 3500, stock: -1 },
  ],
  personalization: collarTemplate,
};

beforeEach(() => {
  const data = defaultDemoData();
  setDemoData({ ...data, products: [...data.products, product] });
});

describe("configurador de collar", () => {
  it("recargos en pesos enteros por formato, material y dije", () => {
    expect(collarSurcharge(collarSpec, defaultCollarConfig)).toBe(0);
    const config = { ...defaultCollarConfig, format: "joined" as const, material: "biothane" as const, charm: "phone" as const };
    expect(collarSurcharge(collarSpec, config)).toBe(1500 + 3000 + 1500);
    const variant = product.variants.find((v) => v.id === "col-m")!;
    expect(unitPrice(product, variant, true, config)).toBe(product.basePrice + 1500 + 6000);
    const quote = quoteCart([{ id: "a", productSlug: product.slug, variantId: "col-m", quantity: 2, personalization: { kind: "TEXT", text: "Simba", approvedAt: "", collar: config } }]);
    expect(quote.subtotal).toBe((product.basePrice + 1500 + 6000) * 2);
    expect(quote.personalizationTotal).toBe(12000);
  });
  it("talle por contorno de cuello", () => {
    expect(sizeForNeck(collarSpec, product, 24)).toBe("col-xs");
    expect(sizeForNeck(collarSpec, product, 38)).toBe("col-m");
    expect(sizeForNeck(collarSpec, product, 55)).toBe("col-l");
    expect(sizeForNeck(collarSpec, product, 80)).toBeNull();
    expect(sizeForNeck(collarSpec, product, Number.NaN)).toBeNull();
    // Sin huecos entre talles: 27,5 cm (entre 27 y 28) cae en un talle; los extremos quedan afuera.
    expect(sizeForNeck(collarSpec, product, 27.5)).toBe("col-xs");
    expect(sizeForNeck(collarSpec, product, 35.5)).toBe("col-s");
    expect(sizeForNeck(collarSpec, product, 65.5)).toBe("col-xl");
    expect(sizeForNeck(collarSpec, product, 19.5)).toBeNull();
    expect(sizeForNeck(collarSpec, product, 66)).toBeNull();
  });
  it("descripción para el taller y piezas a imprimir", () => {
    expect(describeCollar(collarSpec, { ...defaultCollarConfig, neckCm: 38 })).toBe("Letras sueltas · Paracord trenzado verde oliva · dije patita · cuello 38 cm");
    expect(describeCollar(collarSpec, { ...defaultCollarConfig, charm: "none" })).toContain("sin dije");
    expect(collarPieces("Ñoqui Jr", defaultCollarConfig)).toEqual(["Ñ", "O", "Q", "U", "I", "J", "R"]);
    expect(collarPieces("Ñoqui", { ...defaultCollarConfig, format: "joined" })).toEqual(["Ñoqui"]);
    expect(collarLineDetail({ productSlug: "collar-con-nombre", personalization: { kind: "TEXT", approvedAt: "", collar: defaultCollarConfig } })).toMatch(/^Letras sueltas/);
    expect(collarLineDetail({ productSlug: "ionic-whey" })).toBe("");
  });
  it("las combinaciones listas usan opciones válidas", () => {
    for (const p of collarPresets) {
      expect(collarSpec.formats.some((o) => o.id === p.config.format)).toBe(true);
      expect(collarSpec.materials.some((o) => o.id === p.config.material)).toBe(true);
      expect(collarSpec.cordColors.some((c) => c.hex === p.config.cordColor && c.name === p.config.cordColorName)).toBe(true);
      expect([...p.name].length).toBeLessThanOrEqual(product.personalization!.maxChars!);
    }
  });
});
