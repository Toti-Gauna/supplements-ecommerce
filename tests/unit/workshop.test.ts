import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createOrdersActions } from "@/demo/admin/orders-slice";
import { costRows, marginPct, recipeCost, suggestedPrice, basePriceFor } from "@/demo/admin/workshop/costs";
import { toIcs } from "@/demo/admin/workshop/ics";
import { applyMaterialOp, committedNeeds, consumeMaterials, materialRows, orderNeeds, reorderQty } from "@/demo/admin/workshop/materials";
import { columnOf, nextColumn, productionMove } from "@/demo/admin/workshop/production";
import { calendarOf, checkReschedule, deliveryWindows, estimateForProduct, lineLeadDays, loadByDay, nextFreeDayFor, orderLeadDays, pendingDeliveries, promiseFor } from "@/demo/engine/delivery";
import { getProduct } from "@/demo/engine/catalog";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { addMonths, addWorkdays, closureFor, isWorkday, monthGrid, nextWorkday, prevWorkday, weekOf, workdaysBetween } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { AR_HOLIDAYS, workshopSettings } from "@/demo/fixtures/workshop";

beforeEach(() => setDemoData(defaultDemoData()));
const cal = calendarOf(workshopSettings);

/** Ningún producto del catálogo es a pedido: el Mass Gainer banana (sin stock) pasa a encargarse al proveedor, con 10 días hábiles. */
function withMadeToOrderBanana() {
  const data = defaultDemoData();
  setDemoData({ ...data, products: data.products.map((p) => (p.slug === "mass-gainer" ? { ...p, madeToOrderDays: 10, variants: p.variants.map((v) => (v.id === "mg-banana-3kg" ? { ...v, stock: -1 } : v)) } : p)) });
}
const wheyLine = { id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 };
const bananaLine = { id: "b", productSlug: "mass-gainer", variantId: "mg-banana-3kg", quantity: 1 };

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
    const whey = getProduct("ionic-whey")!;
    const onOrder = { ...whey.variants[0]!, stock: -1 };
    expect(lineLeadDays(whey, whey.variants[0])).toBe(1);
    expect(lineLeadDays(whey, onOrder)).toBe(3);
    expect(lineLeadDays({ ...whey, madeToOrderDays: 4 }, onOrder)).toBe(4);
    expect(lineLeadDays({ ...whey, madeToOrderDays: 4 }, whey.variants[0])).toBe(1);
    expect(lineLeadDays(whey, { ...onOrder, leadDays: 6 })).toBe(6);
    withMadeToOrderBanana();
    expect(orderLeadDays([wheyLine, bananaLine])).toBe(10);
  });
  it("los días completos y el feriado corren la próxima fecha disponible", () => {
    const load = loadByDay(admin.orders);
    expect(load.get("2026-10-08")).toBe(3);
    expect(load.get("2026-10-09")).toBe(3);
    // Encargo al proveedor de 4 días hábiles desde el domingo 4 → jueves 8, completo; viernes 9, completo; lunes 12, feriado → martes 13
    const whey = { ...getProduct("ionic-whey")!, madeToOrderDays: 4 };
    const onOrder = { ...whey.variants[0]!, stock: -1 };
    const est = estimateForProduct(whey, onOrder, DEMO_TODAY, admin.orders, settings);
    expect(est).toMatchObject({ leadDays: 4, earliest: "2026-10-08", day: "2026-10-13", fullDays: ["2026-10-08", "2026-10-09"] });
    expect(estimateForProduct(whey, onOrder, DEMO_TODAY, admin.orders, { ...settings, dailyCapacity: 5 }).day).toBe("2026-10-08");
    // Lo que está en stock sale al día hábil siguiente
    expect(estimateForProduct(whey, whey.variants[0], DEMO_TODAY, admin.orders, settings)).toMatchObject({ leadDays: 1, day: "2026-10-05" });
  });
  it("promesa de un pedido nuevo y ventanas de entrega", () => {
    const p = promiseFor([wheyLine], DEMO_TODAY, admin.orders, settings);
    expect(p.day).toBe("2026-10-05");
    const w = deliveryWindows("2026-10-09", settings);
    expect(w.find((x) => x.id === "pickup")).toMatchObject({ from: "2026-10-09", to: "2026-10-13" });
    expect(w.find((x) => x.id === "shipping")!.to).toBe("2026-10-21");
  });
  it("reprogramar: nunca a un día cerrado o pasado; avisa sobrecarga y plazo", () => {
    withMadeToOrderBanana();
    // VOL-000122 con un Mass Gainer banana encargado al proveedor (10 días hábiles)
    const order = { ...admin.orders.find((o) => o.code === "VOL-000122")!, lines: [bananaLine] };
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
  const { materials, recipes, settings } = admin.workshop;
  it("costo de receta en pesos enteros y precio sugerido", () => {
    const c = recipeCost(recipes["ionic-whey"]!, materials, settings);
    // Proveedor 26.400 + embalaje (caja chica 650 + folleto 90 + precinto 40 + 1,2 m de cinta × 12 = 14) + 6 min de armado a $4.500 la hora
    expect(c.merchandise).toBe(26400);
    expect(c.materials).toBe(794);
    expect(c.machine).toBe(0);
    expect(c.hand).toBe(450);
    expect(c.total).toBe(27644);
    expect(suggestedPrice(27644, 35)).toBe(42600);
    expect(marginPct(54900, 27644)).toBe(50);
    expect(marginPct(0, 10)).toBeNull();
  });
  it("tabla de márgenes con estados y precio desde", () => {
    // Un producto recién creado en el panel todavía no tiene costo cargado
    const fresh = { ...admin.data.products[0]!, slug: "producto-nuevo" };
    const rows = costRows([...admin.data.products, fresh], admin.data.categories, recipes, materials, settings);
    expect(rows.filter((r) => r.state === "missing").map((r) => r.slug)).toEqual(["producto-nuevo"]);
    expect(rows.every((r) => r.state === "missing" || Number.isInteger(r.cost!.total))).toBe(true);
    // "Desde": el precio más bajo entre las variantes (Ionic Whey 2 lb, $54.900)
    expect(rows.find((r) => r.slug === "ionic-whey")).toMatchObject({ price: 54900, margin: 50, state: "ok" });
    const whey = admin.data.products.find((p) => p.slug === "ionic-whey")!;
    expect(basePriceFor(whey, 50000)).toBe(50000);
  });
  it("insumos comprometidos por pedidos pagados y descuento al producir", () => {
    const need = committedNeeds(admin.orders, recipes);
    // Pagados: VOL-000122 (Isolate) y VOL-000111 (colágeno) van en caja chica; VOL-000113 (2 cajas de barras) y VOL-000109 (alfajores), en bolsa
    expect(need.get("caja-chica")).toBe(2);
    expect(need.get("bolsa")).toBe(3);
    expect(need.get("folleto")).toBe(5);
    const rows = materialRows(materials, admin.orders, recipes);
    expect(rows.find((m) => m.id === "caja-chica")).toMatchObject({ committed: 2, available: 78, state: "ok" });
    const sachet = rows.find((m) => m.id === "sachet-muestra")!;
    expect(sachet.committed).toBe(0);
    expect(sachet.state).toBe("low");
    expect(reorderQty(sachet)).toBe(34);
    const order = admin.orders.find((o) => o.code === "VOL-000113")!;
    const after = consumeMaterials(materials, orderNeeds(order.lines, recipes));
    expect(after.find((m) => m.id === "bolsa")!.stock).toBe(120 - 2);
    expect(applyMaterialOp(materials, ["sachet-muestra"], { kind: "add", qty: 10 }).find((m) => m.id === "sachet-muestra")!.stock).toBe(36);
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
  it("exporta las entregas a .ics de día completo", () => {
    const ics = toIcs([{ uid: "VOL-000121", day: "2026-10-08", title: "Entrega VOL-000121, Julián", description: "Colgador; 1 u.\nRetira" }], new Date("2026-10-04T12:00:00Z"));
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261008\r\nDTEND;VALUE=DATE:20261009");
    expect(ics).toContain("SUMMARY:Entrega VOL-000121\\, Julián");
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
    expect(h.actions.moveProduction("VOL-000113", "machine")).toBeNull();
    expect(stock(h.get(), "bolsa")).toBe(120 - 2);
    expect(h.actions.moveProduction("VOL-000113", "finishing")).toBeNull();
    expect(h.actions.transition("VOL-000113", "IN_CLAIM")).toBe(true);
    expect(h.actions.transition("VOL-000113", "IN_PRODUCTION")).toBe(true);
    const o = h.get().orders.find((x) => x.code === "VOL-000113")!;
    expect(o.stage).toBe("finishing");
    expect(stock(h.get(), "bolsa")).toBe(120 - 2);
  });
  it("no reprograma lo que ya salió del taller o se cerró", () => {
    const h = harness();
    expect(h.actions.rescheduleOrder("VOL-000118", "2026-10-13").ok).toBe(false);
    expect(h.actions.rescheduleOrder("VOL-000117", "2026-10-13").ok).toBe(false);
    expect(h.actions.rescheduleOrder("VOL-000122", "2026-10-27").ok).toBe(true);
    expect(h.get().orders.find((o) => o.code === "VOL-000122")!.promisedDate).toBe("2026-10-27");
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
