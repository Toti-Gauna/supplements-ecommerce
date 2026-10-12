import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { customerRows } from "@/demo/admin/customers";
import { applyDraft, cellKey, expandEdit, parseCellInput, parseTsv, pruneDraft, sheetReducer, toTsv } from "@/demo/admin/sheet";
import { applyStockOp, inventoryValue, lowStockRows, productStockTotal, stockRows, stockState } from "@/demo/admin/stock";
import { productStockBadge } from "@/demo/admin/stock-badge";
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
  // Ningún producto del catálogo es a pedido: el shaker pasa a pedido solo para estas pruebas.
  const products = admin.data.products.map((p) => (p.slug === "shaker-volta" ? { ...p, variants: p.variants.map((v) => ({ ...v, stock: -1 })) } : p));
  it("sumar y fijar stock en lote sin tocar lo que es a pedido", () => {
    const keys = ["ionic-whey::iw-chocolate-2lb", "shaker-volta::sh-grafito"];
    const next = applyStockOp(products, keys, { kind: "add", units: 5 });
    expect(next.find((p) => p.slug === "ionic-whey")!.variants[0]!.stock).toBe(23);
    expect(next.find((p) => p.slug === "shaker-volta")!.variants[0]!.stock).toBe(-1);
    expect(applyStockOp(products, keys, { kind: "set", stock: 0 }).find((p) => p.slug === "shaker-volta")!.variants[0]!.stock).toBe(0);
  });
  it("estados de stock y alertas", () => {
    expect([stockState(-1), stockState(0), stockState(2), stockState(10)]).toEqual(["made-to-order", "out", "low", "ok"]);
    const low = lowStockRows(products, admin.data.categories);
    expect(low.some((r) => r.productSlug === "isolate-zero" && r.variantLabel === "Vainilla" && r.state === "out")).toBe(true);
    expect(low.some((r) => r.productSlug === "overvolt-pre" && r.variantLabel === "Mango" && r.state === "low")).toBe(true);
    expect(low.every((r) => r.stock >= 0 && r.stock <= 3)).toBe(true);
    const shaker = products.find((p) => p.slug === "shaker-volta")!;
    expect(productStockTotal(shaker)).toBeNull();
    expect(inventoryValue(stockRows(products, admin.data.categories))).toBeGreaterThan(0);
  });
  it("la insignia de stock del producto sale de la variante más baja, no de la suma", () => {
    const bar = products.find((p) => p.slug === "barra-proteica")!;
    const withStocks = (p: typeof bar, stocks: number[]) => ({ ...p, variants: p.variants.slice(0, stocks.length).map((v, i) => ({ ...v, stock: stocks[i]! })) });
    // La barra del catálogo: mucho stock en total y una sola variante baja ("Stock bajo · 139" se contradecía).
    expect(productStockBadge(bar)).toEqual({ state: "low", text: "1 variante baja" });
    expect(productStockBadge(withStocks(bar, [40, 2, 3]))).toEqual({ state: "low", text: "2 variantes bajas" });
    expect(productStockBadge(withStocks(bar, [40, 0, 0, 2]))).toEqual({ state: "out", text: "Sin stock en 2 variantes" });
    expect(productStockBadge(withStocks(bar, [0, 0]))).toEqual({ state: "out", text: "Sin stock" });
    expect(productStockBadge(withStocks(bar, [2]))).toEqual({ state: "low", text: "Stock bajo · 2" });
    expect(productStockBadge(withStocks(bar, [40, 12]))).toEqual({ state: "ok", text: "En stock · 52" });
    expect(productStockBadge(withStocks(bar, [-1, 12]))).toEqual({ state: "ok", text: "En stock" });
    expect(productStockBadge(withStocks(bar, [-1, -1]))).toEqual({ state: "made-to-order", text: "A pedido" });
    // El umbral es el de "Avisar con N o menos".
    expect(productStockBadge(withStocks(bar, [40, 5]), 5)).toEqual({ state: "low", text: "1 variante baja" });
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
  const pre = rows.filter((r) => r.productSlug === "overvolt-pre");
  it("valida lo que se escribe en cada celda", () => {
    expect(parseCellInput("price", "$ 12.900", admin.data.categories)).toEqual({ ok: true, value: 12900 });
    expect(parseCellInput("stock", "a pedido", admin.data.categories)).toEqual({ ok: true, value: -1 });
    expect(parseCellInput("categorySlug", "creatinas", admin.data.categories)).toEqual({ ok: true, value: "creatinas" });
    expect(parseCellInput("categorySlug", "Inventada", admin.data.categories).ok).toBe(false);
    expect(parseCellInput("productName", "  ", admin.data.categories).ok).toBe(false);
  });
  it("las columnas de producto se copian a todas sus variantes y se aplican de una vez", () => {
    expect(pre).toHaveLength(3);
    const edit = expandEdit(rows, pre[0]!.key, "productName", "Overvolt pre-entreno XL");
    expect(Object.keys(edit)).toHaveLength(pre.length);
    const draft = { ...edit, [cellKey(pre[1]!.key, "price")]: 38900, [cellKey(pre[0]!.key, "stock")]: 2 };
    const next = applyDraft(admin.data.products, rows, draft).find((p) => p.slug === "overvolt-pre")!;
    expect(next.name).toBe("Overvolt pre-entreno XL");
    expect(next.basePrice + next.variants[1]!.priceDelta).toBe(38900);
    expect(next.variants[0]!.stock).toBe(2);
    expect(pruneDraft(rows, { [cellKey(pre[0]!.key, "stock")]: pre[0]!.stock })).toEqual({});
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
