"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct } from "@/demo/engine/catalog";
import { sameTypeOnly, toggleCompare, type CategoryOf, type CompareToggle } from "@/demo/engine/compare-tray";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/** La categoría de cada producto según el catálogo de este navegador (con lo que cambió el panel). */
export const categoryOfProduct: CategoryOf = (slug) => getProduct(slug)?.categorySlug;

/**
 * Bandeja del comparador de este navegador (hasta 3 productos, todos del mismo tipo). Se borra con "Reiniciar demo".
 * Una bandeja vieja que mezclaba tipos se limpia al cargar (queda el tipo del primero).
 */
interface CompareState {
  slugs: string[];
  toggle: (slug: string) => CompareToggle;
  /** Reemplaza la bandeja (lo que se está comparando en /comparar/, o una comparación nueva desde un aviso). */
  set: (slugs: string[]) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const next = toggleCompare(get().slugs, slug, categoryOfProduct);
        if (next.result === "added" || next.result === "removed") set({ slugs: next.slugs });
        return next;
      },
      set: (slugs) => set({ slugs: sameTypeOnly(slugs, categoryOfProduct) }),
      clear: () => set({ slugs: [] }),
    }),
    {
      name: `${STORAGE_PREFIX}compare`,
      storage: demoStorage,
      skipHydration: true,
      partialize: (s) => ({ slugs: s.slugs }),
      merge: (persisted, current) => {
        const slugs = (persisted as Partial<CompareState> | undefined)?.slugs;
        return { ...current, slugs: Array.isArray(slugs) ? sameTypeOnly(slugs, categoryOfProduct) : current.slugs };
      },
    },
  ),
);
