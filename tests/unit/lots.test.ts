import { describe, expect, it } from "vitest";
import { expiringLots, hasExpiring, invalidLots, lotState, setClearance, setVariantLots, withoutEmptyLots, withStock } from "@/demo/admin/lots";
import { applyStockOp, stockRows } from "@/demo/admin/stock";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { variantLots } from "@/demo/fixtures/lots";
import { listPrice, unitPrice } from "@/demo/engine/catalog";
import { clearancePrice, daysToExpiry, expiryDate, fefo, firstOutLot, formatExpiry, variantClearance } from "@/demo/engine/lots";
import { defaultDemoData } from "@/demo/engine/source";
import type { Lot, Product, Variant } from "@/demo/types";

const products = () => defaultDemoData().products;
const find = (list: Product[], slug: string, id: string) => { const p = list.find((x) => x.slug === slug)!; return { p, v: p.variants.find((x) => x.id === id)! }; };
const lot = (code: string, expires: string, units: number, clearancePct?: number): Lot => ({ code, expires, units, ...(clearancePct ? { clearancePct } : {}) });
const variant = (lots: Lot[]): Variant => ({ id: "v", label: "V", priceDelta: 0, stock: lots.reduce((s, l) => s + l.units, 0), lots });

describe("vencimientos y FEFO (engine)", () => {
  it("el envase vence el último día del mes impreso", () => {
    expect(expiryDate("2026-11")).toBe("2026-11-30");
    expect(expiryDate("2028-02")).toBe("2028-02-29");
    expect(formatExpiry("2026-11")).toBe("11/2026");
  });
  it("días hasta el vencimiento contra la fecha de la demo", () => {
    expect(daysToExpiry("2026-11", DEMO_TODAY)).toBe(57);
    expect(daysToExpiry("2026-12", DEMO_TODAY)).toBe(88);
    expect(daysToExpiry("2026-09", DEMO_TODAY)).toBeLessThan(0);
  });
  it("sale primero el que vence primero y tiene unidades", () => {
    const v = variant([lot("B", "2027-11", 4), lot("A", "2026-11", 0), lot("C", "2027-01", 2)]);
    expect(fefo(v.lots!).map((l) => l.code)).toEqual(["A", "C", "B"]);
    expect(firstOutLot(v)?.code).toBe("C");
    expect(firstOutLot({ ...v, lots: undefined })).toBeUndefined();
  });
  it("precio de liquidación redondeado a $100, nunca más que la lista", () => {
    expect(clearancePrice(54900, 30)).toBe(38400);
    expect(clearancePrice(2900, 25)).toBe(2200);
    expect(clearancePrice(150, 70)).toBe(100);
  });
});

describe("lotes de muestra", () => {
  it("el stock de cada variante con lotes es la suma de sus lotes", () => {
    for (const p of products()) for (const v of p.variants) if (v.lots) expect(v.stock, v.id).toBe(v.lots.reduce((s, l) => s + l.units, 0));
    const ids = new Set(products().flatMap((p) => p.variants.map((v) => v.id)));
    for (const id of Object.keys(variantLots)) expect(ids.has(id), id).toBe(true);
  });
  it("algunos lotes vencen en menos de 60 días; el de 12/2026 queda afuera; accesorios sin lote", () => {
    const soon = expiringLots(products(), DEMO_TODAY);
    expect(soon.length).toBeGreaterThanOrEqual(5);
    expect(soon[0]!.days).toBeLessThanOrEqual(soon.at(-1)!.days);
    expect(soon.every((r) => r.days >= 0 && r.days < 60)).toBe(true);
    expect(soon.some((r) => r.lot.code === "KR-2601-K")).toBe(false);
    expect(find(products(), "shaker-volta", "sh-voltio").v.lots).toBeUndefined();
    const { v } = find(products(), "ionic-whey", "iw-vainilla-2lb");
    expect(firstOutLot(v)?.code).toBe("VL-2603-W");
    expect(hasExpiring(v, DEMO_TODAY)).toBe(true);
    expect(lotState(lot("x", "2026-09", 1), DEMO_TODAY)).toBe("expired");
  });
  it("las filas de stock traen marca, lote que sale primero y lotes por vencer", () => {
    const row = stockRows(products(), defaultDemoData().categories).find((r) => r.variantId === "iw-vainilla-2lb")!;
    expect(row).toMatchObject({ brand: "VOLTA Lab", lots: 2, onClearance: false });
    expect(row.lot?.code).toBe("VL-2603-W");
    expect(row.expiring.map((r) => r.lot.code)).toEqual(["VL-2603-W"]);
  });
});

