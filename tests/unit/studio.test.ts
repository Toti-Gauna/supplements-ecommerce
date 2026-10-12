import { beforeEach, describe, expect, it } from "vitest";
import { buildCaption, hooksFor, keywordFor, offerLine, themeHashtag } from "@/demo/admin/studio/caption";
import { offerProducts, studioOffer, studioProducts } from "@/demo/admin/studio/content";
import { studioGame, studioStack, templateProducts, templateTexts } from "@/demo/admin/studio/templates";
import { beats, clampDuration, potDrop, productSlot, span, sweepAt } from "@/demo/admin/studio/timeline";
import { exportName, pickVideoFormat } from "@/demo/admin/studio/video";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";
import { gamePrizes } from "@/demo/fixtures/game";
import { STUDIO_HOOKS, STUDIO_TEMPLATES } from "@/demo/fixtures/studio";

const theme = (id: string) => demoData().themes.find((t) => t.id === id)!;
const rule = DEFAULT_STACK_RULE;

describe("estudio de contenido", () => {
  beforeEach(() => setDemoData(defaultDemoData()));

  it("cuatro plantillas de VOLTA y nada de Velmar en los textos fijos", () => {
    expect(STUDIO_TEMPLATES.map((t) => t.id)).toEqual(["offer", "product", "stack", "game"]);
    const fixed = JSON.stringify([STUDIO_HOOKS, STUDIO_TEMPLATES]).toLowerCase();
    for (const word of ["mascota", "a mano", "taller", "personaliz", "vela"]) expect(fixed).not.toContain(word);
  });

  it("cada plantilla arranca con sus productos y sus textos", () => {
    const madre = theme("dia-de-la-madre");
    const ctx = { products: [], stack: studioStack([], rule), game: studioGame(gamePrizes) };
    expect(templateTexts("offer", madre, ctx)).toMatchObject({ eyebrow: "Especial Día de la Madre", title: madre.headline, subtitle: madre.subtitle });
    expect(templateProducts("offer", madre, demoData().products, rule)).toEqual(madre.productSlugs.slice(0, 3));
    expect(templateTexts("offer", null, ctx).title).toBe("Cargá tu mejor versión");
    expect(offerProducts(null)).toHaveLength(3);
    expect(templateProducts("product", null, demoData().products, rule)).toHaveLength(1);
    const stackSlugs = templateProducts("stack", null, demoData().products, rule);
    const stack = studioProducts(stackSlugs, null);
    expect(new Set(stack.map((p) => p.categorySlug))).toEqual(new Set(["proteinas", "creatinas", "pre-entrenos"]));
    expect(templateTexts("stack", null, { ...ctx, products: stack, stack: studioStack(stack, rule) })).toMatchObject({ eyebrow: "Stack del mes", title: "Proteínas + creatinas + pre-entrenos", subtitle: "Juntos tienen 10 % off con el descuento stack." });
    expect(templateProducts("game", null, demoData().products, rule)).toEqual([]);
    expect(templateTexts("game", null, ctx).subtitle).toContain("hasta envío gratis");
  });

  it("precios, precio por servicio y lote salen del engine y de la ficha, en pesos enteros", () => {
    const offer = studioOffer(theme("dia-de-la-madre"));
    const [p] = studioProducts(["creatina-monohidrato"], offer);
    expect(p).toMatchObject({ price: 29900, offerPrice: Math.round(29900 * 0.85), servings: 60, perServing: 498 });
    expect(p!.lot).toMatch(/^LOTE \S+ · VTO \d{2}\/\d{4}$/);
    // Cupón con mínimo (Black Friday): no hay precio por producto, la oferta va como condición.
    const [q] = studioProducts(["creatina-monohidrato"], studioOffer(theme("black-friday")));
    expect(q!.offerPrice).toBeNull();
    expect(offerLine(studioOffer(theme("black-friday")))).toBe("30% OFF con el código BLACK30 (desde $40.000 de compra)");
    expect(studioProducts(["no-existe", "creatina-monohidrato"], offer).map((x) => x.slug)).toEqual(["creatina-monohidrato"]);
    expect(studioProducts(["creatina-monohidrato", "ionic-whey"], null, 1)).toHaveLength(1);
  });

  it("stack del mes con la misma regla que el carrito; el juego con los premios guardados", () => {
    const three = studioProducts(templateProducts("stack", null, demoData().products, rule), null);
    const st = studioStack(three, rule);
    expect(st.applies).toBe(true);
    expect(st.discount).toBe(Math.round(st.subtotal * 0.1));
    expect(st.total).toBe(st.subtotal - st.discount);
    expect(studioStack(three.slice(0, 2), rule)).toMatchObject({ applies: false, missing: 1, discount: 0 });
    expect(studioGame(gamePrizes)).toMatchObject({ active: true, best: "Envío gratis", tiers: [{ minScore: 300 }, { minScore: 800 }, { minScore: 1500 }] });
    expect(studioGame({ ...gamePrizes, active: false }).active).toBe(false);
  });

  it("el texto sugerido usa un gancho de la plantilla y del producto, pide un comentario y pocos hashtags", () => {
    const madre = theme("dia-de-la-madre");
    const offer = studioOffer(madre);
    const creatine = studioProducts(["creatina-monohidrato"], offer);
    expect(hooksFor(creatine)[0]!.id).toBe("mito");
    expect(keywordFor(creatine)).toBe("CREATINA");
    const { text } = buildCaption({ theme: madre, offer, products: creatine, format: "story", variant: 0 });
    expect(text.split("\n")[0]).toBe("No, la creatina no te hace retener agua debajo de la piel.");
    expect(text).toContain("Comentá CREATINA");
    expect(text).toContain("15% OFF con el código MAMA15");
    expect(text).toContain("#DíaDeLaMadre");
    expect(text.match(/#/g)).toHaveLength(3);
    expect(hooksFor(studioProducts(["overvolt-pre"], null))[0]!.id).toBe("pre");
    expect(hooksFor(studioProducts(["omega-3"], null))[0]!.id).toBe("precio");
    const ids = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => buildCaption({ theme: null, offer: null, products: creatine, format: "post", variant: v }).hook.id);
    expect(new Set(ids).size).toBe(hooksFor(creatine).length);
    expect(buildCaption({ theme: null, offer: null, products: creatine, format: "carousel", variant: 0 }).text).toContain("Cómo pedir el tuyo: 1)");
    expect(themeHashtag(theme("operacion-verano"))).toBe("#OperaciónVerano");
    const quiet = buildCaption({ theme: madre, offer, products: creatine, format: "post", variant: 0, showPrice: false, showOffer: false }).text;
    expect(quiet).not.toContain("$");
    expect(quiet).not.toContain("MAMA15");
    // Producto destacado: precio por servicio y lote; stack: el total; juego: sus ganchos y los niveles.
    expect(buildCaption({ template: "product", theme: null, offer: null, products: creatine, format: "post", variant: 0 }).text).toMatch(/\$\s?498 por servicio[\s\S]*LOTE/);
    const stack = studioProducts(templateProducts("stack", null, demoData().products, rule), null);
    expect(buildCaption({ template: "stack", theme: null, offer: null, products: stack, format: "post", variant: 0, stack: studioStack(stack, rule) }).text).toMatch(/descuento stack \(10 %\)[\s\S]*Comentá STACK/);
    const game = buildCaption({ template: "game", theme: madre, offer, products: [], format: "carousel", variant: 0, game: studioGame(gamePrizes) });
    expect(["juego", "juego-premio"]).toContain(game.hook.id);
    expect(game.text).toContain("1.500 puntos → Envío gratis");
    expect(game.text).toContain("Cómo ganar tu cupón: 1)");
    expect(game.text).not.toContain("MAMA15");
  });

  it("tiempos: duración entre 6 y 15 s, entradas en orden, potes que caen y filo de luz fuera del cuadro final", () => {
    expect(clampDuration(3)).toBe(6);
    expect(clampDuration(40)).toBe(15);
    expect(clampDuration(Number.NaN)).toBe(6);
    const b = beats(10);
    expect(b.eyebrow).toBeLessThan(b.title);
    expect(b.product).toBeLessThan(b.offer);
    expect(b.cta).toBe(7.8);
    expect(span(1, 0.5, 1)).toBe(0.5);
    expect(productSlot(0.5, 10, 3).index).toBe(0);
    expect(productSlot(7.5, 10, 3).index).toBe(2);
    expect(productSlot(9.9, 10, 3)).toEqual({ index: 0, enter: 1, start: 7.8 });
    expect(productSlot(5, 10, 1)).toEqual({ index: 0, enter: 1, start: 0.9 });
    expect(potDrop(0, 1)).toBe(0);
    expect(potDrop(5, 1)).toBe(1);
    expect(potDrop(1.5, 1, 0.35)).toBeGreaterThan(0);
    expect(sweepAt(1, 2, 10)).toBeNull();
    expect(sweepAt(2.8, 2, 10)).toBeCloseTo(0.4545, 3);
    expect(sweepAt(9.8, 2, 10)).toBeNull();
  });

  it("elige MP4 si el navegador lo graba (Safari) y si no WebM; nombre de archivo claro", () => {
    expect(pickVideoFormat((m) => m.startsWith("video/mp4"))?.ext).toBe("mp4");
    expect(pickVideoFormat((m) => m === "video/webm;codecs=vp8,opus")).toEqual({ mimeType: "video/webm;codecs=vp8,opus", ext: "webm" });
    expect(pickVideoFormat(() => false)).toBeNull();
    expect(exportName("dia-de-la-madre", "historia", "mp4")).toBe("volta-dia-de-la-madre-historia.mp4");
    expect(exportName(null, "carrusel", "png", 1)).toBe("volta-original-carrusel-2.png");
    expect(exportName("dia-de-la-madre", "post", "png", undefined, "stack")).toBe("volta-stack-post.png");
    expect(exportName(null, "carrusel", "png", 2, "game")).toBe("volta-juego-carrusel-3.png");
  });
});
