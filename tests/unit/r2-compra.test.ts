import { beforeEach, describe, expect, it } from "vitest";
import { cadeteClock, countdownText } from "@/demo/engine/cadete-clock";
import { cartLoad } from "@/demo/engine/cart-load";
import { orderReminders, potsInUse, remainingPct } from "@/demo/engine/repurchase";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";
import { checkedLot } from "@/demo/engine/tracking";
import { runOutLineForBuyer } from "@/demo/admin/repurchase-text";
import { deliveryStrip } from "@/features/order/tracking-states";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { deliveredSampleOrder } from "@/demo/fixtures/tracking";
import { workshopSettings as settings } from "@/demo/fixtures/workshop";

beforeEach(() => setDemoData(defaultDemoData()));

const whey = [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }];

describe("carga del bolso: un solo medidor", () => {
  it("mide el envío gratis y suma la meta del stack solo con suplementos", () => {
    const load = cartLoad(84_800, { categories: ["proteinas", "creatinas"], missing: 1 }, { freeShippingFrom: 120_000, stackPct: 10 });
    expect(load.pct).toBe(70);
    expect(load.goals.map((g) => [g.id, g.done, g.missing])).toEqual([["shipping", false, "faltan $ 35.200"], ["stack", false, "1 categoría más"]]);
    expect(load.next).toBe("Te faltan $ 35.200 para el envío gratis · Sumá 1 categoría más de suplementos y tenés 10 % off");
  });
  it("sin suplementos o con el stack apagado no ofrece el stack; con todo hecho no hay próxima meta", () => {
    expect(cartLoad(10_000, { categories: [], missing: 3 }, { freeShippingFrom: 120_000, stackPct: 10 }).goals).toHaveLength(1);
    expect(cartLoad(10_000, { categories: ["proteinas"], missing: 2 }, { freeShippingFrom: 120_000, stackPct: 0 }).goals).toHaveLength(1);
    const full = cartLoad(130_000, { categories: ["a", "b", "c"], missing: 0 }, { freeShippingFrom: 120_000, stackPct: 10 });
    expect(full.pct).toBe(100);
    expect(full.next).toBeNull();
    expect(full.goals.every((g) => g.done && g.missing === "")).toBe(true);
  });
});

describe("cuenta regresiva del cadete", () => {
  it("el lunes 5/10 a las 21:50 llega el martes y quedan 2 h 10 min (a la medianoche la promesa pasa al miércoles)", () => {
    const c = cadeteClock(whey, "2026-10-06T00:50:00.000Z", DEMO_TODAY, [], settings);
    expect(c).toEqual({ day: "2026-10-06", minutesLeft: 130 });
    expect(countdownText(c.minutesLeft!)).toBe("2 h 10 min");
  });
  it("un sábado no apura: pedir el domingo da la misma fecha", () => {
    expect(cadeteClock(whey, "2026-10-10T15:00:00.000Z", "2026-10-10", [], settings).minutesLeft).toBeNull();
  });
  it("textos cortos", () => {
    expect(countdownText(45)).toBe("45 min");
    expect(countdownText(120)).toBe("2 h");
    expect(countdownText(0)).toBe("menos de 1 min");
  });
});

describe("Mi box: potes en uso calculados de los pedidos", () => {
  it("el pedido entregado de la cuenta demo: la whey se termina el 9/10 y la creatina el 8/11", () => {
    const pots = potsInUse([deliveredSampleOrder], demoData().products, DEMO_TODAY);
    expect(pots.map((p) => [p.slug, p.startsOn, p.runsOutOn, p.state])).toEqual([
      ["ionic-whey", "2026-09-09", "2026-10-09", "week"],
      ["creatina-monohidrato", "2026-09-09", "2026-11-08", "later"],
    ]);
    expect(remainingPct(pots[0]!, DEMO_TODAY)).toBe(13);
  });
  it("un pedido sin pagar todavía no es un pote en uso", () => {
    expect(potsInUse([{ ...deliveredSampleOrder, status: "PENDING_PAYMENT" }], demoData().products, DEMO_TODAY)).toEqual([]);
  });
  it("avisos de recompra de lo comprado: uno por producto que se sigue, 5 días antes", () => {
    const lines = [...deliveredSampleOrder.lines, { id: "x", productSlug: "shaker-volta", variantId: "sh-voltio", quantity: 1 }];
    const r = orderReminders(lines, "2026-10-06", demoData().products);
    expect(r.map((x) => [x.id, x.runsOutOn, x.remindOn, x.perDay])).toEqual([
      ["ionic-whey:iw-chocolate-2lb", "2026-11-05", "2026-10-31", 1],
      ["creatina-monohidrato:cm-sin-sabor-300", "2026-12-05", "2026-11-30", 1],
    ]);
  });
});

describe("lote del control, para el comprador", () => {
  it("lee el texto que guarda el panel", () => {
    expect(checkedLot("VL-2606-W · vence 06/2027")).toEqual({ code: "VL-2606-W", expires: "06/2027" });
    expect(checkedLot("Sin lote cargado")).toEqual({ code: null, expires: null });
    expect(checkedLot(undefined)).toBeNull();
  });
});

describe("textos y etapas para el comprador", () => {
  it("Mi box le habla al comprador", () => {
    expect(runOutLineForBuyer({ runsOutOn: "2026-10-09", inDays: 4 })).toBe("Se te termina el viernes 9 de octubre (en 4 días)");
    expect(runOutLineForBuyer({ runsOutOn: "2026-10-01", inDays: -4 })).toBe("Se te terminó el jueves 1 de octubre (hace 4 días)");
  });
  it("la ficha de entrega: pago en curso, después armado y lote, después la entrega", () => {
    const states = (s: Parameters<typeof deliveryStrip>[0]) => deliveryStrip(s, "Llega mañana").map((x) => x.state);
    expect(states("PENDING_PAYMENT")).toEqual(["done", "current", "pending", "pending"]);
    expect(states("IN_PRODUCTION")).toEqual(["done", "done", "current", "pending"]);
    expect(states("SHIPPED")).toEqual(["done", "done", "done", "current"]);
    expect(states("DELIVERED")).toEqual(["done", "done", "done", "done"]);
  });
});
