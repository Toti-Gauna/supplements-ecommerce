import { describe, expect, it } from "vitest";
import { checkImageFile, checkImageSize, checkSlide, frame, isSlideList, newSlide, normalizeSlides, SLIDE_LIMITS } from "@/demo/admin/content-slides";
import { BADGE_EDGE, coverRatio, offerParts, overlaps, postLayout, storyBadge } from "@/demo/admin/studio/offer";
import { defaultDemoData } from "@/demo/engine/source";
import type { CarouselSlide } from "@/demo/types";

/** Polish 8.3 · Lote 7: cartel de oferta del Estudio y carrusel del inicio. */
const { content } = defaultDemoData();
const img = { src: "data:image/jpeg;base64,AAAA", alt: "Vela sobre la mesa", x: 50, y: 50, zoom: 1 };

describe("cartel de oferta del Estudio (8.3.27)", () => {
  it("separa el valor de OFF y deja frases como 'Envío gratis' enteras", () => {
    expect(offerParts("30% OFF")).toEqual({ value: "30%", unit: "OFF" });
    expect(offerParts("$3.000 OFF")).toEqual({ value: "$3.000", unit: "OFF" });
    expect(offerParts("Envío gratis")).toEqual({ value: "Envío gratis", unit: "" });
  });

  it("post 1:1: el cartel entra en la pieza, no pisa la columna de texto y apenas toca el borde de la tarjeta", () => {
    for (const badge of [{ w: 280, h: 230 }, { w: 320, h: 300 }, { w: 378, h: 360 }]) {
      const L = postLayout(1080, badge);
      expect(L.badge!.x + L.badge!.w).toBeLessThanOrEqual(1080 - BADGE_EDGE);
      expect(L.badge!.y).toBeGreaterThanOrEqual(BADGE_EDGE);
      // Titular, texto y precio van de x = 80 a 530.
      expect(overlaps(L.badge!, { x: 80, y: 100, w: 450, h: 760 })).toBe(false);
      // Solo el margen de arriba de la tarjeta (el producto va centrado).
      expect(coverRatio(L.card, L.badge!)).toBeLessThan(0.1);
      expect(L.badge!.y + L.badge!.h - L.card.y).toBeLessThanOrEqual(48);
      expect(L.card.h).toBeGreaterThanOrEqual(420);
    }
    // La decoración se corre a la izquierda del cartel.
    const wide = postLayout(1080, { w: 378, h: 360 });
    expect(wide.hero.x + wide.hero.size).toBeLessThanOrEqual(wide.badge!.x + 16);
    expect(postLayout(1080, null)).toMatchObject({ badge: null, card: { x: 560, y: 250, w: 430, h: 538 } });
  });

  it("historia 9:16: el cartel queda dentro y solo se apoya en el costado de la tarjeta", () => {
    const card = { x: 302, y: 820, w: 476, h: 580 };
    const b = storyBadge(1080, card, { w: 312, h: 334 });
    expect(b.x + b.w).toBeLessThanOrEqual(1080 - BADGE_EDGE);
    expect(b.x).toBeGreaterThan(card.x + card.w * 0.8);
    expect(coverRatio(card, b)).toBeLessThan(0.1);
  });
});

describe("carrusel del inicio (8.3.28)", () => {
  it("las diapositivas de muestra y una nueva pasan la validación", () => {
    for (const s of content.slides) expect(checkSlide(s)).toEqual([]);
    expect(checkSlide(newSlide("s-x"))).toEqual([]);
    expect(isSlideList(content.slides)).toBe(true);
  });

  it("texto largo, botón vacío e imagen sin descripción fallan con mensajes claros", () => {
    const s = newSlide("s-x");
    expect(checkSlide({ ...s, title: "x".repeat(SLIDE_LIMITS.title + 5) })).toEqual([`El título tiene ${SLIDE_LIMITS.title + 5} caracteres; el máximo es ${SLIDE_LIMITS.title}.`]);
    expect(checkSlide({ ...s, title: " " })).toEqual(["Escribí el título."]);
    expect(checkSlide({ ...s, ctaLabel: "" })).toEqual(["Escribí el texto del botón."]);
    expect(checkSlide({ ...s, image: { ...img, alt: "" } })).toEqual(["Describí la imagen en pocas palabras (texto alternativo)."]);
    expect(checkSlide({ ...s, image: img })).toEqual([]);
  });

  it("valida formato, peso y medidas de la imagen; el encuadre queda dentro de los límites", () => {
    expect(checkImageFile({ type: "image/gif", size: 10 })).toMatch(/JPG, PNG o WEBP/);
    expect(checkImageFile({ type: "image/png", size: 11 * 1024 * 1024 })).toMatch(/El máximo es 10 MB/);
    expect(checkImageFile({ type: "image/webp", size: 1024 })).toBeNull();
    expect(checkImageSize(300, 900)).toMatch(/al menos 400 px/);
    expect(checkImageSize(640, 480)).toBeNull();
    expect(frame({ x: -10, y: 140, zoom: 5 })).toEqual({ x: 0, y: 100, zoom: 2 });
  });

  it("datos guardados antes de 8.3.28 o rotos: la imagen inválida se descarta y queda la ilustración", () => {
    const broken = { ...newSlide("s-x"), image: { src: "https://externo/foto.jpg", alt: "x", x: 1, y: 1, zoom: 1 } } as CarouselSlide;
    const [fixed] = normalizeSlides([broken]);
    expect(fixed!.image).toBeUndefined();
    expect(fixed!.art).toBe("dachshund");
    expect(normalizeSlides(content.slides)).toEqual(content.slides);
    expect(isSlideList([broken])).toBe(false);
    expect(isSlideList([])).toBe(false);
  });
});
