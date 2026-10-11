import type { GameItemKind, GameRules } from "../fixtures/game";
import { WORLD_W, nextGap, nextRandom, spawnItem, type FallingItem } from "./game-spawn";

/**
 * Shaker Rush: reglas de la partida en funciones puras (movimiento, aparición, colisiones, puntaje, combo, vidas y
 * tiempo). `stepGame` recibe el estado y devuelve uno nuevo más los eventos del paso; el dibujo y el sonido los
 * resuelve la interfaz con esos eventos. Unidades de mundo: 360 de ancho, alto variable (el de la pantalla).
 */
export { WORLD_W, type FallingItem };

/** Shaker del jugador: boca de 72 de ancho, 80 de alto, apoyado a 28 del piso. */
export const SHAKER = { w: 72, h: 80, floor: 28, follow: 1100, speed: 400, accel: 3200, hurtSec: 0.8 } as const;
export const MIN_H = 520;
export const MAX_H = 860;

/** Lo que pide el jugador: ir a una x (dedo o mouse) o empujar hacia un lado (teclado). */
export interface GameIntent { targetX: number | null; dir: -1 | 0 | 1 }

export interface GameState {
  phase: "playing" | "over";
  endReason: "time" | "lives" | null;
  t: number;
  h: number;
  rng: number;
  nextId: number;
  spawnIn: number;
  lastX: number;
  items: FallingItem[];
  shaker: { x: number; vx: number; hurt: number };
  score: number;
  lives: number;
  combo: number;
  bestCombo: number;
  boost: number;
  caught: number;
  missed: number;
  junkHits: number;
}

export type GameEvent =
  | { type: "catch"; kind: GameItemKind; x: number; y: number; points: number; combo: number }
  | { type: "junk"; kind: GameItemKind; x: number; y: number; lives: number }
  | { type: "miss"; kind: GameItemKind; x: number }
  | { type: "boost-end" }
  | { type: "end"; reason: "time" | "lives" };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const clampHeight = (h: number) => clamp(h, MIN_H, MAX_H);
export const shakerTop = (h: number) => h - SHAKER.floor - SHAKER.h;

export function createGame(seed: number, h: number, rules: GameRules): GameState {
  return {
    phase: "playing", endReason: null, t: 0, h: clampHeight(h), rng: seed >>> 0, nextId: 1, spawnIn: 0.35, lastX: WORLD_W / 2,
    items: [], shaker: { x: WORLD_W / 2, vx: 0, hurt: 0 }, score: 0, lives: rules.lives, combo: 0, bestCombo: 0, boost: 0, caught: 0, missed: 0, junkHits: 0,
  };
}

/** Cambió el alto de la pantalla (rotación, barra del navegador): el shaker sigue apoyado en el piso. */
export function resizeGame(s: GameState, h: number): GameState {
  return { ...s, h: clampHeight(h) };
}

/** Multiplicador del combo: ×1, y sube uno cada `comboStep` aciertos seguidos hasta `maxComboMult`. */
export function comboMult(combo: number, rules: GameRules): number {
  return Math.min(rules.maxComboMult, 1 + Math.floor(combo / rules.comboStep));
}

/** Puntos de una captura con el combo ya contado (incluye la captura) y el ×2 del rayo. Siempre enteros. */
export function itemPoints(kind: GameItemKind, combo: number, boosted: boolean, rules: GameRules): number {
  return rules.items[kind].points * comboMult(combo, rules) * (boosted ? 2 : 1);
}

function moveShaker(s: GameState, intent: GameIntent, dt: number): { x: number; vx: number } {
  const half = SHAKER.w / 2;
  const { x, vx } = s.shaker;
  if (intent.targetX !== null) {
    const step = clamp(clamp(intent.targetX, half, WORLD_W - half) - x, -SHAKER.follow * dt, SHAKER.follow * dt);
    return { x: x + step, vx: dt > 0 ? step / dt : 0 };
  }
  const want = intent.dir * SHAKER.speed;
  const dv = clamp(want - vx, -SHAKER.accel * dt, SHAKER.accel * dt);
  const nvx = vx + dv;
  const nx = clamp(x + nvx * dt, half, WORLD_W - half);
  return { x: nx, vx: nx === half || nx === WORLD_W - half ? 0 : nvx };
}

