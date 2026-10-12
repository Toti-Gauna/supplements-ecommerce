import { beforeEach, describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createPurchasingActions } from "@/demo/admin/purchasing-slice";
import { variantMargins, variantSupplierCost } from "@/demo/admin/workshop/costs";
import { lotFor, NO_LOT_TEXT } from "@/demo/admin/workshop/lots";
import { checkLevel, checkSupplier, purchaseOrderFrom, receiveStock, supplierDraft, whatsappText } from "@/demo/admin/workshop/purchase-orders";
import { buyQty, deliveryDaysText, levelRows, nextDelivery, onOrderByKey, suggestedPurchases, type PurchaseOrder } from "@/demo/admin/workshop/purchasing";
import { getProduct } from "@/demo/engine/catalog";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEFAULT_STOCK_LEVEL } from "@/demo/fixtures/suppliers";
import type { Variant } from "@/demo/types";

/** Fase 7 · Operaciones: lote que sale, costo por presentación, compras sugeridas y pedidos a proveedores. */
beforeEach(() => setDemoData(defaultDemoData()));

describe("control de lote", () => {
  const whey = () => getProduct("ionic-whey")!;
  it("sale el lote de la variante que vence primero y tiene unidades (FEFO, como el catálogo)", () => {
    const first = whey().variants[0]!;
    const variant = { ...first, lots: [{ code: "L-3", expires: "2027-12", units: 4 }, { code: "L-1", expires: "2027-02", units: 0 }, { code: "L-2", expires: "2027-05", units: 2 }] } as Variant;
    expect(lotFor(whey(), variant)).toEqual({ code: "L-2", expires: "2027-05", text: "L-2 · vence 05/2027" });
    expect(lotFor(whey(), first).text).toMatch(/^VL-\S+ · vence \d{2}\/\d{4}$/);
  });
  it("sin lotes en la variante usa el lote del producto; sin ninguno, un texto para controlarlo a mano", () => {
    expect(lotFor(whey(), { ...whey().variants[0]!, lots: [] })).toEqual({ code: "VL-2609-W", expires: "2027-11", text: "VL-2609-W · vence 11/2027" });
    const shaker = getProduct("shaker-volta")!;
    expect(lotFor(shaker, shaker.variants[0])).toEqual({ code: null, expires: null, text: NO_LOT_TEXT });
  });
});

describe("costo por presentación", () => {
  const { recipes, materials } = defaultAdminData().workshop;
  it("usa el costo propio cargado o lo estima en proporción al precio", () => {
    const whey = getProduct("ionic-whey")!;
    const big = whey.variants.find((v) => v.id === "iw-chocolate-5lb")!;
    expect(variantSupplierCost(whey, whey.variants[0]!, recipes["ionic-whey"])).toEqual({ cost: 26400, estimated: false });
    expect(variantSupplierCost(whey, big, recipes["ionic-whey"])).toEqual({ cost: 52800, estimated: false });
    // El costo de la variante (lista del proveedor importada en Catálogo) manda sobre el cargado en Costos.
    expect(variantSupplierCost(whey, { ...big, cost: 49000 }, recipes["ionic-whey"])).toEqual({ cost: 49000, estimated: false });
    // Omega 3 x120 ($30.900) sin costo propio: 11.300 × 30.900 / 18.900
    const omega = getProduct("omega-3")!;
    expect(variantSupplierCost(omega, omega.variants[1]!, recipes["omega-3"])).toEqual({ cost: 18475, estimated: true });
    expect(variantSupplierCost(omega, omega.variants[1]!, undefined)).toBeNull();
    const rows = variantMargins(whey, recipes["ionic-whey"], materials, 35);
    expect(rows).toHaveLength(whey.variants.length);
    // 5 lb: $116.900 contra 52.800 + 794 de embalaje
    expect(rows.find((r) => r.variant.id === "iw-chocolate-5lb")).toMatchObject({ cost: 53594, margin: 54, state: "ok" });
  });
});

