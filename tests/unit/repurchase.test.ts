import { beforeEach, describe, expect, it } from "vitest";
import { customerRows, type CustomerRow } from "@/demo/admin/customers";
import { createCustomerActions } from "@/demo/admin/customers-slice";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { plainText } from "@/demo/admin/emails/render";
import { lastingDays, remainingPct, repurchaseItems, startOf, stateOf, withNotice } from "@/demo/admin/repurchase";
import { customerWhatsappLink, repurchaseMessage, runOutLine, runOutText, whenText } from "@/demo/admin/repurchase-text";
import type { AdminOrder } from "@/demo/admin/types";
import { getProduct } from "@/demo/engine/catalog";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

beforeEach(() => setDemoData(defaultDemoData()));

const admin = defaultAdminData();
const products = admin.data.products;
const rows = customerRows(admin.users, admin.orders);
const row = (email: string) => rows.find((c) => c.email === email)!;
const product = (slug: string) => getProduct(slug)!;
const variant = (slug: string, id: string) => product(slug).variants.find((v) => v.id === id);

/** Cliente de prueba con los pedidos que se le pasan (todos pagados salvo que digan otra cosa). */
function customer(orders: Partial<AdminOrder>[]): CustomerRow {
  const full = orders.map((o, i) => ({ code: `T-${i}`, createdAt: "2026-09-01T10:00:00-03:00", customer: { name: "Ana Prueba", email: "ana@e.com", phone: "223 555-0000" }, userId: null, status: "DELIVERED", fulfillment: "PICKUP", paymentMethod: "CHECKOUT_PRO", lines: [], total: 0, notes: [], log: [], ...o }) as AdminOrder);
  return { ...row("juan.i@ejemplo.com"), name: "Ana Prueba", email: "ana@e.com", orders: full };
}

describe("cuánto dura cada pote", () => {
  it("un servicio por día; pre-entrenos y aminoácidos 4 por semana; la cantidad suma", () => {
    expect(lastingDays(product("ionic-whey"), variant("ionic-whey", "iw-chocolate-2lb"), 1)).toBe(30);
    expect(lastingDays(product("ionic-whey"), variant("ionic-whey", "iw-chocolate-5lb"), 1)).toBe(75);
    expect(lastingDays(product("mass-gainer"), variant("mass-gainer", "mg-chocolate-3kg"), 2)).toBe(40);
    // 30 servicios a 4 por semana: 52 días y medio → 52.
    expect(lastingDays(product("overvolt-pre"), variant("overvolt-pre", "ov-limon-300"), 1)).toBe(52);
    expect(lastingDays(product("barra-proteica"), variant("barra-proteica", "bp-mani-x12"), 1)).toBe(12);
  });
  it("accesorios y presentaciones chicas no se siguen", () => {
    expect(lastingDays(product("shaker-volta"), variant("shaker-volta", "sh-voltio"), 3)).toBeNull();
    expect(lastingDays(product("barra-proteica"), variant("barra-proteica", "bp-mani-u"), 2)).toBeNull();
    expect(lastingDays(product("gel-energetico"), variant("gel-energetico", "ge-tropical-x6"), 1)).toBeNull();
  });
  it("empieza el día que lo recibe; si no hay fecha de entrega, el día de la compra", () => {
    expect(startOf({ createdAt: "2026-09-07T10:15:00-03:00", promisedDate: "2026-09-08" })).toBe("2026-09-08");
    expect(startOf({ createdAt: "2026-09-07T23:30:00-03:00" })).toBe("2026-09-07");
    expect(startOf({ createdAt: "2026-09-07T10:00:00-03:00", promisedDate: "2026-09-01" })).toBe("2026-09-07");
  });
});

