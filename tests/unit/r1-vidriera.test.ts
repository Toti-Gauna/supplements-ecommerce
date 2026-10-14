import { beforeEach, describe, expect, it } from "vitest";
import { checkHeroFeature, checkHeroList, HERO_LIMITS, isHeroList, newHeroFeature } from "@/demo/admin/content-hero";
import { getProduct } from "@/demo/engine/catalog";
import { boxLeaderboard, heroPicks, homeReviews, scoreText } from "@/demo/engine/home";
import { categoryShelf, goalProduct, rackFacts, stockLine } from "@/demo/engine/rack";
import { recommendForHome } from "@/demo/engine/recommend";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";
import { themeProducts } from "@/demo/engine/themes";

/** R1 · Vidriera: ficha de rack, hero, estantes, tabla del box, reseñas y el editor del hero. */
beforeEach(() => setDemoData(defaultDemoData()));
const product = (slug: string) => getProduct(slug)!;

describe("ficha de rack", () => {
  it("manda la presentación con stock de mejor precio por servicio y dice «desde»", () => {
    const f = rackFacts(product("ionic-whey"));
    expect(f.lead.size).toBe("5 lb (2,27 kg)");
    expect(f.lead.stock).toBeGreaterThan(0);
    expect(f.price).toBe(116900);
    expect(f.perServing).toBe(Math.round(116900 / 75));
    expect(f.from).toBe(true);
    expect(f.flavors).toBe(4);
    expect(f.sizes).toBe(2);
    expect(f.bestSize).toBe("5 lb (2,27 kg)");
  });

  it("una luz por variante con su estado; las sin stock no se pueden agregar", () => {
    const f = rackFacts(product("ionic-whey"));
    expect(f.lights).toHaveLength(8);
    expect(f.lights.find((l) => l.label === "Frutilla · 5 lb (2,27 kg)")?.state).toBe("out");
    expect(f.lights.find((l) => l.label === "Cookies & cream · 5 lb (2,27 kg)")?.state).toBe("low");
    expect(f.buyable.every((v) => v.stock !== 0)).toBe(true);
    expect(f.units).toBe(f.buyable.reduce((n, v) => n + Math.max(0, v.stock), 0));
  });

  it("el stock se lee igual en la tarjeta y en el hero", () => {
    expect(stockLine({ state: "ok", units: 18 })).toBe("En stock · 18 u");
    expect(stockLine({ state: "low", units: 2 })).toBe("Quedan 2");
    expect(stockLine({ state: "out", units: 0 })).toBe("Sin stock");
    expect(stockLine({ state: "made-to-order", units: 0 })).toBe("A pedido");
  });
});

describe("estantes y objetivos", () => {
  it("el estante trae los 3 más vendidos, cuántas marcas hay y el mejor precio por servicio", () => {
    const s = categoryShelf("proteinas");
    expect(s.products).toHaveLength(3);
    expect(s.products[0]!.soldCount).toBeGreaterThanOrEqual(s.products[1]!.soldCount);
    expect(s.brands).toBeGreaterThan(1);
    expect(s.fromPerServing).toBeLessThanOrEqual(rackFacts(product("ionic-whey")).perServing!);
  });

  it("el producto del objetivo es el elegido en el panel; si no es de ese objetivo, el más vendido", () => {
    expect(goalProduct("masa-muscular", "mass-gainer")?.slug).toBe("mass-gainer");
    expect(goalProduct("masa-muscular", "omega-3")?.slug).toBe("creatina-monohidrato");
    expect(goalProduct("masa-muscular")?.slug).toBe("creatina-monohidrato");
  });
});

