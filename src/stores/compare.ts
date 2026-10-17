"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPARE_MAX, toggleCompare, type CompareToggle } from "@/demo/engine/compare";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/** Bandeja del comparador de este navegador (hasta 3 productos). Se borra con "Reiniciar demo". */
interface CompareState {
  slugs: string[];
  toggle: (slug: string) => CompareToggle["result"];
  /** Reemplaza la bandeja (lo que se está comparando en /comparar/). */
  set: (slugs: string[]) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const next = toggleCompare(get().slugs, slug);
        if (next.result !== "full") set({ slugs: next.slugs });
        return next.result;
      },
      set: (slugs) => set({ slugs: [...new Set(slugs)].slice(0, COMPARE_MAX) }),
      clear: () => set({ slugs: [] }),
    }),
    { name: `${STORAGE_PREFIX}compare`, storage: demoStorage, skipHydration: true },
  ),
);
