"use client";
import { brand } from "@/config/brand";
import { canvasPalette, canvasToPng } from "@/lib/share-png";

/**
 * Tarjeta 9:16 del puntaje de Shaker Rush (1080 × 1920, para historias): se dibuja en un canvas del navegador como
 * la pantalla de un arcade del box, con el puntaje en dígitos LED de 7 segmentos, el puesto de la semana y el premio.
 */
export interface ScoreCardData {
  score: number;
  best: number;
  newBest: boolean;
  position: number | null;
  prize: string | null;
  alias: string;
  /** Fecha que se imprime ("17/10/2026"). */
  when: string;
}

const W = 1080;
const H = 1920;
const PAD = 84;
// Segmentos del marcador (mismas medidas que el LED de la tienda: dígito de 32 × 58).
const T = 6;
const hSeg = (cy: number): number[][] => [[4, cy], [4 + T / 2, cy - T / 2], [28 - T / 2, cy - T / 2], [28, cy], [28 - T / 2, cy + T / 2], [4 + T / 2, cy + T / 2]];
const vSeg = (cx: number, y1: number, y2: number): number[][] => [[cx, y1], [cx + T / 2, y1 + T / 2], [cx + T / 2, y2 - T / 2], [cx, y2], [cx - T / 2, y2 - T / 2], [cx - T / 2, y1 + T / 2]];
const SEGS = [hSeg(3), vSeg(29, 4, 28), vSeg(29, 30, 54), hSeg(55), vSeg(3, 30, 54), vSeg(3, 4, 28), hSeg(29)];
const DIGITS: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg" };

/** Dibuja un número con dígitos LED, centrado en `cx`, con la base en `y` y una escala. */
function drawLed(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, scale: number, color: string) {
  const width = [...text].reduce((w, c) => w + (c in DIGITS ? 40 : 12), 0) * scale;
  let x = cx - width / 2;
  for (const c of text) {
    if (!(c in DIGITS)) {
      ctx.fillStyle = color;
      ctx.fillRect(x + 1 * scale, y + 52 * scale, 6 * scale, 6 * scale);
      x += 12 * scale;
      continue;
    }
    SEGS.forEach((pts, k) => {
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, x + (px! - (py! - 29) * 0.12) * scale, y + py! * scale));
      ctx.closePath();
      const on = DIGITS[c]!.includes("abcdefg"[k]!);
      ctx.globalAlpha = on ? 1 : 0.08;
      ctx.shadowBlur = on ? 18 : 0;
      ctx.fillStyle = color;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    x += 40 * scale;
  }
}

function plate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string, value: string, c: ReturnType<typeof canvasPalette>) {
  ctx.fillStyle = "rgb(255 255 255 / 0.06)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgb(255 255 255 / 0.16)";
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = c.muted;
  ctx.font = `700 24px ${c.mono}`;
  ctx.fillText(label, x + 28, y + 52, w - 56);
  ctx.fillStyle = c.ink;
  ctx.font = `800 64px ${c.display}`;
  ctx.fillText(value, x + 28, y + h - 36, w - 56);
}

export async function renderScoreCard(d: ScoreCardData): Promise<Blob> {
  await document.fonts?.ready;
  const c = canvasPalette();
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.8, 260, 40, W * 0.8, 260, 900);
  glow.addColorStop(0, "rgb(139 114 255 / 0.32)");
  glow.addColorStop(1, "rgb(139 114 255 / 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgb(242 240 234 / 0.05)";
  for (let x = 120; x < W; x += 120) ctx.fillRect(x, 0, 2, H);
  for (let y = 0; y < H; y += 6) { ctx.fillStyle = "rgb(255 255 255 / 0.018)"; ctx.fillRect(0, y, W, 2); }
  ctx.fillStyle = c.volt;
  ctx.fillRect(0, 0, W, 12);
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 30px ${c.mono}`;
  ctx.fillText(`${brand.mark} · ${brand.club.toUpperCase()} · ARCADE`, PAD, 130);
  ctx.fillStyle = c.ink;
  ctx.font = `900 190px ${c.display}`;
  ctx.fillText("SHAKER", PAD, 350);
  ctx.fillStyle = c.volt;
  ctx.fillText("RUSH", PAD, 530);
  ctx.shadowColor = c.volt;
  drawLed(ctx, d.score.toLocaleString("es-AR"), W / 2, 700, Math.min(5.2, 860 / ([...d.score.toLocaleString("es-AR")].length * 40)), c.volt);
  ctx.fillStyle = c.muted;
  ctx.font = `700 34px ${c.mono}`;
  ctx.textAlign = "center";
  ctx.fillText("PUNTOS", W / 2, 1060);
  if (d.newBest) {
    ctx.fillStyle = c.volt;
    ctx.fillRect(W / 2 - 220, 1100, 440, 76);
    ctx.fillStyle = c.bg;
    ctx.font = `800 40px ${c.mono}`;
    ctx.fillText("NUEVO RÉCORD", W / 2, 1152);
  }
  ctx.textAlign = "left";
  const half = (W - PAD * 2 - 24) / 2;
  plate(ctx, PAD, 1240, half, 190, "PUESTO DE LA SEMANA", d.position ? `#${d.position}` : "—", c);
  plate(ctx, PAD + half + 24, 1240, half, 190, "RÉCORD", d.best.toLocaleString("es-AR"), c);
  plate(ctx, PAD, 1454, W - PAD * 2, 190, "PREMIO DE HOY", d.prize ?? "Sin cupón esta vez", c);
  ctx.fillStyle = c.ink;
  ctx.font = `800 64px ${c.display}`;
  ctx.fillText(`¿ME SUPERÁS, ${d.alias}?`.replace(", VOS?", "?"), PAD, 1760, W - PAD * 2);
  ctx.fillStyle = c.muted;
  ctx.font = `400 28px ${c.mono}`;
  ctx.fillText(`Jugalo en el ${brand.club} · ${brand.city} · ${d.when}`, PAD, 1830, W - PAD * 2);
  return canvasToPng(canvas);
}
