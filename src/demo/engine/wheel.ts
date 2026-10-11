import type { WheelConfig, WheelSegment } from "../fixtures/wheel";
import type { Coupon } from "../types";

/** Sorteo ponderado. `rng` inyectable para tests deterministas. En producción el sorteo se hace en el servidor. */
export function pickSegment(config: WheelConfig, rng: () => number = Math.random): { segment: WheelSegment; index: number } | null {
  const pool = config.segments.map((s, index) => ({ s, index })).filter(({ s }) => s.active && s.weight > 0);
  const total = pool.reduce((sum, { s }) => sum + s.weight, 0);
  if (!config.active || total === 0) return null;
  let roll = rng() * total;
  for (const { s, index } of pool) {
    roll -= s.weight;
    if (roll < 0) return { segment: s, index };
  }
  const last = pool[pool.length - 1]!;
  return { segment: last.s, index: last.index };
}

/** Rotación final (grados, sentido horario) para que el segmento quede bajo el puntero superior. */
export function rotationFor(index: number, count: number, turns = 6, jitter = 0.5): number {
  const slice = 360 / count;
  const center = index * slice + slice / 2;
  const offset = (jitter - 0.5) * slice * 0.7;
  return turns * 360 + (360 - center) + offset;
}

const mod360 = (a: number) => ((a % 360) + 360) % 360;

/** Gajo que queda bajo el puntero de arriba para una rotación dada (grados, sentido horario). */
export function segmentAt(rotation: number, count: number): number {
  return Math.floor(mod360(360 - mod360(rotation)) / (360 / count)) % count;
}

/**
 * Rotación final para que, partiendo de `current` y girando `turns` vueltas hacia `dir` (1 horario, -1 antihorario),
 * el gajo `index` quede bajo el puntero. `jitter` (0–1) corre el punto de frenado dentro del gajo.
 */
export function landingRotation(current: number, index: number, count: number, dir: 1 | -1, turns: number, jitter = 0.5): number {
  const slice = 360 / count;
  const desired = mod360(360 - (index * slice + slice / 2) + (jitter - 0.5) * slice * 0.6);
  const base = current + dir * turns * 360;
  return dir > 0 ? base + mod360(desired - mod360(base)) : base - mod360(mod360(base) - desired);
}

export function probability(config: WheelConfig, segment: WheelSegment): number {
  const total = config.segments.filter((s) => s.active).reduce((sum, s) => sum + s.weight, 0);
  return segment.active && total > 0 ? segment.weight / total : 0;
}

/** Convierte el premio en un cupón de un uso que funciona en el carrito de la demo. */
export function prizeCoupon(segment: WheelSegment, seed: string, now: Date, validDays: number): Coupon {
  const ends = new Date(now.getTime() + validDays * 86_400_000).toISOString().slice(0, 10);
  const type = segment.kind === "FREE_SHIPPING" ? "FREE_SHIPPING" : segment.kind;
  const min = segment.minSubtotal ? ` desde $${segment.minSubtotal.toLocaleString("es-AR")}` : "";
  return {
    code: `RULETA${seed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5)}`,
    type, value: segment.value, minSubtotal: segment.minSubtotal, endsAt: ends,
    description: `Ruleta: ${segment.label}${min}`, active: true, maxUses: 1, usedCount: 0,
  };
}
