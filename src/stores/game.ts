"use client";
import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GamePrizeRecord } from "@/demo/engine/game-prize";
import type { ScoreRecord } from "@/demo/engine/game-ranking";
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
  /** Partidas con su fecha, para el ranking semanal (las últimas 60). */
  scores: ScoreRecord[];
  recordGame: (score: number, at?: string) => void;
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
      scores: [],
      recordGame: (score, at = new Date().toISOString()) =>
        set((s) => ({ best: Math.max(s.best, score), plays: s.plays + 1, lastScore: score, scores: [...s.scores, { score, at }].slice(-60) })),
      addPrize: (prize) => set((s) => ({ prizes: [prize, ...s.prizes.filter((p) => p.code !== prize.code)].slice(0, 30) })),
      clear: () => set({ best: 0, plays: 0, lastScore: null, prizes: [], scores: [] }),
    }),
    {
      name: `${STORAGE_PREFIX}game`,
      // v2 (R2c): las partidas guardan su fecha para el ranking semanal; lo anterior se conserva.
      version: 2,
      migrate: (persisted) => ({ scores: [], ...(persisted as object) }),
      storage: demoStorage,
      skipHydration: true,
      partialize: ({ best, plays, lastScore, prizes, scores }) => ({ best, plays, lastScore, prizes, scores }),
    },
  ),
);

/** Códigos de los cupones ganados en el juego (para Mis cupones y la billetera). */
export function useGameCodes(): string[] {
  const prizes = useGame((s) => s.prizes);
  return useMemo(() => prizes.map((p) => p.code), [prizes]);
}
