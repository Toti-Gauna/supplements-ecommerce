"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Density, Sort } from "@/components/organisms/data-table/types";
import { demoStorage, STORAGE_PREFIX } from "./storage";

export interface TablePrefs {
  sort?: Sort | null;
  hidden?: string[];
  density?: Density;
}

interface TablePrefsState {
  prefs: Record<string, TablePrefs>;
  set: (id: string, patch: TablePrefs) => void;
}

/** Orden, columnas visibles y densidad de cada tabla del panel, recordados en este navegador. */
export const useTablePrefs = create<TablePrefsState>()(
  persist(
    (set) => ({
      prefs: {},
      set: (id, patch) => set((s) => ({ prefs: { ...s.prefs, [id]: { ...s.prefs[id], ...patch } } })),
    }),
    { name: `${STORAGE_PREFIX}tables`, storage: demoStorage, skipHydration: true },
  ),
);
