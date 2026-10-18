import { beforeEach, describe, expect, it } from "vitest";
import { CALENDAR_HELP, PREPARATION_HELP } from "@/demo/admin/help";
import { byYear, checkEvent, eventDraft, hasImpact, holidayRows, ownClosures, scheduleImpact } from "@/demo/admin/workshop/schedule";
import { checkDrop, checkReschedule } from "@/demo/engine/reschedule";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { AR_HOLIDAYS } from "@/demo/fixtures/workshop";
import { useAdmin } from "@/stores/admin";

/** Polish 8.3 · Lote 5 y Fase 7: impacto del cupo del cadete y de cierres, feriados separados, entradas y preparación. */
const state = () => useAdmin.getState();
const order = (code: string) => state().orders.find((o) => o.code === code)!;
const bolsa = () => state().workshop.materials.find((m) => m.name === "Bolsa con logo")!.stock;
beforeEach(() => state().resetAdmin());

describe("capacidad y días cerrados (8.3.14)", () => {
  it("bajar el cupo del cadete marca los días que quedan sobrecargados, sin mover pedidos", () => {
    const s = state().workshop.settings;
    // El 8 y el 9 tienen 2 pedidos con cadete cada uno (retiro y correo no cuentan).
    const impact = scheduleImpact(state().orders, s, { ...s, dailyCapacity: 1 }, DEMO_TODAY);
    expect(impact.overloaded.map((d) => d.day)).toEqual(["2026-10-08", "2026-10-09"]);
    expect(impact.closed).toEqual([]);
    expect(hasImpact(scheduleImpact(state().orders, s, { ...s, dailyCapacity: 4 }, DEMO_TODAY))).toBe(false);
  });
  it("cerrar un día con una entrega la lista con el motivo; abrir sábados no toca nada", () => {
    const s = state().workshop.settings;
    const closed = { ...s, closures: [...s.closures, { date: "2026-10-14", name: "Mudanza", kind: "cierre" as const }] };
    expect(scheduleImpact(state().orders, s, closed, DEMO_TODAY).closed).toEqual([{ code: "VOL-000123", day: "2026-10-14", reason: "Mudanza" }]);
    expect(hasImpact(scheduleImpact(state().orders, s, { ...s, closedWeekdays: [0] }, DEMO_TODAY))).toBe(false);
    state().addClosure({ date: "2026-10-14", name: "Mudanza", kind: "cierre" });
    expect(order("VOL-000123").promisedDate).toBe("2026-10-14");
  });
  it("feriados cargados separados de los cierres propios, por año y sin perder ninguno", () => {
    const s = state().workshop.settings;
    const rows = holidayRows(s, DEMO_TODAY);
    expect(rows).toHaveLength(AR_HOLIDAYS.length);
    expect(rows.map((r) => r.date)).toEqual([...rows.map((r) => r.date)].sort());
    expect(byYear(rows, "2027", DEMO_TODAY)).toHaveLength(16);
    expect(byYear(rows, "proximos", DEMO_TODAY).every((r) => r.date >= DEMO_TODAY)).toBe(true);
    expect(ownClosures(s).map((c) => c.name)).toEqual(["Inventario anual (local cerrado, de muestra)"]);
    state().removeClosure("2026-10-12");
    expect(holidayRows(state().workshop.settings, DEMO_TODAY).find((r) => r.date === "2026-10-12")).toMatchObject({ closed: false, past: false });
  });
  it("editar un cierre propio cambia fecha y motivo en un paso", () => {
    state().updateClosure("2026-11-06", { date: "2026-11-13", name: "Feria (otra fecha)", kind: "cierre" });
    expect(ownClosures(state().workshop.settings)).toEqual([{ date: "2026-11-13", name: "Feria (otra fecha)", kind: "cierre" }]);
  });
});

