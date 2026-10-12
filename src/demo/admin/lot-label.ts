import { firstOutLot, formatExpiry } from "../engine/lots";
import type { Product, Variant } from "../types";

/**
 * Rótulo de laboratorio del lote: "LOTE VL-2610-C · VTO 03/2028". Lo usan los emails (cuando el pedido ya se armó)
 * y el Estudio de contenido. Con la variante, el lote que sale primero (FEFO, igual que el control de lote); si no
 * tiene lotes cargados, el de muestra del producto.
 */
export function lotLabel(product: Pick<Product, "lot"> | undefined, variant?: Variant): string | undefined {
  const lot = (variant && firstOutLot(variant)) ?? product?.lot;
  return lot ? `LOTE ${lot.code} · VTO ${formatExpiry(lot.expires)}` : undefined;
}
