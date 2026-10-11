import { beforeEach, describe, expect, it } from "vitest";
import { collarLineDetail, getProduct, unitPrice } from "@/demo/engine/catalog";
import { collarPieces, collarSurcharge, describeCollar, sizeForNeck } from "@/demo/engine/collar";
import { quoteCart } from "@/demo/engine/pricing";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { collarPresets, collarSpec, defaultCollarConfig } from "@/demo/fixtures/collar";

beforeEach(() => setDemoData(defaultDemoData()));

describe("configurador de collar", () => {
  const product = getProduct("collar-con-nombre")!;
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
    expect(collarLineDetail({ productSlug: "vela-caniche" })).toBe("");
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
