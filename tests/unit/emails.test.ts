import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createEmailActions } from "@/demo/admin/emails-slice";
import { createOrdersActions } from "@/demo/admin/orders-slice";
import { checkTemplate, contextForOrder, customerStatus, lotLabel, plainText, previewCode, refillContextFor, renderEmail, resolveInline, sampleContext, sampleOrderFor, tokensFor, tokenValue, trackingSteps } from "@/demo/admin/emails/render";
import { composeEmails, pushOutbox, triggersForNewOrder, triggersForTransition, OUTBOX_LIMIT } from "@/demo/admin/emails/triggers";
import { getProduct } from "@/demo/engine/catalog";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { EMAIL_TRIGGERS, emailTemplates } from "@/demo/fixtures/emails";

beforeEach(() => setDemoData(defaultDemoData()));
const tpl = (id: string) => emailTemplates.find((t) => t.id === id)!;
const orderOf = (code: string) => defaultAdminData().orders.find((o) => o.code === code)!;

function harness(seed: (s: AdminData) => AdminData = (s) => s) {
  let state: AdminData = seed(defaultAdminData());
  const set = (fn: (s: AdminData) => Partial<AdminData>) => { state = { ...state, ...fn(state) }; };
  const get = () => state;
  return { orders: createOrdersActions(set, get), emails: createEmailActions(set, get), get };
}

describe("plantillas de una tienda de suplementos", () => {
  it("hay un email por momento del pedido y el de recompra; nada de Velmar", () => {
    expect(new Set(emailTemplates.map((t) => t.trigger))).toEqual(new Set(EMAIL_TRIGGERS));
    const all = JSON.stringify(emailTemplates).toLowerCase();
    for (const word of ["mascota", "cumple", "taller", "diseño", "a mano", "producción"]) expect(all).not.toContain(word);
    expect(emailTemplates.every((t) => checkTemplate(t).length === 0)).toBe(true);
  });
  it("las fichas de cada momento: el motivo solo en el rechazo, el producto solo en la recompra", () => {
    expect(tokensFor("proof-rejected")).toContain("order.rejectReason");
    expect(tokensFor("ready")).not.toContain("order.rejectReason");
    expect(tokensFor("repurchase")).toEqual(["customer.firstName", "customer.name", "refill.product", "refill.date"]);
  });
});

