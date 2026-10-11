import { SHAKER, type FallingItem } from "@/demo/engine/game";
import { ART, SHAKER_ART, SPRITES, type Layer } from "./sprites";

/** Dibujo en canvas de las capas de `sprites.ts`. Los Path2D se crean una sola vez y se reusan en cada cuadro. */
const paths = new Map<string, Path2D>();
function path(d: string): Path2D {
  let p = paths.get(d);
  if (!p) { p = new Path2D(d); paths.set(d, p); }
  return p;
}

export function drawLayers(ctx: CanvasRenderingContext2D, layers: Layer[]): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const l of layers) {
    ctx.globalAlpha = l.alpha ?? 1;
    const p = path(l.d);
    if (l.fill) { ctx.fillStyle = l.fill; ctx.fill(p, l.evenodd ? "evenodd" : "nonzero"); }
    if (l.stroke) { ctx.strokeStyle = l.stroke; ctx.lineWidth = l.width ?? 1; ctx.stroke(p); }
  }
  ctx.globalAlpha = 1;
}

/** Lo que cae: la cápsula gira entera; lo demás se balancea (un pote o una hamburguesa dados vuelta se leen mal). */
export function drawItem(ctx: CanvasRenderingContext2D, it: FallingItem, still: boolean, junk: boolean): void {
  const angle = still ? 0 : it.kind === "capsule" ? it.rot : Math.sin(it.rot) * 0.32;
  if (!still) {
    // Estela de velocidad: dos trazos con poca opacidad (un degradé barato) que se alargan cuando todo cae más rápido.
    const len = it.vy * 0.1;
    ctx.strokeStyle = junk ? ART.ember : it.kind === "golden" ? ART.gold : ART.volt;
    ctx.lineCap = "round";
    ctx.lineWidth = it.r * 0.9;
    for (const [k, a] of [[1, 0.07], [0.5, 0.12]] as const) {
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(it.x, it.y - it.r * 0.5 - len * k); ctx.lineTo(it.x, it.y - it.r * 0.5); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(it.x, it.y);
  if (angle) ctx.rotate(angle);
  const k = it.r / 20;
  ctx.scale(k, k);
  drawLayers(ctx, SPRITES[it.kind]);
  ctx.restore();
}

const glows = new WeakMap<CanvasRenderingContext2D, { aura: CanvasGradient; rim: CanvasGradient }>();
function gradients(ctx: CanvasRenderingContext2D) {
  let g = glows.get(ctx);
  if (!g) {
    const aura = ctx.createRadialGradient(0, 40, 6, 0, 40, 74);
    aura.addColorStop(0, "rgba(200,255,46,0.42)");
    aura.addColorStop(1, "rgba(200,255,46,0)");
    const rim = ctx.createLinearGradient(0, 0, 0, 80);
    rim.addColorStop(0, ART.voltSoft);
    rim.addColorStop(0.5, ART.volt);
    rim.addColorStop(1, "rgba(139,114,255,0.35)");
    g = { aura, rim };
    glows.set(ctx, g);
  }
  return g;
}

export interface ShakerLook {
  /** Inclinación en radianes (sale de la velocidad). */
  tilt: number;
  /** Batido de 0 a 1: el avance hacia el premio más alto. */
  level: number;
  /** Marcas de los niveles de premio (0 a 1) y si ya se alcanzaron. */
  marks: { level: number; reached: boolean }[];
  boost: boolean;
  /** 0 a 1: golpe de chatarra reciente. */
  hurt: number;
}

/** El shaker del jugador, con la boca en (x, top). El batido sube con el puntaje y las marcas son los premios. */
export function drawShaker(ctx: CanvasRenderingContext2D, x: number, top: number, look: ShakerLook): void {
  const { aura, rim } = gradients(ctx);
  const cup = path(SHAKER_ART.cup);
  ctx.save();
  ctx.translate(x, top);
  ctx.rotate(look.tilt);
  if (look.boost) { ctx.fillStyle = aura; ctx.fillRect(-80, -40, 160, 160); }
  ctx.fillStyle = "rgba(223,230,238,0.12)";
  ctx.fill(cup);
  ctx.save();
  ctx.clip(cup);
  const surface = SHAKER.h - Math.min(1, Math.max(0, look.level)) * 74;
  ctx.fillStyle = look.boost ? ART.volt : ART.plasma;
  ctx.fillRect(-40, surface, 80, 90);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-40, surface, 80, 2.5);
  if (look.hurt > 0) { ctx.globalAlpha = look.hurt * 0.55; ctx.fillStyle = ART.ember; ctx.fillRect(-40, 0, 80, 90); ctx.globalAlpha = 1; }
  ctx.restore();
  ctx.lineCap = "round";
  for (const m of look.marks) {
    const y = SHAKER.h - m.level * 74;
    ctx.strokeStyle = m.reached ? ART.volt : "rgba(238,241,245,0.55)";
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-31 + (y / 80) * 4, y); ctx.lineTo(-17, y); ctx.stroke();
  }
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = look.boost ? ART.night : "#fff";
  ctx.translate(4, 44);
  ctx.fill(path(SHAKER_ART.mark));
  ctx.translate(-4, -44);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(238,241,245,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke(cup);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 4;
  ctx.stroke(path(SHAKER_ART.shine));
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.6;
  ctx.stroke(path(SHAKER_ART.rim));
  ctx.fillStyle = "#1a1f28";
  ctx.fill(path(SHAKER_ART.ring));
  ctx.strokeStyle = ART.volt;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-36, -6.5); ctx.lineTo(36, -6.5); ctx.stroke();
  ctx.restore();
}
