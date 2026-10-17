import { brand } from "@/config/brand";
import type { canvasPalette } from "@/lib/share-png";
import { fitLine } from "../../admin/studio/render/paint";
import type { CardPalette } from "./designs";
import type { GiftCardArtData } from "./drawGiftCard";

/** Ticket de entrada al pie: el código para abrirlo y dónde, con troquel. */
export function drawTicket(ctx: CanvasRenderingContext2D, W: number, H: number, PAD: number, p: CardPalette, c: ReturnType<typeof canvasPalette>, d: GiftCardArtData) {
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
  // El sitio en dos renglones: el dominio y el camino ("/tienda/regalo").
  const slash = d.where.indexOf("/");
  const [host, path] = slash > 0 ? [d.where.slice(0, slash), d.where.slice(slash)] : [d.where, ""];
  ctx.font = `800 34px ${c.display}`;
  ctx.fillText(fitLine(ctx, host || brand.name, w - cut - 70), x + cut + 40, y + 102);
  ctx.font = `700 22px ${c.mono}`;
  ctx.globalAlpha = 0.75;
  // Si el camino no entra, se recorta del principio: lo que importa es el final ("…/regalo").
  let tail = path || brand.city;
  while (tail.length > 4 && ctx.measureText(tail).width > w - cut - 70) tail = `…${tail.slice(2)}`;
  ctx.fillText(tail, x + cut + 40, y + 140);
  ctx.restore();
}
