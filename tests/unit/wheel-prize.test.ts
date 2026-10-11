import { describe, expect, it } from "vitest";
import { choiceAfterCouponChange, prizeStatus, type WheelPrize } from "@/demo/engine/wheel-prize";
import type { Coupon } from "@/demo/types";

const prize: WheelPrize = { code: "RULETAABC", label: "10% OFF", at: "2026-10-10T12:00:00.000Z", choice: "won" };
const coupon: Coupon = { code: "RULETAABC", type: "PERCENT", value: 10, description: "Ruleta: 10% OFF", active: true, maxUses: 1, usedCount: 0 };

describe("estado del premio de la ruleta (8.2.14)", () => {
  it("recién ganado, guardado, aplicado, quitado desde el checkout y usado", () => {
    expect(prizeStatus(prize, { appliedCode: null, coupon })).toBe("ganado");
    expect(prizeStatus({ ...prize, choice: "saved" }, { appliedCode: null, coupon })).toBe("guardado");
    expect(prizeStatus(prize, { appliedCode: "RULETAABC", coupon })).toBe("aplicado");
    expect(prizeStatus({ ...prize, choice: "removed" }, { appliedCode: null, coupon })).toBe("desactivado");
    expect(prizeStatus(prize, { appliedCode: "RULETAABC", coupon: { ...coupon, usedCount: 1 } })).toBe("utilizado");
  });

  it("un premio guardado antes de este cambio (sin elección) cuenta como guardado", () => {
    expect(prizeStatus({ code: prize.code, label: prize.label, at: prize.at }, { appliedCode: null, coupon })).toBe("guardado");
  });

  it("aplicado gana sobre lo elegido antes (volver a aplicarlo después de quitarlo)", () => {
    expect(prizeStatus({ ...prize, choice: "removed" }, { appliedCode: "RULETAABC", coupon })).toBe("aplicado");
  });

  it("otro cupón en el carrito no cambia el estado del premio", () => {
    expect(prizeStatus({ ...prize, choice: "saved" }, { appliedCode: "BIENVENIDA10", coupon })).toBe("guardado");
  });

  it("quitarlo en el checkout lo desactiva; reemplazarlo o quitarlo en la tienda lo guarda", () => {
    expect(choiceAfterCouponChange(prize, "RULETAABC", null, "checkout")).toBe("removed");
    expect(choiceAfterCouponChange(prize, "RULETAABC", "BIENVENIDA10", "checkout")).toBe("saved");
    expect(choiceAfterCouponChange(prize, "RULETAABC", null, "tienda")).toBe("saved");
    // Cambios que no tocan al premio lo dejan como estaba.
    expect(choiceAfterCouponChange(prize, "BIENVENIDA10", null, "checkout")).toBe("won");
    expect(choiceAfterCouponChange(prize, null, "RULETAABC", "tienda")).toBe("won");
  });
});
