import { bestSellers, fromPrice, getProduct } from "../../engine/catalog";
import { offerPrice, themeOffer, themeProducts, type ThemeOffer } from "../../engine/themes";
import { STUDIO_BRAND } from "../../fixtures/studio";
import type { ArtKey, Product, SeasonalTheme } from "../../types";

/** Textos editables de una pieza (arrancan con los de la temática; el dueño los cambia). */
export interface StudioTexts {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

/** Producto listo para dibujar: precio y precio con el cupón calculados por el engine (pesos enteros). */
export interface StudioProduct {
  slug: string;
  name: string;
  short: string;
  categorySlug: string;
  art: ArtKey;
  tint?: string;
  photoDataUrl?: string;
  personalizable: boolean;
  price: number;
  /** Precio con el cupón de la temática (solo porcentaje sin mínimo); null si no aplica. */
  offerPrice: number | null;
}

export const MAX_STUDIO_PRODUCTS = 3;

export function studioTexts(theme: SeasonalTheme | null): StudioTexts {
  if (!theme) return { eyebrow: STUDIO_BRAND.eyebrow, title: STUDIO_BRAND.title, subtitle: STUDIO_BRAND.subtitle, cta: STUDIO_BRAND.cta };
  return { eyebrow: `Especial ${theme.name}`, title: theme.headline, subtitle: theme.subtitle, cta: STUDIO_BRAND.cta };
}

/** Oferta de la temática (su cupón vigente) o ninguna. */
export function studioOffer(theme: SeasonalTheme | null): ThemeOffer | null {
  return theme ? themeOffer(theme) : null;
}

/** Productos sugeridos: los de la oferta de la temática, o los más vendidos sin temática. */
export function suggestedProducts(theme: SeasonalTheme | null): string[] {
  const list = theme ? themeProducts(theme) : bestSellers(MAX_STUDIO_PRODUCTS);
  return list.slice(0, MAX_STUDIO_PRODUCTS).map((p) => p.slug);
}

export function toStudioProduct(product: Product, offer: ThemeOffer | null): StudioProduct {
  const price = fromPrice(product);
  return {
    slug: product.slug, name: product.name, short: product.short, categorySlug: product.categorySlug, art: product.art,
    tint: product.variants[0]?.colorHex, photoDataUrl: product.photoDataUrl, personalizable: Boolean(product.personalization),
    price, offerPrice: offerPrice(price, offer),
  };
}

/** Productos elegidos (hasta 3, en orden), omitiendo los que ya no existen. */
export function studioProducts(slugs: string[], offer: ThemeOffer | null): StudioProduct[] {
  return slugs.slice(0, MAX_STUDIO_PRODUCTS).flatMap((slug) => {
    const p = getProduct(slug);
    return p ? [toStudioProduct(p, offer)] : [];
  });
}
