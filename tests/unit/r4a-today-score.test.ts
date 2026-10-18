import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { compareActions, greetingFor, summaryLine, type TodayAction, type TodaySnapshot } from "@/demo/engine/today";
import { todayBoard } from "@/demo/engine/today-board";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

/** R4a · "Hoy en tu tienda": el marcador del día y los textos de arriba (lunes 5/10/2026). */
const snap = (): TodaySnapshot => defaultAdminData();
const order = (s: TodaySnapshot, code: string) => s.orders.find((o) => o.code === code)!;

describe("marcador del día", () => {
  it("sale de los pedidos, el cadete y el stock de la demo", () => {
    const { score } = todayBoard(snap(), DEMO_TODAY);
    expect(score.sold).toEqual({ amount: 0, orders: 0, week: 318_390 });
    // Pendientes de pago + comprobantes en revisión: nada de eso está cobrado.
    expect(score.toCollect).toEqual({ amount: 171_150, orders: 4, receipts: 2, receiptsAmount: 69_740 });
    expect(score.toPack).toEqual({ count: 8, late: 1 });
    expect(score.leaving).toMatchObject({ cadete: 1, pickup: 0, slotsUsed: 1, capacity: 2, nextCadeteDay: "2026-10-06" });
    expect(score.stockRisk).toEqual({ count: 30, out: 8 });
  });

  it("un comprobante en revisión no suma a lo vendido; aprobado, sí (si el pedido es de hoy)", () => {
    const s = snap();
    const o = order(s, "VOL-000124");
    o.createdAt = `${DEMO_TODAY}T09:00:00-03:00`;
    expect(todayBoard(s, DEMO_TODAY).score.sold.amount).toBe(0);
    o.status = "PAID";
    o.proof = { ...o.proof!, status: "APPROVED" };
    expect(todayBoard(s, DEMO_TODAY).score.sold).toMatchObject({ amount: o.total, orders: 1 });
  });
});

describe("textos y orden estable", () => {
  it("saludo según la hora de Buenos Aires", () => {
    expect(greetingFor("2026-10-05T11:00:00.000Z")).toBe("Buen día");
    expect(greetingFor("2026-10-05T18:30:00.000Z")).toBe("Buenas tardes");
    expect(greetingFor("2026-10-06T01:00:00.000Z")).toBe("Buenas noches");
  });

  it("la frase de arriba cuenta lo urgente", () => {
    const list = todayBoard(snap(), DEMO_TODAY).actions;
    expect(summaryLine(list)).toBe("Tenés 7 cosas para hoy. Arrancá por la primera de la lista.");
    expect(summaryLine(list.filter((a) => a.tier === "semana"))).toBe("Nada urgente para hoy. Quedan 4 cosas para la semana.");
  });

  it("a igual nivel y tipo, manda lo que vence antes y después el id", () => {
    const base = { kind: "receipt", tier: "hoy", title: "", detail: "", metric: { value: 1 }, href: "", cta: { type: "link", label: "", href: "" } } as const;
    const a: TodayAction = { ...base, id: "b", due: "2026-10-06" };
    const b: TodayAction = { ...base, id: "a", due: "2026-10-06" };
    const c: TodayAction = { ...base, id: "c", due: "2026-10-05" };
    expect([a, b, c].sort(compareActions).map((x) => x.id)).toEqual(["c", "a", "b"]);
  });
});
