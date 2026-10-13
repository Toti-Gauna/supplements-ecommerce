import type { HeroImage, HeroImageFrame } from "../types";

/** Reglas de las imágenes propias del carrusel: se procesan y guardan solo en el navegador. */
export const HERO_IMAGE = {
  types: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 10 * 1024 * 1024,
  minSide: 400,
  outSide: 900,
  quality: 0.8,
  altMax: 120,
} as const;
export const FRAME_DEFAULT: HeroImageFrame = { x: 50, y: 50, zoom: 1 };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

/** Posición 0–100 %, zoom 1–2. */
export function imageFrame(value: HeroImageFrame): HeroImageFrame {
  return { x: clamp(value.x, 0, 100), y: clamp(value.y, 0, 100), zoom: clamp(value.zoom, 1, 2) };
}

export function checkImageFile(file: { type: string; size: number }): string | null {
  if (!(HERO_IMAGE.types as readonly string[]).includes(file.type)) return "Ese archivo no es una imagen compatible. Subí JPG, PNG o WEBP.";
  if (file.size > HERO_IMAGE.maxBytes) return `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es 10 MB.`;
  return null;
}

export function checkImageSize(width: number, height: number): string | null {
  return ![width, height].every(Number.isFinite) || Math.min(width, height) < HERO_IMAGE.minSide
    ? `La imagen mide ${width} × ${height} px. Usá una de al menos ${HERO_IMAGE.minSide} px de lado para que no se vea borrosa.` : null;
}

export function isHeroImage(value: unknown): value is HeroImage {
  const i = value as HeroImage | null;
  return !!i && typeof i.src === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(i.src)
    && typeof i.alt === "string" && !!i.frame && [i.frame.x, i.frame.y, i.frame.zoom].every((n) => typeof n === "number" && Number.isFinite(n));
}

/** Una imagen guardada rota vuelve al envase SVG, conservando el resto de la diapositiva. */
export function normalizeHeroImage(value: unknown): HeroImage | undefined {
  return isHeroImage(value) ? { ...value, frame: imageFrame(value.frame) } : undefined;
}

export function checkImage(image: HeroImage): string[] {
  const errors: string[] = [];
  if (!isHeroImage(image)) errors.push("La imagen guardada no es válida. Quitala y volvé a subirla.");
  const length = [...image.alt.trim()].length;
  if (length < 3) errors.push("Describí la imagen en pocas palabras (texto alternativo).");
  if (length > HERO_IMAGE.altMax) errors.push(`El texto alternativo tiene ${length} caracteres; el máximo es ${HERO_IMAGE.altMax}.`);
  return errors;
}
