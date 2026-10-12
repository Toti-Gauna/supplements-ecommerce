import { SHAKER, WORLD_W, shakerTop, type GameState } from "@/demo/engine/game";
import { gameRules } from "@/demo/fixtures/game";
import { drawItem, drawShaker } from "./art/draw";
import { drawFx, shakeOffset, type Fx } from "./fx";

/**
 * Un cuadro de Shaker Rush. El fondo (noche, grilla, luz) es CSS detrás del canvas transparente: acá solo se limpia y
 * se dibuja lo que se mueve. Se dibuja en px CSS (el contexto ya está escalado por devicePixelRatio) y el mundo de 360
 * de ancho se centra con `scale`, `ox` y `oy`.
 */
export interface View {
  cssW: number;
  cssH: number;
  dpr: number;
  scale: number;
  ox: number;
  oy: number;
}

export interface SceneOptions {
  still: boolean;
  /** Batido del shaker (0 a 1) y marcas de los premios. */
  level: number;
  marks: { level: number; reached: boolean }[];
}

/** Calcula escala y márgenes para que el mundo entre en el área del juego (ancho fijo, alto el de la pantalla). */
export function fitView(cssW: number, cssH: number, dpr: number, worldH: number): View {
  const scale = Math.min(cssW / WORLD_W, cssH / worldH);
  return { cssW, cssH, dpr, scale, ox: (cssW - WORLD_W * scale) / 2, oy: cssH - worldH * scale };
}

export function drawScene(ctx: CanvasRenderingContext2D, s: GameState, fx: Fx, view: View, opts: SceneOptions): void {
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  ctx.clearRect(0, 0, view.cssW, view.cssH);
  const [sx, sy] = shakeOffset(fx);
  ctx.translate(view.ox + sx, view.oy + sy);
  ctx.scale(view.scale, view.scale);
  // Bordes del campo y piso: líneas finas, apenas visibles (en pantallas anchas marcan hasta dónde llega el shaker).
  ctx.strokeStyle = "rgba(238,241,245,0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, s.h);
  ctx.moveTo(WORLD_W, 0); ctx.lineTo(WORLD_W, s.h);
  ctx.moveTo(0, s.h - SHAKER.floor + 4); ctx.lineTo(WORLD_W, s.h - SHAKER.floor + 4);
  ctx.stroke();
  for (const it of s.items) drawItem(ctx, it, opts.still, gameRules.items[it.kind].junk);
  const tilt = opts.still ? 0 : Math.max(-0.16, Math.min(0.16, s.shaker.vx / 2600));
  drawShaker(ctx, s.shaker.x, shakerTop(s.h), { tilt, level: opts.level, marks: opts.marks, boost: s.boost > 0, hurt: s.shaker.hurt / SHAKER.hurtSec });
  drawFx(ctx, fx);
}
