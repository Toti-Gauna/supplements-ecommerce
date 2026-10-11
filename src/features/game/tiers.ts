import { shakerTop, type GameState } from "@/demo/engine/game";
import { gamePrizes } from "@/demo/fixtures/game";
import { playSound } from "@/lib/sound";
import { ART } from "./art/sprites";
import { popup, ring, type Fx } from "./fx";

/**
 * Los niveles de premio dentro de la partida: el batido del shaker sube hacia el premio más alto y cada nivel es una
 * marca en el vaso. Solo muestran el avance: el premio lo decide `resolveGamePrize` al terminar.
 */
const tiers = [...gamePrizes.tiers].sort((a, b) => a.minScore - b.minScore);
const top = tiers.at(-1)?.minScore ?? 1;

/** Cuántos niveles se alcanzaron con ese puntaje (0 = ninguno). */
export const reachedTier = (score: number) => tiers.filter((t) => score >= t.minScore).length;

export const fillLevel = (score: number) => Math.min(1, score / top);

export const tierMarks = (score: number) => tiers.map((t) => ({ level: t.minScore / top, reached: score >= t.minScore }));

/** Si el puntaje cruzó un nivel: festejo en el shaker y el texto para el lector de pantalla. */
export function tierUp(before: number, after: number, s: GameState, fx: Fx): string | null {
  const from = reachedTier(before), to = reachedTier(after);
  if (to <= from) return null;
  const tier = tiers[to - 1]!;
  const y = shakerTop(s.h);
  popup(fx, s.shaker.x, y - 46, `¡${tier.label}!`, ART.volt);
  ring(fx, s.shaker.x, y + 40, ART.voltSoft);
  playSound("powerup");
  return `Llegaste a ${tier.label}.`;
}
