import { GIFT_LIMITS, cleanText, isOccasion, normalizeGiftCode, type Gift } from "./gifts";

/**
 * Link de un regalo (demo): el regalo viaja en el parámetro ?g= como base64url de un JSON compacto y versionado.
 * No lleva el email ni el precio; si se corta o se edita, no abre nada. En producción el link es una clave al azar.
 */
interface Wire { v: 1; c: string; f: string; t: string; m: string; o: string; i: { s: string; n: string; v: string; x?: string }; d: string; e?: string }

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): string | null {
  try {
    const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** Parámetro del link. No lleva el email ni el precio. */
export function encodeGift(gift: Gift): string {
  const wire: Wire = {
    v: 1, c: gift.code, f: gift.from, t: gift.to, m: gift.message, o: gift.occasion,
    i: { s: gift.item.slug, n: gift.item.name, v: gift.item.variant, ...(gift.item.detail ? { x: gift.item.detail } : {}) },
    d: gift.createdAt.slice(0, 10), ...(gift.eta ? { e: gift.eta } : {}),
  };
  return toBase64Url(JSON.stringify(wire));
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9-]{1,80}$/;

/** Lee el parámetro del link. Cualquier cosa rara (link cortado, editado a mano) devuelve null. */
export function decodeGift(param: string | null | undefined): Gift | null {
  if (!param || param.length > 3000) return null;
  const json = fromBase64Url(param);
  if (!json) return null;
  let w: Partial<Wire>;
  try { w = JSON.parse(json) as Partial<Wire>; } catch { return null; }
  if (!w || w.v !== 1 || typeof w.i !== "object" || !w.i) return null;
  const code = normalizeGiftCode(String(w.c ?? ""));
  const from = cleanText(w.f, GIFT_LIMITS.name), to = cleanText(w.t, GIFT_LIMITS.name);
  const name = cleanText(w.i.n, 80);
  if (!code || !from || !to || !name || !isOccasion(w.o) || !SLUG.test(String(w.i.s)) || !DAY.test(String(w.d))) return null;
  const detail = cleanText(w.i.x, 120);
  return {
    code, from, to, message: cleanText(w.m, GIFT_LIMITS.message), occasion: w.o,
    item: { slug: String(w.i.s), name, variant: cleanText(w.i.v, 80), ...(detail ? { detail } : {}) },
    createdAt: `${w.d}T12:00:00.000Z`, ...(typeof w.e === "string" && DAY.test(w.e) ? { eta: w.e } : {}),
  };
}

/** Ruta del link (relativa al sitio; la página le suma el origen y el basePath). */
export function giftPath(gift: Gift): string {
  return `/regalo/?g=${encodeGift(gift)}`;
}
