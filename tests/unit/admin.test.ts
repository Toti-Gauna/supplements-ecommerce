import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { countByStatus, delta, filterOrders, salesSummary, topProducts } from "@/demo/admin/metrics";
import { availability, getProduct, visibleCategories } from "@/demo/engine/catalog";
import { validateCoupon } from "@/demo/engine/coupons";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

const now = new Date("2026-10-04T12:00:00-03:00");
beforeEach(() => setDemoData(defaultDemoData()));

describe("métricas del panel demo", () => {
  const { orders } = defaultAdminData();
  it("cuenta pedidos por estado", () => {
    const c = countByStatus(orders);
    expect(c.PAYMENT_REVIEW).toBe(2);
    expect(c.PENDING_PAYMENT).toBe(2);
  });
  it("ventas de muestra solo con pedidos pagados o posteriores", () => {
    const s = salesSummary(orders, DEMO_TODAY);
    expect(s.days).toHaveLength(7);
    expect(s.today).toBe(0);
    expect(s.week).toBeGreaterThan(0);
    expect(s.month).toBeGreaterThanOrEqual(s.week);
  });
  it("8.3.1: barras, tabla y KPI salen del mismo cálculo y concilian", () => {
    const s = salesSummary(orders, DEMO_TODAY);
    // La suma de los 7 días es exactamente el KPI "Ventas últimos 7 días".
    expect(s.days.reduce((t, d) => t + d.amount, 0)).toBe(s.week);
    for (const d of s.days) {
      // Cada día lista sus pedidos: cantidad y total coinciden con la barra.
      expect(d.codes).toHaveLength(d.orders);
      const total = d.codes.reduce((t, code) => t + orders.find((o) => o.code === code)!.total, 0);
      expect(total).toBe(d.amount);
    }
    // Hay días sin ventas (para el estado vacío) y días con varios pedidos.
    expect(s.days.some((d) => d.orders === 0)).toBe(true);
    expect(s.days.some((d) => d.orders > 0)).toBe(true);
  });
  it("ticket promedio, variación semanal y top productos", () => {
    const s = salesSummary(orders, DEMO_TODAY);
    expect(s.avgTicket).toBeGreaterThan(0);
    expect(delta(150, 100)).toBe(50);
    expect(delta(10, 0)).toBeNull();
    const top = topProducts(orders, 3);
    expect(top).toHaveLength(3);
    expect(top[0]!.units).toBeGreaterThanOrEqual(top[1]!.units);
  });
  it("filtra por código, estado y fecha", () => {
    expect(filterOrders(orders, { q: "000123", status: "ALL", from: "", to: "" }).map((o) => o.code)).toEqual(["VEL-000123"]);
    expect(filterOrders(orders, { q: "", status: "PAYMENT_REVIEW", from: "", to: "" })).toHaveLength(2);
    expect(filterOrders(orders, { q: "", status: "ALL", from: "2026-10-03", to: "2026-10-04" })).toHaveLength(3);
  });
});

describe("los cambios del panel se reflejan en la tienda", () => {
  it("stock en 0 deja la variante sin stock", () => {
    const data = defaultDemoData();
    data.products = data.products.map((p) => (p.slug === "vela-caniche" ? { ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) } : p));
    setDemoData(data);
    const p = getProduct("vela-caniche")!;
    expect(availability(p, p.variants[0]!)).toEqual({ kind: "out-of-stock" });
  });
  it("un producto desactivado sale de los listados y su categoría vacía se oculta", () => {
    const data = defaultDemoData();
    data.products = data.products.map((p) => (p.categorySlug === "souvenirs" ? { ...p, active: false } : p));
    setDemoData(data);
    expect(visibleCategories().map((c) => c.slug)).not.toContain("souvenirs");
  });
  it("un cupón pausado o agotado se rechaza", () => {
    const data = defaultDemoData();
    data.coupons = [{ code: "PAUSA", type: "PERCENT", value: 5, description: "", active: false }, { code: "AGOTADO", type: "PERCENT", value: 5, description: "", maxUses: 3, usedCount: 3 }];
    setDemoData(data);
    expect(validateCoupon("PAUSA", { subtotal: 1000, isRegistered: true, now })).toMatchObject({ ok: false });
    expect(validateCoupon("AGOTADO", { subtotal: 1000, isRegistered: true, now })).toMatchObject({ ok: false });
  });
});