describe("calendario editable (8.3.15)", () => {
  it("datos guardados antes de 8.3 (sin entradas o con entradas rotas) quedan con las de muestra; lo demás no cambia", () => {
    const merge = useAdmin.persist.getOptions().merge!;
    const { events: _omit, ...oldWorkshop } = state().workshop;
    void _omit;
    const old = merge({ workshop: { ...oldWorkshop, settings: { ...oldWorkshop.settings, dailyCapacity: 5 } } }, state());
    expect(old.workshop.events.map((e) => e.id)).toEqual(["ev-entrega-krono", "ev-retiro-113"]);
    expect(old.workshop.settings.dailyCapacity).toBe(5);
    expect(merge({ workshop: { ...oldWorkshop, events: "roto" } }, state()).workshop.events).toHaveLength(2);
  });
  it("soltar un pedido: un día con el cadete completo, cerrado o pasado se rechaza con el motivo; Reprogramar permite sobrecargar avisando", () => {
    const { orders, workshop: { settings } } = state();
    const o = order("VOL-000110");
    expect(checkDrop(o, "2026-10-08", DEMO_TODAY, orders, settings)).toMatchObject({ ok: false, blocked: "full" });
    expect(checkDrop(o, "2026-10-12", DEMO_TODAY, orders, settings)).toMatchObject({ ok: false, blocked: "closed", error: "Día de la Diversidad Cultural: no se despacha ese día." });
    expect(checkDrop(o, "2026-10-10", DEMO_TODAY, orders, settings).error).toBe("Sábado sin despachos: elegí otro día.");
    expect(checkDrop(o, "2026-10-01", DEMO_TODAY, orders, settings)).toMatchObject({ ok: false, blocked: "past" });
    expect(checkDrop(o, "2026-10-13", DEMO_TODAY, orders, settings).ok).toBe(true);
    expect(checkReschedule(o, "2026-10-08", DEMO_TODAY, orders, settings)).toMatchObject({ ok: true, overload: true });
    // Un pedido que va por correo no usa el cadete: el 8 lo acepta aunque el cadete esté completo.
    expect(checkDrop(order("VOL-000114"), "2026-10-08", DEMO_TODAY, orders, settings)).toMatchObject({ ok: true, overload: false });
    expect(checkDrop(order("VOL-000119"), "2026-10-13", DEMO_TODAY, orders, settings)).toMatchObject({ ok: false, blocked: "fixed" });
  });
  it("entradas: validación, guardar, mover y quitar, sin tocar pedidos", () => {
    const codes = state().orders.map((o) => o.code);
    expect(checkEvent(eventDraft("2026-10-06"), DEMO_TODAY, codes)).toHaveProperty("title");
    expect(checkEvent({ ...eventDraft("2026-10-06"), title: "Nota", kind: "pedido" }, DEMO_TODAY, codes)).toHaveProperty("orderCode");
    expect(checkEvent({ ...eventDraft("2026-10-01"), title: "Vacaciones", kind: "cierre" }, DEMO_TODAY, codes)).toHaveProperty("date");
    expect(checkEvent({ ...eventDraft("2026-10-01"), title: "Anotación vieja" }, DEMO_TODAY, codes)).toEqual({});
    const before = state().orders;
    state().saveEvent({ id: "ev-test", date: "2026-10-06", title: "Llamar al proveedor", kind: "tarea" });
    state().moveEvent("ev-test", "2026-10-07");
    expect(state().workshop.events.find((e) => e.id === "ev-test")?.date).toBe("2026-10-07");
    state().removeEvent("ev-test");
    expect(state().workshop.events.some((e) => e.id === "ev-test")).toBe(false);
    expect(state().orders).toBe(before);
  });
});

describe("preparación de pedidos (8.3.16, Fase 7)", () => {
  it("el embalaje se descuenta una sola vez aunque el pedido vaya y vuelva entre etapas", () => {
    expect(bolsa()).toBe(120);
    expect(state().movePreparation("VOL-000113", "lot-check")).toBeNull();
    const after = bolsa();
    expect(after).toBeLessThan(120);
    expect(state().movePreparation("VOL-000113", "picking")).toBeNull();
    expect(state().movePreparation("VOL-000113", "lot-check")).toBeNull();
    expect(bolsa()).toBe(after);
    expect(state().movePreparation("VOL-000113", "queue")).toBe("Un pedido que se empezó a armar no vuelve a Por preparar.");
    expect(state().movePreparation("VOL-000113", "lot-check")).toBe("Ya está en esa etapa.");
    expect(order("VOL-000113")).toMatchObject({ status: "IN_PRODUCTION", stage: "lot-check" });
  });
  it("a Listo para despachar solo con el lote de cada línea confirmado, también desde la ficha o en lote", () => {
    expect(state().movePreparation("VOL-000110", "ready")).toBe("Antes de despacharlo, pasalo por Control de lote.");
    expect(state().movePreparation("VOL-000121", "ready")).toBe("Falta confirmar el lote de 1 producto.");
    expect(state().transition("VOL-000121", "READY")).toBe(false);
    expect(state().confirmLots("VOL-000121", {})).toBe("Falta confirmar el lote de algún producto.");
    expect(order("VOL-000121").status).toBe("IN_PRODUCTION");
    expect(state().confirmLots("VOL-000121", { a: "VL-2610-C · vence 03/2028" })).toBeNull();
    expect(order("VOL-000121")).toMatchObject({ status: "READY", lotCheck: { a: "VL-2610-C · vence 03/2028" } });
    expect(order("VOL-000121").stage).toBeUndefined();
    expect(state().emails.outbox[0]).toMatchObject({ trigger: "ready", orderCode: "VOL-000121" });
    expect(state().confirmLots("VOL-000121", { a: "otro" })).toBe("Solo se controlan los lotes de un pedido en preparación.");
  });
});

describe("ayudas de Operaciones (8.3.10, Fase 7)", () => {
  it("salen de las reglas del engine: qué ocupa lugar del cadete y los dos pasos de Para armar (R4b)", () => {
    expect(CALENDAR_HELP.items.find((i) => i.term === "Ocupa lugar del cadete")?.text).toMatch(/pendiente de pago.*pagado.*en preparación.*listo/i);
    expect(PREPARATION_HELP.items.map((i) => i.term)).toEqual(["1 · Juntá los potes", "2 · Controlá lote y vencimiento", "Reglas"]);
    expect(PREPARATION_HELP.items.at(-1)!.text).toMatch(/lote de cada producto confirmado/);
  });
});

