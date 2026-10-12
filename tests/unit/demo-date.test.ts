import { beforeEach, describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createOrdersActions } from "@/demo/admin/orders-slice";
import { demoNow } from "@/demo/clock";
import { DISPATCH_PROMISE, nextCadeteDay, READY_STOCK_DAYS } from "@/demo/engine/delivery";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { stageDates, trackedStatus } from "@/demo/engine/tracking";
import { weekday } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { shippingZones } from "@/demo/fixtures/commerce";
import { storeFaqs } from "@/demo/fixtures/content";
import { sampleTrackedOrder } from "@/demo/fixtures/tracking";
import { FAQ } from "@/demo/fixtures/variants";
import { workshopSettings as settings } from "@/demo/fixtures/workshop";
import { arrivalText } from "@/features/order/arrival";
import { etaFor, stateForStatus, timelineFor } from "@/features/order/tracking-states";
import { whenDay } from "@/lib/date";
import type { DemoOrder } from "@/stores/checkout";

beforeEach(() => setDemoData(defaultDemoData()));

describe("una sola fecha de demo: el lunes 5 de octubre de 2026", () => {
  it("es lunes: el local despacha y el cadete sale", () => {
    expect(DEMO_TODAY).toBe("2026-10-05");
    expect(weekday(DEMO_TODAY)).toBe(1);
  });
  it("'ahora' es la hora real de Buenos Aires sobre el día de la demo", () => {
    expect(demoNow(new Date("2026-10-12T18:32:10Z"))).toBe("2026-10-05T18:32:10.000Z");
    // 23:05 del 23/12 en Buenos Aires → 23:05 del lunes 5/10 (02:05 del 6 en UTC).
    expect(demoNow(new Date("2026-12-24T02:05:00Z"))).toBe("2026-10-06T02:05:00.000Z");
  });
  it("hoy, mañana o el día", () => {
    expect(whenDay("2026-10-05", DEMO_TODAY)).toBe("hoy, lun 5 oct");
    expect(whenDay("2026-10-06", DEMO_TODAY)).toBe("mañana, mar 6 oct");
    expect(whenDay("2026-10-06", DEMO_TODAY, "long")).toBe("mañana, martes 6 de octubre");
    expect(whenDay("2026-10-08", DEMO_TODAY)).toBe("el jue, 8 oct");
  });
});

describe("promesa de entrega única", () => {
  it("los textos fijos prometen lo mismo que calcula el calendario", () => {
    expect(READY_STOCK_DAYS).toBe(1);
    expect(DISPATCH_PROMISE).toBe("al día hábil siguiente");
    const texts = [site.description, storeFaqs.find((f) => f.q === "¿Cuándo me llega?")!.a, FAQ.envio.a, ...shippingZones.map((z) => z.etaText)];
    for (const t of texts) expect(t).not.toMatch(/en el día|antes de las 14|en 1 hora/);
    expect(storeFaqs.find((f) => f.q === "¿Cuándo me llega?")!.a).toContain("con cadete al día hábil siguiente");
  });
  it("el cadete lleva mañana lo que se pide hoy; con el día completo, el próximo con lugar", () => {
    const { orders } = defaultAdminData();
    expect(nextCadeteDay(DEMO_TODAY, orders, settings)).toBe("2026-10-06");
    // Con el martes completo pasa al miércoles.
    const full = [1, 2].map((n) => ({ code: `X-${n}`, status: "PAID" as const, fulfillment: "LOCAL_DELIVERY" as const, promisedDate: "2026-10-06", lines: [] }));
    expect(nextCadeteDay(DEMO_TODAY, [...orders, ...full], settings)).toBe("2026-10-07");
  });
  it("cuándo lo recibe, por cada forma de entrega", () => {
    expect(arrivalText("LOCAL_DELIVERY", "2026-10-06", DEMO_TODAY, settings)).toBe("Llega mañana, mar 6 oct");
    expect(arrivalText("PICKUP", "2026-10-08", DEMO_TODAY, settings)).toBe("Retiralo desde el jue, 8 oct");
    // Por correo, de 3 a 7 días hábiles desde que sale (el lunes 12 es feriado).
    expect(arrivalText("SHIPPING", "2026-10-06", DEMO_TODAY, settings)).toBe("Llega entre el vie, 9 oct y el vie, 16 oct");
  });
  it("el pedido del checkout guarda la fecha que vio el comprador (la misma de sus regalos)", () => {
    let state: AdminData = defaultAdminData();
    const set = (fn: (s: AdminData) => Partial<AdminData>) => { state = { ...state, ...fn(state) }; };
    const actions = createOrdersActions(set, () => state);
    const order: DemoOrder = {
      code: "VOL-DEMO-0001", token: "demo-volta", createdAt: "2026-10-05T14:00:00.000Z", promisedDate: "2026-10-07",
      contact: { name: "Juana Pérez", email: "juana@ejemplo.com", phone: "223 555-1234" }, fulfillment: "LOCAL_DELIVERY", paymentMethod: "BANK_TRANSFER",
      lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }], quote: { total: 1 } as unknown as DemoOrder["quote"], asAccount: false,
    };
    actions.syncShopOrder(order);
    expect(state.orders[0]).toMatchObject({ code: "VOL-DEMO-0001", status: "PENDING_PAYMENT", promisedDate: "2026-10-07" });
    // Subir el comprobante lo deja en revisión, fechado el día de la demo.
    expect(actions.receiveProof("VOL-DEMO-0001", "comprobante.pdf")).toBe(true);
    expect(state.orders[0]!.status).toBe("PAYMENT_REVIEW");
    expect(state.orders[0]!.log.at(-1)!.at.slice(0, 10)).toBe(DEMO_TODAY);
  });
});

