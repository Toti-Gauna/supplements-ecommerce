"use client";
import { clubToday } from "@/demo/engine/club-calendar";
import { rivalOf, weekBest, weeklyRanking } from "@/demo/engine/game-ranking";
import { WEEKLY_RANKING } from "@/demo/fixtures/game-ranking";
import { useAccount } from "@/stores/account";
import { useClub } from "@/stores/club";
import { useGame } from "@/stores/game";
import { useHydrated } from "@/stores/hydration";

/** Tu alias en el ranking: el nombre de la cuenta demo o "VOS" (en mayúsculas, como en un arcade). */
export const ownAlias = (name: string | undefined) => (name ? name.split(" ")[0]!.toUpperCase() : "VOS");

/**
 * Ranking semanal de Shaker Rush con tu mejor partida de esta semana en este navegador (se juega sin cuenta). Antes de
 * rehidratar solo se ven los alias de muestra.
 */
export function useWeeklyRanking() {
  const hydrated = useHydrated();
  const scores = useGame((s) => s.scores);
  const name = useAccount((s) => s.user?.name);
  const gymId = useClub((s) => s.gymId);
  const best = hydrated ? weekBest(scores, clubToday(new Date())) : 0;
  const rows = weeklyRanking(WEEKLY_RANKING, hydrated ? { alias: ownAlias(name), score: best, gymId: gymId ?? undefined } : null);
  return { rows, best, mine: rows.find((r) => r.mine) ?? null, rival: rivalOf(rows) };
}
