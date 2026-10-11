import { describe, expect, it } from "vitest";
import { canTransition, manualNextStatuses } from "@/demo/engine/orders";

const ship = { fulfillment: "SHIPPING" as const };

describe("transiciones de pedido (spec 5.2)", () => {
  it("subir comprobante deja en revisión y nunca paga", () => {
    expect(canTransition("PENDING_PAYMENT", "PAYMENT_REVIEW", { ...ship, trigger: "proof-received" })).toBe(true);
    expect(canTransition("PENDING_PAYMENT", "PAID", { ...ship, trigger: "proof-received" })).toBe(false);
  });
  it("solo aprobar el comprobante o la confirmación del proveedor pasan a PAID", () => {
    expect(canTransition("PAYMENT_REVIEW", "PAID", { ...ship, trigger: "proof-approved" })).toBe(true);
    expect(canTransition("PAYMENT_REVIEW", "PAID", { ...ship, trigger: "admin" })).toBe(false);
    expect(canTransition("PENDING_PAYMENT", "PAID", { ...ship, trigger: "provider-confirmed" })).toBe(true);
    expect(canTransition("PENDING_PAYMENT", "PAID", { ...ship, trigger: "admin" })).toBe(false);
  });
  it("rechazar vuelve a pendiente de pago", () => {
    expect(canTransition("PAYMENT_REVIEW", "PENDING_PAYMENT", { ...ship, trigger: "proof-rejected" })).toBe(true);
  });
  it("producción y entrega respetan el tipo de entrega", () => {
    expect(manualNextStatuses("PAID", "SHIPPING")).toEqual(["IN_PRODUCTION", "IN_CLAIM"]);
    expect(manualNextStatuses("READY", "SHIPPING")).toEqual(["SHIPPED", "IN_CLAIM"]);
    expect(manualNextStatuses("READY", "PICKUP")).toEqual(["DELIVERED", "IN_CLAIM"]);
  });
  it("reclamo vuelve al estado previo o termina en devuelto; cancelado es final", () => {
    expect(manualNextStatuses("IN_CLAIM", "SHIPPING", "DELIVERED")).toEqual(["DELIVERED", "RETURNED"]);
    expect(manualNextStatuses("CANCELLED", "SHIPPING")).toEqual([]);
    expect(manualNextStatuses("PENDING_PAYMENT", "SHIPPING")).toEqual(["CANCELLED"]);
  });
});
