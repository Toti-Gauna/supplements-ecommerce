import { describe, expect, it } from "vitest";
import { defaultAdminData } from "@/demo/admin/defaults";
import { cadeteRoute, dispatchDays, leavesOn, otherDispatches, pickingList, routeText, zoneFor } from "@/demo/admin/dispatch";
import { afterSaleGroups, amountToCollect, collectGroups, collectQueue, packQueue, packStep } from "@/demo/admin/order-work";
import type { AdminOrder } from "@/demo/admin/types";
import { calendarOf } from "@/demo/engine/delivery";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";

/** R4b · Pedidos unificado: cobrar, armar, despachos y posventa con los datos de muestra (lunes 5/10/2026). */
const orders = () => defaultAdminData().orders;
const codes = (list: { code: string }[]) => list.map((o) => o.code.slice(-3));
const cal = () => calendarOf(defaultAdminData().workshop.settings);
const with_ = (code: string, patch: Partial<AdminOrder>) => orders().map((o) => (o.code.endsWith(code) ? { ...o, ...patch } : o));

describe("por cobrar", () => {
  it("separa comprobantes por revisar, sin pagar y resueltos; la fila arranca por los comprobantes", () => {
    const g = collectGroups(orders());
    expect(codes(g.review)).toEqual(["124", "123"]);
    expect(codes(g.waiting)).toEqual(["125", "126"]);
    expect(codes(g.done)).toEqual(["109", "121", "113", "120", "110", "115"]);
    expect(codes(collectQueue(g, "todo"))).toEqual(["124", "123", "125", "126"]);
    expect(collectQueue(g, "done")).toBe(g.done);
  });

  it("lo que falta cobrar suma pendientes y comprobantes en revisión, nunca lo pagado", () => {
    expect(amountToCollect(orders())).toBe(171_150);
    expect(amountToCollect(with_("124", { status: "PAID" }))).toBeLessThan(171_150);
  });

  it("un comprobante rechazado vuelve a sin pagar y sale de la revisión", () => {
    const g = collectGroups(with_("124", { status: "PENDING_PAYMENT", proof: { fileName: "x.jpg", receivedAt: "2026-10-03T11:20:00-03:00", status: "REJECTED", rejectReason: "No coincide" } }));
    expect(codes(g.review)).toEqual(["123"]);
    expect(codes(g.waiting)).toEqual(["124", "125", "126"]);
    expect(codes(g.done)[0]).toBe("124");
  });
});

describe("para armar en dos pasos", () => {
  it("pagados y en preparación, el que sale antes primero; paso 1 juntar y paso 2 controlar lote", () => {
    expect(codes(packQueue(orders()))).toEqual(["115", "114", "113", "121", "111", "110", "109", "122"]);
    expect(codes(packQueue(orders(), "juntar"))).toEqual(["114", "113", "111", "110", "109", "122"]);
    expect(codes(packQueue(orders(), "controlar"))).toEqual(["115", "121"]);
    expect(packStep({ status: "PAID" })).toBe(1);
    expect(packStep({ status: "IN_PRODUCTION", stage: "picking" })).toBe(1);
    expect(packStep({ status: "IN_PRODUCTION", stage: "lot-check" })).toBe(2);
    expect(packStep({ status: "READY" })).toBeNull();
    expect(packStep({ status: "PAYMENT_REVIEW" })).toBeNull();
  });
});

