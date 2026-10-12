import type { GameRules } from "../fixtures/game";
import { SHAKER, WORLD_W, shakerTop, type GameIntent, type GameState } from "./game";

/**
 * Jugador automático de Shaker Rush. Sirve para los tests (calibrar los niveles de premio y probar una partida entera
 * de punta a punta) y para el modo determinista de los e2e, que solo se activa desde la prueba: en la tienda no se ve.
 * Va al próximo objeto bueno que llega a tiempo sin pasar por donde está cayendo chatarra.
 */
export function autopilotIntent(s: GameState, rules: GameRules): GameIntent {
  const top = shakerTop(s.h);
  const half = SHAKER.w / 2;
  // Cada chatarra ocupa la altura del shaker durante [from, to] segundos desde ahora.
  const junk = s.items
    .filter((it) => rules.items[it.kind].junk)
    .map((it) => ({ x: it.x, reach: half + it.r + 14, from: (top - (it.y + it.r)) / it.vy, to: (top + SHAKER.h - (it.y - it.r)) / it.vy }))
    .filter((j) => j.to > 0);
  const hits = (lo: number, hi: number, from: number, until: number) => junk.some((j) => j.from < until && j.to > from && j.x + j.reach > lo && j.x - j.reach < hi);
  const route = (to: number) => {
    const travel = Math.abs(to - s.shaker.x) / SHAKER.follow;
    return { travel, blocked: hits(Math.min(to, s.shaker.x), Math.max(to, s.shaker.x), 0, travel + 0.08) };
  };
  const goods = s.items
    .filter((it) => !rules.items[it.kind].junk)
    .map((it) => ({ x: it.x, eta: (top - (it.y + it.r)) / it.vy }))
    .filter((g) => g.eta > -0.1)
    .sort((a, b) => a.eta - b.eta);
  for (const g of goods) {
    const { travel, blocked } = route(g.x);
    if (travel > g.eta + 0.05 || blocked || hits(g.x, g.x, travel, g.eta + 0.35)) continue;
    return { targetX: g.x, dir: 0 };
  }
  if (!hits(s.shaker.x, s.shaker.x, 0, 0.8)) return { targetX: s.shaker.x, dir: 0 };
  // Sin objetivo y con chatarra encima: la x libre más cercana a la que se llega sin chocar.
  let best = s.shaker.x, bestDist = Infinity;
  for (let x = half; x <= WORLD_W - half; x += 12) {
    const dist = Math.abs(x - s.shaker.x);
    const { travel, blocked } = route(x);
    if (dist < bestDist && !blocked && !hits(x, x, travel, 0.8)) { best = x; bestDist = dist; }
  }
  return { targetX: best, dir: 0 };
}
