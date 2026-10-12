import { bestSellers, fromPrice, getProduct } from "../../engine/catalog";
import { pricePerServing } from "../../engine/servings";
import { offerPrice, themeOffer, themeProducts, type ThemeOffer } from "../../engine/themes";
import type { ArtKey, PackStyle, Product, SeasonalTheme } from "../../types";
import { lotLabel } from "../lot-label";

/** Textos editables de una pieza (arrancan con los de la plantilla y la temática; el dueño los cambia). */
export interface StudioTexts {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

/** Producto listo para dibujar: precios calculados por el engine (pesos enteros) y los datos del rótulo. */
export interface StudioProduct {
  slug: string;
  name: string;
  short: string;
  brand: string;
  categorySlug: string;
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
  photoDataUrl?: string;
  price: number;
  /** Precio con el cupón de la temática (solo porcentaje sin mínimo); null si no aplica. */
  offerPrice: number | null;
  /** Servicios de la presentación que se muestra (la del precio "desde"). */
  servings?: number;
  /** Pesos por servicio de esa presentación. */
  perServing?: number;
  /** "LOTE VL-2610-C · VTO 03/2028". */
  lot?: string;
  /** Cómo se toma (de la ficha). */
  usage?: string;
}

export const MAX_STUDIO_PRODUCTS = 3;

/** Oferta de la temática (su cupón vigente) o ninguna. */
export function studioOffer(theme: SeasonalTheme | null): ThemeOffer | null {
  return theme ? themeOffer(theme) : null;
}

/** Productos de la oferta: los de la temática, o los más vendidos sin temática. */
export function offerProducts(theme: SeasonalTheme | null): string[] {
  const list = theme ? themeProducts(theme) : bestSellers(MAX_STUDIO_PRODUCTS);
  return list.slice(0, MAX_STUDIO_PRODUCTS).map((p) => p.slug);
}

export function toStudioProduct(product: Product, offer: ThemeOffer | null): StudioProduct {
  const price = fromPrice(product);
  // La presentación del precio "desde" (la más barata) es la que da los servicios y el precio por servicio.
  const variant = [...product.variants].sort((a, b) => a.priceDelta - b.priceDelta)[0];
  const servings = variant?.servings && variant.servings > 1 ? variant.servings : undefined;
  const perServing = pricePerServing(price, servings) ?? undefined;
  const lot = lotLabel(product);
  return {
    slug: product.slug, name: product.name, short: product.short, brand: product.brand, categorySlug: product.categorySlug, art: product.art, pack: product.pack,
    tint: product.variants[0]?.colorHex, photoDataUrl: product.photoDataUrl, price, offerPrice: offerPrice(price, offer),
    ...(servings ? { servings } : {}), ...(perServing ? { perServing } : {}), ...(lot ? { lot } : {}), ...(product.usage ? { usage: product.usage.text } : {}),
  };
}

/** Productos elegidos (hasta `max`, en orden), omitiendo los que ya no existen. */
export function studioProducts(slugs: string[], offer: ThemeOffer | null, max = MAX_STUDIO_PRODUCTS): StudioProduct[] {
  return slugs.slice(0, max).flatMap((slug) => {
    const p = getProduct(slug);
    return p ? [toStudioProduct(p, offer)] : [];
  });
}