describe("render de plantillas", () => {
  const ctx = contextForOrder(orderOf("VOL-000121"));
  it("las fichas se reemplazan por datos reales, nunca quedan llaves", () => {
    const mail = renderEmail(tpl("tpl-payment-approved"), ctx);
    expect(mail.subject).toBe("Pago aprobado: pedido VOL-000121");
    const text = plainText(mail);
    expect(text).toContain("Hola Julián");
    expect(text).toContain("jueves, 8 de octubre");
    expect(text).not.toMatch(/[{}]/);
  });
  it("montos en pesos, estado como lo lee el cliente y datos que faltan con texto natural", () => {
    expect(tokenValue("order.total", ctx)).toMatch(/^\$\s?\d{1,3}(\.\d{3})*$/);
    expect(tokenValue("order.status", ctx)).toBe("Preparando tu pedido");
    expect(tokenValue("order.rejectReason", ctx)).toBe("no pudimos encontrar el ingreso en la cuenta");
    expect(tokenValue("refill.product", ctx)).toBe("producto");
    expect(tokenValue("order.deliveryDate", { ...ctx, order: { ...ctx.order!, deliveryDate: undefined } })).toBe("la fecha que te confirmemos");
    expect(resolveInline([{ kind: "text", text: "Hola " }, { kind: "token", token: "customer.firstName" }], ctx)).toBe("Hola Julián");
    expect(customerStatus("READY", "PICKUP")).toBe("Listo para retirar");
    expect(customerStatus("READY", "SHIPPING")).toBe("Listo para salir");
  });
  it("tarjeta y productos del pedido con servicios; el lote recién cuando está armado", () => {
    const mail = renderEmail(tpl("tpl-order-created"), ctx);
    expect(mail.blocks.find((b) => b.type === "order-card")).toMatchObject({ code: "VOL-000121", fulfillment: "Cadete en Mar del Plata", status: "Preparando tu pedido" });
    expect(mail.blocks.find((b) => b.type === "products")).toMatchObject({ lines: [{ name: "Creatina monohidrato micronizada", variant: "Sin sabor · 500 g", quantity: 1, detail: "100 servicios" }] });
    expect(JSON.stringify(mail)).not.toContain("LOTE");
    const ready = renderEmail(tpl("tpl-ready-delivery"), { ...ctx, order: { ...ctx.order!, status: "READY" } });
    const lot = lotLabel(getProduct("creatina-monohidrato"));
    expect(lot).toMatch(/^LOTE \S+ · VTO \d{2}\/\d{4}$/);
    expect(ready.blocks.find((b) => b.type === "products")).toMatchObject({ lines: [{ lot }] });
  });
  it("entregado: cómo tomar cada producto del pedido", () => {
    const mail = renderEmail(tpl("tpl-delivered"), { ...ctx, order: { ...ctx.order!, status: "DELIVERED" } });
    expect(mail.blocks.find((b) => b.type === "usage")).toMatchObject({ lines: [{ name: "Creatina monohidrato micronizada", text: expect.stringContaining("5 g por día") }] });
  });
  it("recompra: el producto que se termina y su fecha; sin bloques del pedido", () => {
    const refill = refillContextFor(orderOf("VOL-000121"))!;
    expect(refill.refill).toMatchObject({ slug: "creatina-monohidrato", date: "2027-01-09" });
    const mail = renderEmail({ ...tpl("tpl-repurchase"), blocks: [...tpl("tpl-repurchase").blocks, { id: "x", type: "order-card" }] }, refill);
    expect(mail.subject).toBe("Julián, tu Creatina monohidrato micronizada se está por terminar");
    expect(mail.blocks.some((b) => b.type === "order-card")).toBe(false);
    expect(mail.blocks.find((b) => b.type === "refill")).toMatchObject({ line: { name: "Creatina monohidrato micronizada" }, date: "sábado, 9 de enero" });
    expect(mail.blocks.find((b) => b.type === "button")).toMatchObject({ href: "/p/creatina-monohidrato/" });
  });
  it("recorrido como lo ve el cliente: retiro en 5 pasos, envío en 6", () => {
    expect(trackingSteps("IN_PRODUCTION", "SHIPPING").map((s) => s.state)).toEqual(["done", "done", "current", "next", "next", "next"]);
    expect(trackingSteps("READY", "PICKUP").map((s) => s.label)).toEqual(["Recibido", "Pagado", "Preparando", "Listo para retirar", "Retirado"]);
    expect(trackingSteps("SHIPPED", "LOCAL_DELIVERY").find((s) => s.state === "current")?.label).toBe("En camino");
  });
  it("valida antes de guardar: asunto, contenido y al menos una forma de entrega", () => {
    expect(checkTemplate({ name: " ", subject: [{ kind: "text", text: " " }], blocks: [{ id: "h", type: "header" }], only: [] })).toHaveLength(4);
  });
});

