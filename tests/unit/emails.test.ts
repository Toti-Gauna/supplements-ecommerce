import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createEmailActions } from "@/demo/admin/emails-slice";
import { createOrdersActions } from "@/demo/admin/orders-slice";
import { contextForOrder, plainText, renderEmail, resolveInline, tokenValue, trackingSteps } from "@/demo/admin/emails/render";
import { composeEmails, pushOutbox, triggersForNewOrder, triggersForTransition, OUTBOX_LIMIT } from "@/demo/admin/emails/triggers";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { emailTemplates } from "@/demo/fixtures/emails";

beforeEach(() => setDemoData(defaultDemoData()));
const tpl = (id: string) => emailTemplates.find((t) => t.id === id)!;

function harness(seed: (s: AdminData) => AdminData = (s) => s) {
  let state: AdminData = seed(defaultAdminData());
  const set = (fn: (s: AdminData) => Partial<AdminData>) => { state = { ...state, ...fn(state) }; };
  const get = () => state;
  return { orders: createOrdersActions(set, get), emails: createEmailActions(set, get), get };
}

describe("render de plantillas", () => {
  const order = defaultAdminData().orders.find((o) => o.code === "VOL-000121")!;
  const ctx = contextForOrder(order);
  it("las fichas se reemplazan por datos reales, nunca quedan llaves", () => {
    const mail = renderEmail(tpl("tpl-payment-approved"), ctx);
    expect(mail.subject).toBe("Pago aprobado: pedido VOL-000121");
    const text = plainText(mail);
    expect(text).toContain("Hola Julián");
    expect(text).toContain("jueves, 8 de octubre");
    expect(text).not.toMatch(/[{}]/);
  });
  it("montos en pesos y datos que faltan con texto natural", () => {
    expect(tokenValue("order.total", ctx)).toMatch(/^\$\s?\d{1,3}(\.\d{3})*$/);
    expect(tokenValue("pet.name", ctx)).toBe("tu mascota");
    expect(tokenValue("order.deliveryDate", { ...ctx, order: { ...ctx.order!, deliveryDate: undefined } })).toBe("la fecha que te confirmemos");
    expect(resolveInline([{ kind: "text", text: "Hola " }, { kind: "token", token: "customer.firstName" }], ctx)).toBe("Hola Julián");
  });
  it("bloques del pedido completos y omitidos cuando no hay pedido", () => {
    const mail = renderEmail(tpl("tpl-order-created"), ctx);
    const card = mail.blocks.find((b) => b.type === "order-card");
    expect(card).toMatchObject({ code: "VOL-000121", fulfillment: "Cadete en Mar del Plata", status: "En producción" });
    const products = mail.blocks.find((b) => b.type === "products");
    // El detalle de cada línea son los servicios del envase.
    expect(products).toMatchObject({ lines: [{ name: "Creatina monohidrato micronizada", variant: "Sin sabor · 500 g", quantity: 1, detail: "100 servicios" }] });
    const pet = renderEmail(tpl("tpl-pet-birthday"), { customerName: "Diego Álvarez", email: "d@e.com", pet: { name: "Ñoqui" } });
    expect(pet.subject).toBe("¡Feliz cumple, Ñoqui! 🎂");
    expect(renderEmail({ ...tpl("tpl-pet-birthday"), blocks: [{ id: "x", type: "order-card" }] }, { customerName: "D", email: "d" }).blocks).toEqual([]);
  });
  it("seguimiento según el estado", () => {
    expect(trackingSteps("IN_PRODUCTION", "SHIPPING").map((s) => s.state)).toEqual(["done", "done", "current", "next", "next"]);
    expect(trackingSteps("DELIVERED", "PICKUP").at(-1)).toEqual({ label: "Retirado", state: "current" });
  });
});

