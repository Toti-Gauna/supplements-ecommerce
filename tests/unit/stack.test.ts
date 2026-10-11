import { describe, expect, it } from "vitest";
import { stackDiscount, stackSuggestions } from "@/demo/engine/stack";
import { products } from "@/demo/fixtures/products";

const p = (slug: string) => products.find((x) => x.slug === slug)!;
const line = (slug: string, lineTotal: number) => ({ product: p(slug), lineTotal });

describe("descuento stack", () => {
  it("con 3 categorías de suplementos distintas descuenta el % sobre esas líneas", () => {
    const r = stackDiscount([line("ionic-whey", 54900), line("creatina-monohidrato", 29900), line("overvolt-pre", 36900), line("shaker-volta", 8900)]);
    expect(r.categories).toEqual(["proteinas", "creatinas", "pre-entrenos"]);
    expect(r.missing).toBe(0);
    expect(r.base).toBe(121700);
    expect(r.discount).toBe(12170);
  });

  it("dos productos de la misma categoría cuentan una vez; los accesorios no suman", () => {
    const r = stackDiscount([line("ionic-whey", 54900), line("isolate-zero", 72500), line("shaker-volta", 8900)]);
    expect(r.categories).toEqual(["proteinas"]);
    expect(r.missing).toBe(2);
    expect(r.discount).toBe(0);
  });

  it("la regla se puede cambiar desde el panel", () => {
    const r = stackDiscount([line("ionic-whey", 10000), line("creatina-monohidrato", 10000)], { pct: 15, minCategories: 2 });
    expect(r.discount).toBe(3000);
  });
});

describe("sugerencias para armar el stack", () => {
  it("una por categoría, distinta de la del producto, con stock y priorizando el mismo objetivo", () => {
    const s = stackSuggestions(p("ionic-whey"), products);
    expect(s).toHaveLength(2);
    expect(new Set(s.map((x) => x.categorySlug)).size).toBe(2);
    expect(s.every((x) => x.categorySlug !== "proteinas")).toBe(true);
    expect(s[0]!.slug).toBe("creatina-monohidrato");
  });
});
