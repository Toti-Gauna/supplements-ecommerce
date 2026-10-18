"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WaOverrides } from "@/demo/admin/whatsapp";
import type { Inline } from "@/demo/fixtures/emails";
import type { WaMessageId } from "@/demo/fixtures/whatsapp";
import { demoStorage, STORAGE_PREFIX } from "./storage";

interface WhatsappTextsState {
  /** Mensajes editados por el dueño; los que no están usan el texto de muestra (`fixtures/whatsapp.ts`). */
  texts: WaOverrides;
  save: (id: WaMessageId, text: Inline) => void;
  /** Vuelve un mensaje al texto de muestra. */
  restore: (id: WaMessageId) => void;
  clear: () => void;
}

/**
 * Mensajes de WhatsApp por estado del pedido (R4b), editados en Ajustes → Emails. Solo en este navegador. Vive aparte
 * del estado del panel para no tocar su versión guardada.
 */
export const useWhatsappTexts = create<WhatsappTextsState>()(
  persist(
    (set) => ({
      texts: {},
      save: (id, text) => set((s) => ({ texts: { ...s.texts, [id]: text } })),
      restore: (id) => set((s) => {
        const texts = { ...s.texts };
        delete texts[id];
        return { texts };
      }),
      clear: () => set({ texts: {} }),
    }),
    {
      name: `${STORAGE_PREFIX}whatsapp`, storage: demoStorage, skipHydration: true,
      // Lo guardado roto (no es un objeto) se ignora: quedan los textos de muestra.
      merge: (persisted, current) => {
        const texts = (persisted as { texts?: unknown } | undefined)?.texts;
        return { ...current, texts: texts && typeof texts === "object" && !Array.isArray(texts) ? (texts as WaOverrides) : {} };
      },
    },
  ),
);
