import { beforeEach, describe, expect, it } from "vitest";
import { customerRows } from "@/demo/admin/customers";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createOrdersActions } from "@/demo/admin/orders-slice";
import { costRows, marginPct, recipeCost, suggestedPrice, basePriceFor } from "@/demo/admin/workshop/costs";
import { toIcs } from "@/demo/admin/workshop/ics";
import { applyMaterialOp, committedNeeds, consumeMaterials, materialRows, orderNeeds, reorderQty } from "@/demo/admin/workshop/materials";
import { columnOf, nextColumn, productionMove } from "@/demo/admin/workshop/production";
import { customerReminders, nextOccurrence } from "@/demo/admin/workshop/reminders";
import { calendarOf, checkReschedule, deliveryWindows, estimateForProduct, lineLeadDays, loadByDay, nextFreeDayFor, orderLeadDays, pendingDeliveries, promiseFor } from "@/demo/engine/delivery";
import { getProduct } from "@/demo/engine/catalog";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { addMonths, addWorkdays, closureFor, isWorkday, monthGrid, nextWorkday, prevWorkday, weekOf, workdaysBetween } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { AR_HOLIDAYS, workshopSettings } from "@/demo/fixtures/workshop";

beforeEach(() => setDemoData(defaultDemoData()));
const cal = calendarOf(workshopSettings);

describe("días hábiles y feriados", () => {
  it("salta fines de semana y feriados argentinos", () => {
    expect(isWorkday("2026-10-12", cal)).toBe(false);
    expect(closureFor("2026-10-12", cal)?.reason).toBe("Día de la Diversidad Cultural");
    expect(closureFor("2026-10-10", cal)?.reason).toBe("Sábado sin taller");
    // Viernes 9 + 1 hábil: sábado, domingo y el lunes 12 (feriado) no cuentan
    expect(addWorkdays("2026-10-09", 1, cal)).toBe("2026-10-13");
    expect(addWorkdays("2026-10-04", 0, cal)).toBe("2026-10-05");
    expect(nextWorkday("2026-11-20", cal)).toBe("2026-11-24");
    expect(prevWorkday("2026-10-13", cal)).toBe("2026-10-09");
    expect(workdaysBetween("2026-10-09", "2026-10-16", cal)).toBe(4);
    expect(workdaysBetween("2026-10-16", "2026-10-09", cal)).toBe(-4);
  });
  it("los trasladables están en lunes y las fechas no se repiten", () => {
    const moved = AR_HOLIDAYS.filter((h) => /Güemes|San Martín|Diversidad/.test(h.name));
    for (const h of moved) expect(new Date(`${h.date}T00:00:00Z`).getUTCDay()).toBe(1);
    expect(new Set(AR_HOLIDAYS.map((h) => h.date)).size).toBe(AR_HOLIDAYS.length);
  });
  it("trabajar los sábados cambia el cálculo", () => {
    const sat = calendarOf({ ...workshopSettings, closedWeekdays: [0] });
    expect(addWorkdays("2026-10-09", 1, sat)).toBe("2026-10-10");
  });
  it("grilla del mes de lunes a domingo y navegación", () => {
    const grid = monthGrid("2026-10-15");
    expect(grid[0]![0]).toBe("2026-09-28");
    expect(grid.at(-1)!.at(-1)).toBe("2026-11-01");
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(weekOf("2026-10-04")[0]).toBe("2026-09-28");
    expect(addMonths("2026-12-10", 1)).toBe("2027-01-01");
    expect(addMonths("2026-01-10", -1)).toBe("2025-12-01");
  });
});

