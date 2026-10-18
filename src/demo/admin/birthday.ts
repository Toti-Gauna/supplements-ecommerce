import { issueGiftCard, makeGiftCardCode, type GiftCardRecord } from "../engine/gift-cards";
import { encodeGift } from "../engine/gift-link";
import { makeGiftCode, type Gift } from "../engine/gifts";
import { addDays, daysBetween } from "../engine/workdays";
import type { CustomerProfile } from "../fixtures/customers";
import { formatARS } from "@/lib/money";
import { customerWhatsappLink } from "./repurchase-text";

/**
 * Regalo de cumpleaños (R4c). Un cumpleaños es MM-DD (sin año). Si cae en los próximos días, el panel ofrece armar un
 * regalo con el sistema de regalos de la tienda: una gift card de la casa (no es un pago: se descuenta en la próxima
 * compra, vence a los 12 meses) con su mensaje de WhatsApp y el link para abrirla. Uno por año. Puro y testeado.
 */
export const BIRTHDAY_GIFT_AMOUNT = 10_000;
/** Desde cuántos días antes aparece la acción en la ficha, y desde cuántos en "Hoy en tu tienda". */
export const BIRTHDAY_PROFILE_DAYS = 7;
export const BIRTHDAY_TODAY_DAYS = 3;

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Próximo cumpleaños en o después de `today` (AAAA-MM-DD). El 29/2 cuenta como 28/2. */
export function nextBirthday(mmdd: string, today: string): string {
  const [m, d] = mmdd.split("-").map(Number) as [number, number];
  const day = Math.min(d, MONTH_DAYS[m - 1] ?? 31);
  const year = Number(today.slice(0, 4));
  const at = (y: number) => `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return at(at(year) >= today ? year : year + 1);
}

/** Días hasta el próximo cumpleaños: 0 es hoy. null si el dato no es un MM-DD válido. */
export function daysToBirthday(mmdd: string | undefined, today: string): number | null {
  if (!mmdd || !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(mmdd)) return null;
  return daysBetween(today, nextBirthday(mmdd, today));
}

export interface BirthdayState {
  inDays: number;
  /** Día del cumpleaños (AAAA-MM-DD). */
  date: string;
  /** Ya se armó el regalo de este año. */
  done: boolean;
}

export function birthdayState(profile: Pick<CustomerProfile, "birthday" | "birthdayGift"> | undefined, today: string): BirthdayState | null {
  const inDays = daysToBirthday(profile?.birthday, today);
  if (inDays === null) return null;
  const date = addDays(today, inDays);
  return { inDays, date, done: profile?.birthdayGift?.year === Number(date.slice(0, 4)) };
}

export const birthdayWhen = (inDays: number) => (inDays === 0 ? "hoy" : inDays === 1 ? "mañana" : `en ${inDays} días`);

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** El regalo y su gift card: monto fijo, a nombre de quien cumple, de parte de la tienda. null si el monto no es válido. */
export function birthdayGift(input: { name: string; email?: string; store: string; today: string; now: string; random: () => number }): { gift: Gift; card: GiftCardRecord } | null {
  const to = firstName(input.name);
  const giftCode = makeGiftCode(input.random);
  const card = issueGiftCard({ amount: BIRTHDAY_GIFT_AMOUNT, code: makeGiftCardCode(input.random), today: input.today, from: input.store, to, giftCode });
  if (!card) return null;
  const gift: Gift = {
    code: giftCode, from: input.store, to, ...(input.email ? { toEmail: input.email.trim().toLowerCase() } : {}), occasion: "volta", kind: "gift-card", createdAt: input.now,
    message: `¡Feliz cumple, ${to}! Te dejamos ${formatARS(card.amount)} para tu próximo pote. Que lo disfrutes entrenando.`,
    item: { slug: "gift-card", name: `Gift card de ${formatARS(card.amount)}`, variant: `Vence el ${card.expires.split("-").reverse().join("/")}` },
    giftCard: { amount: card.amount, code: card.code, expires: card.expires, balance: card.balance },
  };
  return { gift, card };
}

/** Parámetro del link del regalo (lo que va después de `?g=`). */
export const giftParam = (gift: Gift) => encodeGift(gift);
export const giftPathFor = (param: string) => `/regalo/?g=${param}`;

/** Mensaje de WhatsApp con el link para abrir el regalo. */
export function birthdayMessage(name: string, link: string, store: string): string {
  return `¡Feliz cumple, ${firstName(name)}! De parte de todos en ${store} te dejamos un regalo: abrilo acá ${link}. Es una gift card de ${formatARS(BIRTHDAY_GIFT_AMOUNT)} para tu próxima compra.`;
}

export const birthdayLink = (phone: string | undefined, name: string, link: string, store: string) => customerWhatsappLink(phone, birthdayMessage(name, link, store));
