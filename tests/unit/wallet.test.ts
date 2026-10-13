import { beforeEach, describe, expect, it } from "vitest";
import { walletCoupons } from "@/demo/engine/wallet";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";

const now = new Date("2026-10-04T12:00:00");

describe("walletCoupons", () => {
  beforeEach(() => setDemoData(defaultDemoData()));

  it("lista primero los disponibles y no muestra los de la tienda vencidos", () => {
    const list = walletCoupons({ subtotal: 30000, isRegistered: false, now, wheelCode: null });
    expect(list[0]!.status).toBe("available");
    expect(list.some((w) => w.coupon.code === "INVIERNO")).toBe(false);
    expect(list.find((w) => w.coupon.code === "ENVIOGRATIS")!.status).toBe("needs-account");
  });

  it("muestra el mínimo de compra como pendiente", () => {
    const list = walletCoupons({ subtotal: 1000, isRegistered: true, now, wheelCode: null });
    expect(list.find((w) => w.coupon.code === "ENTRENA2000")!.status).toBe("min-subtotal");
  });

  it("incluye solo el cupón de ruleta propio, primero", () => {
    const base = demoData();
    setDemoData({ ...base, coupons: [...base.coupons, { code: "RULETAAAAAA", type: "PERCENT", value: 5, description: "5% OFF", maxUses: 1 }, { code: "RULETABBBBB", type: "PERCENT", value: 5, description: "5% OFF", maxUses: 1 }] });
    const list = walletCoupons({ subtotal: 30000, isRegistered: false, now, wheelCode: "RULETAAAAAA" });
    expect(list[0]!.coupon.code).toBe("RULETAAAAAA");
    expect(list[0]!.origin).toBe("ruleta");
    expect(list.some((w) => w.coupon.code === "RULETABBBBB")).toBe(false);
  });

  it("de la tienda oculta los agotados, pero un premio propio vencido se sigue viendo", () => {
    const base = demoData();
    setDemoData({ ...base, coupons: [...base.coupons,
      { code: "AGOTADO", type: "PERCENT", value: 5, description: "5% OFF", maxUses: 3, usedCount: 3 },
      { code: "RULETAVIEJO", type: "PERCENT", value: 5, description: "5% OFF", maxUses: 1, endsAt: "2026-09-01" }] });
    const list = walletCoupons({ subtotal: 30000, isRegistered: false, now, wheelCode: "RULETAVIEJO" });
    expect(list.some((w) => w.coupon.code === "AGOTADO")).toBe(false);
    expect(list.find((w) => w.coupon.code === "RULETAVIEJO")!.status).toBe("expired");
  });
});
