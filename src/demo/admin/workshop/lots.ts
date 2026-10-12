import { firstOutLot, formatExpiry } from "../../engine/lots";
import type { Product, Variant } from "../../types";

/**
 * Lote que sale de cada línea al preparar un pedido (Fase 7): el que vence primero y tiene unidades (FEFO, el mismo
 * `firstOutLot` del catálogo). Si la variante no tiene lotes cargados, el lote de muestra del producto; si tampoco
 * hay, un texto para controlarlo a mano.
 */
export interface LineLot {
  code: string | null;
  /** AAAA-MM, como está impreso en el envase. */
  expires: string | null;
  /** Texto que se confirma y queda en el pedido ("VL-2609-W · vence 11/2027"). */
  text: string;
}

export const NO_LOT_TEXT = "Sin lote cargado";

/** Lote que tiene que salir de esta línea: el primero que vence. */
export function lotFor(product: Product | undefined, variant: Variant | undefined): LineLot {
  const first = (variant && firstOutLot(variant)) ?? product?.lot;
  if (!first) return { code: null, expires: null, text: NO_LOT_TEXT };
  return { code: first.code, expires: first.expires, text: `${first.code} · vence ${formatExpiry(first.expires)}` };
}
