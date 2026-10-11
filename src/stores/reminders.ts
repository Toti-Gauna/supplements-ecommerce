"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/**
 * Avisos de recompra pedidos desde la ficha ("Avisame cuando se esté por terminar"). En la demo quedan en este
 * navegador y se ven en Mi cuenta; en producción los guarda el servidor y salen por email o WhatsApp.
 */
export interface RepurchaseReminder {
  /** `${slug}:${variantId}`: un aviso por presentación. */
  id: string;
  slug: string;
  variantId: string;
  name: string;
  variant: string;
  /** AAAA-MM-DD */
  startsOn: string;
  runsOutOn: string;
  remindOn: string;
  perDay: number;
}

interface RemindersState {
  items: RepurchaseReminder[];
  save: (r: RepurchaseReminder) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useReminders = create<RemindersState>()(
  persist(
    (set) => ({
      items: [],
      save: (r) => set((s) => ({ items: [r, ...s.items.filter((x) => x.id !== r.id)] })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: `${STORAGE_PREFIX}reminders`, storage: demoStorage, skipHydration: true },
  ),
);
