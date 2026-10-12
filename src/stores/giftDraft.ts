"use client";
import { create } from "zustand";
import type { LineGift } from "@/demo/engine/cart-types";
import { withKnownOccasion } from "@/demo/engine/gifts";
import type { GiftOccasion } from "@/demo/types";

/**
 * Borrador del regalo, compartido por la ficha ("Regalar ahora") y el checkout ("¿Es para regalo?"): cerrar y
 * volver a abrir el modal no pierde lo escrito. Vive en memoria (no se guarda en el navegador ni se envía).
 */
interface GiftDraftState {
  draft: LineGift;
  /** Ya escribió algo: al reabrir no se pisa con los valores sugeridos. */
  touched: boolean;
  patch: (patch: Partial<LineGift>) => void;
  /** Al abrir: propone "De parte de" y la ocasión si todavía no escribió nada, o carga un regalo para editarlo. */
  prime: (suggested: { from?: string; occasion: GiftOccasion }, existing?: LineGift) => void;
  /** Después de agregar el regalo: queda solo quién lo manda, para el próximo. */
  done: () => void;
}

const EMPTY: LineGift = { to: "", from: "", toEmail: "", message: "", occasion: "volta" };

export const useGiftDraft = create<GiftDraftState>()((set) => ({
  draft: EMPTY,
  touched: false,
  patch: (patch) => set((s) => ({ draft: { ...s.draft, ...patch }, touched: true })),
  prime: (suggested, existing) => set((s) => {
    if (existing) return { draft: withKnownOccasion({ ...EMPTY, ...existing }), touched: true };
    if (s.touched) return {};
    return { draft: { ...EMPTY, from: s.draft.from || suggested.from || "", occasion: suggested.occasion } };
  }),
  done: () => set((s) => ({ draft: { ...EMPTY, from: s.draft.from, occasion: s.draft.occasion }, touched: false })),
}));
