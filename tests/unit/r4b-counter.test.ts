import { describe, expect, it } from "vitest";
import { fefoTake, lineKey, potFor, searchPots, type CounterLine } from "@/demo/engine/counter";
import { addLine, buildTicket, setLineQty } from "@/demo/engine/counter-ticket";
import { registerSale } from "@/demo/engine/counter-sale";
import { DEFAULT_COUNTER_PLANS } from "@/demo/fixtures/counter";
import { defaultDemoData } from "@/demo/engine/source";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { stackDiscount } from "@/demo/engine/stack";
import type { Product } from "@/demo/types";

/** R4b · Modo mostrador: potes con el lote que sale (FEFO), ticket con el descuento stack y venta que descuenta stock. */
const TODAY = "2026-10-05";
const data = defaultDemoData();
const { products, categories } = data;
const product = (slug: string) => products.find((p) => p.slug === slug)!;
const variant = (slug: string, id: string) => product(slug).variants.find((v) => v.id === id)!;
const line = (productSlug: string, variantId: string, qty = 1): CounterLine => ({ productSlug, variantId, qty });
const sale = (lines: CounterLine[], list: readonly Product[] = products) =>
  registerSale({ products: list, lines, rule: DEFAULT_STACK_RULE, pay: { method: "DEBIT" }, plans: DEFAULT_COUNTER_PLANS, sales: [], day: TODAY, at: `${TODAY}T10:00:00-03:00` });

describe("FEFO: sale primero el lote que vence primero", () => {
  it("toma del lote más próximo a vencer y después del siguiente", () => {
    const v = variant("ionic-whey", "iw-vainilla-2lb"); // VL-2603-W (11/2026) ×5 y VL-2609-W (11/2027) ×13
    expect(fefoTake(v, 3)).toEqual([{ code: "VL-2603-W", expires: "2026-11", units: 3 }]);
    expect(fefoTake(v, 7)).toEqual([{ code: "VL-2603-W", expires: "2026-11", units: 5 }, { code: "VL-2609-W", expires: "2027-11", units: 2 }]);
    // Lo que ya está en el ticket se saltea: el sexto pote ya sale del lote nuevo.
    expect(fefoTake(v, 1, 5)).toEqual([{ code: "VL-2609-W", expires: "2027-11", units: 1 }]);
  });

  it("el pote dice qué lote sale, cuánto le falta para vencer y lo que queda descontando el ticket", () => {
    const p = product("ionic-whey");
    const pot = potFor(p, variant("ionic-whey", "iw-vainilla-2lb"), categories, { today: TODAY });
    expect(pot).toMatchObject({ price: 54900, left: 18, state: "ok", gear: false, nextLot: { code: "VL-2603-W", soon: true } });
    expect(pot.nextLot!.days).toBe(56);
    const withTicket = potFor(p, variant("ionic-whey", "iw-vainilla-2lb"), categories, { today: TODAY, lines: [line("ionic-whey", "iw-vainilla-2lb", 16)] });
    expect(withTicket).toMatchObject({ left: 2, state: "low", nextLot: { code: "VL-2609-W", soon: false } });
    expect(potFor(p, variant("ionic-whey", "iw-frutilla-5lb"), categories, { today: TODAY })).toMatchObject({ left: 0, state: "out", nextLot: null });
  });

  it("el equipamiento no tiene lote y un lote liquidado cobra su precio de liquidación", () => {
    const gear = potFor(product("guantes-boxeo"), variant("guantes-boxeo", "gb-rojo-10oz"), categories, { today: TODAY });
    expect(gear).toMatchObject({ gear: true, nextLot: null });
    const p = structuredClone(product("barra-proteica"));
    p.variants.find((v) => v.id === "bp-mani-x12")!.lots![0]!.clearancePct = 30;
    const pot = potFor(p, p.variants.find((v) => v.id === "bp-mani-x12")!, categories, { today: TODAY });
    expect(pot).toMatchObject({ listPrice: 29000, price: 20300, clearancePct: 30 });
  });
});