describe("disparadores y bandeja de salida", () => {
  it("cada cambio de estado dispara su email; volver de un reclamo o cancelar no reenvía", () => {
    expect(triggersForTransition("PENDING_PAYMENT", "PAYMENT_REVIEW")).toEqual(["proof-received"]);
    expect(triggersForTransition("PAYMENT_REVIEW", "PAID")).toEqual(["payment-approved"]);
    expect(triggersForTransition("PENDING_PAYMENT", "PAID")).toEqual(["payment-approved"]);
    expect(triggersForTransition("PAYMENT_REVIEW", "PENDING_PAYMENT")).toEqual(["proof-rejected"]);
    expect(triggersForTransition("PAID", "IN_PRODUCTION")).toEqual(["preparing"]);
    expect(triggersForTransition("IN_PRODUCTION", "READY")).toEqual(["ready"]);
    expect(triggersForTransition("READY", "SHIPPED")).toEqual(["shipped"]);
    expect(triggersForTransition("SHIPPED", "DELIVERED")).toEqual(["delivered"]);
    expect(triggersForTransition("READY", "DELIVERED")).toEqual(["delivered"]);
    for (const [from, to] of [["IN_CLAIM", "IN_PRODUCTION"], ["IN_CLAIM", "DELIVERED"], ["PENDING_PAYMENT", "CANCELLED"], ["IN_CLAIM", "RETURNED"]] as const) expect(triggersForTransition(from, to)).toEqual([]);
    expect(triggersForNewOrder()).toEqual(["order-created"]);
  });
  it("“listo” sale con la plantilla de su forma de entrega; pausada no sale; la bandeja tiene límite", () => {
    const pickup = contextForOrder(orderOf("VOL-000113"));
    const delivery = contextForOrder(orderOf("VOL-000121"));
    expect(composeEmails(emailTemplates, ["ready"], pickup, "x").map((m) => m.templateId)).toEqual(["tpl-ready-pickup"]);
    expect(composeEmails(emailTemplates, ["ready"], delivery, "x").map((m) => m.templateId)).toEqual(["tpl-ready-delivery"]);
    const paused = emailTemplates.map((t) => ({ ...t, active: t.trigger !== "ready" }));
    expect(composeEmails(paused, ["ready"], pickup, "x")).toEqual([]);
    const many = composeEmails(emailTemplates, ["order-created"], pickup, "x");
    expect(pushOutbox(Array(OUTBOX_LIMIT).fill(many[0]), many)).toHaveLength(OUTBOX_LIMIT);
  });
  it("la vista previa usa un pedido real que recibe esa plantilla", () => {
    const orders = defaultAdminData().orders;
    expect(sampleOrderFor(tpl("tpl-ready-pickup"), orders)?.fulfillment).toBe("PICKUP");
    expect(sampleOrderFor(tpl("tpl-shipped"), orders)?.status).toBe("SHIPPED");
    expect(sampleContext(tpl("tpl-repurchase"), orders).refill).toBeDefined();
    // El pedido elegido sigue si recibe la plantilla; si no, se cambia por uno que sí.
    expect(previewCode(tpl("tpl-shipped"), orders, "VOL-000121")).toBe("VOL-000121");
    expect(orders.find((o) => o.code === previewCode(tpl("tpl-ready-pickup"), orders, "VOL-000121"))?.fulfillment).toBe("PICKUP");
  });
  it("la demo arranca con historial y suma el email que corresponde al mover un pedido", () => {
    const h = harness();
    expect(h.get().emails.outbox.length).toBeGreaterThan(5);
    expect(h.get().emails.outbox.every((m, i, all) => i === 0 || Date.parse(all[i - 1]!.at) >= Date.parse(m.at))).toBe(true);
    expect(h.orders.transition("VOL-000113", "IN_PRODUCTION")).toBe(true);
    expect(h.get().emails.outbox[0]).toMatchObject({ trigger: "preparing", orderCode: "VOL-000113", to: "ana.l@ejemplo.com" });
    expect(h.orders.transition("VOL-000113", "READY")).toBe(true);
    expect(h.get().emails.outbox[0]).toMatchObject({ templateId: "tpl-ready-pickup", email: { subject: "¡Tu pedido VOL-000113 está listo para retirar!" } });
    h.emails.setEmailTemplateActive("tpl-delivered", false);
    expect(h.orders.transition("VOL-000113", "DELIVERED")).toBe(true);
    expect(h.get().emails.outbox[0]!.trigger).toBe("ready");
    // El rechazo del comprobante explica el motivo
    expect(h.orders.rejectProof("VOL-000123", "El monto no coincide")).toBe(true);
    expect(plainText(h.get().emails.outbox[0]!.email)).toContain("Motivo: El monto no coincide.");
    // Un reclamo y la vuelta a pagado no reenvían "Pago aprobado"
    const paid = () => h.get().emails.outbox.filter((m) => m.orderCode === "VOL-000122" && m.trigger === "payment-approved").length;
    const before = paid();
    expect(h.orders.transition("VOL-000122", "IN_CLAIM")).toBe(true);
    expect(h.orders.transition("VOL-000122", "PAID")).toBe(true);
    expect(paid()).toBe(before);
  });
  it("prueba desde el editor (también la de recompra, con el producto) y plantilla restaurada", () => {
    const h = harness();
    expect(h.emails.sendTestEmail("tpl-shipped", "VOL-000119")).toBe(true);
    expect(h.get().emails.outbox[0]).toMatchObject({ test: true, to: "tienda@volta.demo", orderCode: "VOL-000119" });
    // La prueba de "Listo para retirar" sale aunque el pedido elegido sea con envío (es una prueba)
    expect(h.emails.sendTestEmail("tpl-ready-pickup", "VOL-000121")).toBe(true);
    expect(h.emails.sendTestEmail("tpl-repurchase", "VOL-000121")).toBe(true);
    const test = h.get().emails.outbox[0]!;
    expect(test.orderCode).toBeUndefined();
    expect(test.email.blocks.some((b) => b.type === "refill")).toBe(true);
    expect(h.get().emails.outbox[0]!.email.subject).toBe("Julián, tu Creatina monohidrato micronizada se está por terminar");
    const t = h.get().emails.templates.find((x) => x.id === "tpl-ready-pickup")!;
    h.emails.saveEmailTemplate({ ...t, name: "Cambiada", blocks: [] });
    h.emails.resetEmailTemplate("tpl-ready-pickup");
    expect(h.get().emails.templates.find((x) => x.id === "tpl-ready-pickup")!.name).toBe("Listo para retirar");
  });
});
