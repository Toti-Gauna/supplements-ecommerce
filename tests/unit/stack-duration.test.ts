import { describe, expect, it } from "vitest";
import { defaultStack, stackSummary, type StackPick } from "@/demo/engine/stack-builder";
import { durationOptions, durationSpread, durationTolerance, equalizeDuration } from "@/demo/engine/stack-duration";
import { decodeStack, encodeStack, MAX_QTY } from "@/demo/engine/stack-link";
import { products } from "@/demo/fixtures/products";
import type { Product } from "@/demo/types";

const p = (slug: string) => products.find((x) => x.slug === slug)!;
const days = (picks: StackPick[], catalog: Product[] = products) => stackSummary(picks, catalog).lines.map((l) => l.days!);
/** Copia del catálogo con el stock de una variante cambiado. */
const withStock = (variantId: string, stock: number) =>
  products.map((x) => ({ ...x, variants: x.variants.map((v) => (v.id === variantId ? { ...v, stock } : v)) }));

describe("te dura N días", () => {
  it("cada línea dice cuánto dura con un servicio por día, y la cantidad multiplica precio y días", () => {
    const fuerza = defaultStack("fuerza", products);
    expect(days(fuerza)).toEqual([30, 60, 30]);
    const two = stackSummary([{ ...fuerza[0]!, qty: 2 }], products).lines[0]!;
    expect(two).toMatchObject({ qty: 2, unitPrice: 54900, price: 109800, days: 60, perServing: 1830 });
  });

  it("la diferencia y la tolerancia", () => {
    expect(durationSpread([30, 60, 45])).toBe(30);
    expect(durationSpread([60])).toBe(0);
    expect(durationTolerance(60)).toBe(6);
    expect(durationTolerance(10)).toBe(3);
  });

  it("las opciones respetan el sabor, el stock y el tope de unidades", () => {
    const whey = p("ionic-whey");
    const choco2 = whey.variants.find((v) => v.id === "iw-chocolate-2lb")!;
    const opts = durationOptions(whey, choco2);
    expect(opts.every((o) => whey.variants.find((v) => v.id === o.variantId)!.color === "Chocolate")).toBe(true);
    expect(Math.max(...opts.map((o) => o.qty))).toBeLessThanOrEqual(MAX_QTY);
    const fiveLb = whey.variants.find((v) => v.color === "Chocolate" && v.size?.startsWith("5 lb"))!;
    expect(opts.filter((o) => o.variantId === fiveLb.id).map((o) => o.qty)).toEqual(Array.from({ length: Math.min(MAX_QTY, fiveLb.stock) }, (_, i) => i + 1));
  });
});

describe("igualar duración", () => {
  it("fuerza: proteína y pre pasan a dos unidades y todo dura 60 días, con el mismo sabor", () => {
    const fuerza = defaultStack("fuerza", products);
    const r = equalizeDuration(fuerza, products);
    expect(r.days).toBe(60);
    expect(r.spread).toBe(0);
    expect(r.changed).toEqual(["base", "energia"]);
    expect(r.picks.map((x) => x.qty ?? 1)).toEqual([2, 1, 2]);
    expect(r.picks[0]!.variantId).toBe(fuerza[0]!.variantId);
    expect(days(r.picks)).toEqual([60, 60, 60]);
  });

  it("fuerza + salud: los cuatro quedan dentro de la tolerancia", () => {
    const r = equalizeDuration(defaultStack(["fuerza", "salud"], products), products);
    const d = days(r.picks);
    expect(durationSpread(d)).toBeLessThanOrEqual(durationTolerance(Math.min(...d)));
  });

  it("si ya dura lo mismo no cambia nada", () => {
    const fuerza = defaultStack("fuerza", products);
    const once = equalizeDuration(fuerza, products);
    const twice = equalizeDuration(once.picks, products);
    expect(twice.changed).toEqual([]);
    expect(twice.picks).toBe(once.picks);
  });

  it("con un solo producto (o sin servicios) no hay nada que igualar", () => {
    const one = defaultStack("fuerza", products).slice(0, 1);
    expect(equalizeDuration(one, products)).toEqual({ picks: one, days: null, spread: 0, changed: [] });
  });

  it("no pide más unidades de las que hay en stock", () => {
    const fuerza = defaultStack("fuerza", products);
    const catalog = withStock(fuerza[2]!.variantId, 1);
    const r = equalizeDuration(fuerza, catalog);
    expect(r.picks[2]!.qty ?? 1).toBe(1);
  });

  it("con dos servicios por día los días se cortan a la mitad", () => {
    const r = equalizeDuration(defaultStack("fuerza", products), products, 2);
    expect(r.days).not.toBeNull();
    expect(r.spread).toBeLessThanOrEqual(durationTolerance(r.days!));
  });
});

describe("la cantidad en el link", () => {
  it("va al final solo si es más de una y se lee de vuelta con tope y stock", () => {
    const picks: StackPick[] = [{ slot: "base", slug: "ionic-whey", variantId: "iw-chocolate-2lb", qty: 2 }, { slot: "creatina", slug: "creatina-monohidrato", variantId: "cm-sin-sabor-300" }];
    const q = new URLSearchParams(encodeStack("fuerza", picks));
    expect(q.get("stack")).toBe("base.ionic-whey.iw-chocolate-2lb.2,creatina.creatina-monohidrato.cm-sin-sabor-300");
    expect(decodeStack(q.get("stack"), products)).toEqual(picks);
    expect(decodeStack("base.ionic-whey.iw-chocolate-2lb.9", products)[0]!.qty).toBe(MAX_QTY);
    expect(decodeStack("base.ionic-whey.iw-chocolate-2lb.x", products)[0]!.qty).toBeUndefined();
  });
});