describe("seguimiento con el estado y las fechas del pedido", () => {
  it("arranca en el estado real: con el comprobante en revisión no dice 'Pagado'", () => {
    const log = [{ at: "2026-10-05T14:00:00.000Z", to: "PENDING_PAYMENT" as const }, { at: "2026-10-05T14:05:00.000Z", to: "PAYMENT_REVIEW" as const }];
    expect(stateForStatus("PAYMENT_REVIEW")).toBe("review");
    const steps = timelineFor(1, stageDates(log, "PAYMENT_REVIEW"));
    expect(steps.map((s) => s.state)).toEqual(["done", "current", "pending", "pending", "pending", "pending", "pending"]);
    expect(steps.find((s) => s.label === "Pagado")).toMatchObject({ state: "pending", date: undefined });
    expect(steps[0]!.date).toMatch(/^5 oct, 11:00/);
    expect(etaFor("review", "LOCAL_DELIVERY", "2026-10-06", DEMO_TODAY, settings)).toBe("Llega mañana, mar 6 oct, si el pago se confirma a tiempo");
  });
  it("cada estado del pedido tiene su vista; un reclamo muestra dónde estaba", () => {
    expect(["PENDING_PAYMENT", "PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"].map((s) => stateForStatus(s as never))).toEqual(["pending", "paid", "production", "ready", "shipped", "delivered"]);
    expect(trackedStatus("IN_CLAIM", "DELIVERED")).toBe("DELIVERED");
    expect(trackedStatus("CANCELLED")).toBe("PENDING_PAYMENT");
  });
  it("un comprobante rechazado no deja la revisión vieja en la línea de tiempo", () => {
    const log = [{ at: "a", to: "PENDING_PAYMENT" as const }, { at: "b", to: "PAYMENT_REVIEW" as const }, { at: "c", to: "PENDING_PAYMENT" as const }];
    expect(stageDates(log, "PENDING_PAYMENT")).toEqual(["c", undefined, undefined, undefined, undefined, undefined, undefined]);
  });
  it("el pedido de ejemplo es del día de la demo y se está armando", () => {
    const status = sampleTrackedOrder.log.at(-1)!.to;
    expect(status).toBe("IN_PRODUCTION");
    expect(sampleTrackedOrder.log.every((l) => l.at.startsWith(DEMO_TODAY))).toBe(true);
    expect(etaFor("ready", "LOCAL_DELIVERY", "2026-10-06", DEMO_TODAY, settings)).toBe("Sale con el cadete mañana, mar 6 oct");
  });
});
