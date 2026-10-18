import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { coverage, coverageText, costAge, costSince, dailySales, liquidationProfit, SALES_WINDOW_DAYS } from "@/demo/admin/live-costs";
import { liveCostRows } from "@/demo/admin/live-rows";
import type { CostBook } from "@/demo/admin/supplier-list/costs";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEFAULT_COST_SINCE } from "@/demo/fixtures/live-costs";
import { createWorkshopActions } from "@/demo/admin/workshop-slice";
import type { AdminData } from "@/demo/admin/defaults";

const admin = defaultAdminData();
const book: CostBook = { recipes: admin.workshop.recipes, materials: admin.workshop.materials, settings: admin.workshop.settings };
const order = (day: string, lines: [string, string, number][], status = "PAID") =>
  ({ status, createdAt: `${day}T12:00:00-03:00`, lines: lines.map(([productSlug, variantId, quantity]) => ({ id: "x", productSlug, variantId, quantity })) }) as { status: never; prevStatus?: never; createdAt: string; lines: never };

describe("venta diaria", () => {
  it("cuenta pedidos pagados de las últimas 8 semanas y el mostrador, no los impagos ni los viejos", () => {
    const sales = dailySales(
      [order("2026-10-01", [["ionic-whey", "iw-chocolate-2lb", 2]]), order("2026-09-20", [["ionic-whey", "iw-chocolate-2lb", 4]]),
        order("2026-10-02", [["ionic-whey", "iw-chocolate-2lb", 9]], "PENDING_PAYMENT"), order("2026-07-01", [["ionic-whey", "iw-chocolate-2lb", 9]])],
      [{ day: "2026-10-05", lines: [{ productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", qty: 6 }] as never }],
      DEMO_TODAY,
    );
    expect(sales.get("ionic-whey::iw-chocolate-2lb")).toBe(12 / SALES_WINDOW_DAYS);
    expect(sales.size).toBe(1);
  });
  it("un pedido en reclamo cuenta si venía pagado", () => {
    const o = { ...order("2026-10-01", [["ionic-whey", "iw-chocolate-2lb", 1]], "IN_CLAIM"), prevStatus: "DELIVERED" as never };
    expect(dailySales([o], [], DEMO_TODAY).size).toBe(1);
  });
});

describe("cobertura de stock", () => {
  it("es stock / venta diaria, hacia abajo", () => {
    expect(coverage(18, 0.6)).toEqual({ days: 30, state: "ok" });
    expect(coverage(7, 1)).toEqual({ days: 7, state: "corta" });
    expect(coverage(100, 0.5)).toEqual({ days: 200, state: "larga" });
    expect(coverage(10, 3)).toEqual({ days: 3, state: "corta" });
  });
  it("casos sin cuenta: a pedido, sin stock y sin ventas", () => {
    expect(coverage(-1, 2).state).toBe("a-pedido");
    expect(coverage(0, 2)).toEqual({ days: 0, state: "sin-stock" });
    expect(coverage(12, 0)).toEqual({ days: null, state: "sin-ventas" });
  });
});

describe("cobertura en una celda", () => {
  it("dice los días o, si no hay cuenta, el rótulo", () => {
    expect(coverageText(coverage(18, 0.6))).toBe("30 días");
    expect(coverageText(coverage(1, 1))).toBe("1 día");
    expect(coverageText(coverage(12, 0))).toBe("Sin ventas");
    expect(coverageText(coverage(-1, 3))).toBe("A pedido");
    expect(coverageText(coverage(0, 3))).toBe("0 días");
  });
});

describe("desde cuándo rige el costo", () => {
  const p = admin.data.products.find((x) => x.slug === "isolate-zero")!;
  it("usa el de la lista del proveedor, si no el de la receta y si no el de muestra", () => {
    expect(costSince(p, p.variants[0]!, admin.workshop.recipes["isolate-zero"])).toBe("2026-07-20");
    expect(costSince(p, { ...p.variants[0]!, cost: 45_000, costSince: "2026-10-05" }, undefined)).toBe("2026-10-05");
    expect(costSince(p, p.variants[0]!, { items: [], supplierCost: 1, costSince: "2026-09-01" })).toBe("2026-09-01");
    expect(costSince({ ...p, slug: "nuevo" }, p.variants[0]!, undefined)).toBe(DEFAULT_COST_SINCE);
  });
  it("cuenta los días que lleva el costo", () => {
    expect(costAge("2026-07-20", DEMO_TODAY)).toBe(77);
    expect(costAge("2026-12-01", DEMO_TODAY)).toBe(0);
  });
  it("editar el costo de una receta lo fecha hoy; editar solo el embalaje no", () => {
    let state = { audit: [], workshop: structuredClone(admin.workshop) } as unknown as AdminData;
    const actions = createWorkshopActions((fn) => { state = { ...state, ...fn(state) }; });
    const recipe = state.workshop.recipes["isolate-zero"]!;
    actions.saveRecipe("isolate-zero", { ...recipe, items: [] });
    expect(state.workshop.recipes["isolate-zero"]!.costSince).toBeUndefined();
    actions.saveRecipe("isolate-zero", { ...recipe, supplierCost: 47_000 });
    expect(state.workshop.recipes["isolate-zero"]!.costSince).toBe(DEMO_TODAY);
  });
});

describe("ganancia al liquidar", () => {
  it("es unidades × (precio de liquidación − costo puesto en el local)", () => {
    const l = liquidationProfit(3, 29_000, 14_450, 30);
    expect(l).toMatchObject({ price: 20_300, units: 3, revenue: 60_900, profit: 17_550, ifExpires: -43_350 });
  });
  it("puede dar pérdida, y aun así es menos que dejar que venza", () => {
    const l = liquidationProfit(10, 10_000, 8_000, 40);
    expect(l.price).toBe(6_000);
    expect(l.profit).toBe(-20_000);
    expect(l.profit!).toBeGreaterThan(l.ifExpires!);
  });
  it("sin costo cargado no inventa una ganancia", () => {
    expect(liquidationProfit(5, 10_000, null, 30)).toMatchObject({ profit: null, ifExpires: null, revenue: 35_000 });
  });
  it("todo en pesos enteros", () => {
    const l = liquidationProfit(7, 12_345, 6_789, 33);
    for (const n of [l.price, l.revenue, l.profit!, l.ifExpires!]) expect(Number.isInteger(n)).toBe(true);
  });
});

describe("filas de costos vivos con los datos de muestra", () => {
  const rows = liveCostRows(admin.data.products, book, admin.orders, admin.counter.sales, DEMO_TODAY);
  it("una por variante con costo, con fecha y cobertura", () => {
    expect(rows.length).toBeGreaterThan(100);
    const whey = rows.find((r) => r.variantId === "iw-chocolate-2lb")!;
    expect(whey).toMatchObject({ since: "2026-09-14", stock: 18, supplierCost: 26_400 });
    expect(whey.coverage.state).toMatch(/ok|larga|corta|sin-ventas/);
  });
  it("el lote por vencer trae su ganancia al liquidar con el descuento propuesto", () => {
    const row = rows.find((r) => r.variantId === "bp-mani-x12")!;
    expect(row.lot?.lot.code).toBe("VL-2604-B");
    expect(row.liquidation).toMatchObject({ pct: 30, price: 20_300, units: 3 });
    expect(row.liquidation!.profit).toBe(3 * (20_300 - row.landed));
  });
  it("una variante sin lote por vencer no tiene liquidación", () => {
    expect(rows.find((r) => r.variantId === "iz-chocolate-2lb")!.liquidation).toBeNull();
  });
});