describe("buscador del mostrador", () => {
  it("usa el buscador de la tienda y un sabor deja solo esos potes", () => {
    const pots = searchPots("whey chocolate", products, categories, { today: TODAY });
    expect(pots.length).toBeGreaterThan(0);
    expect(pots.every((p) => /chocolate/i.test(p.variantLabel))).toBe(true);
    expect(pots[0]!.productSlug).toBe("ionic-whey");
  });

  it("tolera errores leves y, sin texto, muestra lo que más sale con stock", () => {
    expect(searchPots("creatna", products, categories, { today: TODAY }).some((p) => p.productSlug === "creatina-monohidrato")).toBe(true);
    const best = searchPots("", products, categories, { today: TODAY, limit: 8 });
    expect(best).toHaveLength(8);
    expect(best.every((p) => p.state !== "out")).toBe(true);
  });

  it("los productos pausados no aparecen", () => {
    const paused = products.map((p) => (p.slug === "ionic-whey" ? { ...p, active: false } : p));
    expect(searchPots("whey", paused, categories, { today: TODAY }).some((p) => p.productSlug === "ionic-whey")).toBe(false);
  });
});

describe("ticket con el descuento stack", () => {
  const stackLines = [line("ionic-whey", "iw-chocolate-2lb"), line("creatina-monohidrato", "cm-sin-sabor-300"), line("overvolt-pre", "ov-limon-300")];

  it("tres categorías de suplementos: 10 % con la misma regla de la tienda", () => {
    const t = buildTicket(stackLines, products);
    expect(t.subtotal).toBe(54900 + 29900 + 36900);
    expect(t.stack.discount).toBe(12170);
    expect(t.stack.discount).toBe(stackDiscount(t.rows.map((r) => ({ product: { slug: r.line.productSlug, categorySlug: r.categorySlug }, lineTotal: r.total })), DEFAULT_STACK_RULE).discount);
    expect(t.total).toBe(109530);
    expect(t.units).toBe(3);
  });

  it("dos categorías no tienen descuento y el equipamiento no suma al stack", () => {
    const t = buildTicket([line("ionic-whey", "iw-chocolate-2lb"), line("creatina-monohidrato", "cm-sin-sabor-300"), line("guantes-boxeo", "gb-rojo-10oz")], products);
    expect(t.stack).toMatchObject({ discount: 0, missing: 1 });
    expect(t.total).toBe(54900 + 29900 + 59900);
  });

  it("la regla editada en el panel cambia el descuento", () => {
    expect(buildTicket(stackLines, products, { pct: 15, minCategories: 2 }).stack.discount).toBe(18255);
  });

  it("sumar, cambiar y sacar líneas", () => {
    let lines = addLine([], "ionic-whey", "iw-chocolate-2lb");
    lines = addLine(lines, "ionic-whey", "iw-chocolate-2lb", 2);
    expect(lines).toEqual([line("ionic-whey", "iw-chocolate-2lb", 3)]);
    const key = lineKey("ionic-whey", "iw-chocolate-2lb");
    expect(setLineQty(lines, key, 5)[0]!.qty).toBe(5);
    expect(setLineQty(lines, key, 0)).toEqual([]);
  });

  it("pedir más de lo que hay queda marcado en la línea", () => {
    const t = buildTicket([line("ionic-whey", "iw-cookies-cream-5lb", 3)], products);
    expect(t.rows[0]!.short).toBe(1);
  });
});

describe("venta registrada (simulada)", () => {
  it("descuenta cada pote del lote que vence primero y guarda los lotes en la venta", () => {
    const r = sale([line("ionic-whey", "iw-vainilla-2lb", 6), line("guantes-boxeo", "gb-rojo-10oz")]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const after = r.products.find((p) => p.slug === "ionic-whey")!.variants.find((v) => v.id === "iw-vainilla-2lb")!;
    expect(after.stock).toBe(12);
    expect(after.lots).toEqual([expect.objectContaining({ code: "VL-2609-W", expires: "2027-11", units: 12 })]);
    expect(r.sale.lines[0]!.lots).toEqual([{ code: "VL-2603-W", expires: "2026-11", units: 5 }, { code: "VL-2609-W", expires: "2027-11", units: 1 }]);
    expect(r.products.find((p) => p.slug === "guantes-boxeo")!.variants[0]!.stock).toBe(3);
    expect(r.sale).toMatchObject({ number: "0001", day: TODAY, total: 6 * 54900 + 59900, method: "DEBIT" });
    // El catálogo de entrada no se toca.
    expect(variant("ionic-whey", "iw-vainilla-2lb").stock).toBe(18);
  });

  it("no vende más de lo que hay ni un ticket vacío", () => {
    expect(sale([line("ionic-whey", "iw-cookies-cream-5lb", 3)])).toEqual({ ok: false, error: "De Ionic Whey 100% (Cookies & cream · 5 lb (2,27 kg)) quedan 2: bajá la cantidad del ticket." });
    expect(sale([])).toEqual({ ok: false, error: "El ticket está vacío." });
  });
});
