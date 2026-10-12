import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createOrdersActions } from "@/demo/admin/orders-slice";
import { costRows, marginPct, recipeCost, suggestedPrice, basePriceFor } from "@/demo/admin/workshop/costs";
import { toIcs } from "@/demo/admin/workshop/ics";
import { applyMaterialOp, committedNeeds, consumeMaterials, materialRows, orderNeeds, reorderQty } from "@/demo/admin/workshop/materials";
import { columnOf, nextColumn, prepMove } from "@/demo/admin/workshop/preparation";
import { calendarOf, deliveryWindows, estimateForProduct, lineLeadDays, loadByDay, nextFreeDayFor, orderLeadDays, pendingDeliveries, promiseFor } from "@/demo/engine/delivery";
import { checkReschedule } from "@/demo/engine/reschedule";
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
    expect(closureFor("2026-10-10", cal)?.reason).toBe("Sábado sin despachos");
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
  it("los días con el cadete completo y el feriado corren la próxima fecha del cadete; retiro y correo no tienen cupo", () => {
    const load = loadByDay(admin.orders);
    // Solo cuentan los pedidos con cadete: el 8 (VOL-000121 y 111) y el 9 (VOL-000125 y 110); el retiro de VOL-000113 no.
    expect(load.get("2026-10-08")).toBe(2);
    expect(load.get("2026-10-09")).toBe(2);
    expect(load.get("2026-10-07")).toBeUndefined();
    // Encargo al proveedor de 4 días hábiles desde el lunes 5 → viernes 9, completo; lunes 12, feriado → martes 13
    const whey = { ...getProduct("ionic-whey")!, madeToOrderDays: 4 };
    const onOrder = { ...whey.variants[0]!, stock: -1 };
    const est = estimateForProduct(whey, onOrder, DEMO_TODAY, admin.orders, settings);
    expect(est).toMatchObject({ leadDays: 4, earliest: "2026-10-09", day: "2026-10-13", fullDays: ["2026-10-09"] });
    expect(estimateForProduct(whey, onOrder, DEMO_TODAY, admin.orders, { ...settings, dailyCapacity: 5 }).day).toBe("2026-10-09");
    // Lo que está en stock sale al día hábil siguiente
    expect(estimateForProduct(whey, whey.variants[0], DEMO_TODAY, admin.orders, settings)).toMatchObject({ leadDays: 1, day: "2026-10-06" });
  });
  it("promesa de un pedido nuevo según cómo sale, y ventanas de entrega", () => {
    expect(promiseFor([wheyLine], DEMO_TODAY, admin.orders, settings, { fulfillment: "LOCAL_DELIVERY" }).day).toBe("2026-10-06");
    // Un encargo de 4 días: con cadete pasa al 13 (9 completo, 12 feriado); por correo o retiro sale el 9.
    const slow = [bananaLine];
    const data = defaultDemoData();
    setDemoData({ ...data, products: data.products.map((p) => (p.slug === "mass-gainer" ? { ...p, madeToOrderDays: 4, variants: p.variants.map((v) => (v.id === "mg-banana-3kg" ? { ...v, stock: -1 } : v)) } : p)) });
    expect(promiseFor(slow, DEMO_TODAY, admin.orders, settings, { fulfillment: "LOCAL_DELIVERY" })).toMatchObject({ earliest: "2026-10-09", day: "2026-10-13" });
    expect(promiseFor(slow, DEMO_TODAY, admin.orders, settings, { fulfillment: "SHIPPING" })).toMatchObject({ day: "2026-10-09", fullDays: [] });
    const w = deliveryWindows("2026-10-09", settings, "2026-10-13");
    expect(w.find((x) => x.id === "pickup")).toMatchObject({ from: "2026-10-09", to: "2026-10-13" });
    expect(w.find((x) => x.id === "local")).toMatchObject({ from: "2026-10-13", to: "2026-10-13" });
    expect(w.find((x) => x.id === "shipping")!.to).toBe("2026-10-21");
  });
  it("reprogramar: nunca a un día cerrado o pasado; avisa sobrecarga del cadete y plazo", () => {
    withMadeToOrderBanana();
    // VOL-000122 con cadete y un Mass Gainer banana encargado al proveedor (10 días hábiles)
    const order = { ...admin.orders.find((o) => o.code === "VOL-000122")!, fulfillment: "LOCAL_DELIVERY" as const, lines: [bananaLine] };
    expect(checkReschedule(order, "2026-10-12", DEMO_TODAY, admin.orders, settings)).toMatchObject({ ok: false, error: expect.stringMatching(/Diversidad/) });
    expect(checkReschedule(order, "2026-10-01", DEMO_TODAY, admin.orders, settings).ok).toBe(false);
    const full = checkReschedule(order, "2026-10-08", DEMO_TODAY, admin.orders, settings);
    expect(full.ok).toBe(true);
    expect(full.warnings.join(" ")).toMatch(/sobrecargado/);
    expect(full.warnings.join(" ")).toMatch(/antes del plazo/);
    expect(checkReschedule(order, "2026-10-27", DEMO_TODAY, admin.orders, settings).warnings).toEqual([]);
  });
});