describe("hero del inicio", () => {
  it("la campaña usa la imagen y el encuadre del destacado visible de su producto", () => {
    const theme = demoData().themes.find((t) => t.id === "black-friday")!;
    const lead = themeProducts(theme)[0]!;
    const feature = { ...demoData().content.hero[0]!, productSlug: lead.slug, image: { src: "data:image/webp;base64,AA==", alt: "Escena propia del rack", frame: { x: 30, y: 60, zoom: 1.2 } } };
    expect(heroPicks([feature], theme)[0]).toMatchObject({ kind: "campaign", headline: theme.headline, image: feature.image });
    expect(heroPicks([{ ...feature, active: false }], theme)[0]?.image).toBeUndefined();
  });
  it("cada destacado conserva su imagen y encuadre sin modificar el producto del catálogo", () => {
    const feature = demoData().content.hero[0]!;
    const image = { src: "data:image/webp;base64,AA==", alt: "Pote bajo el reflector", frame: { x: 20, y: 70, zoom: 1.5 } };
    const picks = heroPicks([{ ...feature, image }], null);
    expect(picks[0]!.image).toEqual(image);
    expect(picks[0]!.product).toEqual(getProduct(feature.productSlug));
    expect(getProduct(feature.productSlug)!.photoDataUrl).toBeUndefined();
  });
  it("sin campaña, los destacados visibles del panel en orden; con campaña, la campaña primero", () => {
    const { content, themes } = demoData();
    expect(heroPicks(content.hero, null).map((p) => p.product.slug)).toEqual(["ionic-whey", "creatina-monohidrato", "overvolt-pre"]);
    const theme = themes.find((t) => t.id === "black-friday")!;
    const picks = heroPicks(content.hero, theme);
    expect(picks[0]).toMatchObject({ kind: "campaign", headline: theme.headline, product: themeProducts(theme)[0] });
    expect(new Set(picks.map((p) => p.product.slug)).size).toBe(picks.length);
  });

  it("los ocultos o con el producto oculto no salen; sin nada, el más vendido", () => {
    const hero = demoData().content.hero.map((h, i) => (i === 0 ? { ...h, active: false } : h));
    expect(heroPicks(hero, null)[0]!.product.slug).toBe("creatina-monohidrato");
    expect(heroPicks([], null)).toMatchObject([{ product: { slug: "creatina-monohidrato" } }]);
  });

  it("el editor valida producto, titular y largo; la lista pide uno visible", () => {
    const { products, content } = demoData();
    for (const h of content.hero) expect(checkHeroFeature(h, products)).toEqual([]);
    expect(isHeroList(content.hero)).toBe(true);
    const h = newHeroFeature("h-x", "ionic-whey");
    expect(checkHeroFeature({ ...h, headline: " " }, products)).toEqual(["Escribí el titular."]);
    expect(checkHeroFeature({ ...h, headline: "x".repeat(HERO_LIMITS.headline + 1) }, products)).toEqual([`El titular tiene ${HERO_LIMITS.headline + 1} caracteres; el máximo es ${HERO_LIMITS.headline}.`]);
    expect(checkHeroFeature({ ...h, productSlug: "no-existe" }, products)).toEqual(["Elegí un producto del catálogo."]);
    expect(checkHeroList([{ ...h, active: false }])).toHaveLength(1);
    expect(isHeroList([{ id: "x" }])).toBe(false);
  });
});

describe("el más elegido del box y reseñas", () => {
  it("ordena por ventas de la semana, marca el cambio de puesto y trae el precio por servicio", () => {
    const rows = boxLeaderboard(5);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(rows[0]).toMatchObject({ product: { slug: "ionic-whey" }, move: 1 });
    expect(rows[1]).toMatchObject({ product: { slug: "creatina-monohidrato" }, move: -1 });
    expect(rows.every((r, i) => i === 0 || rows[i - 1]!.week >= r.week)).toBe(true);
    expect(rows[0]!.perServing).toBe(rackFacts(product("ionic-whey")).perServing);
  });

  it("«Recomendados» no repite la tabla del box", () => {
    const top = boxLeaderboard(5).map((r) => r.product.slug);
    expect(recommendForHome([], 8, top).some((p) => top.includes(p.slug))).toBe(false);
  });

  it("reseñas de productos visibles, las de más reseñas primero, con coma decimal", () => {
    const list = homeReviews(3);
    expect(list).toHaveLength(3);
    expect(list[0]!.count).toBeGreaterThanOrEqual(list[1]!.count);
    expect(scoreText(4.7)).toBe("4,7");
  });
});
