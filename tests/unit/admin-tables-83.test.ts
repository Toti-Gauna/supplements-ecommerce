import { describe, expect, it } from "vitest";
import { categoryRows, hasCategoryNamed } from "@/demo/admin/categories";
import { defaultAdminData } from "@/demo/admin/defaults";
import { cellKey, specPrune, specText } from "@/demo/admin/sheet";
import { applyCategoryDraft, applyMaterialDraft, categorySheetSpec, materialSheetSpec, parseQty, productSheetSpec } from "@/demo/admin/sheet-specs";
import { stockRows } from "@/demo/admin/stock";
import { applyFilters, facetCount, filterRows, paginate, type FilterSpec } from "@/demo/admin/table";
import { materialRows } from "@/demo/admin/workshop/materials";

/** Polish 8.3 · Lote 2: filtros de las tablas y vistas Excel. */
interface Row { name: string; state: "a" | "b"; day: string }
const rows: Row[] = [{ name: "Vela", state: "a", day: "2026-10-01" }, { name: "Comedero", state: "b", day: "2026-10-05" }, { name: "Vela XL", state: "b", day: "2026-10-09" }];
const specs: FilterSpec<Row>[] = [
  { id: "estado", label: "Estado", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], test: (r, v) => r.state === v },
  { id: "desde", label: "Desde", kind: "date", test: (r, v) => r.day >= v },
];

describe("filtros de las tablas (8.3.4)", () => {
  it("el valor vacío no filtra y los filtros se suman", () => {
    expect(applyFilters(rows, specs, {})).toHaveLength(3);
    expect(applyFilters(rows, specs, { estado: "b" }).map((r) => r.name)).toEqual(["Comedero", "Vela XL"]);
    expect(applyFilters(rows, specs, { estado: "b", desde: "2026-10-06" }).map((r) => r.name)).toEqual(["Vela XL"]);
  });
  it("cuenta cada opción con el resto de los filtros aplicados, y busca sobre lo filtrado", () => {
    expect(facetCount(rows, specs, { desde: "2026-10-02" }, "estado", "a")).toBe(0);
    expect(facetCount(rows, specs, { desde: "2026-10-02" }, "estado", "")).toBe(2);
    expect(filterRows(rows, specs, { estado: "b" }, "vela", (r) => r.name).map((r) => r.name)).toEqual(["Vela XL"]);
  });
  it("filtrar nunca deja una página inválida: diez por página y la página se ajusta al total", () => {
    const many = Array.from({ length: 23 }, (_, i) => i);
    expect(paginate(many, 3, 10)).toMatchObject({ page: 3, pages: 3, from: 21, to: 23 });
    expect(paginate(many.slice(0, 4), 3, 10)).toMatchObject({ page: 1, pages: 1, from: 1, to: 4 });
    expect(paginate([], 2, 10)).toMatchObject({ page: 1, pages: 1, from: 0, to: 0 });
  });
});

describe("vistas Excel (8.3.4, 8.3.18, 8.3.19, 8.3.22)", () => {
  const admin = defaultAdminData();
  it("Productos y stock: a pedido se muestra como texto y lo que vuelve a su valor sale del borrador", () => {
    const stock = stockRows(admin.data.products, admin.data.categories);
    const spec = productSheetSpec(admin.data.categories);
    const toOrder = stock.find((r) => r.stock < 0)!;
    expect(specText(spec.columns.find((c) => c.id === "stock")!, toOrder.stock, toOrder)).toBe("a pedido");
    expect(specPrune(spec, stock, { [cellKey(toOrder.key, "stock")]: -1, [cellKey(toOrder.key, "price")]: toOrder.price + 100 })).toEqual({ [cellKey(toOrder.key, "price")]: toOrder.price + 100 });
  });
  it("las columnas calculadas o críticas son de solo lectura", () => {
    const readOnly = (spec: { columns: { id: string; parse?: unknown }[] }) => spec.columns.filter((c) => !c.parse).map((c) => c.id);
    expect(readOnly(materialSheetSpec)).toEqual(["unit", "committed", "available", "state", "reorder"]);
    expect(readOnly(categorySheetSpec)).toEqual(["position", "active", "reorder"]);
    expect(specPrune(materialSheetSpec, materialRows(admin.workshop.materials, admin.orders, admin.workshop.recipes), { [cellKey(admin.workshop.materials[0]!.id, "committed")]: 99 })).toEqual({});
  });
  it("insumos: cantidades válidas según la unidad y un solo guardado con lo editado", () => {
    expect(parseQty("1.500", false)).toEqual({ ok: true, value: 1500 });
    expect(parseQty("2,5", true)).toEqual({ ok: true, value: 2.5 });
    expect(parseQty("2,5", false).ok).toBe(false);
    expect(parseQty("-3", false).ok).toBe(false);
    expect(parseQty("", true).ok).toBe(false);
    const [first, second] = admin.workshop.materials;
    const next = applyMaterialDraft(admin.workshop.materials, { [cellKey(first!.id, "stock")]: 42, [cellKey(second!.id, "supplier")]: "", [cellKey("no-existe", "stock")]: 1 });
    expect(next[0]).toEqual({ ...first, stock: 42 });
    expect(next[1]!.supplier).toBeUndefined();
    expect(next).toHaveLength(admin.workshop.materials.length);
  });
  it("categorías: orden global, conteos, nombre repetido y edición sin mover el orden", () => {
    const list = categoryRows(admin.data.categories, admin.data.products);
    expect(list.map((c) => c.position)).toEqual(list.map((_, i) => i + 1));
    expect(list.reduce((s, c) => s + c.total, 0)).toBe(admin.data.products.length);
    expect(hasCategoryNamed(admin.data.categories, ` ${admin.data.categories[0]!.name.toUpperCase()} `)).toBe(true);
    expect(hasCategoryNamed(admin.data.categories, "Algo nuevo")).toBe(false);
    const c = list[1]!;
    const next = applyCategoryDraft(admin.data.categories, { [cellKey(c.slug, "name")]: "Renombrada", [cellKey(c.slug, "featured")]: !c.featured });
    const edited = next.find((x) => x.slug === c.slug)!;
    expect(edited).toMatchObject({ name: "Renombrada", featured: !c.featured, sortOrder: admin.data.categories.find((x) => x.slug === c.slug)!.sortOrder });
  });
});