describe("plazos y capacidad", () => {
  const admin = defaultAdminData();
  const settings = admin.workshop.settings;
  it("plazo por variante, por producto y de stock", () => {
    const vela = getProduct("vela-caniche")!;
    const placa = getProduct("placa-nfc")!;
    expect(lineLeadDays(vela, vela.variants[0], false)).toBe(1);
    expect(lineLeadDays(placa, placa.variants[0], true)).toBe(4);
    expect(lineLeadDays(placa, { ...placa.variants[0]!, leadDays: 6 }, true)).toBe(6);
    expect(orderLeadDays([{ id: "a", productSlug: "vela-caniche", variantId: "vc-vainilla", quantity: 1 }, { id: "b", productSlug: "velador-con-foto", variantId: "vcf-m", quantity: 1 }])).toBe(10);
  });
  it("los días completos y el feriado corren la próxima fecha disponible", () => {
    const load = loadByDay(admin.orders);
    expect(load.get("2026-10-08")).toBe(3);
    expect(load.get("2026-10-09")).toBe(3);
    // Placa NFC: 4 días hábiles desde el domingo 4 → jueves 8, completo; viernes 9, completo; lunes 12, feriado → martes 13
    const est = estimateForProduct(getProduct("placa-nfc")!, undefined, DEMO_TODAY, admin.orders, settings);
    expect(est).toMatchObject({ leadDays: 4, earliest: "2026-10-08", day: "2026-10-13", fullDays: ["2026-10-08", "2026-10-09"] });
    expect(estimateForProduct(getProduct("placa-nfc")!, undefined, DEMO_TODAY, admin.orders, { ...settings, dailyCapacity: 5 }).day).toBe("2026-10-08");
  });
  it("promesa de un pedido nuevo y ventanas de entrega", () => {
    const p = promiseFor([{ id: "a", productSlug: "vela-caniche", variantId: "vc-vainilla", quantity: 1 }], DEMO_TODAY, admin.orders, settings);
    expect(p.day).toBe("2026-10-05");
    const w = deliveryWindows("2026-10-09", settings);
    expect(w.find((x) => x.id === "pickup")).toMatchObject({ from: "2026-10-09", to: "2026-10-13" });
    expect(w.find((x) => x.id === "shipping")!.to).toBe("2026-10-21");
  });
  it("reprogramar: nunca a un día cerrado o pasado; avisa sobrecarga y plazo", () => {
    const order = admin.orders.find((o) => o.code === "VEL-000122")!;
    expect(checkReschedule(order, "2026-10-12", DEMO_TODAY, admin.orders, settings)).toMatchObject({ ok: false, error: expect.stringMatching(/Diversidad/) });
    expect(checkReschedule(order, "2026-10-01", DEMO_TODAY, admin.orders, settings).ok).toBe(false);
    const full = checkReschedule(order, "2026-10-08", DEMO_TODAY, admin.orders, settings);
    expect(full.ok).toBe(true);
    expect(full.warnings.join(" ")).toMatch(/sobrecargado/);
    expect(full.warnings.join(" ")).toMatch(/antes del plazo/);
    expect(checkReschedule(order, "2026-10-27", DEMO_TODAY, admin.orders, settings).warnings).toEqual([]);
  });
});

describe("costos, insumos, producción y recordatorios", () => {
  const admin = defaultAdminData();
  const { materials, recipes, settings, profiles } = admin.workshop;
  it("costo de receta en pesos enteros y precio sugerido", () => {
    const c = recipeCost(recipes["vela-caniche"]!, materials, settings);
    // 220 g cera × 12 + 15 ml × 55 + pabilo 120 + 0,05 plancha × 3200 = 2640 + 825 + 120 + 160
    expect(c.materials).toBe(3745);
    expect(c.machine).toBe(125);
    expect(c.hand).toBe(1875);
    expect(c.total).toBe(5745);
    expect(suggestedPrice(5745, 50)).toBe(11500);
    expect(marginPct(11900, 5745)).toBe(52);
    expect(marginPct(0, 10)).toBeNull();
  });
  it("tabla de márgenes con estados y precio desde", () => {
    const rows = costRows(admin.data.products, admin.data.categories, recipes, materials, settings);
    expect(rows.find((r) => r.slug === "guia-etiquetas-velas")!.state).toBe("missing");
    expect(rows.every((r) => r.state === "missing" || Number.isInteger(r.cost!.total))).toBe(true);
    const comedero = admin.data.products.find((p) => p.slug === "comedero-perro-globo")!;
    expect(basePriceFor(comedero, 20000)).toBe(20000);
  });
  it("insumos comprometidos por pedidos pagados y descuento al producir", () => {
    const need = committedNeeds(admin.orders, recipes);
    // VEL-000113: 12 velas souvenir × 90 g de cera
    expect(need.get("cera")).toBe(1080);
    const rows = materialRows(materials, admin.orders, recipes);
    const led = rows.find((m) => m.id === "led")!;
    expect(led.committed).toBe(1);
    expect(led.state).toBe("low");
    expect(reorderQty(led)).toBe(7);
    const order = admin.orders.find((o) => o.code === "VEL-000113")!;
    const after = consumeMaterials(materials, orderNeeds(order.lines, recipes));
    expect(after.find((m) => m.id === "cera")!.stock).toBe(5000 - 1080);
    expect(applyMaterialOp(materials, ["led"], { kind: "add", qty: 10 }).find((m) => m.id === "led")!.stock).toBe(14);
  });
  it("tablero de producción: solo hacia adelante, terminación puede volver a máquina", () => {
    expect(columnOf({ status: "PAID" })).toBe("queue");
    expect(columnOf({ status: "IN_PRODUCTION", stage: "finishing" })).toBe("finishing");
    expect(productionMove({ status: "PAID" }, "machine")).toEqual({ ok: true, status: "IN_PRODUCTION", stage: "machine" });
    expect(productionMove({ status: "IN_PRODUCTION", stage: "finishing" }, "machine")).toEqual({ ok: true, status: "IN_PRODUCTION", stage: "machine" });
    expect(productionMove({ status: "IN_PRODUCTION" }, "ready")).toEqual({ ok: true, status: "READY" });
    expect(productionMove({ status: "PAID" }, "ready").ok).toBe(false);
    expect(productionMove({ status: "READY" }, "finishing").ok).toBe(false);
    expect(productionMove({ status: "SHIPPED" }, "ready").ok).toBe(false);
    expect(nextColumn("finishing")).toBe("ready");
    expect(nextColumn("ready")).toBeNull();
  });
  it("recordatorios: cumpleaños de mascotas y recompra dentro de los próximos 30 días", () => {
    expect(nextOccurrence("10-09", DEMO_TODAY)).toBe("2026-10-09");
    expect(nextOccurrence("01-15", DEMO_TODAY)).toBe("2027-01-15");
    const list = customerReminders(customerRows(admin.users, admin.orders), profiles, admin.data.products, settings, DEMO_TODAY);
    expect(list[0]).toMatchObject({ kind: "pet-birthday", date: "2026-10-09", title: "Cumple de Ñoqui", inDays: 5 });
    expect(list.some((r) => r.kind === "repurchase" && r.title === "Recompra: Difusor de varillas Volta" && r.date === "2026-10-27")).toBe(true);
    expect(list.every((r) => r.inDays <= 30)).toBe(true);
    expect(list.some((r) => r.title === "Cumple de Kira")).toBe(false);
  });
  it("exporta las entregas a .ics de día completo", () => {
    const ics = toIcs([{ uid: "VEL-000121", day: "2026-10-08", title: "Entrega VEL-000121, Julián", description: "Colgador; 1 u.\nRetira" }], new Date("2026-10-04T12:00:00Z"));
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261008\r\nDTEND;VALUE=DATE:20261009");
    expect(ics).toContain("SUMMARY:Entrega VEL-000121\\, Julián");
    expect(ics).toContain("DESCRIPTION:Colgador\\; 1 u.\\nRetira");
    expect(ics).toContain("DTSTAMP:20261004T120000Z");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });
});

