"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RackAlert } from "@/demo/engine/rack-alerts";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/**
 * Avisos "si baja o si vuelve" de Mi rack (R2c). Simulados: quedan en este navegador, no se manda nada y se borran con
 * "Reiniciar demo". En producción los guarda el servidor en la cuenta y salen por email o WhatsApp.
 */
interface RackAlertsState {
  items: RackAlert[];
  /** Pide el aviso (o lo vuelve a armar con el precio y el stock de hoy). */
  watch: (alert: RackAlert) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useRackAlerts = create<RackAlertsState>()(
  persist(
    (set) => ({
      items: [],
      watch: (alert) => set((s) => ({ items: [alert, ...s.items.filter((a) => a.slug !== alert.slug)] })),
      remove: (slug) => set((s) => ({ items: s.items.filter((a) => a.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    { name: `${STORAGE_PREFIX}rack-alerts`, storage: demoStorage, skipHydration: true },
  ),
);
