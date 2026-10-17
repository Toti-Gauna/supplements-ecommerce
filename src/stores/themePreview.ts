"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SeasonId } from "@/demo/types";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/** Vista previa: una temática, "original" (la marca sin temática) o null (la que corresponde por el panel). */
export type ThemePreview = SeasonId | "original" | null;

/** "Probar temáticas": vista previa elegida en este navegador. */
interface ThemePreviewState {
  previewId: ThemePreview;
  /**
   * Modo vitrina (R3a): la fecha que se está mostrando sin recargar. Manda sobre la vista previa y NO se guarda: al
   * salir (o al recargar) la tienda vuelve a la vista previa de antes, sin dejar nada.
   */
  vitrinaId: SeasonId | null;
  setPreview: (id: ThemePreview) => void;
  setVitrina: (id: SeasonId | null) => void;
}

export const useThemePreview = create<ThemePreviewState>()(
  persist(
    (set) => ({ previewId: null, vitrinaId: null, setPreview: (previewId) => set({ previewId }), setVitrina: (vitrinaId) => set({ vitrinaId }) }),
    { name: `${STORAGE_PREFIX}theme-preview`, storage: demoStorage, skipHydration: true, partialize: (s) => ({ previewId: s.previewId }) },
  ),
);

/** La vista previa que manda en la tienda: la de la vitrina, si está andando, o la elegida en "Probar temáticas". */
export function useEffectivePreview(): ThemePreview {
  return useThemePreview((s) => s.vitrinaId ?? s.previewId);
}
