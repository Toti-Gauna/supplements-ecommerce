import type { GameItemKind, GameRules } from "../fixtures/game";

/**
 * Shaker Rush: azar con semilla, curva de dificultad y aparición de lo que cae. Todo puro: con la misma semilla y los
 * mismos pasos la partida es idéntica (tests, y en producción el servidor podría repetirla para validar el puntaje).
 * Unidades: el campo mide WORLD_W de ancho; velocidades en unidades por segundo.
 */
export const WORLD_W = 360;

export interface FallingItem {
  id: number;
  kind: GameItemKind;
  x: number;
  y: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
}

/** mulberry32: devuelve [valor entre 0 y 1, semilla siguiente]. */
export function nextRandom(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(s ^ (s >>> 15), s | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Semilla a partir de un texto (FNV-1a). */
export function seedFrom(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** Dificultad según el avance de la partida (`p` de 0 a 1): todo sube de a poco, sin saltos. */
export function difficulty(p: number): { speed: number; gap: number; junk: number } {
  const q = Math.min(1, Math.max(0, p));
  return { speed: 150 + 190 * q ** 1.2, gap: 0.8 - 0.4 * q, junk: 0.2 + 0.18 * q };
}

/** Intervalo hasta la próxima aparición (con un poco de variación para que no sea un metrónomo). */
export const MIN_GAP = 0.4 * 0.85;
export function nextGap(p: number, rnd: () => number): number {
  return difficulty(p).gap * (0.85 + rnd() * 0.3);
}

const GROUPS = { good: ["scoop", "capsule", "bolt", "golden"], junk: ["burger", "soda", "donut"] } as const;

function pickKind(rules: GameRules, junk: boolean, rnd: () => number): GameItemKind {
  const pool = junk ? GROUPS.junk : GROUPS.good;
  const total = pool.reduce((sum, k) => sum + rules.items[k].weight, 0);
  let roll = rnd() * total;
  for (const k of pool) {
    roll -= rules.items[k].weight;
    if (roll < 0) return k;
  }
  return pool[0];
}

/**
 * Algo nuevo arriba del campo. El rayo no aparece mientras dura el ×2 (sería un premio perdido) y la x se aleja un poco
 * de la anterior para que dos cosas seguidas no caigan una encima de la otra.
 */
export function spawnItem(rules: GameRules, ctx: { p: number; id: number; lastX: number; boosted: boolean }, rnd: () => number): FallingItem {
  const d = difficulty(ctx.p);
  let kind = pickKind(rules, rnd() < d.junk, rnd);
  if (kind === "bolt" && ctx.boosted) kind = "scoop";
  const rule = rules.items[kind];
  const margin = rule.size + 10;
  const place = () => margin + rnd() * (WORLD_W - margin * 2);
  let x = place();
  for (let i = 0; i < 3 && Math.abs(x - ctx.lastX) < 44; i++) x = place();
  return { id: ctx.id, kind, x, y: -rule.size * 2, vy: d.speed * rule.speed * (0.92 + rnd() * 0.16), r: rule.size, rot: rnd() * Math.PI * 2, vr: (rnd() - 0.5) * 2.4 };
}