/** Un paso de la partida. `dt` en segundos (se limita a 50 ms: una pestaña que vuelve no teletransporta nada). */
export function stepGame(s: GameState, intent: GameIntent, dtRaw: number, rules: GameRules): { state: GameState; events: GameEvent[] } {
  if (s.phase === "over") return { state: s, events: [] };
  const dt = clamp(dtRaw, 0, 0.05);
  let seed = s.rng;
  const rnd = () => { const [v, next] = nextRandom(seed); seed = next; return v; };
  const events: GameEvent[] = [];
  const t = Math.min(rules.durationSec, s.t + dt);
  const p = t / rules.durationSec;
  const { x, vx } = moveShaker(s, intent, dt);
  let boost = Math.max(0, s.boost - dt);
  if (s.boost > 0 && boost === 0) events.push({ type: "boost-end" });
  let { nextId, lastX, score, lives, combo, bestCombo, caught, missed, junkHits } = s;
  let hurt = Math.max(0, s.shaker.hurt - dt);
  let spawnIn = s.spawnIn - dt;
  const moved = s.items.map((it) => ({ ...it, y: it.y + it.vy * dt, rot: it.rot + it.vr * dt }));
  while (spawnIn <= 0) {
    const item = spawnItem(rules, { p, id: nextId++, lastX, boosted: boost > 0 }, rnd);
    lastX = item.x;
    moved.push(item);
    spawnIn += nextGap(p, rnd);
  }
  const top = shakerTop(s.h);
  const half = SHAKER.w / 2;
  const items: FallingItem[] = [];
  for (const it of moved) {
    const rule = rules.items[it.kind];
    // Lo bueno se atrapa con todo el radio (generoso); la chatarra pega con un poco menos (perdona los roces).
    const r = rule.junk ? it.r * 0.72 : it.r;
    const touching = it.x + r > x - half && it.x - r < x + half && it.y + r > top && it.y - r < top + SHAKER.h;
    if (touching && !rule.junk) {
      combo += 1;
      bestCombo = Math.max(bestCombo, combo);
      const points = itemPoints(it.kind, combo, boost > 0, rules);
      score += points;
      caught += 1;
      if (it.kind === "bolt") boost = rules.boostSec;
      events.push({ type: "catch", kind: it.kind, x: it.x, y: it.y, points, combo });
    } else if (touching && hurt === 0) {
      lives -= 1;
      combo = 0;
      junkHits += 1;
      hurt = SHAKER.hurtSec;
      events.push({ type: "junk", kind: it.kind, x: it.x, y: it.y, lives });
    } else if (it.y - it.r > s.h) {
      // Lo que se cae no saca vida: solo corta el combo.
      if (!rule.junk) { combo = 0; missed += 1; events.push({ type: "miss", kind: it.kind, x: it.x }); }
    } else items.push(it);
  }
  const reason = lives <= 0 ? "lives" : t >= rules.durationSec ? "time" : null;
  if (reason) events.push({ type: "end", reason });
  const state: GameState = {
    phase: reason ? "over" : "playing", endReason: reason, t, h: s.h, rng: seed, nextId, spawnIn, lastX, items,
    shaker: { x, vx, hurt }, score, lives: Math.max(0, lives), combo, bestCombo, boost: reason ? 0 : boost, caught, missed, junkHits,
  };
  return { state, events };
}

/** Resumen de la partida terminada (lo que se guarda y se valida para el premio). */
export function gameSummary(s: GameState) {
  return { score: s.score, durationSec: Math.round(s.t * 10) / 10, caught: s.caught, missed: s.missed, junkHits: s.junkHits, bestCombo: s.bestCombo, reason: s.endReason ?? "time" };
}
export type GameSummary = ReturnType<typeof gameSummary>;
