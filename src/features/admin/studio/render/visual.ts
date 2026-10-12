import { beats, productSlot } from "@/demo/admin/studio/timeline";
import type { PotSpot } from "@/demo/admin/studio/offer";
import { drawGameArt } from "./game-art";
import { drawPedestal, drawPot } from "./pot";
import { DISPLAY, roundRect } from "./paint";
import type { StudioScene } from "./types";

/**
 * Lo principal de cada pieza, según la plantilla: el pote (o los potes de la oferta, uno por uno), el estante del
 * stack con los tres potes cayendo escalonados y el letrero de neón, o el shaker de Shaker Rush. Devuelve qué producto
 * se ve y cuándo empezó (para que el precio entre después).
 */
export interface VisualArea { cx: number; floorY: number; size: number; width: number }

export function drawVisual(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, a: VisualArea): { index: number; start: number } {
  const look = { accent: s.look.accent, glow: s.look.glow };
  const b = beats(s.duration);
  halo(ctx, a.cx, a.floorY - a.size * 0.4, a.size * 0.7, s.look.glow);
  if (s.template === "game") {
    const scale = a.size / 130;
    drawGameArt(ctx, t, b.product, s.duration, { cx: a.cx, top: a.floorY - 82 * scale, scale, spread: a.width / 2 });
    return { index: -1, start: b.product };
  }
  if (s.template === "stack") {
    drawShelf(ctx, s, t, a, look);
    return { index: -1, start: b.product };
  }
  const slot = productSlot(t, s.duration, s.products.length);
  const item = s.products[slot.index];
  const spot: PotSpot = { cx: a.cx, floorY: a.floorY, size: a.size };
  drawPot(ctx, item?.img ?? null, spot, { t, duration: s.duration, start: slot.start, seed: slot.index + 1, look, photo: item?.photo });
  return { index: slot.index, start: slot.start };
}

function halo(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `${color}55`); g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/**
 * Estante: una base larga y los potes cayendo uno tras otro; en el stack, con el descuento, el neón "Stack −10 %".
 * También arma la fila de potes de la portada del carrusel.
 */
export function drawShelf(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, a: VisualArea, look: { accent: string; glow: string } = s.look) {
  const b = beats(s.duration);
  const n = Math.max(1, s.products.length);
  drawPedestal(ctx, a.cx, a.floorY, a.width, look);
  const gap = a.width / n;
  s.products.forEach((item, i) => {
    const cx = a.cx - a.width / 2 + gap * (i + 0.5);
    const size = a.size * (n === 3 && i === 1 ? 1.08 : 1);
    drawPot(ctx, item.img, { cx, floorY: a.floorY, size }, { t, duration: s.duration, start: b.product, delay: i * 0.35, seed: i + 1, look, pedestal: false, photo: item.photo });
  });
  if (s.template !== "stack" || !s.stack?.applies) return;
  const on = t >= b.offer + 0.6 || t >= s.duration - 0.05;
  // Letrero de neón sobre el estante: se prende de golpe (con un parpadeo) cuando caen todos los potes.
  const flicker = on && (t >= b.offer + 1 || Math.floor(t * 20) % 3 !== 0);
  const text = `STACK −${s.stack.pct} %`;
  const size = Math.round(a.width * 0.075);
  ctx.save();
  ctx.font = `800 ${size}px ${DISPLAY}`;
  const w = ctx.measureText(text).width + size * 1.4, h = size * 1.7;
  const x = a.cx - w / 2, y = a.floorY - a.size * 0.95 - h;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = flicker ? s.look.accent : "rgba(255,255,255,0.18)";
  if (flicker) { ctx.shadowColor = s.look.accent; ctx.shadowBlur = 24; }
  ctx.stroke();
  ctx.fillStyle = flicker ? s.look.accent : "rgba(255,255,255,0.25)";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, a.cx, y + h / 2 + 2);
  ctx.restore();
}
