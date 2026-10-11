import { describe, expect, it } from "vitest";
import { defaultDemoData } from "@/demo/engine/source";
import { parseCsv, parseMoney, parseStock, parseYesNo, slugify } from "@/demo/admin/import/cells";
import { detectMapping, findHeaderRow } from "@/demo/admin/import/columns";
import { buildImportPlan } from "@/demo/admin/import/plan";
import { catalogSheet, SAMPLE_SHEET } from "@/demo/admin/import/template";

const data = () => { const d = defaultDemoData(); return { products: d.products, categories: d.categories }; };

describe("celdas de la planilla", () => {
  it("precios en pesos enteros, con $ y puntos de miles", () => {
    expect(parseMoney("$ 12.500")).toEqual({ ok: true, value: 12500 });
    expect(parseMoney("1.250,00")).toEqual({ ok: true, value: 1250 });
    expect(parseMoney(18900)).toEqual({ ok: true, value: 18900 });
    expect(parseMoney("15.990,50").ok).toBe(false);
    expect(parseMoney(10.5).ok).toBe(false);
    expect(parseMoney("-200").ok).toBe(false);
  });
  it("stock: números, a pedido y vacío sin cambios", () => {
    expect(parseStock("a pedido")).toEqual({ ok: true, value: -1 });
    expect(parseStock(-1)).toEqual({ ok: true, value: -1 });
    expect(parseStock("1.200")).toEqual({ ok: true, value: 1200 });
    expect(parseStock("")).toEqual({ ok: true, value: null });
    expect(parseStock("-5").ok).toBe(false);
    expect(parseStock("12,5").ok).toBe(false);
  });
  it("sí y no", () => {
    expect(parseYesNo("Sí")).toEqual({ ok: true, value: true });
    expect(parseYesNo("pausado")).toEqual({ ok: true, value: false });
    expect(parseYesNo("tal vez").ok).toBe(false);
  });
  it("CSV de Excel en español con ; y comillas", () => {
    expect(parseCsv('﻿Producto;Precio\n"Vela; caniche";"$ 11.900"\r\n\n')).toEqual([["Producto", "Precio"], ["Vela; caniche", "$ 11.900"]]);
    expect(parseCsv('a,b\n"di ""hola""",2')).toEqual([["a", "b"], ['di "hola"', "2"]]);
  });
  it("slugs sin tildes", () => expect(slugify("Tabla de picada — Ñandú")).toBe("tabla-de-picada-nandu"));
});

describe("plan de importación", () => {
  it("reconoce columnas con otros nombres", () => {
    const m = detectMapping(SAMPLE_SHEET[0]!);
    expect(m).toMatchObject({ code: null, category: 0, product: 1, variant: 2, price: 3, stock: 4, visible: 5, description: null });
    expect(findHeaderRow([["Mi lista de stock"], ...SAMPLE_SHEET])).toBe(1);
  });
  it("crea, actualiza, deja igual y marca errores sin aplicarlos", () => {
    const plan = buildImportPlan(SAMPLE_SHEET, 0, detectMapping(SAMPLE_SHEET[0]!), data());
    expect(plan.counts).toEqual({ "create-product": 1, "create-variant": 2, update: 4, unchanged: 1, error: 1 });
    expect(plan.newCategories).toEqual(["Mates y cocina"]);
    const tabla = plan.next.products.find((p) => p.name === "Tabla de picada con nombre")!;
    expect(tabla.basePrice).toBe(24000);
    expect(tabla.variants.map((v) => [v.label, v.priceDelta, v.stock])).toEqual([["Grande (40 cm)", 0, 6], ["Chica (30 cm)", -4500, 10]]);
    const bowl = plan.next.products.find((p) => p.slug === "comedero-elevado-madera")!;
    // Precio de una variante de un producto con varias: cambia la diferencia, no el precio base
    expect(bowl.variants[0]).toMatchObject({ stock: 9, priceDelta: 1500 });
    expect(bowl.basePrice).toBe(32000);
    const error = plan.rows.find((r) => r.action === "error")!;
    expect(error.line).toBe(10);
    expect(error.errors[0]).toMatch(/pesos enteros/);
    expect(plan.next.products.find((p) => p.slug === "salchicha-geometrico")!.basePrice).toBe(data().products.find((p) => p.slug === "salchicha-geometrico")!.basePrice);
  });
  it("pide la variante cuando el producto tiene varias", () => {
    const rows = [["Producto", "Stock"], ["Vela caniche", 3]];
    const plan = buildImportPlan(rows, 0, detectMapping(rows[0]!), data());
    expect(plan.rows[0]!.errors[0]).toMatch(/indicá cuál/);
  });
  it("la plantilla con el catálogo actual vuelve a entrar sin cambios", () => {
    const d = data();
    const sheet = catalogSheet(d.products, d.categories);
    const plan = buildImportPlan(sheet, 0, detectMapping(sheet[0]!), d);
    expect(plan.counts.unchanged).toBe(sheet.length - 1);
    expect(plan.counts.error).toBe(0);
  });
  it("con nombres repetidos pide el código; con código actualiza el correcto y permite renombrar", () => {
    const d = data();
    d.products.push({ ...structuredClone(d.products.find((p) => p.slug === "difusor")!), slug: "difusor-2" });
    const rows = [["Producto", "Stock"], ["Difusor de varillas Volta", 4]];
    expect(buildImportPlan(rows, 0, detectMapping(rows[0]!), d).rows[0]!.errors[0]).toMatch(/columna Código/);
    const withCode = [["Código", "Producto", "Stock"], ["difusor-2", "Difusor XL", 4]];
    const plan = buildImportPlan(withCode, 0, detectMapping(withCode[0]!), d);
    expect(plan.next.products.find((p) => p.slug === "difusor-2")).toMatchObject({ name: "Difusor XL", variants: [expect.objectContaining({ stock: 4 })] });
    expect(plan.next.products.find((p) => p.slug === "difusor")!.variants[0]!.stock).toBe(10);
  });
  it("producto nuevo sin categoría o sin precio no entra", () => {
    const rows = [["Producto", "Precio", "Categoría"], ["Mate", "", "Cocina"], ["Termo", "$ 9.000", ""]];
    const plan = buildImportPlan(rows, 0, detectMapping(rows[0]!), data());
    expect(plan.rows.map((r) => r.action)).toEqual(["error", "error"]);
    expect(plan.next.products).toHaveLength(data().products.length);
  });
});
