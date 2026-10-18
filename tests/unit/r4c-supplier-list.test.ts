import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { undoPriceChange } from "@/demo/admin/bulk-price";
import { applyUpdates, linesToUpdates, previewMarginChange } from "@/demo/admin/supplier-list/apply";
import { brandMargin, landedCost, packagingCost, type CostBook } from "@/demo/admin/supplier-list/costs";
import { diffSupplierList, summaryOf, type SupplierDiff } from "@/demo/admin/supplier-list/diff";
import { parsePastedList } from "@/demo/admin/supplier-list/paste";
import { commercialPrice, priceForMargin, proposedPrice } from "@/demo/admin/supplier-list/round";
import { variantPrice } from "@/demo/admin/stock";
import { SUPPLIER_PASTE_TEXT } from "@/demo/fixtures/import/supplier-paste";

const admin = defaultAdminData();
const book: CostBook = { recipes: admin.workshop.recipes, materials: admin.workshop.materials, settings: admin.workshop.settings };
const run = (ending: "900" | "100" | "500" = "900"): SupplierDiff => {
  const out = diffSupplierList(parsePastedList(SUPPLIER_PASTE_TEXT), { products: admin.data.products, book, ending });
  if ("error" in out) throw new Error(out.error);
  return out;
};

describe("redondeo comercial", () => {
  it("termina en 900 y siempre sube", () => {
    expect(commercialPrice(54_900)).toBe(54_900);
    expect(commercialPrice(54_901)).toBe(55_900);
    expect(commercialPrice(1_000)).toBe(1_900);
    expect(commercialPrice(116_450)).toBe(116_900);
    expect(commercialPrice(2_850)).toBe(2_900);
  });
  it("por debajo de $ 1.000 sube al múltiplo de $ 50", () => {
    expect(commercialPrice(851)).toBe(900);
    expect(commercialPrice(900)).toBe(900);
    expect(commercialPrice(0)).toBe(50);
  });
  it("a $100 y a $500", () => {
    expect(commercialPrice(12_001, "100")).toBe(12_100);
    expect(commercialPrice(12_001, "500")).toBe(12_500);
    expect(commercialPrice(12_500, "500")).toBe(12_500);
  });
  it("el precio redondeado nunca deja menos margen que el pedido", () => {
    for (const cost of [1_433, 8_100, 26_400, 43_550, 90_001]) for (const margin of [20, 35, 40, 55]) {
      const price = proposedPrice(cost, margin);
      expect(price).toBeGreaterThanOrEqual(priceForMargin(cost, margin));
      expect(Number.isInteger(price)).toBe(true);
      expect(((price - cost) / price) * 100).toBeGreaterThanOrEqual(margin - 0.01);
    }
  });
  it("el margen se acota de 1 a 90 %", () => {
    expect(priceForMargin(1000, 0)).toBe(1011);
    expect(priceForMargin(1000, 200)).toBe(10_000);
  });
});

describe("lo que se pega", () => {
  it("separa por tabulación aunque el membrete no tenga ninguna, y también un CSV con ;", () => {
    expect(parsePastedList("Lista\nMarca\tCosto\nForja\t$ 1.000\n")).toEqual([["Lista"], ["Marca", "Costo"], ["Forja", "$ 1.000"]]);
    expect(parsePastedList("Marca;Costo\nForja;$ 1.000")).toEqual([["Marca", "Costo"], ["Forja", "$ 1.000"]]);
  });
});

