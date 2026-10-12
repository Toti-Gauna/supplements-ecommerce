import { formatARS } from "@/lib/money";
import { DISPLAY, MONO, SANS, drawLines, wrap } from "./paint";
import type { StudioScene } from "./types";

/**
 * Datos de la pieza junto al visual: nombre y precio (tachado si hay precio con cupón), precio por servicio y rótulo
 * de lote del producto destacado, total del stack o la escalera de premios del juego. Devuelve dónde termina (y).
 */
type Align = "left" | "center";

/** Rótulo de laboratorio en mono con borde ("LOTE VL-2610-C · VTO 03/2028"). */
export function labTag(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, align: Align, color = "rgba(255,255,255,0.8)") {
  ctx.save();
  ctx.font = `700 ${size}px ${MONO}`;
  const w = ctx.measureText(text).width + size * 1.2, h = size * 1.9;
  const left = align === "center" ? x - w / 2 : x;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(left, y, w, h, 8); ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(text, left + size * 0.6, y + h / 2 + 1);
  ctx.restore();
  return y + h;
}

/** Precio principal y, si hay cupón, el de lista tachado al lado. */
function price(ctx: CanvasRenderingContext2D, s: StudioScene, main: number, old: number | null, x: number, y: number, size: number, align: Align) {
  ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${size * 1.1}px ${SANS}`;
  ctx.fillStyle = old !== null ? s.look.accent : "#ffffff";
  const text = formatARS(main);
  if (old === null) { ctx.fillText(text, x, y); return; }
  // Con precio tachado, el par (precio + tachado) se centra junto.
  const w = ctx.measureText(text).width;
  ctx.font = `600 ${size * 0.7}px ${SANS}`;
  const o = formatARS(old), ow = ctx.measureText(o).width;
  const left = align === "center" ? x - (w + 18 + ow) / 2 : x;
  ctx.textAlign = "left";
  ctx.font = `800 ${size * 1.1}px ${SANS}`;
  ctx.fillText(text, left, y);
  ctx.font = `600 ${size * 0.7}px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(o, left + w + 18, y);
  ctx.fillRect(left + w + 18, y - size * 0.24, ow, 3);
}

/** Nombre y precio del producto `index`; en "Producto destacado", también precio por servicio y lote. */
export function priceTag(ctx: CanvasRenderingContext2D, s: StudioScene, index: number, x: number, y: number, size: number, maxW: number, align: Align, alpha: number, maxLines = 2): number {
  const p = s.products[index]?.data;
  if (!p || alpha <= 0) return y;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${size}px ${DISPLAY}`;
  let end = s.template === "product" ? y - size : drawLines(ctx, wrap(ctx, p.name, maxW, maxLines), x, y, size * 1.08, 1, align);
  if (s.showPrice) {
    end += size * 0.3;
    const deal = s.showOffer && p.offerPrice !== null;
    price(ctx, s, deal ? p.offerPrice! : p.price, deal ? p.price : null, x, end + size * 0.8, size, align);
    end += size * 1.2;
    if (s.template === "product" && p.perServing) {
      ctx.font = `700 ${Math.round(size * 0.55)}px ${MONO}`;
      ctx.fillStyle = s.look.accent; ctx.textAlign = align;
      ctx.fillText(`${formatARS(p.perServing)} por servicio${p.servings ? ` · ${p.servings} servicios` : ""}`, x, end + size * 0.45);
      end += size * 0.75;
    }
  }
  if (s.template === "product" && p.lot) end = labTag(ctx, p.lot, x, end + size * 0.3, Math.round(size * 0.42), align);
  ctx.restore();
  return end;
}

/** Total del stack: subtotal tachado, el % y el total con el descuento (o los precios sueltos si no aplica). */
export function stackTotal(ctx: CanvasRenderingContext2D, s: StudioScene, x: number, y: number, size: number, align: Align, alpha: number): number {
  const st = s.stack;
  if (!st || !s.showPrice || alpha <= 0) return y;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `700 ${Math.round(size * 0.5)}px ${MONO}`;
  ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  ctx.fillText(st.applies ? `LOS ${s.products.length} JUNTOS · STACK −${st.pct} %` : `LOS ${s.products.length} JUNTOS`, x, y);
  price(ctx, s, st.applies ? st.total : st.subtotal, st.applies ? st.subtotal : null, x, y + size * 1.25, size, align);
  ctx.restore();
  return y + size * 1.6;
}

/** Escalera de premios del juego: "300 pts → 5 % OFF" con una celda de batería por nivel. */
export function tierLadder(ctx: CanvasRenderingContext2D, s: StudioScene, x: number, y: number, size: number, align: Align, alpha: number): number {
  const g = s.game;
  if (!g || alpha <= 0) return y;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (!g.active) {
    ctx.font = `600 ${size}px ${SANS}`; ctx.fillStyle = "#ffffff"; ctx.textAlign = align;
    ctx.fillText("Jugá por el récord", x, y + size);
    ctx.restore();
    return y + size * 1.4;
  }
  const rowH = size * 1.55;
  g.tiers.forEach((tier, i) => {
    const ry = y + i * rowH;
    const ptsText = `${tier.minScore.toLocaleString("es-AR")} PTS`, label = tier.label;
    ctx.font = `700 ${Math.round(size * 0.55)}px ${MONO}`;
    const pw = ctx.measureText(ptsText).width;
    ctx.font = `800 ${size}px ${SANS}`;
    const lw = ctx.measureText(label).width;
    // Una celda de batería más por nivel: el premio "carga" a medida que sube el puntaje.
    const cell = size * 0.26, step = cell * 1.35, cells = g.tiers.length, gap = size * 0.4;
    const bar = cells * step;
    const start = align === "center" ? x - (bar + gap + lw + gap + pw) / 2 : x;
    for (let c = 0; c < cells; c++) {
      ctx.fillStyle = c <= i ? s.look.accent : "rgba(255,255,255,0.18)";
      ctx.fillRect(start + c * step, ry + size * 0.2, cell, size * 0.8);
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, start + bar + gap, ry + size);
    ctx.font = `700 ${Math.round(size * 0.55)}px ${MONO}`;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(ptsText, start + bar + gap + lw + gap, ry + size * 0.92);
  });
  ctx.restore();
  return y + g.tiers.length * rowH;
}
