import { coverCrop, type PieceLayout } from "@/demo/admin/studio/campaign-pieces";
import type { ThemeOffer } from "@/demo/engine/themes";
import type { SeasonalTheme } from "@/demo/types";
import type { ThemeSkin } from "@/features/themes/skins";
import { MONO } from "../../studio/render/paint";
import type { Img } from "../../studio/render/types";

/** Lo común de las piezas de campaña: qué se dibuja, el fondo con el key visual y el descuento de marcador. */
export interface PieceInput {
  theme: SeasonalTheme;
  offer: ThemeOffer | null;
  skin: ThemeSkin;
  /** Key visual 4:5 de la campaña ya pasado a imagen (null mientras carga: queda el degradé). */
  art: Img | null;
  /** "Ahora" de la demo (ISO) para la cuenta regresiva. */
  now: string;
}

/** Fondo de la fecha y el key visual recortado en su lugar, con el velo que deja leer el texto. */
export function drawBackdrop(ctx: CanvasRenderingContext2D, W: number, H: number, l: PieceLayout, p: PieceInput, veilDir: "down" | "right" = "down") {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, p.skin.from);
  bg.addColorStop(1, p.skin.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  if (p.art) {
    const c = coverCrop(p.art.naturalWidth || 800, p.art.naturalHeight || 1000, l.art, 0.35);
    ctx.drawImage(p.art, c.x, c.y, c.w, c.h, l.art.x, l.art.y, l.art.w, l.art.h);
  }
  const v = l.veil;
  const g = veilDir === "down" ? ctx.createLinearGradient(0, v.y, 0, v.y + v.h) : ctx.createLinearGradient(v.x, 0, v.x + v.w, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, p.skin.from);
  ctx.fillStyle = g;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  if (veilDir === "down") { ctx.fillStyle = p.skin.from; ctx.fillRect(0, v.y + v.h - 1, W, H - v.y - v.h + 1); }
}

/** El descuento como número de marcador ("30" + "% OFF"); devuelve dónde termina. */
export function drawDiscount(ctx: CanvasRenderingContext2D, offer: ThemeOffer | null, x: number, y: number, size: number, accent: string): number {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = accent;
  ctx.shadowBlur = size * 0.18;
  ctx.fillStyle = accent;
  const big = !offer ? "" : offer.coupon.type === "PERCENT" ? String(offer.coupon.value) : offer.coupon.type === "FIXED" ? `$${offer.coupon.value.toLocaleString("es-AR")}` : "";
  ctx.font = `800 ${big.length > 3 ? size * 0.62 : size}px ${MONO}`;
  ctx.fillText(big, x, y);
  const w = ctx.measureText(big).width;
  ctx.shadowBlur = 0;
  ctx.font = `800 ${size * 0.3}px ${MONO}`;
  const unit = !offer ? "" : offer.coupon.type === "PERCENT" ? "% OFF" : offer.coupon.type === "FIXED" ? "OFF" : "ENVÍO GRATIS";
  ctx.fillText(unit, x + w + (big ? size * 0.08 : 0), y - size * 0.06);
  ctx.restore();
  return x + w;
}
