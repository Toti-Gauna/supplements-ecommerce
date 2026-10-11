import { LOGO_M, LOGO_STROKE, LOGO_V } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";
import { CARD_PAD, cardSprite } from "./sprites";
import type { Img } from "./types";

/** Utilidades de dibujo en canvas (coordenadas de diseño a 1080 px de ancho). */
export const DISPLAY = '"Fraunces Variable", Georgia, serif';
export const SANS = '"Manrope Variable", system-ui, sans-serif';

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Imagen recortada para cubrir el rectángulo (como object-fit: cover). */
export function drawCover(ctx: CanvasRenderingContext2D, img: Img, x: number, y: number, w: number, h: number) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih);
  const sw = w / s, sh = h / s;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

/** Tarjeta de producto: foto o ilustración con esquinas redondeadas, sombra y giro leve. */
export function drawCard(ctx: CanvasRenderingContext2D, img: Img | null, x: number, y: number, w: number, h: number, opts: { rotate?: number; alpha?: number; radius?: number } = {}) {
  ctx.save();
  ctx.globalAlpha *= opts.alpha ?? 1;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(((opts.rotate ?? 0) * Math.PI) / 180);
  ctx.drawImage(cardSprite(img, w, h, opts.radius ?? 36, (c, i, cw, ch) => drawCover(c, i, 0, 0, cw, ch)), -w / 2 - CARD_PAD, -h / 2 - CARD_PAD);
  ctx.restore();
}

/** Corta el texto en líneas que entran en `maxWidth` (con la fuente ya puesta). */
export function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 4): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = `${lines[maxLines - 1]!.replace(/\s+\S*$/, "")}…`; }
  return lines;
}

/** Bloque de texto: devuelve dónde termina (y). `reveal` 0–1 sube y aparece cada línea en cascada. */
export function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number, reveal = 1, align: CanvasTextAlign = "left") {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  lines.forEach((l, i) => {
    const p = Math.min(1, Math.max(0, reveal * (lines.length + 1) - i));
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.fillText(l, x, y + i * lineHeight + (1 - p) * 26);
    ctx.restore();
  });
  return y + lines.length * lineHeight;
}

/** Recorta una línea con "…" para que entre en `maxWidth` (con la fuente ya puesta). */
export function fitLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = Array.from(text);
  while (chars.length > 1 && ctx.measureText(`${chars.join("")}…`).width > maxWidth) chars.pop();
  return `${chars.join("").trimEnd()}…`;
}

/** Bajada con letras espaciadas: separa por caracteres reales (los emojis no se parten). */
export const spaced = (text: string) => Array.from(text.toUpperCase()).join("\u200a");

/** Píldora con texto (CTA, sello de oferta, "Deslizá"). Achica la letra si no entra en `maxWidth`. Devuelve su ancho. */
export function drawPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: { bg: string; ink: string; size?: number; align?: "left" | "center" | "right"; padX?: number; h?: number; maxWidth?: number }) {
  const padX = opts.padX ?? 34;
  let size = opts.size ?? 30;
  ctx.font = `800 ${size}px ${SANS}`;
  while (opts.maxWidth && size > 16 && ctx.measureText(text).width + padX * 2 > opts.maxWidth) { size -= 1; ctx.font = `800 ${size}px ${SANS}`; }
  const h = opts.h ?? (opts.size ?? 30) * 2.2;
  const w = ctx.measureText(text).width + padX * 2;
  const left = opts.align === "center" ? x - w / 2 : opts.align === "right" ? x - w : x;
  roundRect(ctx, left, y, w, h, h / 2);
  ctx.fillStyle = opts.bg;
  ctx.fill();
  ctx.fillStyle = opts.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + w / 2, y + h / 2 + 1);
  return w;
}

const LOGO_PATH = typeof Path2D === "undefined" ? null : new Path2D(`${LOGO_M}M${LOGO_V.slice(1)}`);

/** Logo de Volta (marca + nombre). `h` = alto de la marca. */
export function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string) {
  if (!LOGO_PATH) return;
  const s = h / 452;
  ctx.save();
  ctx.translate(x - 156 * s, y - 234 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = LOGO_STROKE;
  ctx.lineJoin = "miter";
  ctx.stroke(LOGO_PATH);
  ctx.restore();
  ctx.fillStyle = color;
  ctx.font = `500 ${h * 1.05}px ${DISPLAY}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(brand.name, x + h * 1.42, y + h * 0.52);
}