describe("compras sugeridas", () => {
  const admin = defaultAdminData();
  const { suppliers, stockLevels, recipes, settings } = admin.workshop;
  const products = admin.data.products;
  const rows = levelRows(products, suppliers, stockLevels, []);
  it("cada variante con su nivel (propio o el general), su proveedor por marca y su estado", () => {
    expect(rows.find((r) => r.key === "ionic-whey::iw-frutilla-5lb")).toMatchObject({ stock: 0, min: 2, target: 6, own: true, state: "below", supplier: { id: "lab-costa" } });
    expect(rows.find((r) => r.key === "isolate-zero::iz-chocolate-2lb")).toMatchObject({ stock: 9, ...DEFAULT_STOCK_LEVEL, own: false, state: "ok", supplier: { id: "atlantica" } });
    expect(rows.find((r) => r.key === "night-casein::nc-vainilla-2lb")).toMatchObject({ stock: 4, state: "below", supplier: { id: "sur" } });
  });
  it("agrupa por proveedor lo que está en el mínimo o debajo, hasta el objetivo, con el total al costo", () => {
    const groups = suggestedPurchases(rows, products, recipes);
    // Del pedido más grande al más chico.
    expect(groups.map((g) => g.supplier?.id)).toEqual(["lab-costa", "sur", "atlantica"]);
    expect(groups.map((g) => g.total)).toEqual([...groups.map((g) => g.total)].sort((a, b) => b - a));
    const lab = groups[0]!;
    expect(lab.lines.map((l) => [l.key, l.qty])).toEqual([
      ["ionic-whey::iw-frutilla-5lb", 6], ["ionic-whey::iw-cookies-cream-5lb", 4], ["creatina-gomitas::cg-naranja-90", 7],
      ["barra-proteica::bp-mani-x12", 7], ["electrolitos::ev-blue-razz-x10", 7],
    ]);
    expect(lab.total).toBe(lab.lines.reduce((s, l) => s + l.qty * l.unitCost!, 0));
    expect(lab.lines[0]).toMatchObject({ unitCost: 52800, stock: 0, target: 6 });
    expect(groups.every((g) => g.total === Math.round(g.total))).toBe(true);
    const sur = groups.find((g) => g.supplier?.id === "sur")!;
    // Sur pide un mínimo de $ 800.000 y la sugerencia no llega.
    expect(sur).toMatchObject({ underMinimum: true });
    expect(sur.total).toBeLessThan(sur.supplier!.minOrder);
  });
  it("lo pedido y sin recibir se descuenta; recibido ya no", () => {
    const order: PurchaseOrder = { id: "oc-1", supplierId: "lab-costa", createdAt: "2026-10-04T10:00:00Z", expectedOn: null, total: 0, status: "ordered",
      lines: [{ key: "ionic-whey::iw-frutilla-5lb", productSlug: "ionic-whey", variantId: "iw-frutilla-5lb", name: "x", qty: 4, unitCost: 52800 }] };
    expect(onOrderByKey([order]).get("ionic-whey::iw-frutilla-5lb")).toBe(4);
    expect(buyQty(levelRows(products, suppliers, stockLevels, [order]).find((r) => r.key === "ionic-whey::iw-frutilla-5lb")!)).toBe(2);
    expect(onOrderByKey([{ ...order, status: "received" }]).size).toBe(0);
  });
  it("próximo reparto del proveedor (saltea feriados) y días en palabras", () => {
    const atlantica = suppliers.find((s) => s.id === "atlantica")!;
    // Lunes y jueves: desde el domingo 4 → lunes 5; desde el viernes 9, el lunes 12 es feriado → jueves 15
    expect(nextDelivery(atlantica, DEMO_TODAY, settings.closures)).toBe("2026-10-05");
    expect(nextDelivery(atlantica, "2026-10-09", settings.closures)).toBe("2026-10-15");
    expect(nextDelivery({ ...atlantica, deliveryWeekdays: [] }, DEMO_TODAY, settings.closures)).toBeNull();
    expect(deliveryDaysText([4, 1])).toBe("lunes y jueves");
    expect(deliveryDaysText([3])).toBe("miércoles");
  });
  it("mensaje para WhatsApp, registro del pedido y mercadería recibida", () => {
    const [lab] = suggestedPurchases(rows, products, recipes);
    const text = whatsappText(lab!, "Volta Suplementos", "2026-10-06");
    expect(text.split("\n")[0]).toBe("Hola Paula, ¿cómo va? Te paso el pedido de Volta Suplementos:");
    expect(text).toContain("• 6 × Ionic Whey 100% · Frutilla · 5 lb (2,27 kg)");
    expect(text).toMatch(/Total estimado al costo: \$\s?[\d.]+\./);
    expect(text.endsWith("¿Lo podemos recibir el 6/10? ¡Gracias!")).toBe(true);
    const order = purchaseOrderFrom(lab!, "2026-10-04T10:00:00Z", "2026-10-06");
    expect(order).toMatchObject({ supplierId: "lab-costa", status: "ordered", total: lab!.total, expectedOn: "2026-10-06" });
    expect(order.lines[0]).not.toHaveProperty("stock");
    const after = receiveStock(products, order);
    expect(after.find((p) => p.slug === "ionic-whey")!.variants.find((v) => v.id === "iw-frutilla-5lb")!.stock).toBe(6);
    expect(after.find((p) => p.slug === "omega-3")).toBe(products.find((p) => p.slug === "omega-3"));
  });
  it("validaciones de niveles y proveedores", () => {
    expect(checkLevel({ min: 3, target: 8 })).toBeNull();
    expect(checkLevel({ min: 8, target: 3 })).toMatch(/objetivo/);
    expect(checkLevel({ min: -1, target: 3 })).toMatch(/enteros/);
    const d = supplierDraft(suppliers[0]!);
    expect(checkSupplier(d).value).toEqual({ contact: "Paula Ríos", phone: "223 555-0181", minOrder: 500000, deliveryWeekdays: [2, 4] });
    expect(checkSupplier({ ...d, minOrder: "" }).value?.minOrder).toBe(0);
    expect(checkSupplier({ ...d, days: [], phone: "abc", minOrder: "1.500,50" }).errors).toEqual({ days: expect.any(String), phone: expect.any(String), minOrder: expect.any(String) });
  });
});