describe("disparadores y bandeja de salida", () => {
  it("cada cambio de estado dispara su email; volver de un reclamo no reenvía", () => {
    expect(triggersForTransition("PAYMENT_REVIEW", "PAID")).toEqual(["payment-approved"]);
    expect(triggersForTransition("PAID", "IN_PRODUCTION")).toEqual(["in-production"]);
    expect(triggersForTransition("IN_CLAIM", "IN_PRODUCTION")).toEqual([]);
    expect(triggersForTransition("IN_CLAIM", "PAID")).toEqual([]);
    expect(triggersForNewOrder()).toEqual(["order-created"]);
  });
  it("una plantilla pausada no sale y la bandeja tiene límite", () => {
    const ctx = contextForOrder(defaultAdminData().orders[0]!);
    const paused = emailTemplates.map((t) => ({ ...t, active: t.trigger !== "ready" }));
    expect(composeEmails(paused, ["ready"], ctx, "2026-10-04T10:00:00Z")).toEqual([]);
    const many = composeEmails(emailTemplates, ["order-created"], ctx, "x");
    expect(pushOutbox(Array(OUTBOX_LIMIT).fill(many[0]), many)).toHaveLength(OUTBOX_LIMIT);
  });
  it("la demo arranca con historial y suma emails al avanzar un pedido", () => {
    const h = harness();
    const before = h.get().emails.outbox.length;
    expect(before).toBeGreaterThan(5);
    expect(h.get().emails.outbox.every((m, i, all) => i === 0 || Date.parse(all[i - 1]!.at) >= Date.parse(m.at))).toBe(true);
    h.orders.moveProduction("VOL-000113", "machine");
    const [mail] = h.get().emails.outbox;
    expect(mail).toMatchObject({ trigger: "in-production", orderCode: "VOL-000113", to: "ana.l@ejemplo.com" });
    expect(mail!.email.subject).toContain("VOL-000113 está en producción");
    h.emails.setEmailTemplateActive("tpl-ready", false);
    expect(h.orders.moveProduction("VOL-000113", "ready")).toBeNull();
    expect(h.get().orders.find((o) => o.code === "VOL-000113")!.status).toBe("READY");
    expect(h.get().emails.outbox[0]!.trigger).toBe("in-production");
    // Un reclamo y la vuelta a pagado no reenvían "Pago aprobado"
    const paid = () => h.get().emails.outbox.filter((m) => m.orderCode === "VOL-000122" && m.trigger === "payment-approved").length;
    const before122 = paid();
    expect(h.orders.transition("VOL-000122", "IN_CLAIM")).toBe(true);
    expect(h.orders.transition("VOL-000122", "PAID")).toBe(true);
    expect(paid()).toBe(before122);
  });
  it("prueba, cumpleaños de mascota y plantilla restaurada", () => {
    // Las fichas de muestra ya no traen mascotas: Diego tiene una cargada solo para esta prueba.
    const h = harness((s) => {
      const diego = s.workshop.profiles["diego.a@ejemplo.com"]!;
      const profiles = { ...s.workshop.profiles, "diego.a@ejemplo.com": { ...diego, pets: [{ id: "p1", name: "Ñoqui", species: "perro" as const, birthday: "10-09" }] } };
      return { ...s, workshop: { ...s.workshop, profiles } };
    });
    expect(harness().emails.sendPetBirthdayEmail("diego.a@ejemplo.com", "Diego Álvarez", "p1", "2026")).toBe("off");
    expect(h.emails.sendTestEmail("tpl-shipped", "VOL-000119")).toBe(true);
    expect(h.get().emails.outbox[0]).toMatchObject({ test: true, to: "taller@volta.demo" });
    expect(h.emails.sendPetBirthdayEmail("diego.a@ejemplo.com", "Diego Álvarez", "p1", "2026")).toBe("sent");
    expect(h.get().emails.outbox[0]!.email.subject).toBe("¡Feliz cumple, Ñoqui! 🎂");
    expect(h.emails.sendPetBirthdayEmail("diego.a@ejemplo.com", "Diego Álvarez", "p1", "2026")).toBe("already");
    // La prueba del cumpleaños usa el cliente con mascota (sin pedido), igual que la vista previa
    expect(h.emails.sendTestEmail("tpl-pet-birthday", "")).toBe(true);
    const test = h.get().emails.outbox[0]!;
    expect(test.orderCode).toBeUndefined();
    expect(test.email.blocks.some((b) => b.type === "order-card")).toBe(false);
    expect(plainText(test.email)).toContain("Hola Diego");
    const t = h.get().emails.templates.find((x) => x.id === "tpl-ready")!;
    h.emails.saveEmailTemplate({ ...t, name: "Cambiada", blocks: [] });
    h.emails.resetEmailTemplate("tpl-ready");
    expect(h.get().emails.templates.find((x) => x.id === "tpl-ready")!.name).toBe("Listo para entregar");
  });
});
