import { beforeEach, describe, expect, it } from "vitest";
import { buildCaption, hooksFor, keywordFor, offerLine, themeHashtag } from "@/demo/admin/studio/caption";
import { studioOffer, studioProducts, studioTexts, suggestedProducts } from "@/demo/admin/studio/content";
import { beats, clampDuration, productSlot, span } from "@/demo/admin/studio/timeline";
import { exportName, pickVideoFormat } from "@/demo/admin/studio/video";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";

const theme = (id: string) => demoData().themes.find((t) => t.id === id)!;

describe("estudio de contenido", () => {
  beforeEach(() => setDemoData(defaultDemoData()));

  it("arranca con los textos y los productos de la temática; sin temática, con los de la marca y los más vendidos", () => {
    const madre = theme("dia-de-la-madre");
    expect(studioTexts(madre)).toMatchObject({ eyebrow: "Especial Día de la Madre", title: madre.headline, subtitle: madre.subtitle });
    expect(suggestedProducts(madre)).toEqual(madre.productSlugs.slice(0, 3));
    expect(studioTexts(null).title).toBe("Objetos con alma");
    expect(suggestedProducts(null)).toHaveLength(3);
  });

  it("precio y precio con el cupón salen del engine, en pesos enteros", () => {
    const madre = theme("dia-de-la-madre");
    const offer = studioOffer(madre);
    const [p] = studioProducts(["vela-caniche"], offer);
    expect(Number.isInteger(p!.price)).toBe(true);
    expect(p!.offerPrice).toBe(Math.round(p!.price * 0.85));
    // Cupón con mínimo (Black Friday): no hay precio por producto, la oferta va como condición.
    const [q] = studioProducts(["vela-caniche"], studioOffer(theme("black-friday")));
    expect(q!.offerPrice).toBeNull();
    expect(offerLine(studioOffer(theme("black-friday")))).toBe("25% OFF con el código BLACK25 (desde $30.000 de compra)");
    expect(studioProducts(["no-existe", "vela-caniche"], offer).map((x) => x.slug)).toEqual(["vela-caniche"]);
  });

  it("el texto sugerido usa un gancho que corresponde al producto, pide un comentario y pocos hashtags", () => {
    const madre = theme("dia-de-la-madre");
    const offer = studioOffer(madre);
    const lamp = studioProducts(["velador-con-foto"], offer);
    expect(hooksFor(lamp)[0]!.id).toBe("foto");
    expect(keywordFor(lamp)).toBe("LAMPARA");
    const { text } = buildCaption({ theme: madre, offer, products: lamp, format: "story", variant: 0 });
    expect(text.split("\n")[0]).toBe("Me mandaron esta foto… y mirá en qué la convertimos.");
    expect(text).toContain("Comentá LAMPARA");
    expect(text).toContain("15% OFF con el código MAMA15");
    expect(text).toContain("#DíaDeLaMadre");
    expect(text.match(/#/g)).toHaveLength(3);
    expect(hooksFor(studioProducts(["placa-nfc"], null))[0]!.id).toBe("nfc");
    expect(hooksFor(studioProducts(["comedero-perro-globo"], null))[0]!.id).toBe("pov");
    // "Otra idea" rota entre los ganchos que aplican, sin salirse de la lista.
    const ids = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => buildCaption({ theme: null, offer: null, products: lamp, format: "post", variant: v }).hook.id);
    expect(new Set(ids).size).toBe(hooksFor(lamp).length);
    expect(buildCaption({ theme: null, offer: null, products: lamp, format: "carousel", variant: 0 }).text).toContain("Cómo pedir el tuyo: 1)");
    expect(themeHashtag(theme("dia-de-la-independencia"))).toBe("#9DeJulio");
    // El texto sigue a la pieza: sin precio ni oferta si se apagaron.
    const quiet = buildCaption({ theme: madre, offer, products: lamp, format: "post", variant: 0, showPrice: false, showOffer: false }).text;
    expect(quiet).not.toContain("$");
    expect(quiet).not.toContain("MAMA15");
  });

  it("tiempos: duración entre 6 y 15 s, entradas en orden y productos uno por uno en la historia", () => {
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
    // En el cierre (y en la imagen exportada) vuelve el producto principal.
    expect(productSlot(9.9, 10, 3)).toEqual({ index: 0, enter: 1 });
    expect(productSlot(5, 10, 1)).toEqual({ index: 0, enter: 1 });
  });

  it("elige MP4 si el navegador lo graba (Safari) y si no WebM; nombre de archivo claro", () => {
    expect(pickVideoFormat((m) => m.startsWith("video/mp4"))?.ext).toBe("mp4");
    expect(pickVideoFormat((m) => m === "video/webm;codecs=vp8,opus")).toEqual({ mimeType: "video/webm;codecs=vp8,opus", ext: "webm" });
    expect(pickVideoFormat(() => false)).toBeNull();
    expect(exportName("dia-de-la-madre", "historia", "mp4")).toBe("volta-dia-de-la-madre-historia.mp4");
    expect(exportName(null, "carrusel", "png", 1)).toBe("volta-original-carrusel-2.png");
  });
});
