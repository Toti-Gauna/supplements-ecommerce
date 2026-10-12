import { easeOutExpo, span } from "@/demo/admin/studio/timeline";
import type { GameItemKind } from "@/demo/fixtures/game";
import { drawLayers, drawShaker } from "@/features/game/art/draw";
import { SPRITES } from "@/features/game/art/sprites";

/**
 * Shaker Rush en la pieza: el shaker del juego (el mismo dibujo del canvas del juego) con el batido que sube y lo que
 * cae alrededor. Las posiciones dependen solo de `t`; al final todo queda quieto con el shaker lleno.
 */
/** Cada objeto: dónde cae (x, de −1 a 1 del ancho), a qué altura queda sobre la boca del shaker (0–1) y cuándo. */
const ITEMS: { kind: GameItemKind; x: number; rest: number; delay: number; speed: number }[] = [
  { kind: "scoop", x: 0, rest: 0.05, delay: 0.2, speed: 1 },
  { kind: "capsule", x: -0.62, rest: 0.75, delay: 0.9, speed: 1.15 },
  { kind: "bolt", x: 0.55, rest: 1, delay: 0.5, speed: 1.05 },
  { kind: "golden", x: 0.42, rest: 0.35, delay: 1.6, speed: 1.3 },
  { kind: "donut", x: -0.78, rest: 0.1, delay: 1.3, speed: 0.95 },
  { kind: "capsule", x: 0.85, rest: 0.6, delay: 2.2, speed: 1.1 },
];

export interface GameArtSpot { cx: number; top: number; scale: number; spread: number }

/** Shaker centrado en `cx` con su boca en `top`; `spread` es el ancho por donde caen los objetos. */
export function drawGameArt(ctx: CanvasRenderingContext2D, t: number, start: number, duration: number, spot: GameArtSpot) {
  const { cx, top, scale, spread } = spot;
  const still = t >= duration - 0.05;
  const fill = still ? 0.92 : 0.15 + 0.77 * easeOutExpo(span(t, start + 0.4, Math.max(2, duration - 2.5)));
  // Halo voltio debajo del shaker.
  ctx.save();
  const halo = ctx.createRadialGradient(cx, top + 92 * scale, 0, cx, top + 92 * scale, 70 * scale);
  halo.addColorStop(0, "rgba(200,255,46,0.32)"); halo.addColorStop(1, "rgba(200,255,46,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(cx - 80 * scale, top + 40 * scale, 160 * scale, 100 * scale);
  ctx.restore();
  ctx.save();
  ctx.translate(cx, top);
  ctx.scale(scale, scale);
  drawShaker(ctx, 0, 0, { tilt: still ? 0 : Math.sin(t * 2.2) * 0.05, level: fill, marks: [0.25, 0.55, 0.9].map((level) => ({ level, reached: fill >= level })), boost: false, hurt: 0 });
  ctx.restore();
  // Los objetos quedan en una franja sobre la boca del shaker (no pisan el texto de arriba).
  const band = 52 * scale, from = top - band - 160 * scale;
  for (const [i, it] of ITEMS.entries()) {
    const life = (t - start - it.delay) * it.speed * 0.55;
    if (life < 0 && !still) continue;
    // Cae desde arriba hasta su altura de descanso y queda flotando (en el cuadro final, en su lugar).
    const k = still ? 1 : Math.min(1, life);
    const rest = top + 6 * scale - it.rest * band;
    const y = from + (rest - from) * easeOutExpo(k);
    const x = cx + it.x * spread + (still ? 0 : Math.sin(t * 1.4 + i) * 6);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(it.kind === "capsule" ? (still ? 0.5 : t * 1.3 + i) : Math.sin(t + i) * 0.2);
    ctx.scale(scale * 0.95, scale * 0.95);
    drawLayers(ctx, SPRITES[it.kind]);
    ctx.restore();
  }
}
