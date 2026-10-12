import type { Product, Variant } from "../../types";

/**
 * Lote que sale de cada línea al preparar un pedido (Fase 7): el que vence primero. Lee los lotes de la variante si
 * existen; si no, el lote de muestra del producto; si tampoco hay, un texto para controlarlo a mano. La lectura es
 * tolerante a la forma de los lotes por variante (los suma Catálogo): solo necesita código, vencimiento y cantidad.
 */
export interface LotLike { code: string; expires: string; qty?: number }

export interface LineLot {
  code: string | null;
  /** AAAA-MM o AAAA-MM-DD. */
  expires: string | null;
  /** Texto que se confirma y queda en el pedido ("VL-2609-W · vence 11/2027"). */
  text: string;
}

export const NO_LOT_TEXT = "Sin lote cargado";

type RawLot = { code?: unknown; expires?: unknown; expiresAt?: unknown; expiry?: unknown; qty?: unknown; stock?: unknown; units?: unknown };

function normalize(raw: unknown): LotLike | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawLot;
  const expires = [r.expires, r.expiresAt, r.expiry].find((x): x is string => typeof x === "string");
  if (typeof r.code !== "string" || !expires) return null;
  const qty = [r.qty, r.stock, r.units].find((x): x is number => typeof x === "number");
  return { code: r.code, expires, ...(qty !== undefined ? { qty } : {}) };
}

/** Lotes con unidades de la variante, del que vence primero al último. */
export function variantLots(variant: Variant | undefined): LotLike[] {
  const raw = (variant as { lots?: unknown } | undefined)?.lots;
  if (!Array.isArray(raw)) return [];
  return raw.map(normalize).filter((l): l is LotLike => !!l && (l.qty === undefined || l.qty > 0)).sort((a, b) => a.expires.localeCompare(b.expires));
}

/** "2027-11" → "11/2027"; "2027-11-30" → "30/11/2027". */
export function formatExpiry(expires: string): string {
  return expires.split("-").reverse().join("/");
}

/** Lote que tiene que salir de esta línea: el primero que vence. */
export function lotFor(product: Product | undefined, variant: Variant | undefined): LineLot {
  const first = variantLots(variant)[0] ?? product?.lot;
  if (!first) return { code: null, expires: null, text: NO_LOT_TEXT };
  return { code: first.code, expires: first.expires, text: `${first.code} · vence ${formatExpiry(first.expires)}` };
}