describe("stock repartido entre lotes", () => {
  const v = variant([lot("VIEJO", "2026-11", 5), lot("NUEVO", "2027-11", 13)]);
  it("lo que entra suma al lote más nuevo", () => {
    expect(withStock(v, 25).lots!.map((l) => l.units)).toEqual([5, 20]);
  });
  it("lo que sale descuenta del que vence primero y descarta lotes vacíos", () => {
    const out = withStock(v, 10);
    expect(out.stock).toBe(10);
    expect(out.lots).toEqual([lot("NUEVO", "2027-11", 10)]);
    expect(withStock(v, 0).lots).toBeUndefined();
  });
  it("a pedido no toca los lotes; sin lotes solo cambia el número", () => {
    expect(withStock(v, -1)).toMatchObject({ stock: -1, lots: v.lots });
    expect(withStock({ ...v, lots: undefined }, 7)).toMatchObject({ stock: 7 });
  });
  it("sumar en lote y la vista Excel usan la misma regla", () => {
    const next = applyStockOp(products(), ["ionic-whey::iw-vainilla-2lb"], { kind: "add", units: 5 });
    expect(find(next, "ionic-whey", "iw-vainilla-2lb").v.lots!.map((l) => l.units)).toEqual([5, 18]);
  });
  it("editar lotes a mano recalcula el stock; al guardar se van los vacíos y se validan código y mes", () => {
    const edited = setVariantLots(v, [...v.lots!, lot("", "2027-10", 0)]);
    expect(edited.stock).toBe(18);
    const p = { ...products()[0]!, variants: [edited] };
    expect(withoutEmptyLots(p).variants[0]!.lots).toHaveLength(2);
    expect(invalidLots({ ...p, variants: [setVariantLots(v, [lot("", "2027-10", 3)])] })).toHaveLength(1);
  });
});

describe("liquidar un lote", () => {
  it("el precio de la tienda baja mientras el lote liquidado sale primero; quitarla vuelve exacto", () => {
    const list = setClearance(products(), "ionic-whey", "iw-vainilla-2lb", "VL-2603-W", 30);
    const { p, v } = find(list, "ionic-whey", "iw-vainilla-2lb");
    expect(listPrice(p, v)).toBe(54900);
    expect(unitPrice(p, v)).toBe(38400);
    expect(variantClearance(p, v)).toMatchObject({ pct: 30, listPrice: 54900, price: 38400 });
    const other = find(list, "ionic-whey", "iw-chocolate-2lb");
    expect(unitPrice(other.p, other.v)).toBe(54900);
    const undone = setClearance(list, "ionic-whey", "iw-vainilla-2lb", "VL-2603-W", null);
    expect(undone).toEqual(products());
  });
  it("un lote liquidado que no sale primero no cambia el precio todavía", () => {
    const list = setClearance(products(), "ionic-whey", "iw-vainilla-2lb", "VL-2609-W", 20);
    const { p, v } = find(list, "ionic-whey", "iw-vainilla-2lb");
    expect(unitPrice(p, v)).toBe(54900);
    // Cuando se vende el lote viejo, el liquidado pasa a salir primero.
    const sold = withStock(v, 13);
    expect(unitPrice(p, sold)).toBe(clearancePrice(54900, 20));
  });
});