describe("lista del proveedor de muestra", () => {
  const diff = run();
  it("resume cuántas suben, bajan y no coinciden", () => {
    expect(diff.counts).toMatchObject({ sube: 48, baja: 3, igual: 0, nuevo: 0, "sin-coincidencia": 2, error: 0 });
    expect(diff.summary).toBe("48 suben, 3 bajan, 2 sin coincidencia");
    expect(diff.lines).toHaveLength(53);
  });
  it("dice por qué no coinciden las dos filas sueltas", () => {
    const loose = diff.lines.filter((l) => l.kind === "sin-coincidencia");
    expect(loose.map((l) => l.reason)).toEqual(["No lo vendés", expect.stringContaining("No encontramos la presentación")]);
  });
  it("una fila sin sabor vale para todos los sabores de esa presentación", () => {
    const straps = diff.lines.find((l) => l.label.includes("Straps"))!;
    expect(straps.variants.map((v) => v.variantId)).toEqual(["st-negro", "st-rojo", "st-naranja"]);
  });
  it("cada variante lleva su costo anterior, el nuevo y la variación", () => {
    const isolate = diff.variants.find((v) => v.variantId === "iz-chocolate-2lb")!;
    expect(isolate).toMatchObject({ oldCost: 43_500, newCost: 45_000, pct: 3.4 });
    const creatina = diff.variants.find((v) => v.variantId === "cb-sin-sabor-250")!;
    expect(creatina).toMatchObject({ oldCost: 15_900, newCost: 15_100 });
    expect(creatina.pct).toBe(-5);
  });
  it("propone el precio de la marca: margen sobre el costo con embalaje, redondeado hacia arriba", () => {
    const v = diff.variants.find((x) => x.variantId === "iz-chocolate-2lb")!;
    const pack = packagingCost(book.recipes["isolate-zero"], book.materials);
    expect(v.target).toBe(35);
    expect(v.proposed).toBe(proposedPrice(45_000 + pack, 35));
    expect(v.proposed % 1000).toBe(900);
    expect(v.marginAfter).toBeLessThan(v.marginBefore!);
  });
  it("usa el margen propio de la marca cuando lo hay", () => {
    const custom = { ...book, settings: { ...book.settings, brandMargins: { "Krono Nutrition": 50 } } };
    const out = diffSupplierList(parsePastedList(SUPPLIER_PASTE_TEXT), { products: admin.data.products, book: custom, ending: "900" }) as SupplierDiff;
    const krono = out.variants.find((x) => x.brand === "Krono Nutrition")!;
    const brava = out.variants.find((x) => x.brand === "Brava Sport")!;
    expect(brandMargin("Krono Nutrition", custom.settings)).toBe(50);
    expect(krono.target).toBe(50);
    expect(brava.target).toBe(35);
    expect(krono.proposed).toBeGreaterThan(diff.variants.find((x) => x.key === krono.key)!.proposed);
  });
  it("pide las columnas mínimas", () => {
    const out = diffSupplierList([["Foo", "Bar"], ["x", "y"]], { products: admin.data.products, book, ending: "900" });
    expect(out).toHaveProperty("error");
  });
  it("un costo con centavos es una fila con error, no un cambio", () => {
    const out = diffSupplierList([["Marca", "Artículo", "Presentación", "Costo"], ["Forja", "Termo Cut termogénico", "90 cápsulas", "$ 16.200,50"]], { products: admin.data.products, book, ending: "900" }) as SupplierDiff;
    expect(out.counts.error).toBe(1);
    expect(out.variants).toHaveLength(0);
  });
  it("el resumen omite lo que no hay y concuerda el plural", () => {
    expect(summaryOf({ sube: 1, baja: 0, igual: 1, nuevo: 0, "sin-coincidencia": 1, error: 0 })).toBe("1 sube, 1 sin cambio, 1 sin coincidencia");
  });
});

describe("aplicar y deshacer", () => {
  const diff = run();
  const updates = diff.variants.map((v) => ({ productSlug: v.productSlug, variantId: v.variantId, cost: v.newCost, price: v.proposed }));
  const { products, undo } = applyUpdates(admin.data.products, updates, "Lista de prueba", "2026-10-05", "2026-10-05T10:00:00Z");
  it("pone el costo, la fecha desde la que rige y el precio propuesto en pesos enteros", () => {
    const p = products.find((x) => x.slug === "isolate-zero")!;
    const v = p.variants.find((x) => x.id === "iz-chocolate-2lb")!;
    expect(v).toMatchObject({ cost: 45_000, costSince: "2026-10-05" });
    expect(variantPrice(p, v)).toBe(diff.variants.find((x) => x.variantId === "iz-chocolate-2lb")!.proposed);
    for (const q of products) for (const w of q.variants) expect(Number.isInteger(variantPrice(q, w))).toBe(true);
  });
  it("lo que no estaba en la lista no se toca", () => {
    const before = admin.data.products.find((x) => x.slug === "ionic-whey")!;
    expect(products.find((x) => x.slug === "ionic-whey")).toBe(before);
  });
  it("con una sola variante el precio vive en la base", () => {
    const one = products.find((x) => x.slug === "termo-cut")!;
    expect(one.variants[0]!.priceDelta).toBe(0);
    expect(one.basePrice).toBe(diff.variants.find((x) => x.productSlug === "termo-cut")!.proposed);
  });
  it("deshacer deja precios y costos exactamente como estaban", () => {
    expect(undo.count).toBe(diff.variants.length);
    expect(undoPriceChange(products, undo)).toEqual(admin.data.products);
  });
});

describe("aumento al margen de la marca", () => {
  it("lleva cada variante con costo al precio que deja el margen de su marca", () => {
    const { lines, withoutCost } = previewMarginChange(admin.data.products, { kind: "brand", brand: "Krono Nutrition" }, book, "900");
    expect(withoutCost).toBe(0);
    expect(lines.length).toBe(9);
    for (const l of lines) {
      expect(l.to % 100).toBe(0);
      const p = admin.data.products.find((x) => x.slug === l.productSlug)!;
      const v = p.variants.find((x) => l.key.endsWith(`::${x.id}`))!;
      expect(l.to).toBeGreaterThanOrEqual(priceForMargin(landedCost(p, v, book)!, 35));
    }
    expect(linesToUpdates(lines).every((u) => u.price !== undefined && u.cost === undefined)).toBe(true);
  });
  it("las variantes sin costo se cuentan aparte y no se tocan", () => {
    const empty: CostBook = { ...book, recipes: {} };
    const out = previewMarginChange(admin.data.products.filter((p) => p.slug === "isolate-zero"), { kind: "all" }, empty, "900");
    expect(out.lines).toHaveLength(0);
    expect(out.withoutCost).toBe(2);
  });
});
