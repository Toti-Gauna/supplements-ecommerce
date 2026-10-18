import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { defaultCounterData, normalizeCounter } from "@/demo/admin/counter-data";
import { migrateAdminData } from "@/demo/admin/migrate";
import { inHandLabel, orderOrigin } from "@/demo/admin/order-origin";
import { paymentTrack } from "@/demo/admin/order-tracks";
import { potFor } from "@/demo/engine/counter";
import { buildChatOrder, checkChatOrder, emptyChatDraft, nextOrderCode, type ChatOrderDraft } from "@/demo/engine/counter-chat";
import { quickQueryText, stockWord } from "@/demo/engine/counter-text";
import { canTransition } from "@/demo/engine/orders";
import { defaultDemoData } from "@/demo/engine/source";
import { DEFAULT_COUNTER_PLANS } from "@/demo/fixtures/counter";
import { ADMIN_STORE_VERSION } from "@/stores/storage";

/** R4b · consulta rápida para WhatsApp, pedidos cerrados por chat (nunca pagados solos) y el estado guardado v19. */
const TODAY = "2026-10-05";
const AT = `${TODAY}T11:30:00-03:00`;
const { products, categories } = defaultDemoData();
const draft = (over: Partial<ChatOrderDraft> = {}): ChatOrderDraft => ({
  ...emptyChatDraft(), name: "Ana Prueba", phone: "223 555-0199", lines: [{ productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", qty: 2 }], ...over,
});
const order = (d: ChatOrderDraft) => buildChatOrder(d, { code: "VOL-000127", at: AT, total: 59800, promisedDate: "2026-10-06" });

describe("consulta rápida: texto para WhatsApp", () => {
  const whey = products.find((p) => p.slug === "ionic-whey")!;
  const pots = whey.variants.filter((v) => v.id.endsWith("-5lb")).map((v) => potFor(whey, v, categories, { today: TODAY }));

  it("precio y stock de cada pote, sin números exactos salvo cuando quedan pocos", () => {
    const text = quickQueryText(pots, { store: "Tienda", city: "Mar del Plata" })!;
    expect(text.split("\n")).toEqual([
      `¡Hola! Te paso precio y stock de hoy de Ionic Whey 100% (${whey.brand}):`,
      "• Chocolate · 5 lb (2,27 kg): $ 116.900 · hay stock",
      "• Vainilla · 5 lb (2,27 kg): $ 116.900 · hay stock",
      "• Frutilla · 5 lb (2,27 kg): $ 116.900 · sin stock por ahora",
      "• Cookies & cream · 5 lb (2,27 kg): $ 116.900 · quedan 2",
      "Lo retirás en el local o te lo llevamos con cadete en Mar del Plata. ¿Te lo separo?",
      "— Tienda",
    ]);
    expect(text).not.toMatch(/acreditad|garantiza|cura|mg por kilo/i);
  });

  it("liquidación con su vencimiento, a pedido y sin potes", () => {
    const bar = structuredClone(products.find((p) => p.slug === "barra-proteica")!);
    const box = bar.variants.find((v) => v.id === "bp-mani-x12")!;
    box.lots![0]!.clearancePct = 30;
    expect(quickQueryText([potFor(bar, box, categories, { today: TODAY })], { store: "T", city: "C" })).toContain("$ 20.300 (liquidación, antes $ 29.000; vence 10/2026) · quedan 3");
    expect(stockWord({ state: "on-order", left: -1 })).toBe("a pedido");
    expect(stockWord({ state: "low", left: 1 })).toBe("queda 1");
    expect(quickQueryText([], { store: "T", city: "C" })).toBeNull();
  });
});

describe("pedido cerrado por chat", () => {
  it("valida lo mínimo: nombre, contacto, productos, dirección si no retira y cobro en mano confirmado", () => {
    expect(checkChatOrder(draft(), products)).toEqual({});
    const e = checkChatOrder({ ...emptyChatDraft(), fulfillment: "LOCAL_DELIVERY", pay: "IN_HAND", email: "mal" }, products);
    expect(Object.keys(e).sort()).toEqual(["address", "collected", "email", "lines", "name", "phone"]);
  });

  it("transferencia: entra pendiente de pago, con su canal a la vista", () => {
    const o = order(draft({ channel: "INSTAGRAM" }));
    expect(o).toMatchObject({ status: "PENDING_PAYMENT", paymentMethod: "BANK_TRANSFER", channel: "INSTAGRAM", fulfillment: "PICKUP", userId: null });
    expect(o.inHand).toBeUndefined();
    expect(o.lines).toEqual([{ id: "a", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", quantity: 2 }]);
    expect(o.customer.email).toBe("2235550199@sin-email.invalid");
    expect(orderOrigin(o)).toBe("por Instagram");
    expect(o.log[0]!.note).toBe("Pedido por Instagram cargado en el mostrador");
  });

  it("un comprobante mandado por el chat queda en revisión: nunca pagado", () => {
    const o = order(draft({ pay: "QR_MANUAL", proofSent: true }));
    expect(o.status).toBe("PAYMENT_REVIEW");
    expect(o.proof).toMatchObject({ status: "IN_REVIEW", fileName: "comprobante-por-whatsapp.jpg" });
    expect(paymentTrack(o).label).toBe("Comprobante en revisión");
    // Con Mercado Pago no hay comprobante que valga.
    expect(order(draft({ pay: "CHECKOUT_PRO", proofSent: true })).status).toBe("PENDING_PAYMENT");
  });

  it("en mano: solo pagado si el dueño confirma que cobró, con la transición de orders.ts", () => {
    expect(canTransition("PENDING_PAYMENT", "PAID", { fulfillment: "PICKUP", trigger: "in-hand" })).toBe(true);
    expect(canTransition("PAYMENT_REVIEW", "PAID", { fulfillment: "PICKUP", trigger: "in-hand" })).toBe(false);
    const o = order(draft({ pay: "IN_HAND", inHandMethod: "DEBIT", collected: true }));
    expect(o).toMatchObject({ status: "PAID", inHand: "DEBIT" });
    expect(o.log.map((l) => [l.from, l.to])).toEqual([[null, "PENDING_PAYMENT"], ["PENDING_PAYMENT", "PAID"]]);
    expect(o.log[1]!.note).toBe("Cobro en mano confirmado por el dueño (Débito)");
    expect(inHandLabel(o)).toBe("Débito en mano");
    expect(paymentTrack(o).label).toBe("Cobrado en mano");
    expect(order(draft({ pay: "IN_HAND", collected: false })).status).toBe("PENDING_PAYMENT");
  });

  it("envío con dirección y email del cliente si lo dejó; el código sigue la numeración", () => {
    const o = order(draft({ fulfillment: "SHIPPING", address: "  Calle 1 234, Tandil ", email: "Ana@Ejemplo.com" }));
    expect(o).toMatchObject({ address: "Calle 1 234, Tandil", customer: { email: "ana@ejemplo.com" }, promisedDate: "2026-10-06" });
    expect(nextOrderCode(defaultAdminData().orders, "VOL")).toBe("VOL-000127");
    expect(nextOrderCode([{ code: "VOL-DEMO-0001" }], "VOL")).toBe("VOL-000001");
  });
});

describe("estado guardado v19", () => {
  let saved: Partial<AdminData>;
  beforeEach(() => {
    const base = defaultAdminData();
    const settings = { ...base.data.settings };
    delete settings.counterPlans;
    const { counter, ...rest } = base;
    void counter;
    saved = { ...rest, data: { ...base.data, settings: { ...settings, transferDiscountPct: 7 } } };
  });

  it("la versión del panel sube a 19", () => {
    expect(ADMIN_STORE_VERSION).toBeGreaterThanOrEqual(19);
  });

  it("de v18 suma el mostrador vacío y las cuotas de muestra sin tocar lo editado", () => {
    const next = migrateAdminData(saved, 18);
    expect(next.counter).toEqual(defaultCounterData());
    expect(next.data!.settings.counterPlans).toEqual(DEFAULT_COUNTER_PLANS);
    expect(next.data!.settings.transferDiscountPct).toBe(7);
    expect(next.orders).toHaveLength(saved.orders!.length);
  });

  it("las cuotas y las ventas ya guardadas en v19 no se pisan; lo roto vuelve a vacío", () => {
    const plans = [{ count: 3, pct: 9 }];
    const v19 = { ...saved, data: { ...saved.data!, settings: { ...saved.data!.settings, counterPlans: plans } }, counter: { sales: [], closures: [], float: 5000 } };
    expect(migrateAdminData(v19, 19).data!.settings.counterPlans).toEqual(plans);
    expect(normalizeCounter({ float: 5000 })).toEqual({ sales: [], closures: [], float: 5000 });
    expect(normalizeCounter({ sales: "x" as never, float: -3 })).toEqual(defaultCounterData());
  });
});
