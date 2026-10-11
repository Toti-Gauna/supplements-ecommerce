import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { customerRows } from "@/demo/admin/customers";
import { applyDraft, cellKey, expandEdit, parseCellInput, parseTsv, pruneDraft, sheetReducer, toTsv } from "@/demo/admin/sheet";
import { applyStockOp, inventoryValue, lowStockRows, productStockTotal, stockRows, stockState } from "@/demo/admin/stock";
import { compareValues, exportFileName, matchesQuery, paginate, sortRows } from "@/demo/admin/table";

describe("tablas del panel", () => {
  it("ordena números, texto en español y deja los vacíos al final", () => {
    expect(sortRows([3, null, 1, 2], (x) => x, "desc")).toEqual([3, 2, 1, null]);
    expect(sortRows(["Ñandú", "avión", "Zorro", "bote"], (x) => x, "asc")).toEqual(["avión", "bote", "Ñandú", "Zorro"]);
    expect(compareValues("item 2", "item 10")).toBeLessThan(0);
  });
  it("busca sin tildes y con varias palabras", () => {
    expect(matchesQuery("vela lavanda", "Vela caniche", "Lavanda")).toBe(true);
    expect(matchesQuery("comedero", "Vela caniche")).toBe(false);
  });
  it("pagina y arma el nombre del archivo", () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toMatchObject({ items: [3, 4], pages: 3, from: 3, to: 4 });
    expect(paginate([1, 2], 9, 2).page).toBe(1);
    expect(exportFileName("Pedidos", new Date("2026-10-09T15:00:00Z"))).toBe("volta-pedidos-2026-10-09.xlsx");
  });
});

describe("stock y clientes", () => {
  const admin = defaultAdminData();
  it("sumar y fijar stock en lote sin tocar lo que es a pedido", () => {
    const keys = ["vela-caniche::vc-vainilla", "velador-con-foto::vcf-m"];
    const next = applyStockOp(admin.data.products, keys, { kind: "add", units: 5 });
    expect(next.find((p) => p.slug === "vela-caniche")!.variants[0]!.stock).toBe(13);
    expect(next.find((p) => p.slug === "velador-con-foto")!.variants[0]!.stock).toBe(-1);
    expect(applyStockOp(admin.data.products, keys, { kind: "set", stock: 0 }).find((p) => p.slug === "velador-con-foto")!.variants[0]!.stock).toBe(0);
  });
  it("estados de stock y alertas", () => {
    expect([stockState(-1), stockState(0), stockState(2), stockState(10)]).toEqual(["made-to-order", "out", "low", "ok"]);
    const low = lowStockRows(admin.data.products, admin.data.categories);
    expect(low.some((r) => r.productSlug === "comedero-elevado-madera" && r.variantLabel === "Nogal")).toBe(true);
    expect(low.every((r) => r.stock >= 0 && r.stock <= 3)).toBe(true);
    const lamp = admin.data.products.find((p) => p.slug === "velador-con-foto")!;
    expect(productStockTotal(lamp)).toBeNull();
    expect(inventoryValue(stockRows(admin.data.products, admin.data.categories))).toBeGreaterThan(0);
  });
  it("une cuentas e invitados por email y calcula el total pagado", () => {
    const rows = customerRows(admin.users, admin.orders);
    const emails = rows.map((r) => r.email.toLowerCase());
    expect(new Set(emails).size).toBe(emails.length);
    for (const r of rows) expect(r.totalSpent).toBe(r.orders.filter((o) => ["PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"].includes(o.status) || (o.status === "IN_CLAIM" && o.prevStatus)).reduce((s, o) => s + o.total, 0));
    expect(rows.some((r) => !r.registered)).toBe(true);
  });
});

describe("planilla", () => {
  const admin = defaultAdminData();
  const rows = stockRows(admin.data.products, admin.data.categories);
  const vela = rows.filter((r) => r.productSlug === "vela-caniche");
  it("valida lo que se escribe en cada celda", () => {
    expect(parseCellInput("price", "$ 12.900", admin.data.categories)).toEqual({ ok: true, value: 12900 });
    expect(parseCellInput("stock", "a pedido", admin.data.categories)).toEqual({ ok: true, value: -1 });
    expect(parseCellInput("categorySlug", "velas", admin.data.categories)).toEqual({ ok: true, value: "velas" });
    expect(parseCellInput("categorySlug", "Inventada", admin.data.categories).ok).toBe(false);
    expect(parseCellInput("productName", "  ", admin.data.categories).ok).toBe(false);
  });
  it("las columnas de producto se copian a todas sus variantes y se aplican de una vez", () => {
    const edit = expandEdit(rows, vela[0]!.key, "productName", "Vela caniche XL");
    expect(Object.keys(edit)).toHaveLength(vela.length);
    const draft = { ...edit, [cellKey(vela[1]!.key, "price")]: 13900, [cellKey(vela[0]!.key, "stock")]: 2 };
    const next = applyDraft(admin.data.products, rows, draft).find((p) => p.slug === "vela-caniche")!;
    expect(next.name).toBe("Vela caniche XL");
    expect(next.basePrice + next.variants[1]!.priceDelta).toBe(13900);
    expect(next.variants[0]!.stock).toBe(2);
    expect(pruneDraft(rows, { [cellKey(vela[0]!.key, "stock")]: vela[0]!.stock })).toEqual({});
  });
  it("deshacer y rehacer", () => {
    let h = sheetReducer({ draft: {}, past: [], future: [] }, { type: "set", cells: { a: 1 } });
    h = sheetReducer(h, { type: "set", cells: { b: 2 } });
    h = sheetReducer(h, { type: "undo" });
    expect(h.draft).toEqual({ a: 1 });
    h = sheetReducer(h, { type: "redo" });
    expect(h.draft).toEqual({ a: 1, b: 2 });
  });
  it("copia y pega con Excel", () => {
    expect(parseTsv("a\tb\r\nc\td\r\n")).toEqual([["a", "b"], ["c", "d"]]);
    expect(toTsv([["x", 'di "hola"']])).toBe('x\t"di ""hola"""');
    expect(parseTsv('"Rosa\nMediano"\t5\nb\t6')).toEqual([["Rosa\nMediano", "5"], ["b", "6"]]);
    expect(parseTsv(toTsv([["a\tb", "c"]]))).toEqual([["a\tb", "c"]]);
  });
});
