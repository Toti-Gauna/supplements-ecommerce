import type { Product } from "../types";

/**
 * Rótulo de laboratorio del lote: "LOTE VL-2610-C · VTO 03/2028". Lo usan los emails (cuando el pedido ya se armó)
 * y el Estudio de contenido. Si el lote pasa a ser por variante, este es el único lugar que cambia.
 */
export function lotLabel(product: Pick<Product, "lot"> | undefined): string | undefined {
  const lot = product?.lot;
  if (!lot) return undefined;
  const [y, m] = lot.expires.split("-");
  return `LOTE ${lot.code} · VTO ${m}/${y}`;
}
