"use client";
import { sortedTiers } from "@/demo/engine/game-prize";
import { useDemoData } from "@/stores/admin";

/** Premios guardados en el panel (Premios del juego), con los niveles de menor a mayor puntaje. */
export function usePrizeTiers() {
  const config = useDemoData((d) => d.game);
  return { config, tiers: sortedTiers(config.tiers) };
}
