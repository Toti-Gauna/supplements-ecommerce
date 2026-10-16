import { beforeEach, describe, expect, it } from "vitest";
import { getProduct } from "@/demo/engine/catalog";
import { heroNeighbors } from "@/demo/engine/home";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";

/** Carrusel de imágenes del inicio: quién acompaña al destacado en el rack de la escena ilustrada. */
beforeEach(() => setDemoData(defaultDemoData()));
const product = (slug: string) => getProduct(slug)!;

describe("vecinos del rack del carrusel", () => {
  it("son de la misma categoría, sin repetir el destacado, y como máximo dos", () => {
    const hero = product("creatina-monohidrato");
    const list = heroNeighbors(hero);
    expect(list).toHaveLength(2);
    expect(list.every((p) => p.categorySlug === hero.categorySlug && p.slug !== hero.slug)).toBe(true);
  });

  it("prefieren otro envase y, entre ellos, los más vendidos", () => {
    const hero = product("creatina-monohidrato");
    const same = demoData().products.filter((p) => p.categorySlug === hero.categorySlug && p.slug !== hero.slug && p.active !== false);
    const list = heroNeighbors(hero, same.length);
    expect(list.map((p) => p.slug).sort()).toEqual(same.map((p) => p.slug).sort());
    const firstSame = list.findIndex((p) => p.art === hero.art);
    if (firstSame >= 0) expect(list.slice(firstSame).every((p) => p.art === hero.art)).toBe(true);
    const distinct = list.filter((p) => p.art !== hero.art).map((p) => p.soldCount);
    expect(distinct).toEqual([...distinct].sort((a, b) => b - a));
  });

  it("no muestran productos ocultos y respetan n", () => {
    const [first] = heroNeighbors(product("ionic-whey"), 1);
    expect(heroNeighbors(product("ionic-whey"), 0)).toEqual([]);
    expect(first).toBeDefined();
    const data = defaultDemoData();
    setDemoData({ ...data, products: data.products.map((p) => (p.slug === first!.slug ? { ...p, active: false } : p)) });
    expect(heroNeighbors(product("ionic-whey")).map((p) => p.slug)).not.toContain(first!.slug);
  });

  it("solo en su categoría: queda solo si no hay otros", () => {
    const data = defaultDemoData();
    const hero = data.products[0]!;
    setDemoData({ ...data, products: data.products.map((p) => (p.slug === hero.slug ? { ...p, categorySlug: "categoria-sola" } : p)) });
    expect(heroNeighbors(product(hero.slug))).toEqual([]);
  });
});