describe("despachos", () => {
  it("hoy y los próximos días hábiles con cuántos pedidos salen (lo atrasado suma a hoy)", () => {
    expect(dispatchDays(orders(), DEMO_TODAY, cal()).map((d) => [d.label, d.count])).toEqual([["Hoy", 3], ["Mañana", 0], ["mié 7 oct", 1], ["jue 8 oct", 3], ["vie 9 oct", 3]]);
    expect(leavesOn({ status: "IN_PRODUCTION", promisedDate: "2026-10-02" }, DEMO_TODAY, DEMO_TODAY)).toBe(true);
    expect(leavesOn({ status: "IN_PRODUCTION", promisedDate: "2026-10-02" }, "2026-10-06", DEMO_TODAY)).toBe(false);
    expect(leavesOn({ status: "SHIPPED", promisedDate: DEMO_TODAY }, DEMO_TODAY, DEMO_TODAY)).toBe(false);
  });

  it("la lista de armado suma cada variante de los pedidos pagados del día y marca lo que ya está junto", () => {
    const rows = pickingList(orders(), "2026-10-08", DEMO_TODAY);
    expect(rows.map((r) => [r.name, r.quantity, r.gathered, r.orders.map((o) => o.code.slice(-3))])).toEqual([
      ["Barra proteica 20 g", 2, 0, ["113"]], ["Colágeno hidrolizado + vitamina C", 1, 0, ["111"]], ["Creatina monohidrato micronizada", 1, 1, ["121"]],
    ]);
    expect(rows[0]!.lot).toMatch(/^VL-\d{4}-[A-Z] · vence \d{2}\/\d{4}$/);
    // Dos pedidos con la misma variante se suman en una fila.
    const twice = pickingList(with_("111", { lines: [{ id: "a", productSlug: "barra-proteica", variantId: "bp-mani-x12", quantity: 3 }] }), "2026-10-08", DEMO_TODAY);
    expect(twice.find((r) => r.variantId === "bp-mani-x12")!.quantity).toBe(5);
    // Lo que no está pagado no se junta.
    expect(pickingList(orders(), "2026-10-09", DEMO_TODAY).flatMap((r) => r.orders.map((o) => o.code.slice(-3)))).not.toContain("125");
  });

  it("la hoja de ruta ordena los envíos del cadete por zona y franja, con lo que hay que cobrar", () => {
    const today = cadeteRoute(orders(), DEMO_TODAY, DEMO_TODAY);
    expect(today.map((s) => [s.code.slice(-3), s.zone.id, s.state, s.toCollect, s.late])).toEqual([["115", "centro", "packing", 0, true], ["120", "playa-grande", "ready", 0, false]]);
    const friday = cadeteRoute(orders(), "2026-10-09", DEMO_TODAY);
    expect(friday.map((s) => [s.code.slice(-3), s.state])).toEqual([["125", "unpaid"], ["110", "packing"]]);
    expect(friday[0]!.toCollect).toBe(friday[0]!.total);
    expect(otherDispatches(orders(), DEMO_TODAY, DEMO_TODAY).map((o) => o.code.slice(-3))).toEqual(["124"]);
    const text = routeText(friday, "2026-10-09", DEMO_TODAY, "Tienda");
    expect(text.split("\n")[0]).toBe("Hoja de ruta de Tienda · vie 9 oct");
    expect(text).toContain("1. Centro (10 a 12 h) · Av. Colón 1500");
    expect(text).toMatch(/cobrar \$\s?\d/);
    expect(text).toContain("ya pagó");
  });

  it("ubica la dirección por su calle, con o sin tilde ni avenida", () => {
    expect(zoneFor("Av. Colón 1500, Mar del Plata (7600)").id).toBe("centro");
    expect(zoneFor("Güemes 2800").id).toBe("playa-grande");
    expect(zoneFor("jara 1450").id).toBe("sur");
    expect(zoneFor("Calle Falsa 123").id).toBe("otras");
    expect(zoneFor(undefined).id).toBe("otras");
  });
});

describe("posventa", () => {
  it("en camino, entregados en los últimos 30 días y en reclamo", () => {
    const g = afterSaleGroups(orders(), DEMO_TODAY);
    expect(codes(g.onTheWay)).toEqual(["119"]);
    expect(codes(g.delivered)).toEqual(["118", "108", "107", "106"]);
    expect(codes(g.inClaim)).toEqual(["116"]);
  });
});