describe("se le termina", () => {
  it("a Juan se le termina la whey el jueves 8 (en 3 días) y la creatina más adelante", () => {
    const [whey, creatine] = repurchaseItems(row("juan.i@ejemplo.com"), products, DEMO_TODAY);
    expect(whey).toMatchObject({ slug: "ionic-whey", runsOutOn: "2026-10-08", inDays: 3, state: "week", orderCode: "VOL-000107", variant: "Chocolate · 2 lb (907 g)", key: "ionic-whey:2026-10-08" });
    expect(runOutText(whey!)).toBe("Se le termina el jueves 8 de octubre");
    expect(runOutLine(whey!)).toBe("Se le termina el jueves 8 de octubre (en 3 días)");
    expect(runOutLine({ runsOutOn: DEMO_TODAY, inDays: 0 })).toBe("Se le termina hoy");
    expect(runOutLine({ runsOutOn: "2026-09-20", inDays: -14 })).toBe("Se le terminó el domingo 20 de septiembre (hace 14 días)");
    expect(creatine).toMatchObject({ slug: "creatina-monohidrato", runsOutOn: "2026-11-07", state: "later" });
  });
  it("si vuelve a comprar antes de terminarlo, el pote nuevo arranca cuando se termina el anterior", () => {
    const line = (id: string) => [{ id, productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }];
    const c = customer([{ createdAt: "2026-09-01T10:00:00-03:00", lines: line("a") }, { createdAt: "2026-09-20T10:00:00-03:00", lines: line("b") }]);
    expect(repurchaseItems(c, products, DEMO_TODAY)).toEqual([expect.objectContaining({ startsOn: "2026-10-01", runsOutOn: "2026-10-31", inDays: 26 })]);
  });
  it("solo cuentan pedidos pagados: ni pendientes, ni cancelados, ni en reclamo", () => {
    const lines = [{ id: "a", productSlug: "isolate-zero", variantId: "iz-chocolate-2lb", quantity: 1 }];
    for (const status of ["PENDING_PAYMENT", "PAYMENT_REVIEW", "CANCELLED", "IN_CLAIM"] as const) expect(repurchaseItems(customer([{ status, lines }]), products, DEMO_TODAY)).toEqual([]);
    expect(repurchaseItems(customer([{ status: "PAID", lines }]), products, DEMO_TODAY)).toHaveLength(1);
  });
  it("atrasada hasta 30 días después de terminarse; más atrás ya no aparece", () => {
    expect(repurchaseItems(row("paula.c@ejemplo.com"), products, DEMO_TODAY)[0]).toMatchObject({ slug: "ionic-whey", runsOutOn: "2026-09-20", inDays: -15, state: "overdue" });
    const old = customer([{ createdAt: "2026-07-01T10:00:00-03:00", lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }] }]);
    expect(repurchaseItems(old, products, DEMO_TODAY)).toEqual([]);
    expect([stateOf(-1), stateOf(0), stateOf(6), stateOf(7)]).toEqual(["overdue", "week", "week", "later"]);
  });
  it("los datos de muestra traen varios avisos esta semana y recompras atrasadas", () => {
    const week = rows.flatMap((c) => repurchaseItems(c, products, DEMO_TODAY).filter((i) => i.state === "week"));
    expect(week.map((i) => `${i.name} ${i.runsOutOn}`).sort()).toEqual(["Florencia Medina 2026-10-07", "Juan Ibarra 2026-10-08", "Nicolás Romero 2026-10-05", "Tomás Herrera 2026-10-05"]);
    const late = rows.flatMap((c) => repurchaseItems(c, products, DEMO_TODAY).filter((i) => i.state === "overdue"));
    expect(late.map((i) => i.name).sort()).toEqual(["Paula Castro", "Tomás Herrera"]);
  });
  it("textos: cuándo, batería, WhatsApp prellenado al celular del cliente", () => {
    expect([whenText(0), whenText(1), whenText(4), whenText(-1), whenText(-14)]).toEqual(["hoy", "mañana", "en 4 días", "ayer", "hace 14 días"]);
    const [whey] = repurchaseItems(row("juan.i@ejemplo.com"), products, DEMO_TODAY);
    expect(remainingPct(whey!, DEMO_TODAY)).toBe(10);
    expect(remainingPct(whey!, "2026-10-20")).toBe(0);
    const text = repurchaseMessage(whey!, "Volta");
    expect(text).toBe("¡Hola Juan! Te escribimos de Volta. Calculamos que el jueves 8 de octubre se te termina tu Ionic Whey 100%. ¿Te preparamos otro? En Mar del Plata te lo llevamos con cadete al día hábil siguiente.");
    expect(customerWhatsappLink("223 555-0103", "Hola")).toBe("https://wa.me/5492235550103?text=Hola");
    expect(customerWhatsappLink(undefined, "Hola")).toBeNull();
  });
});

