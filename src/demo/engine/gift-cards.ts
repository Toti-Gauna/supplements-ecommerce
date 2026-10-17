import { formatARS } from "@/lib/money";
import { makeCode, normalizeCode } from "./codes";

/**
 * Gift cards con monto (R3b, aprobada). Pesos enteros, vencen a los 12 meses y su saldo se usa en el checkout como un
 * renglón de descuento ("Saldo de gift card"); nunca es un pago acreditado. Funciones puras: la fecha (`today`,
 * AAAA-MM-DD, de demoNow()/DEMO_TODAY) y el azar se pasan. En producción las emite y descuenta el servidor.
 */
export const GIFT_CARD_RULES = { min: 5_000, max: 300_000, step: 500, months: 12, presets: [15_000, 25_000, 40_000, 60_000] } as const;

/** Un uso del saldo. `key` identifica la compra (en la demo todos los pedidos usan el mismo código de muestra). */
export interface GiftCardRedemption { orderCode: string; amount: number; at: string; key?: string }

export interface GiftCardRecord {
  code: string;
  amount: number;
  balance: number;
  /** Día de emisión y de vencimiento (AAAA-MM-DD; vence al terminar ese día). */
  issuedAt: string;
  expires: string;
  from: string;
  to: string;
  orderCode?: string;
  /** Regalo con el que se mandó (REGALO-…). */
  giftCode?: string;
  redemptions: GiftCardRedemption[];
}

export type GiftCardStatus = "activa" | "en-uso" | "agotada" | "vencida";
export const GIFT_CARD_STATUS_LABEL: Record<GiftCardStatus, string> = { activa: "Sin usar", "en-uso": "Con saldo", agotada: "Usada completa", vencida: "Vencida" };

/** Problema del monto, o null si se puede emitir. */
export function giftCardAmountProblem(amount: number): string | null {
  const { min, max, step } = GIFT_CARD_RULES;
  if (!Number.isInteger(amount) || amount <= 0) return "Escribí un monto en pesos, sin centavos.";
  if (amount < min) return `El mínimo es ${formatARS(min)}.`;
  if (amount > max) return `El máximo es ${formatARS(max)}.`;
  if (amount % step) return `Que sea múltiplo de ${formatARS(step)}.`;
  return null;
}

/** Suma meses a un día AAAA-MM-DD; si el mes no tiene ese día, queda el último (31/1 + 1 mes = 28/2). */
export function addMonths(day: string, months: number): string {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  const total = y * 12 + (m - 1) + months;
  const year = Math.floor(total / 12), month = (total % 12) + 1;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

export const makeGiftCardCode = (random: () => number) => makeCode("GIFT", random);
export const normalizeGiftCardCode = (input: string) => normalizeCode("GIFT", input);

/** Gift card nueva con todo el saldo; null si el monto no es válido. */
export function issueGiftCard(input: { amount: number; code: string; today: string; from: string; to: string; orderCode?: string; giftCode?: string }): GiftCardRecord | null {
  if (giftCardAmountProblem(input.amount) || !normalizeGiftCardCode(input.code)) return null;
  const { amount, code, today, from, to, orderCode, giftCode } = input;
  return { code, amount, balance: amount, issuedAt: today, expires: addMonths(today, GIFT_CARD_RULES.months), from, to, ...(orderCode ? { orderCode } : {}), ...(giftCode ? { giftCode } : {}), redemptions: [] };
}

export function giftCardStatus(card: GiftCardRecord, today: string): GiftCardStatus {
  if (card.balance <= 0) return "agotada";
  if (today > card.expires) return "vencida";
  return card.balance < card.amount ? "en-uso" : "activa";
}

export type GiftCardCheck = { ok: true; card: GiftCardRecord } | { ok: false; message: string };

/** Busca y valida una gift card para usar en el checkout. */
export function checkGiftCard(cards: GiftCardRecord[], input: string, today: string): GiftCardCheck {
  const code = normalizeGiftCardCode(input);
  if (!code) return { ok: false, message: "Revisá el código: GIFT y 8 letras y números." };
  const card = cards.find((c) => c.code === code);
  if (!card) return { ok: false, message: "No encontramos esa gift card." };
  const status = giftCardStatus(card, today);
  if (status === "vencida") return { ok: false, message: `Esa gift card venció el ${card.expires.split("-").reverse().join("/")}.` };
  if (status === "agotada") return { ok: false, message: "Esa gift card ya no tiene saldo." };
  return { ok: true, card };
}

/** Cuánto de la gift card se usa en una compra: hasta el saldo y hasta lo que hay que pagar, nunca negativo. */
export const giftCardApplicable = (balance: number, payable: number) => Math.max(0, Math.min(Math.floor(balance), Math.floor(payable)));

export type RedeemResult = { ok: true; card: GiftCardRecord; used: number } | { ok: false; message: string };

/**
 * Descuenta `amount` del saldo para un pedido. Idempotente por pedido: el mismo pedido no descuenta dos veces. Nunca
 * deja saldo negativo (usa como mucho lo que queda) y no se usa vencida.
 */
export function redeemGiftCard(card: GiftCardRecord, input: { orderCode: string; amount: number; at: string; today: string; key?: string }): RedeemResult {
  const key = input.key ?? input.orderCode;
  const done = card.redemptions.find((r) => (r.key ?? r.orderCode) === key);
  if (done) return { ok: true, card, used: done.amount };
  if (input.today > card.expires) return { ok: false, message: "La gift card está vencida." };
  const used = giftCardApplicable(card.balance, input.amount);
  if (used <= 0) return { ok: false, message: card.balance <= 0 ? "La gift card no tiene saldo." : "No hay nada para descontar." };
  const redemption: GiftCardRedemption = { orderCode: input.orderCode, amount: used, at: input.at, ...(input.key ? { key: input.key } : {}) };
  return { ok: true, used, card: { ...card, balance: card.balance - used, redemptions: [...card.redemptions, redemption] } };
}
