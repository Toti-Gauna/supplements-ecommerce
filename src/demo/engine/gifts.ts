import { seasonalThemes } from "../fixtures/themes";
import type { GiftOccasion } from "../types";
import type { LineGift } from "./cart-types";
import { makeCode, normalizeCode } from "./codes";
import { cleanGiftOptions, giftOptionsProblem, type GiftOpening, type OpenChoice } from "./gift-options";

/**
 * Regalos (pedido de Ignacio, fuera de la especificación; la spec lo listaba como "regalá uno" fuera de alcance).
 * Quien compra marca el producto como regalo; al confirmar se genera un código y un link. Quien lo recibe lo abre
 * con el link, con el código o desde su cuenta. Funciones puras: sin fecha ni azar propios (se pasan).
 *
 * Demo: el link lleva el regalo adentro (sin servidor no hay dónde guardarlo) y el código se resuelve en este
 * navegador. En producción el link y el código son una clave al azar y el servidor guarda el regalo.
 */

export const GIFT_LIMITS = { name: 40, message: 240 } as const;

/** Lo que recibe quien abre el regalo: nunca el precio. */
export interface GiftItem {
  slug: string;
  name: string;
  variant: string;
  /** Detalle para quien recibe ("30 servicios"). */
  detail?: string;
  /** Variante pagada (con sabor o tamaño abiertos, la de referencia del precio; ver engine/gift-choice.ts). */
  variantId?: string;
}

/** Qué se regala: un producto, un stack (pack) o una gift card con monto. */
export type GiftKind = "producto" | "stack" | "gift-card";

export interface Gift {
  code: string;
  from: string;
  to: string;
  toEmail?: string;
  message: string;
  occasion: GiftOccasion;
  item: GiftItem;
  createdAt: string;
  /** Fecha estimada de entrega (AAAA-MM-DD). */
  eta?: string;
  orderCode?: string;
  /** Producto (por defecto), stack o gift card. */
  kind?: GiftKind;
  /** Stack: todos los productos que van adentro (`item` es el nombre del stack). */
  items?: GiftItem[];
  opening?: GiftOpening; // apertura elegida por quien regala
  lockerCode?: string; // 4 dígitos; por defecto el día y mes del regalo (DDMM)
  cardDesign?: string; // id del diseño de tarjeta
  openChoice?: OpenChoice; // sabor/tamaño abiertos para quien recibe
  chosenVariantId?: string; // la variante que eligió quien recibe
  giftCard?: { amount: number; code: string; expires: string; balance: number }; // gift card con monto (pesos enteros)
}

const OCCASIONS = new Set<string>(["volta", ...seasonalThemes.map((t) => t.id)]);
export function isOccasion(value: unknown): value is GiftOccasion {
  return typeof value === "string" && OCCASIONS.has(value);
}

/** Un regalo guardado con una temática que ya no existe (se borró del panel o del código) abre la bolsa VOLTA. */
export function withKnownOccasion<T extends { occasion: GiftOccasion }>(gift: T): T {
  return isOccasion(gift.occasion) ? gift : { ...gift, occasion: "volta" };
}

/** Texto limpio: sin caracteres de control, espacios simples y con tope (cuenta emojis como un carácter). */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const flat = value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return Array.from(flat).slice(0, max).join("").trim();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Problema del formulario de regalo, o null si está listo. */
export function giftProblem(draft: Partial<LineGift>): string | null {
  if (!cleanText(draft.to, GIFT_LIMITS.name)) return "Escribí para quién es el regalo.";
  if (!cleanText(draft.from, GIFT_LIMITS.name)) return "Escribí de parte de quién es.";
  if (draft.toEmail && !EMAIL.test(draft.toEmail.trim())) return "El email no parece válido.";
  if (typeof draft.message === "string" && Array.from(draft.message.trim()).length > GIFT_LIMITS.message) return `El mensaje puede tener hasta ${GIFT_LIMITS.message} caracteres.`;
  return giftOptionsProblem(draft);
}

/** Normaliza lo que cargó la persona (antes de guardarlo en el carrito). */
export function cleanGift(draft: LineGift): LineGift {
  const toEmail = draft.toEmail?.trim().toLowerCase();
  return {
    to: cleanText(draft.to, GIFT_LIMITS.name),
    from: cleanText(draft.from, GIFT_LIMITS.name),
    ...(toEmail ? { toEmail } : {}),
    message: cleanText(draft.message, GIFT_LIMITS.message),
    occasion: isOccasion(draft.occasion) ? draft.occasion : "volta",
    ...cleanGiftOptions(draft),
    ...(draft.openChoice && (draft.openChoice.flavor || draft.openChoice.size) ? { openChoice: { ...(draft.openChoice.flavor ? { flavor: true } : {}), ...(draft.openChoice.size ? { size: true } : {}) } } : {}),
  };
}

// ---------- Código: REGALO-XXXX-XXXX (base 32 de Crockford, el último es dígito verificador; ver engine/codes.ts) ----------

/** Código nuevo. `random` devuelve [0, 1). */
export function makeGiftCode(random: () => number): string {
  return makeCode("REGALO", random);
}

/** Acepta lo que escriba la persona (minúsculas, sin guiones, O por 0, I o L por 1). Null si no es un código válido. */
export function normalizeGiftCode(input: string): string | null {
  return normalizeCode("REGALO", input);
}

/**
 * Regalos que ve una cuenta: los que llegaron a su email (de muestra o enviados desde este navegador) y los que
 * guardó al abrir un link o un código. Sin repetidos, el más nuevo primero.
 */
export function giftsFor(email: string | undefined, { addressed, saved }: { addressed: Gift[]; saved: Gift[] }): Gift[] {
  const mail = email?.trim().toLowerCase();
  const mine = mail ? addressed.filter((g) => g.toEmail === mail) : [];
  const seen = new Set<string>();
  return [...saved, ...mine].filter((g) => !seen.has(g.code) && Boolean(seen.add(g.code))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
