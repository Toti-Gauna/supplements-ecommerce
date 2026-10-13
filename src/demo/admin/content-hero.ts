import type { HeroFeature, Product } from "../types";
import { checkImage, isHeroImage, normalizeHeroImage } from "./content-images";

/**
 * Carrusel del inicio: conserva los destacados del rack, sus límites de texto y hasta cuatro diapositivas propias.
 */
export const HERO_LIMITS = { headline: 40, pitch: 120, max: 4 } as const;

export function newHeroFeature(id: string, productSlug: string): HeroFeature {
  return { id, productSlug, headline: "Nuevo destacado", pitch: "", active: true };
}

const len = (t: string) => [...t.trim()].length;

/** Errores de un destacado para guardar (producto que ya no está, titular vacío o largo, bajada larga). */
export function checkHeroFeature(f: HeroFeature, products: Product[]): string[] {
  const errors: string[] = [];
  const product = products.find((p) => p.slug === f.productSlug);
  if (!product) errors.push("Elegí un producto del catálogo.");
  else if (product.active === false) errors.push(`“${product.name}” está oculto en la tienda: elegí otro o mostralo.`);
  if (!len(f.headline)) errors.push("Escribí el titular.");
  if (len(f.headline) > HERO_LIMITS.headline) errors.push(`El titular tiene ${len(f.headline)} caracteres; el máximo es ${HERO_LIMITS.headline}.`);
  if (len(f.pitch) > HERO_LIMITS.pitch) errors.push(`La bajada tiene ${len(f.pitch)} caracteres; el máximo es ${HERO_LIMITS.pitch}.`);
  if (f.image) errors.push(...checkImage(f.image));
  return errors;
}

/** Errores de la lista entera: al menos uno visible y no más de cuatro. */
export function checkHeroList(list: HeroFeature[]): string[] {
  const errors: string[] = [];
  if (!list.some((f) => f.active !== false)) errors.push("Dejá al menos un destacado visible: es lo primero que se ve en la tienda.");
  if (list.length > HERO_LIMITS.max) errors.push(`Hay ${list.length} destacados; el máximo es ${HERO_LIMITS.max}.`);
  return errors;
}

export function isHeroFeature(x: unknown): x is HeroFeature {
  const f = x as HeroFeature | null;
  return !!f && ["id", "productSlug", "headline", "pitch"].every((k) => typeof (f as unknown as Record<string, unknown>)[k] === "string")
    && (f.image === undefined || isHeroImage(f.image));
}

export const isHeroList = (x: unknown): x is HeroFeature[] => Array.isArray(x) && x.length > 0 && x.every(isHeroFeature);

/** Sanea únicamente la imagen; no cambia textos, productos, IDs, orden ni visibilidad ya editados. */
export function normalizeHeroList(value: unknown): HeroFeature[] | null {
  if (!Array.isArray(value)) return null;
  const list = value.map((feature) => {
    if (!feature || typeof feature !== "object" || feature.image === undefined) return feature;
    const { image, ...rest } = feature;
    const normalized = normalizeHeroImage(image);
    return normalized ? { ...rest, image: normalized } : rest;
  });
  return isHeroList(list) ? list : null;
}

/** ID nuevo para un destacado (fuera del render: usa la hora). */
export const newHeroId = () => `h-${Date.now().toString(36)}`;
