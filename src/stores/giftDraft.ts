"use client";
import { create } from "zustand";
import type { LineGift } from "@/demo/engine/cart-types";
import { GIFT_CARD_RULES } from "@/demo/engine/gift-cards";
import { DEFAULT_GIFT_DESIGN, defaultLockerCode } from "@/demo/engine/gift-options";
import { withKnownOccasion } from "@/demo/engine/gifts";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { GiftOccasion } from "@/demo/types";

/** Qué se regala desde el armador: lo que se está viendo (producto o stack) o una gift card con monto. */
export type GiftDraftKind = "item" | "gift-card";

/**
 * Borrador de "Regalá energía", compartido por la ficha ("Regalar ahora"), el checkout ("¿Es para regalo?") y
 * /regalar/: cerrar y volver a abrir no pierde lo escrito. Vive en memoria (no se guarda en el navegador ni se envía).
 */
interface GiftDraftState {
  draft: LineGift;
  kind: GiftDraftKind;
  /** Monto de la gift card (pesos enteros); `amountText` es lo que se escribe en "Otro monto". */
  amount: number;
  amountText: string;
  /** Ya escribió algo: al reabrir no se pisa con los valores sugeridos. */
  touched: boolean;
  patch: (patch: Partial<LineGift>) => void;
  setKind: (kind: GiftDraftKind) => void;
  setAmount: (amount: number, text?: string) => void;
  /** Al abrir: propone "De parte de" y la ocasión si todavía no escribió nada, o carga un regalo para editarlo. */
  prime: (suggested: { from?: string; occasion: GiftOccasion; kind?: GiftDraftKind }, existing?: LineGift) => void;
  /** Después de agregar el regalo: queda solo quién lo manda, para el próximo. */
  done: () => void;
}

const EMPTY: LineGift = { to: "", from: "", toEmail: "", message: "", occasion: "volta", opening: "bolsa", lockerCode: defaultLockerCode(DEMO_TODAY), cardDesign: DEFAULT_GIFT_DESIGN, openChoice: {} };
const AMOUNT = GIFT_CARD_RULES.presets[1];

export const useGiftDraft = create<GiftDraftState>()((set) => ({
  draft: EMPTY,
  kind: "item",
  amount: AMOUNT,
  amountText: "",
  touched: false,
  patch: (patch) => set((s) => ({ draft: { ...s.draft, ...patch }, touched: true })),
  setKind: (kind) => set({ kind, touched: true }),
  setAmount: (amount, text = "") => set({ amount, amountText: text, touched: true }),
  prime: (suggested, existing) => set((s) => {
    if (existing) return { draft: withKnownOccasion({ ...EMPTY, ...existing }), kind: "item", touched: true };
    const kind = suggested.kind ?? (s.touched ? s.kind : "item");
    if (s.touched) return { kind };
    return { kind, draft: { ...EMPTY, from: s.draft.from || suggested.from || "", occasion: suggested.occasion } };
  }),
  done: () => set((s) => ({ draft: { ...EMPTY, from: s.draft.from, occasion: s.draft.occasion }, kind: "item", amount: AMOUNT, amountText: "", touched: false })),
}));
