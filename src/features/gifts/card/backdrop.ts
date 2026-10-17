import { alpha } from "@/lib/color";
import type { CardPalette } from "./designs";

/** Escenario de la tarjeta: fondo, piso según el diseño y la luz de estudio sobre el motivo. */
type Ctx = CanvasRenderingContext2D;

/** Azar fijo (el mismo grano en cada dibujo, sin parpadeos al escribir). */
function seeded(seed: number) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function floor(ctx: Ctx, W: number, H: number, p: CardPalette) {
  const rnd = seeded(7);
  if (p.floor === "rubber") {
    ctx.fillStyle = "rgb(255 255 255 / 0.05)";
    for (let i = 0; i < 2600; i++) ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
    ctx.fillStyle = "rgb(242 240 234 / 0.045)";
    for (let x = 135; x < W; x += 135) ctx.fillRect(x, 0, 2, H);
  } else if (p.floor === "grid") {
    for (let x = 0; x <= W; x += 18) { ctx.fillStyle = x % 90 ? "rgb(11 13 16 / 0.05)" : "rgb(11 13 16 / 0.11)"; ctx.fillRect(x, 0, 1.5, H); }
    for (let y = 0; y <= H; y += 18) { ctx.fillStyle = y % 90 ? "rgb(11 13 16 / 0.05)" : "rgb(11 13 16 / 0.11)"; ctx.fillRect(0, y, W, 1.5); }
  } else if (p.floor === "ring") {
    // Lona del ring con tres cuerdas cruzando detrás del motivo.
    ctx.fillStyle = "rgb(255 255 255 / 0.04)";
    for (let i = 0; i < 1800; i++) ctx.fillRect(rnd() * W, rnd() * H, 3, 1);
    for (const [i, y] of [560, 680, 800].entries()) {
      ctx.fillStyle = i === 1 ? "#f6efe8" : "#d8262e";
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, y, W, 14);
      ctx.globalAlpha = 1;
    }
  } else {
    // Rayos de estadio desde arriba.
    ctx.save();
    ctx.translate(W / 2, -80);
    for (let i = -6; i <= 6; i++) {
      ctx.fillStyle = i % 2 ? "rgb(255 241 193 / 0.05)" : "rgb(255 241 193 / 0.025)";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(i * 150 - 50, H + 200); ctx.lineTo(i * 150 + 50, H + 200); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

export function drawBackdrop(ctx: Ctx, W: number, H: number, p: CardPalette, motifX: number) {
  const bg = ctx.createLinearGradient(0, 0, W * 0.3, H);
  bg.addColorStop(0, p.bg[0]);
  bg.addColorStop(1, p.bg[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  floor(ctx, W, H, p);
  // Cono de luz de estudio sobre el motivo y halo del color del diseño.
  const cone = ctx.createLinearGradient(0, 0, 0, 1050);
  cone.addColorStop(0, "rgb(255 255 255 / 0.12)");
  cone.addColorStop(1, "rgb(255 255 255 / 0)");
  ctx.fillStyle = cone;
  ctx.beginPath(); ctx.moveTo(motifX - 70, 0); ctx.lineTo(motifX + 70, 0); ctx.lineTo(motifX + 300, 1050); ctx.lineTo(motifX - 300, 1050); ctx.closePath(); ctx.fill();
  const halo = ctx.createRadialGradient(motifX, 560, 30, motifX, 560, 520);
  halo.addColorStop(0, alpha(p.glow, 0.33));
  halo.addColorStop(1, alpha(p.glow, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
}

/** Franja en diagonal (lenguaje "Arena" de campañas y regalos) con un rótulo. */
export function drawDiagonal(ctx: Ctx, W: number, p: CardPalette, label: string, mono: string) {
  ctx.save();
  ctx.fillStyle = p.accent;
  ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 96); ctx.lineTo(W * 0.5 - 70, 96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = p.onAccent;
  ctx.font = `800 28px ${mono}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W - 48, 50, W * 0.5 - 80);
  ctx.restore();
}