describe("costos, insumos, preparación y recordatorios", () => {
  const admin = defaultAdminData();
  const { materials, recipes, settings } = admin.workshop;
  it("costo en pesos enteros (proveedor + embalaje, sin horas de taller) y precio sugerido", () => {
    const c = recipeCost(recipes["ionic-whey"]!, materials);
    // Proveedor 26.400 + embalaje (caja chica 650 + folleto 90 + precinto 40 + 1,2 m de cinta × 12 = 14)
    expect(c.merchandise).toBe(26400);
    expect(c.materials).toBe(794);
    expect(c.total).toBe(27194);
    expect(suggestedPrice(27194, 35)).toBe(41900);
    expect(marginPct(54900, 27194)).toBe(50);
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
  it("preparación: solo hacia adelante, de Control de lote se vuelve a Armando y a Listo solo con los lotes", () => {
    const lines = [wheyLine];
    expect(columnOf({ status: "PAID" })).toBe("queue");
    expect(columnOf({ status: "IN_PRODUCTION" })).toBe("picking");
    expect(columnOf({ status: "IN_PRODUCTION", stage: "lot-check" })).toBe("lot-check");
    expect(prepMove({ status: "PAID" }, "picking")).toEqual({ ok: true, status: "IN_PRODUCTION", stage: "picking" });
    expect(prepMove({ status: "IN_PRODUCTION", stage: "lot-check" }, "picking")).toEqual({ ok: true, status: "IN_PRODUCTION", stage: "picking" });
    expect(prepMove({ status: "IN_PRODUCTION", stage: "lot-check", lines }, "ready")).toMatchObject({ ok: false, lots: true });
    expect(prepMove({ status: "IN_PRODUCTION", stage: "lot-check", lines, lotCheck: { a: "VL-2609-W" } }, "ready")).toEqual({ ok: true, status: "READY" });
    expect(prepMove({ status: "IN_PRODUCTION", lines, lotCheck: { a: "VL-2609-W" } }, "ready").ok).toBe(false);
    expect(prepMove({ status: "PAID" }, "ready").ok).toBe(false);
    expect(prepMove({ status: "READY" }, "lot-check").ok).toBe(false);
    expect(prepMove({ status: "SHIPPED" }, "ready").ok).toBe(false);
    expect(nextColumn("lot-check")).toBe("ready");
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

  it("el embalaje se descuenta una vez aunque el pedido pase por un reclamo, y conserva la etapa", () => {
    const h = harness();
    expect(h.actions.movePreparation("VOL-000113", "picking")).toBeNull();
    expect(stock(h.get(), "bolsa")).toBe(120 - 2);
    expect(h.actions.movePreparation("VOL-000113", "lot-check")).toBeNull();
    expect(h.actions.transition("VOL-000113", "IN_CLAIM")).toBe(true);
    expect(h.actions.transition("VOL-000113", "IN_PRODUCTION")).toBe(true);
    const o = h.get().orders.find((x) => x.code === "VOL-000113")!;
    expect(o.stage).toBe("lot-check");
    expect(stock(h.get(), "bolsa")).toBe(120 - 2);
  });
  it("no reprograma lo que ya salió o se cerró", () => {
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
  it("un pedido listo solo espera un día hábil y los despachos cuentan desde hoy", () => {
    const { orders, workshop } = defaultAdminData();
    const ready = { code: "X", status: "READY" as const, fulfillment: "PICKUP" as const, promisedDate: "2026-10-02", lines: [] };
    expect(nextFreeDayFor(ready, DEMO_TODAY, orders, workshop.settings)).toBe("2026-10-06");
    // Del lunes 5 al sábado 10: incluye a VOL-000120 (listo, sale hoy con el cadete) y el retiro de VOL-000124.
    expect(pendingDeliveries(orders, DEMO_TODAY, "2026-10-10")).toBe(9);
  });
});
