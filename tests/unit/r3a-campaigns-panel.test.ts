import { describe, expect, it } from "vitest";
import { calendarMonths, campaignFlag, dayOfYear, nextCampaign, overlapError, overlapsWith, upcomingCampaign, yearSpans } from "@/demo/admin/campaign-calendar";
import { campaignResult, campaignResults, resultsTotals, withShopOrderCoupon } from "@/demo/admin/campaign-results";
import { defaultAdminData } from "@/demo/admin/defaults";
import type { AdminOrder } from "@/demo/admin/types";
import { seasonalThemes } from "@/demo/fixtures/themes";

const theme = (id: string) => seasonalThemes.find((t) => t.id === id)!;

describe("calendario de campañas", () => {
  it("día del año y rangos que cruzan el año", () => {
    expect(dayOfYear("2026-01-01")).toBe(1);
    expect(dayOfYear("2027-12-31")).toBe(365);
    expect(dayOfYear("2028-02-29")).toBe(dayOfYear("2027-02-28"));
    expect(yearSpans(theme("ano-nuevo"))).toEqual([[dayOfYear("2026-12-26"), 365], [1, 6]]);
  });

  it("las 17 campañas de muestra no se pisan entre sí", () => {
    for (const t of seasonalThemes) expect(overlapsWith(t, seasonalThemes)).toEqual([]);
  });

  it("detecta la superposición (también al cruzar el año) con un error claro", () => {
    const bf = { ...theme("black-friday"), startsOn: "2026-11-03" };
    expect(overlapsWith(bf, seasonalThemes).map((t) => t.id)).toEqual(["cyber-monday"]);
    expect(overlapError(bf, seasonalThemes)).toMatch(/se pisan con CyberMonday/);
    const late = { ...theme("navidad"), endsOn: "2027-01-02" };
    expect(overlapsWith(late, seasonalThemes).map((t) => t.id)).toEqual(["ano-nuevo"]);
    expect(overlapError(theme("navidad"), seasonalThemes)).toBeNull();
  });

  it("doce meses desde octubre: cada campaña empieza en un solo mes y Año Nuevo ocupa dos", () => {
    const months = calendarMonths(seasonalThemes, "2026-10");
    expect(months.map((m) => `${m.year}-${m.month + 1}`)).toEqual(["2026-10", "2026-11", "2026-12", "2027-1", "2027-2", "2027-3", "2027-4", "2027-5", "2027-6", "2027-7", "2027-8", "2027-9"]);
    const starts = months.flatMap((m) => m.bars.filter((b) => b.starts).map((b) => b.id));
    expect(starts).toHaveLength(17);
    expect(new Set(starts).size).toBe(17);
    expect(months.filter((m) => m.bars.some((b) => b.id === "ano-nuevo")).map((m) => m.month)).toEqual([11, 0]);
    const bf = months[1]!.bars.find((b) => b.id === "black-friday")!;
    expect([bf.from, bf.to, Math.round(bf.left), Math.round(bf.width)]).toEqual([23, 30, 73, 27]);
  });

  it("marca CACE, Black Friday y días del deporte", () => {
    expect(["hot-sale", "cyber-monday", "black-friday", "dia-del-running", "navidad"].map((id) => campaignFlag(theme(id)))).toEqual(["cace", "cace", "black-friday", "sport", null]);
  });

  it("en curso y próxima con los días que faltan", () => {
    const live = nextCampaign(seasonalThemes, "2026-10-05")!;
    expect([live.theme.id, live.live, live.endsIn]).toEqual(["dia-de-la-madre", true, 13]);
    const next = upcomingCampaign(seasonalThemes, "2026-10-05")!;
    expect([next.theme.id, next.daysLeft]).toEqual(["halloween", 14]);
    expect(upcomingCampaign(seasonalThemes, "2027-04-20")!.theme.id).toBe("hot-sale");
    expect(nextCampaign(seasonalThemes.map((t) => ({ ...t, active: t.id === "navidad" })), "2027-01-10")!.daysLeft).toBe(dayOfYear("2027-12-01") - 10);
  });
});

describe("resultados de los cupones de campaña", () => {
  const data = defaultAdminData();

  it("Día de la Madre: usos del cupón, pedidos sembrados con MAMA15 y el descuento que dieron", () => {
    const r = campaignResult(theme("dia-de-la-madre"), data.data.coupons, data.orders);
    const withCoupon = data.orders.filter((o) => o.coupon?.code === "MAMA15");
    expect(withCoupon.length).toBe(2);
    expect(r.orders).toBe(2);
    expect(r.uses).toBe(9);
    expect(r.discount).toBe(withCoupon.reduce((s, o) => s + o.coupon!.discount, 0));
    expect(r.discount).toBeGreaterThan(0);
    expect(r.avgTicket).toBe(Math.round(r.revenue / 2));
  });

  it("los cancelados no cuentan y los usos nunca son menos que los pedidos", () => {
    const orders: AdminOrder[] = [
      { ...data.orders[0]!, code: "X1", status: "PAID", total: 10000, coupon: { code: "BLACK30", discount: 3000 } },
      { ...data.orders[0]!, code: "X2", status: "CANCELLED", total: 20000, coupon: { code: "BLACK30", discount: 6000 } },
    ];
    const r = campaignResult(theme("black-friday"), data.data.coupons, orders);
    expect([r.uses, r.orders, r.discount, r.revenue]).toEqual([1, 1, 3000, 10000]);
    const rows = campaignResults(seasonalThemes, data.data.coupons, orders);
    expect(rows).toHaveLength(17);
    expect(resultsTotals(rows).discount).toBe(3000);
  });

  it("el pedido de la tienda queda con el cupón que se usó en el checkout", () => {
    const shop: AdminOrder = { ...data.orders[0]!, code: "VOL-DEMO", fromShop: true, coupon: undefined };
    const coupon = data.data.coupons.find((c) => c.code === "MAMA15")!;
    const out = withShopOrderCoupon([shop, ...data.orders], coupon);
    expect(out[0]!.coupon?.code).toBe("MAMA15");
    expect(out[0]!.coupon!.discount).toBeGreaterThan(0);
    // Un segundo canje no lo pisa, y sin pedido de la tienda no cambia nada.
    expect(withShopOrderCoupon(out, data.data.coupons[0])[0]!.coupon?.code).toBe("MAMA15");
    expect(withShopOrderCoupon(data.orders, coupon)).toBe(data.orders);
  });
});
