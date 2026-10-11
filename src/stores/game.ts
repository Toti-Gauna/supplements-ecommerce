"use client";
import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GamePrizeRecord } from "@/demo/engine/game-prize";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/**
 * Shaker Rush en este navegador: récord, partidas jugadas y premios cobrados (uno por día). En la demo vive en
 * localStorage y se borra con "Reiniciar demo"; en producción el límite diario y los premios los guarda el servidor.
 */
interface GameStoreState {
  best: number;
  plays: number;
  lastScore: number | null;
  /** Premios cobrados, el más nuevo primero (se guardan los últimos 30). */
  prizes: GamePrizeRecord[];
  recordGame: (score: number) => void;
  addPrize: (prize: GamePrizeRecord) => void;
  clear: () => void;
}

export const useGame = create<GameStoreState>()(
  persist(
    (set) => ({
      best: 0,
      plays: 0,
      lastScore: null,
      prizes: [],
      recordGame: (score) => set((s) => ({ best: Math.max(s.best, score), plays: s.plays + 1, lastScore: score })),
      addPrize: (prize) => set((s) => ({ prizes: [prize, ...s.prizes.filter((p) => p.code !== prize.code)].slice(0, 30) })),
      clear: () => set({ best: 0, plays: 0, lastScore: null, prizes: [] }),
    }),
    {
      name: `${STORAGE_PREFIX}game`,
      version: 1,
      storage: demoStorage,
      skipHydration: true,
      partialize: ({ best, plays, lastScore, prizes }) => ({ best, plays, lastScore, prizes }),
    },
  ),
);

/** Códigos de los cupones ganados en el juego (para Mis cupones y la billetera). */
export function useGameCodes(): string[] {
  const prizes = useGame((s) => s.prizes);
  return useMemo(() => prizes.map((p) => p.code), [prizes]);
}