describe("acciones de compras en el panel", () => {
  function harness() {
    let state: AdminData = defaultAdminData();
    const set = (fn: (s: AdminData) => Partial<AdminData>) => { state = { ...state, ...fn(state) }; };
    return { actions: createPurchasingActions(set), get: () => state };
  }
  const stock = (s: AdminData, slug: string, id: string) => s.data.products.find((p) => p.slug === slug)!.variants.find((v) => v.id === id)!.stock;
  it("marcar como pedido saca la sugerencia; recibir suma al stock una sola vez; anular la vuelve a sugerir", () => {
    const h = harness();
    const sugg = () => { const s = h.get(); return suggestedPurchases(levelRows(s.data.products, s.workshop.suppliers, s.workshop.stockLevels, s.workshop.purchases), s.data.products, s.workshop.recipes); };
    const lab = sugg().find((g) => g.supplier?.id === "lab-costa")!;
    h.actions.addPurchase(purchaseOrderFrom(lab, "2026-10-04T10:00:00Z", "2026-10-06"));
    expect(sugg().some((g) => g.supplier?.id === "lab-costa")).toBe(false);
    const id = h.get().workshop.purchases[0]!.id;
    expect(h.actions.receivePurchase(id)).toBe(true);
    expect(stock(h.get(), "ionic-whey", "iw-frutilla-5lb")).toBe(6);
    expect(h.actions.receivePurchase(id)).toBe(false);
    expect(stock(h.get(), "ionic-whey", "iw-frutilla-5lb")).toBe(6);
    const sur = sugg().find((g) => g.supplier?.id === "sur")!;
    h.actions.addPurchase(purchaseOrderFrom(sur, "2026-10-04T11:00:00Z", null));
    h.actions.cancelPurchase(h.get().workshop.purchases[0]!.id);
    expect(sugg().some((g) => g.supplier?.id === "sur")).toBe(true);
  });
  it("guardar un nivel válido cambia la sugerencia; uno inválido no se guarda", () => {
    const h = harness();
    expect(h.actions.saveStockLevel("isolate-zero::iz-chocolate-2lb", { min: 9, target: 12 })).toBeNull();
    expect(h.get().workshop.stockLevels["isolate-zero::iz-chocolate-2lb"]).toEqual({ min: 9, target: 12 });
    expect(h.actions.saveStockLevel("isolate-zero::iz-chocolate-2lb", { min: 9, target: 2 })).toMatch(/objetivo/);
    expect(h.get().workshop.stockLevels["isolate-zero::iz-chocolate-2lb"]).toEqual({ min: 9, target: 12 });
  });
});
