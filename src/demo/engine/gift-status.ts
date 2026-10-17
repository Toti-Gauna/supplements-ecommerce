import type { Gift, GiftKind } from "./gifts";
import type { OpenChoice } from "./gift-options";

/**
 * Estado de un regalo (R3b), el que ve quien lo mandó en "Mis regalos" y el dueño en el panel:
 *
 *   enviado ──abrir──▶ abierto ──elegir──▶ elegido ──canjear──▶ canjeado
 *                          └──────────canjear (sin nada abierto)──────▶
 *
 * - "abrir": quien recibe lo abrió (bolsa o locker). Abrirlo otra vez no cambia nada.
 * - "elegir": solo si quedó sabor o tamaño abierto; se puede cambiar de idea hasta canjearlo.
 * - "canjear": producto o stack, cuando quien recibe lo guarda ("Guardá tu regalo"; si tenía algo abierto, después
 *   de elegir); gift card, la primera vez que se usa su saldo en una compra.
 * Nunca vuelve atrás. En la demo el registro vive en el panel de este navegador; en producción, en el servidor.
 */
export type GiftStatus = "enviado" | "abierto" | "elegido" | "canjeado";
export const GIFT_STATUS_ORDER: readonly GiftStatus[] = ["enviado", "abierto", "elegido", "canjeado"];

export interface GiftRecord {
  code: string;
  from: string;
  to: string;
  kind: GiftKind;
  /** Lo que se regaló ("Ionic Whey 100%", "Stack Fuerza", "Gift card de $ 25.000"). */
  itemName: string;
  productSlug?: string;
  /** Variante pagada (la de referencia del precio si quedó algo abierto). */
  variantId?: string;
  openChoice?: OpenChoice;
  chosenVariantId?: string;
  /** "Chocolate · 2 lb": lo que eligió quien recibe. */
  chosenLabel?: string;
  giftCardCode?: string;
  orderCode?: string;
  createdAt: string;
  status: GiftStatus;
  openedAt?: string;
  chosenAt?: string;
  redeemedAt?: string;
}

export type GiftEvent = { type: "open" } | { type: "choose"; variantId: string; label: string } | { type: "redeem" };

const hasOpen = (r: { openChoice?: OpenChoice }) => Boolean(r.openChoice?.flavor || r.openChoice?.size);

/** Falta elegir sabor o tamaño. */
export const pendingChoice = (r: GiftRecord) => hasOpen(r) && !r.chosenVariantId;

/** Rótulo del estado: "Sabor elegido", "Tamaño elegido" o "Sabor y tamaño elegidos" según lo que quedó abierto. */
export function giftStatusLabel(status: GiftStatus, openChoice?: OpenChoice): string {
  if (status === "elegido") return openChoice?.flavor && openChoice.size ? "Sabor y tamaño elegidos" : openChoice?.size ? "Tamaño elegido" : "Sabor elegido";
  return { enviado: "Enviado", abierto: "Abierto", canjeado: "Canjeado" }[status];
}

/** El registro inicial de un regalo recién enviado (o de uno que llegó por link a este navegador). */
export function recordFromGift(gift: Gift): GiftRecord {
  return {
    code: gift.code, from: gift.from, to: gift.to, kind: gift.kind ?? "producto", itemName: gift.item.name, createdAt: gift.createdAt, status: "enviado",
    ...(gift.kind !== "gift-card" ? { productSlug: gift.item.slug } : {}), ...(gift.item.variantId ? { variantId: gift.item.variantId } : {}),
    ...(gift.openChoice && hasOpen(gift) ? { openChoice: gift.openChoice } : {}), ...(gift.giftCard ? { giftCardCode: gift.giftCard.code } : {}),
    ...(gift.orderCode ? { orderCode: gift.orderCode } : {}),
  };
}

export type GiftEventResult = { ok: true; record: GiftRecord } | { ok: false; message: string };

/** Aplica un evento a un registro según el diagrama. Repetir un paso ya dado es válido y no cambia nada. */
export function applyGiftEvent(record: GiftRecord, event: GiftEvent, at: string): GiftEventResult {
  const { status } = record;
  if (event.type === "open") return { ok: true, record: status === "enviado" ? { ...record, status: "abierto", openedAt: at } : record };
  if (status === "enviado") return { ok: false, message: "Primero hay que abrir el regalo." };
  if (event.type === "choose") {
    if (!hasOpen(record)) return { ok: false, message: "Este regalo no tiene nada para elegir." };
    if (status === "canjeado") return { ok: false, message: "El regalo ya se canjeó." };
    return { ok: true, record: { ...record, status: "elegido", chosenVariantId: event.variantId, chosenLabel: event.label, chosenAt: at } };
  }
  if (status === "canjeado") return { ok: true, record };
  if (pendingChoice(record)) return { ok: false, message: "Elegí primero el sabor o el tamaño." };
  return { ok: true, record: { ...record, status: "canjeado", redeemedAt: at } };
}

/** Aplica el evento al registro del regalo en la lista (lo crea si llegó por link y no estaba). */
export function withGiftEvent(records: GiftRecord[], gift: Gift, event: GiftEvent, at: string): { records: GiftRecord[]; result: GiftEventResult } {
  const current = records.find((r) => r.code === gift.code) ?? recordFromGift(gift);
  const result = applyGiftEvent(current, event, at);
  if (!result.ok || result.record === current && records.includes(current)) return { records, result };
  return { records: [result.record, ...records.filter((r) => r.code !== gift.code)], result };
}
