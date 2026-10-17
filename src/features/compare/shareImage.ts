"use client";
import { brand } from "@/config/brand";
import type { CompareTable } from "@/demo/engine/compare";
import { sharePng } from "@/lib/share-png";

/**
 * "Compartir la comparación como imagen" (para mandarla por WhatsApp): se dibuja en un canvas del navegador, sin
 * servicios externos, como una placa noche del box (igual en los dos modos), con el mejor de cada renglón en voltio.
 * Después, la hoja de compartir del sistema si acepta archivos; si no, se descarga el PNG.
 */
const W = 1080;
const PAD = 64;
const LABEL_W = 250;
const ROW_H = 96;

interface Palette { bg: string; band: string; ink: string; muted: string; volt: string; line: string; display: string; mono: string }

function palette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const display = getComputedStyle(document.body).getPropertyValue("--font-box-display").trim();
  return {
    bg: v("--c-night", "black"), band: v("--c-night-2", "black"), ink: v("--brand-on-night", "white"), muted: v("--brand-night-muted", "gray"),
    volt: v("--brand-volt", "yellow"), line: "rgb(255 255 255 / 0.14)", display: display ? `${display}, ${v("--brand-display", "sans-serif")}` : v("--brand-display", "sans-serif"),
    mono: v("--brand-mono", "monospace"),
  };
}

/** Parte un texto en renglones que entren en `max` px (como mucho `lines`, el último con "…"). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= max || !line) line = next;
    else { out.push(line); line = word; }
  }
  if (line) out.push(line);
  if (out.length <= lines) return out;
  const cut = out.slice(0, lines);
  cut[lines - 1] = `${cut[lines - 1]!.replace(/\s*\S*$/, "")}…`;
  return cut;
}

/** Dibuja la comparación y devuelve el PNG. `when`: la fecha que se imprime ("17/10/2026"). */
export async function renderComparison(table: CompareTable, when: string): Promise<Blob> {
  await document.fonts?.ready;
  const c = palette();
  const n = table.columns.length;
  const colW = (W - PAD * 2 - LABEL_W) / n;
  const headH = 340;
  const top = 250;
  const H = top + headH + table.rows.length * ROW_H + 120;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c.volt;
  ctx.fillRect(0, 0, W, 8);
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 24px ${c.mono}`;
  ctx.fillText(`${brand.name.toUpperCase()} · COMPARADOR`, PAD, 84);
  ctx.fillStyle = c.ink;
  ctx.font = `800 84px ${c.display}`;
  ctx.fillText("¿CUÁL ME CONVIENE?", PAD, 172);
  ctx.fillStyle = c.muted;
  ctx.font = `400 22px ${c.mono}`;
  ctx.fillText(`Precios al ${when} · el mejor de cada renglón, marcado`, PAD, 216);

  table.columns.forEach((col, i) => {
    const x = PAD + LABEL_W + i * colW + 16;
    ctx.fillStyle = c.band;
    ctx.fillRect(x - 12, top, colW - 8, headH - 24);
    ctx.fillStyle = c.volt;
    ctx.font = `700 20px ${c.mono}`;
    ctx.fillText((col.product.brand || "").toUpperCase(), x, top + 44, colW - 32);
    ctx.fillStyle = c.ink;
    ctx.font = `800 42px ${c.display}`;
    wrap(ctx, col.product.name.toUpperCase(), colW - 36, 4).forEach((l, k) => ctx.fillText(l, x, top + 96 + k * 42));
    ctx.fillStyle = c.muted;
    ctx.font = `400 19px ${c.mono}`;
    wrap(ctx, col.presentation, colW - 36, 2).forEach((l, k) => ctx.fillText(l, x, top + headH - 76 + k * 24));
  });

  table.rows.forEach((row, r) => {
    const y = top + headH + r * ROW_H;
    ctx.fillStyle = c.line;
    ctx.fillRect(PAD, y, W - PAD * 2, 2);
    ctx.fillStyle = c.muted;
    ctx.font = `700 19px ${c.mono}`;
    wrap(ctx, row.label.toUpperCase(), LABEL_W - 24, 2).forEach((l, k) => ctx.fillText(l, PAD, y + 42 + k * 24));
    row.cells.forEach((cell, i) => {
      const x = PAD + LABEL_W + i * colW + 16;
      if (cell.best) {
        ctx.fillStyle = c.volt;
        ctx.fillRect(x - 12, y + 14, 5, ROW_H - 28);
      }
      ctx.fillStyle = cell.best ? c.volt : cell.value === null ? c.muted : c.ink;
      const long = row.key === "badges" || row.key === "brand";
      ctx.font = long ? `600 21px ${c.mono}` : `800 40px ${c.display}`;
      wrap(ctx, cell.text, colW - 36, long ? 2 : 1).forEach((l, k) => ctx.fillText(l, x, y + (long ? 42 : 56) + k * 26));
      if (cell.best) {
        ctx.font = `700 16px ${c.mono}`;
        ctx.fillText("MEJOR", x, y + ROW_H - 14);
      }
    });
  });
  ctx.fillStyle = c.muted;
  ctx.font = `400 20px ${c.mono}`;
  ctx.fillText(`${brand.name} · ${brand.city} · precios de la tienda, sujetos a cambios`, PAD, H - 52);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png"));
}

export type { ShareResult } from "@/lib/share-png";

/** Hoja de compartir del sistema con el PNG (WhatsApp, Instagram…); si no acepta archivos, descarga. */
export const shareComparison = sharePng;
