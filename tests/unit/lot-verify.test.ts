import { describe, expect, it } from "vitest";
import { expiryState, normalizeLotCode, verifyLot } from "@/demo/engine/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { productRnpa } from "@/demo/fixtures/lots";
import { products } from "@/demo/fixtures/products";

/** R2 · "Verificá tu lote": el código del pote → producto, vencimiento, ingreso al local y RNPA. */
describe("Verificá tu lote", () => {
  it("entiende el código como lo escribe cualquiera", () => {
    expect(normalizeLotCode(" vl 2606 w ")).toBe("VL-2606-W");
    expect(normalizeLotCode("vl2606w")).toBe("VL-2606-W");
    expect(normalizeLotCode("VL–2606–W")).toBe("VL-2606-W");
    expect(normalizeLotCode("abc")).toBe("ABC");
    expect(normalizeLotCode("   ")).toBe("");
  });

  it("un lote de la tienda devuelve el producto, las presentaciones, el vencimiento y el día de ingreso", () => {
    const r = verifyLot("vl2609w", products, DEMO_TODAY);
    expect(r.kind).toBe("found");
    if (r.kind !== "found") return;
    expect(r.product.slug).toBe("ionic-whey");
    expect(r.product.rnpa).toBe(productRnpa["ionic-whey"]);
    // Es el lote del rótulo: lo tienen todas las presentaciones con stock (Frutilla 5 lb no tiene).
    expect(r.variants.map((v) => v.id)).toContain("iw-vainilla-2lb");
    expect(r.variants.map((v) => v.id)).not.toContain("iw-frutilla-5lb");
    expect(r).toMatchObject({ code: "VL-2609-W", expires: "2027-11", receivedOn: "2026-09-25", state: "ok" });
  });

  it("avisa si vence pronto o ya venció", () => {
    const soon = verifyLot("VL-2604-B", products, DEMO_TODAY);
    expect(soon).toMatchObject({ kind: "found", state: "soon" });
    expect(verifyLot("VL-2604-B", products, "2026-11-15")).toMatchObject({ state: "expired" });
    expect(expiryState("2026-12", DEMO_TODAY)).toBe("ok");
  });

  it("el lote del rótulo de un producto sin unidades sigue siendo de la tienda", () => {
    const sold = products.map((p) => (p.slug === "isolate-zero" ? { ...p, variants: p.variants.map((v) => ({ ...v, lots: undefined, stock: 0 })) } : p));
    expect(verifyLot("KR-2608-I", sold, DEMO_TODAY)).toMatchObject({ kind: "found", variants: [], receivedOn: undefined });
  });

  it("un código que no es de la tienda o vacío se dice claro", () => {
    expect(verifyLot("XX-0000-Z", products, DEMO_TODAY)).toEqual({ kind: "unknown", code: "XX-0000-Z" });
    expect(verifyLot("  ", products, DEMO_TODAY)).toEqual({ kind: "empty" });
  });

  it("todos los lotes del catálogo tienen día de ingreso y es anterior a la fecha de la demo; cada suplemento, su RNPA", () => {
    for (const p of products) {
      for (const l of p.variants.flatMap((v) => v.lots ?? [])) expect(l.receivedOn! <= DEMO_TODAY, `${p.slug} ${l.code}`).toBe(true);
      if (p.categorySlug !== "accesorios") expect(p.rnpa, p.slug).toMatch(/^00-\d{6}$/);
    }
  });
});
