import { GIFT_LIMITS, cleanText, isOccasion, normalizeGiftCode, type Gift, type GiftItem } from "./gifts";
import { cleanGiftOptions } from "./gift-options";
import { normalizeGiftCardCode } from "./gift-cards";

/**
 * Link de un regalo (demo): el regalo viaja en el parámetro ?g= como base64url de un JSON compacto y versionado.
 * No lleva el email ni el precio; si se corta o se edita, no abre nada. En producción el link es una clave al azar.
 * v2 (R3b) suma el tipo (producto, stack o gift card), la apertura, el diseño, lo abierto y la gift card.
 */
interface WireItem { s: string; n: string; v: string; x?: string; vi?: string }
interface Wire {
  v: 1 | 2; c: string; f: string; t: string; m: string; o: string; i: WireItem; d: string; e?: string;
  k?: "s" | "g"; is?: WireItem[]; op?: string; lc?: string; cd?: string; oc?: string; gc?: { a: number; c: string; x: string };
}

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

const toWireItem = (i: GiftItem): WireItem => ({ s: i.slug, n: i.name, v: i.variant, ...(i.detail ? { x: i.detail } : {}), ...(i.variantId ? { vi: i.variantId } : {}) });

/** Parámetro del link. No lleva el email ni el precio (de una gift card, sí el monto: es el regalo). */
export function encodeGift(gift: Gift): string {
  const oc = `${gift.openChoice?.flavor ? "f" : ""}${gift.openChoice?.size ? "s" : ""}`;
  const wire: Wire = {
    v: 2, c: gift.code, f: gift.from, t: gift.to, m: gift.message, o: gift.occasion, i: toWireItem(gift.item),
    d: gift.createdAt.slice(0, 10), ...(gift.eta ? { e: gift.eta } : {}),
    ...(gift.kind === "stack" ? { k: "s" as const } : gift.kind === "gift-card" ? { k: "g" as const } : {}),
    ...(gift.items?.length ? { is: gift.items.map(toWireItem) } : {}),
    ...(gift.opening ? { op: gift.opening } : {}), ...(gift.lockerCode ? { lc: gift.lockerCode } : {}), ...(gift.cardDesign ? { cd: gift.cardDesign } : {}),
    ...(oc ? { oc } : {}), ...(gift.giftCard ? { gc: { a: gift.giftCard.amount, c: gift.giftCard.code, x: gift.giftCard.expires } } : {}),
  };
  return toBase64Url(JSON.stringify(wire));
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9-]{1,80}$/;
const ID = /^[a-z0-9-]{1,80}$/i;

function readItem(w: Partial<WireItem> | undefined): GiftItem | null {
  if (!w || typeof w !== "object") return null;
  const name = cleanText(w.n, 80);
  if (!name || !SLUG.test(String(w.s))) return null;
  const detail = cleanText(w.x, 120);
  return { slug: String(w.s), name, variant: cleanText(w.v, 80), ...(detail ? { detail } : {}), ...(typeof w.vi === "string" && ID.test(w.vi) ? { variantId: w.vi } : {}) };
}

/** Los campos de R3b (v2): tipo, stack, opciones, lo abierto y la gift card. Lo inválido se ignora. */
function readExtras(w: Partial<Wire>): Partial<Gift> | null {
  const items = Array.isArray(w.is) ? w.is.slice(0, 8).map(readItem) : [];
  if (items.some((i) => !i)) return null;
  const card = w.gc && Number.isInteger(w.gc.a) && w.gc.a > 0 && DAY.test(String(w.gc.x)) ? normalizeGiftCardCode(String(w.gc.c)) : null;
  if (w.k === "g" && !card) return null;
  const oc = typeof w.oc === "string" ? w.oc : "";
  return {
    ...(w.k === "s" ? { kind: "stack" as const } : w.k === "g" ? { kind: "gift-card" as const } : {}),
    ...(items.length ? { items: items as GiftItem[] } : {}),
    ...cleanGiftOptions({ opening: w.op, lockerCode: w.lc, cardDesign: w.cd }),
    ...(oc.includes("f") || oc.includes("s") ? { openChoice: { ...(oc.includes("f") ? { flavor: true } : {}), ...(oc.includes("s") ? { size: true } : {}) } } : {}),
    ...(card && w.gc ? { giftCard: { amount: w.gc.a, code: card, expires: w.gc.x, balance: w.gc.a } } : {}),
  };
}

/** Lee el parámetro del link. Cualquier cosa rara (link cortado, editado a mano) devuelve null. */
export function decodeGift(param: string | null | undefined): Gift | null {
  if (!param || param.length > 4000) return null;
  const json = fromBase64Url(param);
  if (!json) return null;
  let w: Partial<Wire>;
  try { w = JSON.parse(json) as Partial<Wire>; } catch { return null; }
  if (!w || (w.v !== 1 && w.v !== 2)) return null;
  const code = normalizeGiftCode(String(w.c ?? ""));
  const from = cleanText(w.f, GIFT_LIMITS.name), to = cleanText(w.t, GIFT_LIMITS.name);
  const item = readItem(w.i);
  if (!code || !from || !to || !item || !isOccasion(w.o) || !DAY.test(String(w.d))) return null;
  const extras = w.v === 2 ? readExtras(w) : {};
  if (!extras) return null;
  return {
    code, from, to, message: cleanText(w.m, GIFT_LIMITS.message), occasion: w.o, item,
    createdAt: `${w.d}T12:00:00.000Z`, ...(typeof w.e === "string" && DAY.test(w.e) ? { eta: w.e } : {}), ...extras,
  };
}

/** Ruta del link (relativa al sitio; la página le suma el origen y el basePath). */
export function giftPath(gift: Gift): string {
  return `/regalo/?g=${encodeGift(gift)}`;
}
