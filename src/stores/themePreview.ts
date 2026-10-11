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
  setPreview: (id: ThemePreview) => void;
}

export const useThemePreview = create<ThemePreviewState>()(
  persist(
    (set) => ({ previewId: null, setPreview: (previewId) => set({ previewId }) }),
    { name: `${STORAGE_PREFIX}theme-preview`, storage: demoStorage, skipHydration: true },
  ),
);
