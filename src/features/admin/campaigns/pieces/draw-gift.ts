import { GIFT_CARD_SAMPLE, pieceLayout } from "@/demo/admin/studio/campaign-pieces";
import { STUDIO_BRAND } from "@/demo/fixtures/studio";
import { formatARS } from "@/lib/money";
import { display, drawLines, drawLogo, MONO, roundRect, SANS, wrap } from "../../studio/render/paint";
import { drawBackdrop, type PieceInput } from "./backdrop";

/**
 * Gift card de la fecha (1200 × 750): el key visual a la izquierda y, a la derecha, la tarjeta para regalar energía
 * con un monto de muestra. Es la imagen que se manda por WhatsApp o se sube a la historia junto con la campaña.
 */
export function drawGiftCard(ctx: CanvasRenderingContext2D, W: number, H: number, p: PieceInput) {
  const l = pieceLayout("giftcard");
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 44);
  ctx.clip();
  drawBackdrop(ctx, W, H, l, p, "right");
  ctx.fillStyle = p.skin.from;
  ctx.fillRect(l.veil.x + l.veil.w - 1, 0, W, H);
  drawLogo(ctx, l.pad, l.logoY, 50, "#ffffff");
  ctx.font = `800 26px ${MONO}`;
  ctx.fillStyle = p.skin.accent;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`GIFT CARD · ${p.theme.name.toUpperCase()}`, l.pad, 175);
  display(ctx, l.headlineSize);
  ctx.fillStyle = "#ffffff";
  drawLines(ctx, wrap(ctx, p.theme.sport ? "Regalá entrenamiento" : "Regalá energía", l.textW, 2), l.pad, l.headlineY, l.headlineSize);
  ctx.font = `500 28px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  drawLines(ctx, wrap(ctx, "Quien la recibe elige el producto, el sabor y el tamaño.", l.textW, 2), l.pad, 320, 38);
  ctx.font = `800 ${l.discountSize}px ${MONO}`;
  ctx.fillStyle = p.skin.accent;
  ctx.shadowColor = p.skin.accent;
  ctx.shadowBlur = 18;
  ctx.fillText(formatARS(GIFT_CARD_SAMPLE).replace(/\s/g, " "), l.pad, l.discountY);
  ctx.shadowBlur = 0;
  // Chip y número de tarjeta de muestra (no es un medio de pago).
  roundRect(ctx, l.pad, l.couponY, 86, 64, 12);
  ctx.fillStyle = p.skin.accent;
  ctx.fill();
  ctx.font = `700 28px ${MONO}`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(`REGALO-${p.theme.id.slice(0, 4).toUpperCase()}-0000`, l.pad + 110, l.couponY + 44);
  ctx.font = `600 24px ${SANS}`;
  ctx.fillText(`${STUDIO_BRAND.name} · ${STUDIO_BRAND.city}`, l.pad, H - 50);
  ctx.restore();
}
