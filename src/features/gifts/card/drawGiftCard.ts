"use client";
import { brand } from "@/config/brand";
import type { GiftOpening } from "@/demo/engine/gift-options";
import type { GiftOccasion } from "@/demo/types";
import { canvasPalette, canvasToPng } from "@/lib/share-png";
import { drawLogo, fitLine, wrap } from "../../admin/studio/render/paint";
import { drawBackdrop, drawDiagonal } from "./backdrop";
import { cardPalette } from "./designs";
import { drawBag, drawLocker } from "./motifs";

/**
 * Tarjeta del regalo para mandar por WhatsApp (R3b): 1080 × 1350 (4:5), dibujada en un canvas del navegador. Lleva para
 * quién es, de quién, el mensaje escrito a mano, la apertura (bolsa o locker), el código y dónde abrirlo. Lo de
 * adentro es sorpresa: nunca muestra el producto ni el precio.
 */
export const CARD_W = 1080;
export const CARD_H = 1350;
const PAD = 72;

export interface GiftCardArtData {
  to: string;
  from: string;
  message: string;
  occasion: GiftOccasion;
  /** Nombre de la ocasión ("Navidad"); sin fecha especial, vacío. */
  occasionName?: string;
  design?: string;
  opening: GiftOpening;
  /** El locker usa la fecha del regalo como combinación (se da la pista) o una propia. */
  lockerHint?: "fecha" | "propia";
  /** REGALO-XXXX-XXXX; en la vista previa todavía no existe. */
  code?: string;
  /** Dónde se abre ("tienda.com/regalo"). */
  where: string;
}

const FALLBACK = { to: "Para vos", from: "…" };

export function drawGiftCard(ctx: CanvasRenderingContext2D, d: GiftCardArtData) {
  const W = CARD_W, H = CARD_H;
  const c = canvasPalette();
  const p = cardPalette(d.design, d.occasion);
  const motifX = 790;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  drawBackdrop(ctx, W, H, p, motifX);
  drawDiagonal(ctx, W, p, d.occasionName ? `EDICIÓN ${d.occasionName.toUpperCase()}` : "EDICIÓN REGALO", c.mono);
  drawLogo(ctx, PAD, 30, 46, p.ink);
  if (d.opening === "locker") drawLocker(ctx, motifX, 120, p, c.mono);
  else drawBag(ctx, motifX, 96, p, c.display);
  // Titular en itálica de póster: el nombre en la luz de señal.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.accent;
  ctx.font = `800 26px ${c.mono}`;
  ctx.fillText("ENTREGA ESPECIAL", PAD, 214);
  const head = (text: string, y: number, color: string, max: number) => {
    let size = 168;
    ctx.font = `italic 900 ${size}px ${c.display}`;
    while (size > 70 && ctx.measureText(text).width > max) { size -= 4; ctx.font = `italic 900 ${size}px ${c.display}`; }
    ctx.fillStyle = color;
    ctx.fillText(text, PAD - 6, y);
  };
  head(`${(d.to.trim() || FALLBACK.to).toUpperCase()},`, 380, p.accent, 600);
  head("TENÉS UN", 530, p.ink, 560);
  head("REGALO", 680, p.ink, 560);
  // Mensaje en papel, escrito a mano y apenas torcido.
  const message = d.message.trim();
  ctx.save();
  ctx.translate(PAD, 740);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.font = `600 46px Caveat, cursive`;
  const lines = message ? wrap(ctx, `“${message}”`, 470, 4) : [];
  const boxH = 70 + Math.max(1, lines.length) * 50;
  ctx.fillStyle = p.paper;
  ctx.shadowColor = "rgb(0 0 0 / 0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  ctx.fillRect(0, 0, 540, boxH);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = p.accent;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(200, -16, 130, 34);
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.paperInk;
  lines.forEach((l, i) => ctx.fillText(l, 34, 70 + i * 50));
  if (!lines.length) { ctx.globalAlpha = 0.45; ctx.fillText("Tu mensaje va acá.", 34, 70); ctx.globalAlpha = 1; }
  ctx.font = `600 40px Caveat, cursive`;
  ctx.textAlign = "right";
  ctx.fillText(fitLine(ctx, `— ${d.from.trim() || FALLBACK.from}`, 400), 510, boxH - 20);
  ctx.restore();
  // Cómo se abre, debajo del motivo.
  ctx.textAlign = "center";
  ctx.fillStyle = p.ink;
  ctx.font = `800 26px ${c.mono}`;
  ctx.fillText(d.opening === "locker" ? "SE ABRE CON COMBINACIÓN" : "SE ABRE A GOLPES", motifX, 1032);
  ctx.fillStyle = p.muted;
  ctx.font = `500 26px ${c.mono}`;
  const hint = d.opening === "locker" ? (d.lockerHint === "propia" ? "Pedime la clave" : "Pista: el día que te lo regalé") : "5 golpes y es tuyo";
  ctx.fillText(hint, motifX, 1070);
  drawTicket(ctx, W, H, p, c, d);
  ctx.restore();
}

/** Ticket de entrada al pie: el código para abrirlo y dónde, con troquel. */
function drawTicket(ctx: CanvasRenderingContext2D, W: number, H: number, p: ReturnType<typeof cardPalette>, c: ReturnType<typeof canvasPalette>, d: GiftCardArtData) {
  const x = PAD - 24, y = H - 236, w = W - (PAD - 24) * 2, h = 180, cut = w * 0.64;
  ctx.save();
  ctx.fillStyle = p.paper;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  // Muescas del troquel (se "recortan" con el fondo del diseño).
  ctx.fillStyle = p.bg[1];
  for (const cy of [y, y + h]) { ctx.beginPath(); ctx.arc(x + cut, cy, 22, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = p.paperInk;
  ctx.globalAlpha = 0.35;
  ctx.setLineDash([8, 10]);
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + cut, y + 30); ctx.lineTo(x + cut, y + h - 30); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.fillStyle = p.paperInk;
  ctx.font = `800 24px ${c.mono}`;
  ctx.fillText("TU CÓDIGO DE ENTRADA", x + 40, y + 56);
  ctx.font = `800 58px ${c.mono}`;
  ctx.fillText(fitLine(ctx, d.code ?? "REGALO-····-····", cut - 70), x + 40, y + 128);
  ctx.font = `800 24px ${c.mono}`;
  ctx.fillText("ABRILO EN", x + cut + 40, y + 56);
  ctx.font = `800 34px ${c.display}`;
  ctx.fillText(fitLine(ctx, d.where, w - cut - 70), x + cut + 40, y + 104);
  ctx.font = `500 22px ${c.mono}`;
  ctx.globalAlpha = 0.7;
  ctx.fillText(fitLine(ctx, `${brand.name} · ${brand.city}`, w - cut - 70), x + cut + 40, y + 142);
  ctx.restore();
}

/** La tarjeta como PNG (espera las fuentes para que el titular y el mensaje salgan con su letra). */
export async function renderGiftCardPng(d: GiftCardArtData): Promise<Blob> {
  await document.fonts?.ready;
  const canvas = Object.assign(document.createElement("canvas"), { width: CARD_W, height: CARD_H });
  drawGiftCard(canvas.getContext("2d")!, d);
  return canvasToPng(canvas);
}
