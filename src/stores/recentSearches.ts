"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/** Búsquedas recientes de este navegador (máx. 6). Se borran con "Reiniciar demo". */
interface RecentState {
  terms: string[];
  remember: (term: string) => void;
  clear: () => void;
}

export const useRecentSearches = create<RecentState>()(
  persist(
    (set) => ({
      terms: [],
      remember: (term) => set((s) => {
        const t = term.trim();
        if (!t) return s;
        return { terms: [t, ...s.terms.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6) };
      }),
      clear: () => set({ terms: [] }),
    }),
    { name: `${STORAGE_PREFIX}search`, storage: demoStorage },
  ),
);
