import { describe, expect, it } from "vitest";
import type { CartLine } from "@/demo/engine/cart-types";
import { completePackLines, groupByPack, monthlyDayOf, packDiscountRows } from "@/demo/engine/pack-cart";
import { packCartLines, packMissingItems, quotePack } from "@/demo/engine/packs";
import { quoteCart } from "@/demo/engine/pricing";
import { packs } from "@/demo/fixtures/packs";

const pack = (id: string) => packs.find((p) => p.id === id)!;
const withIds = (lines: ReturnType<typeof packCartLines>): CartLine[] => lines.map((l, i) => ({ ...l, id: `l${i}` }));

describe("packs en el carrito (L3)", () => {
  it("agrupa las líneas de cada pack en el lugar de la primera y deja lo suelto aparte", () => {
    const hip = withIds(packCartLines(quotePack(pack("hipertrofia"))));
    const solo: CartLine = { id: "x", productSlug: "omega-3", variantId: "v", quantity: 1 };
    const items = [hip[0]!, solo, ...hip.slice(1)].map((line) => ({ line }));
    const groups = groupByPack(items);
    expect(groups.map((g) => g.packId)).toEqual(["hipertrofia", undefined]);
    expect(groups[0]!.items).toHaveLength(hip.length);
    expect(groups[1]!.items.map((i) => i.line.id)).toEqual(["x"]);
  });

  it("completa un pack al que le quitaron un producto, con el mismo día mensual", () => {
    const full = withIds(packCartLines(quotePack(pack("principiante")), 12));
    expect(completePackLines(full, pack("principiante"))).toEqual([]);
    const partial = full.slice(1);
    const missing = completePackLines(partial, pack("principiante"));
    expect(missing).toHaveLength(1);
    expect(missing[0]).toMatchObject({ productSlug: "ionic-whey", quantity: 1, packId: "principiante", monthlyDay: 12 });
    // Con esas líneas el pack vuelve a estar completo y recupera su descuento.
    const again = [...partial, ...missing.map((l, i) => ({ ...l, id: `n${i}` }))];
    expect(packMissingItems(again, pack("principiante"))).toEqual([]);
    expect(quoteCart(again).pack.discount).toBeGreaterThan(0);
    expect(completePackLines([], pack("principiante"))).toEqual([]);
  });

  it("el día mensual sale de cualquier línea del pack", () => {
    const lines = withIds(packCartLines(quotePack(pack("fuerza")), 20));
    expect(monthlyDayOf(lines)).toBe(20);
    expect(monthlyDayOf(withIds(packCartLines(quotePack(pack("fuerza")))))).toBeUndefined();
  });

  it("rotula el descuento: único, mensual o con el nombre si hay más de un pack", () => {
    const entry = { packId: "a", name: "Pack A", pct: 10, monthly: false, discount: 500 };
    expect(packDiscountRows([entry])).toEqual([{ label: "Descuento pack (10 %)", amount: 500, negative: true }]);
    expect(packDiscountRows([{ ...entry, monthly: true, pct: 15 }])[0]!.label).toBe("Descuento pack mensual (15 %)");
    expect(packDiscountRows([entry, { ...entry, packId: "b", name: "Pack B" }]).map((r) => r.label)).toEqual(["Descuento Pack A (10 %)", "Descuento Pack B (10 %)"]);
    expect(packDiscountRows(undefined)).toEqual([]);
  });
});
