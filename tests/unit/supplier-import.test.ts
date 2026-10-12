import { describe, expect, it } from "vitest";
import type { Cell } from "@/demo/admin/import/cells";
import { buildImportPlan } from "@/demo/admin/import/plan";
import { detectMapping, findHeaderRow } from "@/demo/admin/import/columns";
import { buildSupplierPlan, findProduct, priceFromMargin } from "@/demo/admin/import/supplier";
import { detectSheetKind, detectSupplierMapping, findSupplierHeader } from "@/demo/admin/import/supplier-columns";
import { SAMPLE_SHEET } from "@/demo/admin/import/template";
import { SUPPLIER_MARGIN_SHEET, SUPPLIER_SHEET } from "@/demo/fixtures/import/supplier-list";
import { listPrice } from "@/demo/engine/catalog";
import { defaultDemoData } from "@/demo/engine/source";
import type { Product } from "@/demo/types";

const data = () => { const d = defaultDemoData(); return { products: d.products, categories: d.categories }; };
const plan = (rows: Cell[][]) => buildSupplierPlan(rows, findSupplierHeader(rows), detectSupplierMapping(rows[findSupplierHeader(rows)]!), data());
const variant = (list: Product[], slug: string, id: string) => { const p = list.find((x) => x.slug === slug)!; return { p, v: p.variants.find((v) => v.id === id)! }; };

describe("lista de precios del proveedor", () => {
  it("reconoce la lista aunque traiga membrete y columnas con otros nombres", () => {
    expect(findSupplierHeader(SUPPLIER_SHEET)).toBe(3);
    expect(detectSupplierMapping(SUPPLIER_SHEET[3]!)).toMatchObject({ brand: 0, product: 2, size: 3, flavor: 4, variant: null, cost: 5, price: 6, margin: null });
    expect(detectSupplierMapping(SUPPLIER_MARGIN_SHEET[0]!)).toMatchObject({ cost: 3, margin: 4, price: null });
    expect(detectSheetKind(SUPPLIER_SHEET)).toBe("supplier");
    expect(detectSheetKind(SAMPLE_SHEET)).toBe("catalog");
  });
  it("encuentra el producto por marca y nombre, aunque el nombre del distribuidor sea más largo", () => {
    const { products } = data();
    expect(findProduct(products, "Night Casein", "Brava Sport")?.slug).toBe("night-casein");
    expect(findProduct(products, "Creatina Brava 100% pura 250 g", "Brava")?.slug).toBe("creatina-brava");
    expect(findProduct(products, "Night Casein", "Forja")).toBeUndefined();
  });
  it("actualiza costo y precio; una fila sin sabor vale para todos los sabores de esa presentación", () => {
    const p = plan(SUPPLIER_SHEET);
    expect(p.kind).toBe("supplier");
    const casein = p.rows.find((r) => r.product === "Night Casein")!;
    expect(casein.action).toBe("update");
    expect(casein.changes[0]).toMatch(/^2 variantes: Chocolate, Vainilla/);
    for (const id of ["nc-chocolate-2lb", "nc-vainilla-2lb"]) {
      const { p: prod, v } = variant(p.next.products, "night-casein", id);
      expect(v.cost).toBe(41200);
      expect(listPrice(prod, v)).toBe(69900);
    }
    const alfajor12 = variant(p.next.products, "alfajor-proteico", "ap-dulce-de-leche-x12");
    expect(listPrice(alfajor12.p, alfajor12.v)).toBe(31500);
    const alfajor6 = variant(p.next.products, "alfajor-proteico", "ap-dulce-de-leche-x6");
    expect(listPrice(alfajor6.p, alfajor6.v)).toBe(16900);
  });
  it("lo que no vendés se saltea; presentación inexistente y centavos son errores; no crea productos", () => {
    const p = plan(SUPPLIER_SHEET);
    expect(p.rows.filter((r) => r.action === "skip").map((r) => r.product)).toEqual(["Brava Sport · Barra Brava Crunch", "Krono Nutrition · Krono Mass 5 kg"]);
    const errors = p.rows.filter((r) => r.action === "error");
    expect(errors.map((r) => r.errors[0])).toEqual(["No encontramos la presentación “Caja x 24”", "El precio tiene que ser en pesos enteros, sin centavos"]);
    expect(p.next.products).toHaveLength(data().products.length);
    expect(p.counts.update).toBe(14);
    expect(p.summary).toBe("14 filas con costo o precio nuevo");
  });
  it("con margen en vez de precio: precio = costo / (1 − margen), redondeado hacia arriba a $100", () => {
    expect(priceFromMargin(29800, 40)).toBe(49700);
    expect(priceFromMargin(6100, 38)).toBe(9900);
    const p = plan(SUPPLIER_MARGIN_SHEET);
    const vegan = variant(p.next.products, "proteina-vegana", "pv-chocolate-1kg");
    expect(vegan.v.cost).toBe(29800);
    expect(listPrice(vegan.p, vegan.v)).toBe(49700);
    expect(p.rows[0]!.changes.join(" ")).toContain("(margen 40 %)");
    const omega120 = variant(p.next.products, "omega-3", "o3-120");
    expect(listPrice(omega120.p, omega120.v)).toBe(31500);
  });
  it("sin sabor ni presentación en un producto con varios tamaños, pide que se indique cuál", () => {
    const rows: Cell[][] = [["Marca", "Producto", "Costo"], ["VOLTA Lab", "Ionic Whey 100%", "$ 30.000"]];
    expect(plan(rows).rows[0]!.errors[0]).toMatch(/varias presentaciones/);
  });
  it("el catálogo de la tienda sigue funcionando igual (y nunca saltea filas)", () => {
    const c = buildImportPlan(SAMPLE_SHEET, findHeaderRow(SAMPLE_SHEET), detectMapping(SAMPLE_SHEET[0]!), data());
    expect(c.kind).toBe("catalog");
    expect(c.counts.skip).toBe(0);
    expect(c.summary).toMatch(/productos nuevos/);
  });
});
