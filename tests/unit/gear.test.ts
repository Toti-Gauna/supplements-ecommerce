import { describe, expect, it } from "vitest";
import { CONTAINERS } from "@/components/illustrations/supplements";
import { withGearCatalog } from "@/demo/admin/migrate";
import { defaultAdminData } from "@/demo/admin/defaults";
import { isGear } from "@/demo/engine/catalog";
import { searchCatalog } from "@/demo/engine/search";
import { isStackCategory } from "@/demo/engine/stack";
import { categories } from "@/demo/fixtures/categories";
import { products } from "@/demo/fixtures/products";

/** L2: la tienda es un comercio deportivo multimarca, con equipamiento además de suplementos. */
const gear = products.filter((p) => categories.find((c) => c.slug === p.categorySlug)?.kind === "gear");
const slugs = (q: string) => searchCatalog(q, products, categories).results.map((r) => r.product.slug);

describe("equipamiento", () => {
  it("hay accesorios de gym (con el funcional), boxeo y shakers, de marcas de terceros además de la propia", () => {
    for (const slug of ["accesorios", "boxeo", "shakers"]) expect(gear.some((p) => p.categorySlug === slug)).toBe(true);
    expect(new Set(gear.map((p) => p.brand)).size).toBeGreaterThanOrEqual(4);
    expect(gear.length).toBeGreaterThanOrEqual(12);
  });

  it("no vence ni se consume: sin lotes, sin servicios, sin tabla nutricional; se elige por color (y talle o medida)", () => {
    for (const p of gear) {
      expect(isGear(p)).toBe(true);
      expect(p.nutrition).toBeUndefined();
      expect(p.lot).toBeUndefined();
      expect(p.variants.every((v) => !v.lots && !(v.servings && v.servings > 1))).toBe(true);
      expect(CONTAINERS[p.art]).toBeTypeOf("function");
      if (p.variants.some((v) => v.color)) expect(p.optionNames?.color).toBeTruthy();
      if (p.variants.some((v) => v.size) && p.variants.length > 1 && p.slug !== "magnesio-tiza") expect(p.optionNames?.size).toBeTruthy();
    }
  });

  it("no suma al descuento stack (es de suplementos)", () => {
    for (const p of gear) expect(isStackCategory(p.categorySlug)).toBe(false);
  });

  it("el buscador entiende el vocabulario del rubro", () => {
    expect(slugs("guantes")[0]).toBe("guantes-boxeo");
    expect(slugs("vendas")[0]).toBe("vendas-boxeo");
    expect(slugs("faja")[0]).toBe("cinturon-palanca");
    expect(slugs("straps")[0]).toBe("straps-algodon");
    expect(slugs("soga de saltar")[0]).toBe("soga-rulemanes");
  });

  it("v14: a un panel guardado le suma lo nuevo sin tocar lo que el dueño editó", () => {
    const base = defaultAdminData();
    const edited = { ...base.data.products[0]!, name: "Nombre del dueño" };
    const saved = {
      ...base,
      data: {
        ...base.data,
        categories: base.data.categories.filter((c) => c.slug !== "boxeo").map((c) => (c.slug === "accesorios" ? { ...c, kind: undefined, name: "Accesorios" } : c)),
        products: [edited, ...base.data.products.slice(1).filter((p) => p.categorySlug !== "boxeo")],
      },
    };
    const out = withGearCatalog(saved).data!;
    expect(out.products[0]!.name).toBe("Nombre del dueño");
    expect(out.products.some((p) => p.slug === "guantes-boxeo")).toBe(true);
    expect(out.categories.find((c) => c.slug === "boxeo")).toBeTruthy();
    const acc = out.categories.find((c) => c.slug === "accesorios")!;
    expect([acc.kind, acc.name]).toEqual(["gear", "Accesorios"]);
  });
});
