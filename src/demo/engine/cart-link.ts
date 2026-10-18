import type { Product } from "../types";

/**
 * Link de recompra (R4c): lleva a la tienda con el bolso ya cargado (`/recompra/?bolso=slug.variante.cantidad,…`). Al
 * abrirlo, la tienda valida cada línea contra el catálogo y el stock de ese momento y suma lo que se puede comprar.
 * Mismo patrón que el link del estante (`stack-link.ts`). No lleva precios ni datos de la persona.
 */
export const CART_LINK_PATH = "/recompra/";
export const CART_LINK_PARAM = "bolso";
/** Tope por línea, el mismo que tiene el carrito. */
export const CART_LINK_MAX_QTY = 10;

export interface LinkLine { slug: string; variantId: string; qty: number }

/** `slug.variante.cantidad,…` (la cantidad va siempre, entera y entre 1 y el tope). */
export function encodeCartLink(lines: LinkLine[]): string {
  const clean = lines.filter((l) => l.slug && l.variantId).map((l) => [l.slug, l.variantId, Math.min(CART_LINK_MAX_QTY, Math.max(1, Math.round(l.qty) || 1))].join("."));
  return clean.length ? `${CART_LINK_PARAM}=${clean.join(",")}` : "";
}

/** Ruta del link (relativa al sitio: el panel le suma el origen y el basePath). */
export function cartLinkPath(lines: LinkLine[]): string {
  const query = encodeCartLink(lines);
  return query ? `${CART_LINK_PATH}?${query}` : CART_LINK_PATH;
}

export interface DecodedCart { lines: LinkLine[]; /** Líneas del link que ya no se pueden comprar (no existe, pausado o sin stock). */ dropped: number }

/** Lee el parámetro `bolso`: se queda con lo que existe, está activo y tiene stock; una misma variante se suma una sola vez. */
export function decodeCartLink(raw: string | null | undefined, catalog: Product[]): DecodedCart {
  const out: LinkLine[] = [];
  let dropped = 0;
  if (!raw || raw.length > 2000) return { lines: out, dropped };
  for (const part of raw.split(",").slice(0, 20)) {
    const [slug, variantId, qtyRaw] = part.split(".");
    const product = catalog.find((p) => p.slug === slug && p.active !== false);
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant || variant.stock === 0 || out.some((l) => l.variantId === variant.id)) { dropped += 1; continue; }
    const asked = Number.isInteger(Number(qtyRaw)) && Number(qtyRaw) >= 1 ? Number(qtyRaw) : 1;
    out.push({ slug: product.slug, variantId: variant.id, qty: Math.min(asked, CART_LINK_MAX_QTY, variant.stock < 0 ? CART_LINK_MAX_QTY : variant.stock) });
  }
  return { lines: out, dropped };
}
