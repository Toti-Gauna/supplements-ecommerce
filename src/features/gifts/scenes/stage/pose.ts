import type { Pose, Pt } from "@/components/illustrations/figure";

/** Mezcla dos poses (mismas articulaciones) en `k` de 0 a 1: la silueta pasa de una a otra sin saltos. */
export function mixPose(a: Pose, b: Pose, k: number): Pose {
  const m = (p: Pt, q: Pt): Pt => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
  const limb = (p: Pt[], q: Pt[]) => p.map((pt, i) => m(pt, q[i] ?? pt));
  return {
    ...a,
    head: m(a.head, b.head), neck: m(a.neck, b.neck), hip: m(a.hip, b.hip),
    arm: limb(a.arm, b.arm), farArm: limb(a.farArm, b.farArm), leg: limb(a.leg, b.leg), farLeg: limb(a.farLeg, b.farLeg),
  };
}

/** Un punto del escenario en las coordenadas de una silueta (`Athlete` en x, y con escala s; el piso local es 186). */
export function toLocal([X, Y]: Pt, x: number, y: number, s: number, flip = false): Pt {
  return [((X - x) / s) * (flip ? -1 : 1), 186 - (y - Y) / s];
}

/** Y al revés: un punto local de la silueta en el escenario. */
export function toScene([lx, ly]: Pt, x: number, y: number, s: number, flip = false): Pt {
  return [x + lx * s * (flip ? -1 : 1), y - (186 - ly) * s];
}

/** Brazo de dos tramos que llega a `hand` desde `shoulder`, con el codo doblado hacia `bend` (1 o −1). */
export function reach(shoulder: Pt, hand: Pt, len: number, bend = 1): Pt[] {
  const dx = hand[0] - shoulder[0], dy = hand[1] - shoulder[1];
  const d = Math.min(Math.hypot(dx, dy), len * 2 - 0.01);
  const h = Math.sqrt(Math.max(0, len * len - (d / 2) ** 2));
  const mx = shoulder[0] + dx / 2, my = shoulder[1] + dy / 2;
  const n = Math.hypot(dx, dy) || 1;
  return [shoulder, [mx - (dy / n) * h * bend, my + (dx / n) * h * bend], hand];
}
