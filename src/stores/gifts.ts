"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Gift } from "@/demo/engine/gifts";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/** Regalos de este navegador (demo): los que se compraron para regalar y los que se guardaron al abrir un link o un código. */
interface GiftsState {
  sent: Gift[];
  saved: Gift[];
  /** Códigos ya abiertos (la apertura a golpes se hace una vez; después se ve directo). */
  opened: string[];
  addSent: (gifts: Gift[]) => void;
  save: (gift: Gift) => void;
  markOpened: (code: string) => void;
  clear: () => void;
}

export const useGifts = create<GiftsState>()(
  persist(
    (set) => ({
      sent: [],
      saved: [],
      opened: [],
      addSent: (gifts) => set((s) => ({ sent: [...gifts, ...s.sent.filter((g) => !gifts.some((n) => n.code === g.code))].slice(0, 40) })),
      save: (gift) => set((s) => (s.saved.some((g) => g.code === gift.code) ? s : { saved: [gift, ...s.saved].slice(0, 40) })),
      markOpened: (code) => set((s) => (s.opened.includes(code) ? s : { opened: [...s.opened, code] })),
      clear: () => set({ sent: [], saved: [], opened: [] }),
    }),
    { name: `${STORAGE_PREFIX}gifts`, storage: demoStorage, skipHydration: true },
  ),
);
