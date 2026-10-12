import { describe, expect, it } from "vitest";
import { decodeStack, defaultStack, encodeStack, hasCaffeine, slotOptions, stackSummary } from "@/demo/engine/stack-builder";
import { products } from "@/demo/fixtures/products";

const p = (slug: string) => products.find((x) => x.slug === slug)!;

describe("armador de stack", () => {
  it("cada objetivo arma sus tres lugares con productos del objetivo y con stock", () => {
    const fuerza = defaultStack("fuerza", products);
    expect(fuerza.map((x) => x.slot)).toEqual(["base", "creatina", "energia"]);
    expect(fuerza.map((x) => x.slug)).toEqual(["ionic-whey", "creatina-monohidrato", "overvolt-pre"]);
    for (const pick of fuerza) expect(p(pick.slug).variants.find((v) => v.id === pick.variantId)!.stock).not.toBe(0);
  });

  it("el extra elige la categoría que conviene al objetivo", () => {
    expect(slotOptions("extra", "definicion", products)[0]!.categorySlug).toBe("definicion");
    expect(slotOptions("extra", "resistencia", products)[0]!.categorySlug).toBe("hidratacion");
  });

  it("las restricciones filtran: vegano deja la proteína vegana y sin cafeína saca el pre con estimulantes", () => {
    expect(slotOptions("base", "masa-muscular", products, ["vegano"]).map((x) => x.slug)).toEqual(["proteina-vegana"]);
    expect(hasCaffeine(p("overvolt-pre"))).toBe(true);
    expect(hasCaffeine(p("pump-flow"))).toBe(false);
    expect(slotOptions("energia", "fuerza", products, ["sin-cafeina"]).map((x) => x.slug)).toEqual(["pump-flow"]);
  });

  it("el resumen usa la misma regla que el carrito y calcula el costo por día", () => {
    const s = stackSummary(defaultStack("fuerza", products), products);
    expect(s.subtotal).toBe(54900 + 29900 + 36900);
    expect(s.stack.discount).toBe(12170);
    expect(s.total).toBe(121700 - 12170);
    // $1.830 + $498 + $1.230 por servicio (ya redondeados), con el 10 % del stack.
    expect(s.perDay).toBe(Math.round((1830 + 498 + 1230) * 0.9));
  });

  it("con dos lugares no hay descuento", () => {
    const s = stackSummary(defaultStack("fuerza", products).slice(0, 2), products);
    expect(s.stack.missing).toBe(1);
    expect(s.total).toBe(s.subtotal);
  });

  it("la URL ida y vuelta conserva el estante y descarta lo inválido", () => {
    const picks = defaultStack("fuerza", products);
    const q = new URLSearchParams(encodeStack("fuerza", picks));
    expect(q.get("objetivo")).toBe("fuerza");
    expect(decodeStack(q.get("stack"), products)).toEqual(picks);
    expect(decodeStack("base.no-existe.x,creatina.ionic-whey.iw-chocolate-2lb,base.isolate-zero.iz-vainilla-2lb", products)).toEqual([]);
  });
});
