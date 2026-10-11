"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoStorage, STORAGE_PREFIX } from "./storage";
import { playSound } from "@/lib/sound";

/** Favoritos de este navegador (demo). En producción se guardan en la cuenta. */
interface FavoritesState {
  slugs: string[];
  toggle: (slug: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const on = !get().slugs.includes(slug);
        set((s) => ({ slugs: on ? [slug, ...s.slugs] : s.slugs.filter((x) => x !== slug) }));
        playSound(on ? "favorite" : "unfavorite");
        return on;
      },
      clear: () => set({ slugs: [] }),
    }),
    { name: `${STORAGE_PREFIX}favorites`, storage: demoStorage, skipHydration: true },
  ),
);
