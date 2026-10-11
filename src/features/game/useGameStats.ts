"use client";
import { claimedOn, dayKey } from "@/demo/engine/game-prize";
import { useGame } from "@/stores/game";
import { useHydrated } from "@/stores/hydration";

/** Récord y premio de hoy en este navegador (vacío hasta rehidratar, para no diferir del HTML estático). */
export function useGameStats() {
  const hydrated = useHydrated();
  const best = useGame((s) => s.best);
  const plays = useGame((s) => s.plays);
  const prizes = useGame((s) => s.prizes);
  const today = hydrated ? claimedOn(prizes, dayKey(new Date())) : null;
  return { hydrated, best: hydrated ? best : 0, plays: hydrated ? plays : 0, today };
}