describe("avisarle (una sola vez por pote)", () => {
  function harness(seed: (s: AdminData) => AdminData = (s) => s) {
    let state: AdminData = seed(defaultAdminData());
    const set = (fn: (s: AdminData) => Partial<AdminData>) => { state = { ...state, ...fn(state) }; };
    return { actions: createCustomerActions(set, () => state), get: () => state };
  }
  const juanWhey = () => repurchaseItems(row("juan.i@ejemplo.com"), products, DEMO_TODAY)[0]!;

  it("el email de recompra sale a la bandeja y no se repite (ni por WhatsApp)", () => {
    const h = harness();
    expect(h.actions.notifyRepurchase(juanWhey(), "email")).toBe("sent");
    const [mail] = h.get().emails.outbox;
    expect(mail).toMatchObject({ trigger: "repurchase", templateId: "tpl-repurchase", to: "juan.i@ejemplo.com", templateName: "Tu pote se está por terminar" });
    expect(mail!.orderCode).toBeUndefined();
    expect(plainText(mail!.email)).toContain("Hola Juan");
    expect(h.get().workshop.profiles["juan.i@ejemplo.com"]!.notices).toEqual([expect.objectContaining({ key: "ionic-whey:2026-10-08", channel: "email" })]);
    const size = h.get().emails.outbox.length;
    expect(h.actions.notifyRepurchase(juanWhey(), "email")).toBe("already");
    expect(h.actions.notifyRepurchase(juanWhey(), "whatsapp")).toBe("already");
    expect(h.get().emails.outbox).toHaveLength(size);
    // La ficha no pierde lo que ya tenía (la nota de muestra).
    expect(h.get().workshop.profiles["juan.i@ejemplo.com"]!.notes).toHaveLength(1);
  });
  it("por WhatsApp queda anotado sin email; con la plantilla pausada no se anota nada", () => {
    const h = harness();
    const before = h.get().emails.outbox.length;
    expect(h.actions.notifyRepurchase(juanWhey(), "whatsapp")).toBe("sent");
    expect(h.get().emails.outbox).toHaveLength(before);
    expect(h.get().workshop.profiles["juan.i@ejemplo.com"]!.notices![0]!.channel).toBe("whatsapp");
    const paused = harness((s) => ({ ...s, emails: { ...s.emails, templates: s.emails.templates.map((t) => ({ ...t, active: t.trigger !== "repurchase" })) } }));
    expect(paused.actions.notifyRepurchase(juanWhey(), "email")).toBe("off");
    expect(paused.get().workshop.profiles["juan.i@ejemplo.com"]!.notices).toBeUndefined();
  });
  it("withNotice no duplica y objetivo, notas y cumpleaños se guardan en la ficha", () => {
    const p = withNotice({ notes: [] }, "k", "email", "2026-10-04T10:00:00Z");
    expect(withNotice(p, "k", "whatsapp", "x")).toBe(p);
    const h = harness();
    h.actions.setCustomerGoal("Nico.R@ejemplo.com", "fuerza");
    h.actions.addCustomerNote("nico.r@ejemplo.com", "  Prefiere banana  ");
    h.actions.setCustomerBirthday("nico.r@ejemplo.com", "03-21");
    expect(h.get().workshop.profiles["nico.r@ejemplo.com"]).toMatchObject({ goal: "fuerza", birthday: "03-21", notes: [expect.objectContaining({ text: "Prefiere banana" })] });
  });
});
