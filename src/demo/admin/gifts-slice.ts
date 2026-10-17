import { demoNow } from "../clock";
import { DEMO_TODAY } from "../fixtures/admin-orders";
import type { GiftCardRecord, RedeemResult } from "../engine/gift-cards";
import { chooseGiftVariant, spendGiftCard, type ChooseResult } from "../engine/gift-receive";
import { recordFromGift, withGiftEvent, type GiftEventResult } from "../engine/gift-status";
import type { Gift } from "../engine/gifts";
import { auditEntry, type AdminData } from "./defaults";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;
type Get = () => AdminData;

export interface GiftsActions {
  /** Un pedido de la tienda emitió gift cards y mandó regalos: quedan en el panel como "enviados". */
  registerGifts: (gifts: Gift[], cards: GiftCardRecord[]) => void;
  /** Quien recibe abrió el regalo (repetirlo no cambia nada). */
  openGift: (gift: Gift) => GiftEventResult;
  /** Quien recibe eligió el sabor o el tamaño abierto (valida contra el catálogo y el stock). */
  chooseGift: (gift: Gift, variantId: string) => ChooseResult;
  /** "Guardá tu regalo": producto o stack canjeado (si tenía algo abierto, después de elegir). */
  redeemGift: (gift: Gift) => GiftEventResult;
  /** Un pedido usó el saldo de una gift card (idempotente por `key`, la compra; por defecto el código del pedido). */
  spendGiftCard: (code: string, orderCode: string, amount: number, key?: string) => RedeemResult;
}

/** Regalos y gift cards (R3b): viven en `data.giftCards` y `data.giftRecords`, así la tienda valida el saldo ahí. */
export function createGiftsActions(set: Set, get: Get): GiftsActions {
  const log = (s: AdminData, action: string, entity: string) => [auditEntry(action, entity), ...s.audit].slice(0, 80);
  const event = (gift: Gift, type: "open" | "redeem"): GiftEventResult => {
    const { records, result } = withGiftEvent(get().data.giftRecords ?? [], gift, { type }, demoNow());
    if (result.ok) set((s) => ({ data: { ...s.data, giftRecords: records } }));
    return result;
  };
  return {
    registerGifts: (gifts, cards) => set((s) => {
      const records = s.data.giftRecords ?? [];
      const fresh = gifts.filter((g) => !records.some((r) => r.code === g.code)).map(recordFromGift);
      const issued = cards.filter((c) => !(s.data.giftCards ?? []).some((x) => x.code === c.code));
      if (!fresh.length && !issued.length) return {};
      const audit = issued.length ? log(s, `Gift card emitida (${issued.length})`, issued.map((c) => c.code).join(", ")) : s.audit;
      return { data: { ...s.data, giftRecords: [...fresh, ...records], giftCards: [...issued, ...(s.data.giftCards ?? [])] }, audit };
    }),
    openGift: (gift) => event(gift, "open"),
    redeemGift: (gift) => event(gift, "redeem"),
    chooseGift: (gift, variantId) => {
      const { data } = get();
      const out = chooseGiftVariant({ products: data.products, giftRecords: data.giftRecords ?? [] }, gift, variantId, demoNow());
      if (out.ok) set((s) => ({ data: { ...s.data, giftRecords: out.records }, audit: log(s, `Regalo: eligió ${out.variant.label}`, gift.code) }));
      return out;
    },
    spendGiftCard: (code, orderCode, amount, key) => {
      const { data } = get();
      const out = spendGiftCard({ giftCards: data.giftCards ?? [], giftRecords: data.giftRecords ?? [] }, { code, orderCode, amount, at: demoNow(), today: DEMO_TODAY, ...(key ? { key } : {}) });
      if (out.result.ok) set((s) => ({ data: { ...s.data, giftCards: out.giftCards, giftRecords: out.giftRecords }, audit: log(s, `Saldo de gift card usado en ${orderCode}`, code) }));
      return out.result;
    },
  };
}
