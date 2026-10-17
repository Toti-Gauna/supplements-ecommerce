import { describe, expect, it } from "vitest";
import { checkHeroFeature, isHeroList, normalizeHeroList } from "@/demo/admin/content-hero";
import { checkImageFile, checkImageSize, FRAME_DEFAULT, HERO_IMAGE, imageFrame, isHeroImage } from "@/demo/admin/content-images";
import { migrateAdminData } from "@/demo/admin/migrate";
import { defaultAdminData } from "@/demo/admin/defaults";
import { defaultDemoData } from "@/demo/engine/source";
import type { HeroImage } from "@/demo/types";

const { products, content } = defaultDemoData();
const feature = content.hero[0]!;
const image: HeroImage = { src: "data:image/jpeg;base64,aGVsbG8=", alt: "Pote sobre el rack", frame: { ...FRAME_DEFAULT } };

describe("imagen propia del carrusel", () => {
  it("acepta los formatos de la demo y limita el peso antes de leer el archivo", () => {
    for (const type of HERO_IMAGE.types) expect(checkImageFile({ type, size: HERO_IMAGE.maxBytes })).toBeNull();
    expect(checkImageFile({ type: "image/svg+xml", size: 500 })).toMatch(/JPG, PNG o WEBP/);
    expect(checkImageFile({ type: "image/jpeg", size: HERO_IMAGE.maxBytes + 1 })).toMatch(/máximo es 10 MB/);
  });
  it("exige al menos 400 px en los dos lados antes de optimizar", () => {
    expect(checkImageSize(900, 400)).toBeNull();
    expect(checkImageSize(399, 1600)).toMatch(/400 px de lado/);
    expect(checkImageSize(0, 900)).not.toBeNull();
    expect(checkImageSize(NaN, 900)).not.toBeNull();
  });
  it("mantiene posición y zoom dentro del encuadre permitido", () => {
    expect(imageFrame({ x: -10, y: 110, zoom: 3 })).toEqual({ x: 0, y: 100, zoom: 2 });
    expect(imageFrame({ x: 15, y: 80, zoom: 1.35 })).toEqual({ x: 15, y: 80, zoom: 1.35 });
    expect(imageFrame({ x: Infinity, y: NaN, zoom: -1 })).toEqual({ x: 0, y: 0, zoom: 1 });
  });
  it("solo guarda data URLs locales y exige descripción alternativa de 3 a 120 caracteres", () => {
    expect(isHeroImage(image)).toBe(true);
    for (const src of ["https://example.com/photo.jpg", "data:image/svg+xml;base64,aGVsbG8=", "data:image/png;base64,"]) expect(isHeroImage({ ...image, src })).toBe(false);
    expect(isHeroImage({ ...image, frame: { x: 0, y: 0, zoom: NaN } })).toBe(false);
    expect(checkHeroFeature({ ...feature, image }, products)).toEqual([]);
    expect(checkHeroFeature({ ...feature, image: { ...image, alt: " " } }, products)).toEqual(["Describí la imagen en pocas palabras (texto alternativo)."]);
    expect(checkHeroFeature({ ...feature, image: { ...image, alt: "x".repeat(121) } }, products)[0]).toMatch(/máximo es 120/);
  });
  it("recupera textos, orden y visibilidad aunque una imagen guardada esté rota", () => {
    const edited = { ...feature, headline: "Mi titular editado", active: false, image: { src: "roto" } };
    expect(isHeroList([edited])).toBe(false);
    expect(normalizeHeroList([edited, content.hero[1]])).toEqual([{ ...feature, headline: "Mi titular editado", active: false }, content.hero[1]]);
    const framed = normalizeHeroList([{ ...feature, image: { ...image, frame: { x: 140, y: -10, zoom: 3 } } }]);
    expect(framed?.[0]?.image?.frame).toEqual({ x: 100, y: 0, zoom: 2 });
    expect(normalizeHeroList([{ id: "incompleto" }])).toBeNull();
  });
});

describe("migración del panel al carrusel con imágenes", () => {
  it("preserva todas las ediciones compatibles de suplementos, sin reiniciar contenido ni pedidos", () => {
    const saved = defaultAdminData();
    saved.data.content.hero[0] = { ...feature, headline: "Titular del dueño", image };
    saved.data.content.homeCta.text = "Texto editado";
    saved.data.products[0]!.basePrice = 12345;
    saved.orders[0]!.notes = ["Nota editada por el dueño"];
    for (const version of [10, 11, 12]) {
      const next = migrateAdminData(saved, version);
      expect(next).toEqual(saved);
      expect(next.data?.content.hero[0]?.image).toEqual(image);
    }
  });
  it("vuelve a los datos de suplementos ante el esquema antiguo o un estado roto", () => {
    expect(migrateAdminData(defaultAdminData(), 6).data?.content.hero).toEqual(content.hero);
    expect(migrateAdminData({ data: { products: [{ personalization: true }] } }, 12).data?.products[0]?.art).toBeDefined();
    expect(migrateAdminData({ data: { products: [null] } }, 12).data?.products[0]?.art).toBeDefined();
    expect(migrateAdminData(null, 12).data?.content.hero).toEqual(content.hero);
  });
});
