import { createGame, stepGame, type GameState } from "@/demo/engine/game";
import { autopilotIntent } from "@/demo/engine/game-autopilot";
import { gameRules } from "@/demo/fixtures/game";

/**
 * Partida de Shaker Rush para el trailer (pura, con tests): el piloto automático juega la partida entera a paso fijo desde la
 * semilla, siempre igual. La 266 se eligió porque sus tres últimas atrapadas caen casi en corcheas (0,20 / 0,27 / 0,38 s):
 * el reloj se re-cronometra apenas (entre 0,82× y 1,14×) para clavarlas en el estribillo; lo que pasa es lo que da la semilla.
 */
export const SHAKER_SEED = 266;
export const SHAKER_WORLD_H = 800;
export const SHAKER_DT = 1 / 60;

export interface Replay { frames: GameState[]; t0: number; catches: number[]; end: number }

/** Juega la partida y guarda los cuadros de los últimos `keep` segundos (lo único que se ve). */
export function playShaker(seed = SHAKER_SEED, keep = 2.5): Replay {
  let s = createGame(seed, SHAKER_WORLD_H, gameRules);
  const all: GameState[] = [s], catches: number[] = [];
  while (s.phase === "playing") {
    const r = stepGame(s, autopilotIntent(s, gameRules), SHAKER_DT, gameRules);
    s = r.state;
    all.push(s);
    for (const e of r.events) if (e.type === "catch") catches.push(s.t);
  }
  const t0 = s.t - keep;
  const frames = all.filter((f) => f.t >= t0 - 1e-9);
  return { frames, t0: frames[0]!.t, catches, end: s.t };
}

/**
 * Tiempo de la partida para un momento de la escena (en tiempos): las tres últimas atrapadas caen en 0, ½ y 1, y el final
 * ("¡Tiempo!") en 2. Antes de la primera atrapada corre a la misma velocidad que el primer tramo.
 */
export function shakerClock(r: Replay): (u: number) => number {
  const [c1, c2, c3] = r.catches.slice(-3) as [number, number, number];
  const pts: [number, number][] = [[0, c1], [0.5, c2], [1, c3], [2, r.end]];
  return (u) => {
    if (u >= 2) return r.end;
    if (u <= 0) return Math.max(r.t0, c1 + u * ((c2 - c1) / 0.5));
    const i = pts.findIndex(([x]) => x > u) - 1;
    const [ua, ta] = pts[i]!, [ub, tb] = pts[i + 1]!;
    return ta + ((u - ua) / (ub - ua)) * (tb - ta);
  };
}

/** El último cuadro guardado que ya pasó por ese tiempo de la partida (el tiempo de cada paso se acumula: se busca, no se divide). */
export function frameAt(r: Replay, t: number): GameState {
  let lo = 0, hi = r.frames.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (r.frames[mid]!.t <= t + 1e-6) lo = mid; else hi = mid - 1; }
  return r.frames[lo]!;
}
