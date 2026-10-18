import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import type { AdminOrder } from "@/demo/admin/types";
import { orderWhatsapp, waForEmail, waInline, waMessageIdFor, waOnly, waSampleOrder, waTextFor, waTokens } from "@/demo/admin/whatsapp";
import { ORDER_STATUSES } from "@/demo/engine/orders";
import { emailTemplates } from "@/demo/fixtures/emails";
import { WA_MESSAGES } from "@/demo/fixtures/whatsapp";
import { brand } from "@/config/brand";

/** R4b · Mensajes: cada estado del pedido tiene su WhatsApp (y su email cuando lo hay), con el link wa.me armado. */
const orders = () => defaultAdminData().orders;
const order = (code: string) => orders().find((o) => o.code.endsWith(code))!;
const decoded = (href: string) => decodeURIComponent(href.split("?text=")[1]!);

describe("un WhatsApp por estado", () => {
  it("todos los estados tienen mensaje; el rechazo y la forma de entrega eligen el texto", () => {
    const base: Pick<AdminOrder, "fulfillment" | "proof"> = { fulfillment: "LOCAL_DELIVERY" };
    const ids = ORDER_STATUSES.map((status) => waMessageIdFor({ ...base, status }));
    expect(ids).toEqual(["order-created", "proof-received", "payment-approved", "preparing", "ready-delivery", "shipped", "delivered", "cancelled", "claim", "returned"]);
    expect(waMessageIdFor({ status: "READY", fulfillment: "PICKUP" })).toBe("ready-pickup");
    expect(waMessageIdFor({ status: "PENDING_PAYMENT", fulfillment: "PICKUP", proof: { fileName: "a", receivedAt: "x", status: "REJECTED" } })).toBe("proof-rejected");
    expect(new Set(WA_MESSAGES.map((m) => m.id)).size).toBe(WA_MESSAGES.length);
  });

  it("cada email del recorrido tiene su versión WhatsApp, y reclamo, cancelado y devuelto van solo por WhatsApp", () => {
    for (const t of emailTemplates.filter((x) => x.trigger !== "repurchase")) expect(waForEmail(t.id).map((m) => m.emailId), t.id).toEqual([t.id]);
    expect(waForEmail("tpl-repurchase")).toEqual([]);
    expect(waOnly().map((m) => m.id)).toEqual(["claim", "cancelled", "returned"]);
    // El texto es corto: entra en una burbuja de WhatsApp sin cortar.
    for (const m of WA_MESSAGES) expect(waTextFor(waSampleOrder(m.id, orders())!, {}, m.id).length, m.id).toBeLessThan(240);
  });

  it("arma el texto con los datos del pedido y el link wa.me al teléfono ficticio del cliente", () => {
    const wa = orderWhatsapp(order("124"));
    expect(wa.id).toBe("proof-received");
    expect(wa.label).toBe("Comprobante en revisión");
    expect(wa.href).toMatch(/^https:\/\/wa\.me\/5492235550124\?text=/);
    expect(decoded(wa.href!)).toBe(wa.text);
    expect(wa.text).toMatch(/^¡Hola Sofía! Recibimos el comprobante del pedido \w+-000124 \(\$\s?[\d.]+\)/);
    expect(waTextFor(order("126"))).toContain(`Te escribimos de ${brand.name} por tu pedido`);
    expect(waTextFor({ ...order("125"), proof: { fileName: "a", receivedAt: "x", status: "REJECTED", rejectReason: "El monto no coincide" } })).toContain("Motivo: El monto no coincide.");
    expect(orderWhatsapp({ ...order("124"), customer: { ...order("124").customer, phone: "" } }).href).toBeNull();
    expect(waTextFor(order("124"))).not.toMatch(/acreditad/i);
  });

  it("usa el texto editado si es válido; uno vacío o roto vuelve al de muestra", () => {
    const custom = [{ kind: "text" as const, text: "Hola " }, { kind: "token" as const, token: "customer.firstName" as const }, { kind: "text" as const, text: ", ya lo vimos." }];
    expect(waTextFor(order("124"), { "proof-received": custom })).toBe("Hola Sofía, ya lo vimos.");
    expect(waInline("proof-received", { "proof-received": [{ kind: "text", text: "   " }] })).toBe(WA_MESSAGES[1]!.text);
    expect(waInline("proof-received", { "proof-received": "roto" as never })).toBe(WA_MESSAGES[1]!.text);
  });

  it("las fichas del motivo solo están en el mensaje del rechazo", () => {
    expect(waTokens("proof-rejected")).toContain("order.rejectReason");
    expect(waTokens("delivered")).not.toContain("order.rejectReason");
  });
});
