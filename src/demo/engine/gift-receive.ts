import type { Product, Variant } from "../types";
import { validateGiftChoice } from "./gift-choice";
import { withGiftEvent, type GiftRecord } from "./gift-status";
import { redeemGiftCard, type GiftCardRecord, type RedeemResult } from "./gift-cards";
import type { Gift } from "./gifts";

/**
 * Lo que hace quien recibe (R3b), sobre los datos del "servidor" (en la demo, el panel de este navegador): elegir el
 * sabor o el tamaño que quedó abierto (valida contra el catálogo y el stock de ese momento) y, al comprar, usar el
 * saldo de una gift card (que además marca su regalo como canjeado). Funciones puras.
 */
export type ChooseResult = { ok: true; records: GiftRecord[]; variant: Variant } | { ok: false; message: string };

/** Variante de referencia del regalo (la pagada) en el catálogo actual. */
export function giftAnchor(products: Product[], gift: Pick<Gift, "item">): { product: Product; anchor: Variant } | null {
  const product = products.find((p) => p.slug === gift.item.slug);
  const anchor = product?.variants.find((v) => v.id === gift.item.variantId) ?? product?.variants.find((v) => v.label === gift.item.variant);
  return product && anchor ? { product, anchor } : null;
}

export function chooseGiftVariant(data: { products: Product[]; giftRecords: GiftRecord[] }, gift: Gift, variantId: string, at: string, quantity = 1): ChooseResult {
  const found = giftAnchor(data.products, gift);
  if (!found) return { ok: false, message: "Ese producto ya no está en la tienda. Escribinos y lo resolvemos." };
  const check = validateGiftChoice(found.product, found.anchor, gift.openChoice, variantId, quantity);
  if (!check.ok) return check;
  // Elegir es después de abrir: si este navegador no vio la apertura (llegó directo), se registra antes.
  const opened = withGiftEvent(data.giftRecords, gift, { type: "open" }, at).records;
  const { records, result } = withGiftEvent(opened, gift, { type: "choose", variantId: check.variant.id, label: check.variant.label }, at);
  return result.ok ? { ok: true, records, variant: check.variant } : result;
}

/**
 * Usa el saldo de una gift card en un pedido (idempotente por pedido) y, la primera vez, deja su regalo como canjeado.
 */
export function spendGiftCard(
  data: { giftCards: GiftCardRecord[]; giftRecords: GiftRecord[] },
  input: { code: string; orderCode: string; amount: number; at: string; today: string; key?: string },
): { result: RedeemResult; giftCards: GiftCardRecord[]; giftRecords: GiftRecord[] } {
  const card = data.giftCards.find((c) => c.code === input.code);
  if (!card) return { result: { ok: false, message: "No encontramos esa gift card." }, ...data };
  const result = redeemGiftCard(card, input);
  if (!result.ok) return { result, ...data };
  const giftCards = data.giftCards.map((c) => (c.code === card.code ? result.card : c));
  const record = data.giftRecords.find((r) => r.giftCardCode === card.code);
  if (!record || record.status === "canjeado") return { result, giftCards, giftRecords: data.giftRecords };
  const redeemed: GiftRecord = { ...record, status: "canjeado", openedAt: record.openedAt ?? input.at, redeemedAt: input.at };
  return { result, giftCards, giftRecords: data.giftRecords.map((r) => (r.code === record.code ? redeemed : r)) };
}
