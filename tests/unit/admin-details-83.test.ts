import { describe, expect, it } from "vitest";
import { collectionErrors } from "@/demo/admin/collection";
import { VIP_FROM, segmentOf } from "@/demo/admin/customers";
import { defaultAdminData } from "@/demo/admin/defaults";
import { MATERIAL_HELP, SEGMENT_HELP, STAGE_HELP, marginHelp } from "@/demo/admin/help";
import { ORDER_TABS } from "@/demo/admin/order-groups";
import { fulfillmentTrack, nextStep, paymentTrack } from "@/demo/admin/order-tracks";
import type { AdminOrder } from "@/demo/admin/types";
import { checkMaterial, checkRecipe, checkTrialPrice, materialDraft, recipeDraft } from "@/demo/admin/workshop/edit-forms";

/** Polish 8.3 · Lote 3: estados separados, ayudas con las reglas del engine, modales y datos de cobro. */
const orders = defaultAdminData().orders;
const withStatus = (status: AdminOrder["status"], extra: Partial<AdminOrder> = {}): AdminOrder => ({ ...orders[0]!, status, ...extra });

describe("pago y producción por separado (8.3.5)", () => {
  it("un comprobante en revisión nunca es pagado y la producción espera", () => {
    const o = withStatus("PAYMENT_REVIEW", { paymentMethod: "BANK_TRANSFER", proof: { fileName: "x.jpg", receivedAt: "2026-10-01", status: "IN_REVIEW" } });
    expect(paymentTrack(o)).toEqual({ label: "Comprobante en revisión", tone: "warning" });
    expect(fulfillmentTrack(o).label).toBe("Empieza cuando esté pagado");
    expect(nextStep(o)).toMatch(/aprobarlo o rechazarlo/);
  });
  it("rechazado vuelve a esperar; pagado a mano y producción avanzan por separado", () => {
    expect(paymentTrack(withStatus("PENDING_PAYMENT", { paymentMethod: "QR_MANUAL", proof: { fileName: "x", receivedAt: "", status: "REJECTED", rejectReason: "monto" } })).label).toBe("Comprobante rechazado");
    const making = withStatus("IN_PRODUCTION", { paymentMethod: "BANK_TRANSFER", stage: "lot-check" });
    expect(paymentTrack(making)).toEqual({ label: "Pagado · aprobado a mano", tone: "success" });
    expect(fulfillmentTrack(making).label).toBe("En preparación · control de lote");
    expect(fulfillmentTrack(withStatus("READY", { fulfillment: "PICKUP" })).label).toBe("Listo para retirar");
    expect(nextStep(withStatus("DELIVERED"))).toBeNull();
  });
  it("cancelado sin pago queda sin cobrar; cada estado del engine tiene su par de etiquetas", () => {
    expect(paymentTrack(withStatus("CANCELLED", { log: [] })).label).toBe("Sin cobrar (cancelado)");
    for (const o of orders) { expect(paymentTrack(o).label).toBeTruthy(); expect(fulfillmentTrack(o).label).toBeTruthy(); }
  });
});

describe("ayudas con las reglas del engine (8.3.10)", () => {
  it("VIP usa el umbral real y coincide con segmentOf", () => {
    expect(SEGMENT_HELP.items.find((i) => i.term === "VIP")!.text).toContain(VIP_FROM.toLocaleString("es-AR"));
    expect(segmentOf(1, VIP_FROM)).toBe("VIP");
    expect(segmentOf(2, VIP_FROM - 1)).toBe("Frecuente");
    expect(segmentOf(1, 10)).toBe("Nuevo");
    expect(segmentOf(0, 0)).toBe("Sin compras");
  });
  it("las etapas explican exactamente los estados de cada pestaña; margen y stock usan sus estados", () => {
    expect(STAGE_HELP.items.map((i) => i.term)).toEqual(ORDER_TABS.filter((t) => t.id !== "all").map((t) => t.label));
    expect(STAGE_HELP.items.find((i) => i.term === "Por cobrar")!.text).toBe("Pendiente de pago, Comprobante en revisión.");
    expect(MATERIAL_HELP.items.map((i) => i.term)).toEqual(["Alcanza", "Reponer", "No alcanza"]);
    expect(marginHelp(35).items[0]!.text).toContain("35%");
  });
});

describe("modales de Costos e Insumos (8.3.17)", () => {
  const [box] = defaultAdminData().workshop.materials.filter((m) => m.id === "caja-chica");
  it("insumo: nombre obligatorio, costo en pesos enteros, mínimo según la unidad", () => {
    const base = materialDraft(box);
    expect(checkMaterial(base).value).toMatchObject({ name: box!.name, costPerUnit: box!.costPerUnit, supplier: box!.supplier });
    expect(checkMaterial({ ...base, name: " " }).errors.name).toBeTruthy();
    expect(checkMaterial({ ...base, cost: "12,50" }).errors.cost).toMatch(/costo|centavos/);
    expect(checkMaterial({ ...base, cost: "-3" }).errors.cost).toBeTruthy();
    expect(checkMaterial({ ...base, unit: "m", min: "2,5" }).value?.minStock).toBe(2.5);
    expect(checkMaterial({ ...base, unit: "u", min: "2,5" }).errors.min).toBeTruthy();
    expect(checkMaterial({ ...base, supplier: "  " }).value?.supplier).toBeUndefined();
  });
  it("costos: cantidades de embalaje mayores que 0, costos por presentación en pesos enteros y precio de prueba positivo", () => {
    const recipe = defaultAdminData().workshop.recipes["ionic-whey"]!;
    const d = recipeDraft(recipe);
    expect(checkRecipe(d).value).toEqual(recipe);
    expect(checkRecipe({ ...d, supplier: "" }).value?.supplierCost).toBeUndefined();
    expect(checkRecipe({ ...d, supplier: "abc" }).errors.supplier).toBeTruthy();
    expect(checkRecipe({ ...d, items: [{ ...d.items[0]!, qty: "0" }] }).errors[`item:${d.items[0]!.materialId}`]).toMatch(/mayor que 0/);
    expect(checkRecipe({ ...d, variants: { ...d.variants, "iw-chocolate-5lb": "52.800,50" } }).errors["variant:iw-chocolate-5lb"]).toMatch(/enteros/);
    // Vaciar el costo de una presentación vuelve a estimarlo por precio.
    expect(checkRecipe({ ...d, variants: { ...d.variants, "iw-chocolate-5lb": "" } }).value?.variantCosts).not.toHaveProperty("iw-chocolate-5lb");
    expect(checkTrialPrice("$ 11.500")).toEqual({ ok: true, value: 11500 });
    expect(checkTrialPrice("0").ok).toBe(false);
  });
  it("costos: editar sin cambios conserva el costo del proveedor y los de cada presentación", () => {
    const recipe = defaultAdminData().workshop.recipes["ionic-whey"]!;
    expect(recipe.supplierCost).toBe(26400);
    expect(checkRecipe(recipeDraft(recipe)).value).toEqual(recipe);
  });
});

describe("datos de cobro (8.3.30)", () => {
  it("valida alias, CBU de 22 dígitos y titular", () => {
    expect(collectionErrors({ alias: "volta.demo", cbu: "0".repeat(22), holder: "Volta Demo" })).toEqual({});
    expect(Object.keys(collectionErrors({ alias: "ab", cbu: "123", holder: "x" }))).toEqual(["alias", "cbu", "holder"]);
  });
});
