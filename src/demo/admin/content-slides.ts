import type { CarouselSlide, SlideImage } from "../types";

/**
 * Carrusel del inicio (8.3.28): límites de texto, reglas de la imagen propia y validación de cada diapositiva. La
 * imagen se procesa en el navegador y se guarda local (demo); en producción se sube y optimiza en el servidor.
 */
export const SLIDE_LIMITS = { title: 60, subtitle: 140, ctaLabel: 28, alt: 120 } as const;

/** Formatos y tamaños aceptados para la imagen de una diapositiva (documentados en el manual del dueño). */
export const SLIDE_IMAGE = {
  types: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 10 * 1024 * 1024,
  /** Lado más chico aceptado, en píxeles (con menos se ve borrosa en la tienda). */
  minSide: 400,
  /** Lado más largo después de optimizar (la imagen de la tienda mide como mucho 22 rem, ×2 para pantallas densas). */
  outSide: 900,
  quality: 0.8,
} as const;

export const FRAME_DEFAULT = { x: 50, y: 50, zoom: 1 } as const;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

/** Encuadre dentro de los límites (posición 0–100 %, zoom 1–2). */
export function frame(img: Pick<SlideImage, "x" | "y" | "zoom">) {
  return { x: clamp(img.x, 0, 100), y: clamp(img.y, 0, 100), zoom: clamp(img.zoom, 1, 2) };
}

/** Problema de formato o peso del archivo elegido, antes de leerlo. */
export function checkImageFile(file: { type: string; size: number }): string | null {
  if (!(SLIDE_IMAGE.types as readonly string[]).includes(file.type)) return "Ese archivo no es una imagen compatible. Subí JPG, PNG o WEBP.";
  if (file.size > SLIDE_IMAGE.maxBytes) return `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es 10 MB.`;
  return null;
}

/** Problema de medidas, ya leída la imagen. */
export function checkImageSize(width: number, height: number): string | null {
  return Math.min(width, height) < SLIDE_IMAGE.minSide ? `La imagen mide ${width} × ${height} px. Usá una de al menos ${SLIDE_IMAGE.minSide} px de lado para que no se vea borrosa.` : null;
}

export function newSlide(id: string): CarouselSlide {
  return { id, title: "Nueva diapositiva", subtitle: "", ctaLabel: "Ver más", ctaHref: "/categorias/", art: "dachshund", active: true };
}

/** Errores de una diapositiva para guardar (textos largos, botón vacío, imagen sin descripción). */
export function checkSlide(s: CarouselSlide): string[] {
  const errors: string[] = [];
  const len = (t: string) => [...t.trim()].length;
  if (!len(s.title)) errors.push("Escribí el título.");
  if (len(s.title) > SLIDE_LIMITS.title) errors.push(`El título tiene ${len(s.title)} caracteres; el máximo es ${SLIDE_LIMITS.title}.`);
  if (len(s.subtitle) > SLIDE_LIMITS.subtitle) errors.push(`La bajada tiene ${len(s.subtitle)} caracteres; el máximo es ${SLIDE_LIMITS.subtitle}.`);
  if (!len(s.ctaLabel)) errors.push("Escribí el texto del botón.");
  if (len(s.ctaLabel) > SLIDE_LIMITS.ctaLabel) errors.push(`El texto del botón tiene ${len(s.ctaLabel)} caracteres; el máximo es ${SLIDE_LIMITS.ctaLabel}.`);
  if (s.image && len(s.image.alt) < 3) errors.push("Describí la imagen en pocas palabras (texto alternativo).");
  if (s.image && len(s.image.alt) > SLIDE_LIMITS.alt) errors.push(`El texto alternativo tiene ${len(s.image.alt)} caracteres; el máximo es ${SLIDE_LIMITS.alt}.`);
  return errors;
}

export function isSlideImage(x: unknown): x is SlideImage {
  const i = x as SlideImage | null;
  return !!i && typeof i.src === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(i.src) && typeof i.alt === "string" && [i.x, i.y, i.zoom].every((n) => typeof n === "number");
}

export function isSlide(x: unknown): x is CarouselSlide {
  const s = x as CarouselSlide | null;
  return !!s && ["id", "title", "subtitle", "ctaLabel", "ctaHref", "art"].every((k) => typeof (s as unknown as Record<string, unknown>)[k] === "string") && (s.image === undefined || isSlideImage(s.image));
}

export const isSlideList = (x: unknown): x is CarouselSlide[] => Array.isArray(x) && x.length > 0 && x.every(isSlide);

/** Datos guardados antes de 8.3.28 o rotos: una imagen inválida se descarta y queda la ilustración. */
export function normalizeSlides(list: CarouselSlide[]): CarouselSlide[] {
  return list.map((s) => {
    if (s.image === undefined || isSlideImage(s.image)) return s;
    const rest = { ...s };
    delete rest.image;
    return rest;
  });
}

/** ID nuevo para una diapositiva (fuera del render: usa la hora). */
export const newSlideId = () => `s-${Date.now().toString(36)}`;
