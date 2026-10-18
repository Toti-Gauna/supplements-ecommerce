import { beforeEach, describe, expect, it } from "vitest";
import { emptyChatDraft } from "@/demo/engine/counter-chat";
import { demoData } from "@/demo/engine/source";
import { useAdmin } from "@/stores/admin";

/** R4b · el mostrador en el store del panel: la venta descuenta stock (lo ve la tienda), el cierre y el pedido por chat. */
const state = () => useAdmin.getState();
const stockOf = (slug: string, id: string) => demoData().products.find((p) => p.slug === slug)!.variants.find((v) => v.id === id)!;
beforeEach(() => state().resetAdmin());

describe("venta en el mostrador (simulada)", () => {
  it("descuenta del lote FEFO en el catálogo que lee la tienda y queda en el historial del día", () => {
    const r = state().sellAtCounter([{ productSlug: "ionic-whey", variantId: "iw-vainilla-2lb", qty: 6 }], { method: "CASH", received: 400000 });
    expect(r).toMatchObject({ ok: true, sale: { number: "0001", total: 329400, change: 70600 } });
    expect(stockOf("ionic-whey", "iw-vainilla-2lb")).toMatchObject({ stock: 12, lots: [{ code: "VL-2609-W", units: 12 }] });
    expect(state().counter.sales).toHaveLength(1);
    expect(state().audit[0]).toMatchObject({ entity: "Ticket 0001", action: "Venta de mostrador simulada: $ 329.400 en efectivo" });
    const second = state().sellAtCounter([{ productSlug: "ionic-whey", variantId: "iw-vainilla-2lb", qty: 1 }], { method: "CREDIT", installments: 3 });
    expect(second).toMatchObject({ ok: true, sale: { number: "0002", installments: 3, installment: 20496, total: 61488, surcharge: 6588 } });
  });

  it("si no alcanza el stock o el efectivo, no cambia nada", () => {
    const before = state().data.products;
    expect(state().sellAtCounter([{ productSlug: "ionic-whey", variantId: "iw-cookies-cream-5lb", qty: 3 }], { method: "DEBIT" }).ok).toBe(false);
    expect(state().sellAtCounter([{ productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", qty: 1 }], { method: "CASH", received: 1000 }).ok).toBe(false);
    expect(state().data.products).toBe(before);
    expect(state().counter.sales).toHaveLength(0);
  });

  it("las cuotas usan los recargos de los ajustes", () => {
    state().saveSettings({ counterPlans: [{ count: 3, pct: 0 }, { count: 6, pct: 10 }] });
    const r = state().sellAtCounter([{ productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", qty: 1 }], { method: "CREDIT", installments: 6 });
    expect(r).toMatchObject({ ok: true, sale: { pct: 10, total: 32892, installment: 5482 } });
  });
});

describe("cierre del día en el store", () => {
  it("cierra con la caja esperada (fondo + efectivo) y el fondo se puede cambiar", () => {
    state().setCounterFloat(15000);
    state().sellAtCounter([{ productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", qty: 1 }], { method: "CASH", received: 30000 });
    state().sellAtCounter([{ productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", qty: 1 }], { method: "DEBIT" });
    const r = state().closeCounterDay(45000);
    expect(r).toMatchObject({ ok: true, closure: { tickets: 2, cashExpected: 44900, counted: 45000, difference: 100 } });
    expect(state().counter.closures).toHaveLength(1);
    expect(state().counter.sales.every((s) => s.closedAt)).toBe(true);
    expect(state().closeCounterDay(null).ok).toBe(false);
  });
});

describe("pedido por chat en el store", () => {
  it("entra como pedido del panel con su total, su fecha y sin pagar", () => {
    const r = state().createChatOrder({ ...emptyChatDraft(), name: "Ana Prueba", phone: "223 555-0199", fulfillment: "LOCAL_DELIVERY", address: "Güemes 2900, Mar del Plata",
      lines: [{ productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", qty: 2 }] });
    expect(r).toEqual({ ok: true, code: "VOL-000127" });
    const o = state().orders[0]!;
    // 2 × 29.900 − 10 % por transferencia + cadete 3.500.
    expect(o).toMatchObject({ code: "VOL-000127", status: "PENDING_PAYMENT", channel: "WHATSAPP", total: 53820 + 3500 });
    expect(o.promisedDate).toBeTruthy();
    // Sin email no hay emails simulados.
    expect(state().emails.outbox.some((m) => m.orderCode === "VOL-000127")).toBe(false);
  });

  it("con errores no carga nada", () => {
    const n = state().orders.length;
    const r = state().createChatOrder(emptyChatDraft());
    expect(r.ok).toBe(false);
    expect(state().orders).toHaveLength(n);
  });
});
