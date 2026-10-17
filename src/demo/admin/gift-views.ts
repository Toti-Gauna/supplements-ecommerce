import { giftCardStatus, type GiftCardRecord, type GiftCardStatus } from "../engine/gift-cards";
import { giftStatusLabel, GIFT_STATUS_ORDER, type GiftRecord, type GiftStatus } from "../engine/gift-status";

/**
 * Panel → Regalos (R3b): filas y números de las gift cards (emitidas, canjeadas, saldo y vencimiento) y de los regalos
 * (estado y lo que eligió quien lo recibió). Puro: `today` es DEMO_TODAY.
 */
export interface GiftCardRow {
  card: GiftCardRecord;
  status: GiftCardStatus;
  /** Lo usado hasta hoy. */
  used: number;
  /** Días hasta el vencimiento (negativo si ya venció). */
  daysLeft: number;
}

const dayDiff = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);

/** Vence pronto: con saldo y en los próximos 30 días. */
export const EXPIRING_DAYS = 30;

export function giftCardRows(cards: GiftCardRecord[], today: string): GiftCardRow[] {
  return cards
    .map((card) => ({ card, status: giftCardStatus(card, today), used: card.amount - card.balance, daysLeft: dayDiff(today, card.expires) }))
    .sort((a, b) => b.card.issuedAt.localeCompare(a.card.issuedAt));
}

export interface GiftCardStats {
  issued: number;
  issuedAmount: number;
  /** Saldo vivo: lo que todavía se puede usar (sin las vencidas). */
  outstanding: number;
  redeemedAmount: number;
  /** Cuántas se usaron al menos una vez. */
  redeemedCount: number;
  expiringSoon: number;
  expired: number;
}

export function giftCardStats(cards: GiftCardRecord[], today: string): GiftCardStats {
  const rows = giftCardRows(cards, today);
  const live = rows.filter((r) => r.status === "activa" || r.status === "en-uso");
  return {
    issued: rows.length,
    issuedAmount: rows.reduce((s, r) => s + r.card.amount, 0),
    outstanding: live.reduce((s, r) => s + r.card.balance, 0),
    redeemedAmount: rows.reduce((s, r) => s + r.used, 0),
    redeemedCount: rows.filter((r) => r.used > 0).length,
    expiringSoon: live.filter((r) => r.daysLeft <= EXPIRING_DAYS).length,
    expired: rows.filter((r) => r.status === "vencida").length,
  };
}

export interface GiftRecordRow {
  record: GiftRecord;
  statusLabel: string;
  /** Paso del estado (0 enviado … 3 canjeado), para ordenar y para la barra de progreso. */
  step: number;
  /** "Chocolate · 2 lb", "Falta elegir" o "—" si no tenía nada abierto. */
  choice: string;
}

export function giftRecordRows(records: GiftRecord[]): GiftRecordRow[] {
  return [...records]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((record) => {
      const open = Boolean(record.openChoice?.flavor || record.openChoice?.size);
      const choice = record.chosenLabel ?? (open ? (record.status === "enviado" ? "Sin abrir todavía" : "Falta elegir") : "—");
      return { record, statusLabel: giftStatusLabel(record.status, record.openChoice), step: GIFT_STATUS_ORDER.indexOf(record.status), choice };
    });
}

/** Cuántos regalos hay en cada estado (para las pestañas del panel). */
export function giftStatusCounts(records: GiftRecord[]): Record<GiftStatus, number> {
  const counts: Record<GiftStatus, number> = { enviado: 0, abierto: 0, elegido: 0, canjeado: 0 };
  for (const r of records) counts[r.status] += 1;
  return counts;
}