describe("casos de la revisión", () => {
  /** Store mínimo: las acciones reales del panel sobre un estado en memoria. */
  function harness() {
    let state: AdminData = defaultAdminData();
    const set = (fn: (s: AdminData) => Partial<AdminData>) => { state = { ...state, ...fn(state) }; };
    return { actions: createOrdersActions(set, () => state), get: () => state };
  }
  const stock = (s: AdminData, id: string) => s.workshop.materials.find((m) => m.id === id)!.stock;

  it("los insumos se descuentan una vez aunque el pedido pase por un reclamo, y conserva la etapa", () => {
    const h = harness();
    expect(h.actions.moveProduction("VEL-000113", "machine")).toBeNull();
    expect(stock(h.get(), "cera")).toBe(5000 - 1080);
    expect(h.actions.moveProduction("VEL-000113", "finishing")).toBeNull();
    expect(h.actions.transition("VEL-000113", "IN_CLAIM")).toBe(true);
    expect(h.actions.transition("VEL-000113", "IN_PRODUCTION")).toBe(true);
    const o = h.get().orders.find((x) => x.code === "VEL-000113")!;
    expect(o.stage).toBe("finishing");
    expect(stock(h.get(), "cera")).toBe(5000 - 1080);
  });
  it("no reprograma lo que ya salió del taller o se cerró", () => {
    const h = harness();
    expect(h.actions.rescheduleOrder("VEL-000118", "2026-10-13").ok).toBe(false);
    expect(h.actions.rescheduleOrder("VEL-000117", "2026-10-13").ok).toBe(false);
    expect(h.actions.rescheduleOrder("VEL-000122", "2026-10-27").ok).toBe(true);
    expect(h.get().orders.find((o) => o.code === "VEL-000122")!.promisedDate).toBe("2026-10-27");
  });
  it("precio sugerido exacto con cualquier margen entero", () => {
    expect(suggestedPrice(350, 30)).toBe(500);
    expect(suggestedPrice(450, 55)).toBe(1000);
    expect(suggestedPrice(200, 80)).toBe(1000);
    expect(suggestedPrice(100, 90)).toBe(1000);
  });
  it("un pedido listo no espera lugar del taller y las entregas cuentan desde hoy", () => {
    const { orders, workshop } = defaultAdminData();
    const ready = { code: "X", status: "READY" as const, promisedDate: "2026-10-02", lines: [] };
    expect(nextFreeDayFor(ready, DEMO_TODAY, orders, workshop.settings)).toBe("2026-10-05");
    expect(pendingDeliveries(orders, DEMO_TODAY, "2026-10-10")).toBe(8);
  });
});
