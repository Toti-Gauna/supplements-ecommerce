import { campaignCountdown, countdownCells, pieceLayout, type PieceKind, type PieceLayout } from "@/demo/admin/studio/campaign-pieces";
import { STUDIO_BRAND } from "@/demo/fixtures/studio";
import { formatDayRange } from "@/lib/date";
import { display, drawLines, drawLogo, drawPill, fitLine, MONO, roundRect, SANS, wrap } from "../../studio/render/paint";
import { drawBackdrop, drawDiscount, type PieceInput } from "./backdrop";
import { drawGiftCard } from "./draw-gift";

export type { PieceInput } from "./backdrop";

function drawHead(ctx: CanvasRenderingContext2D, W: number, l: PieceLayout, p: PieceInput) {
  drawLogo(ctx, l.pad, l.logoY, 54, "#ffffff");
  ctx.save();
  ctx.font = `700 26px ${MONO}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(fitLine(ctx, `${p.theme.name} · ${formatDayRange(p.theme.startsOn, p.theme.endsOn)}`.toUpperCase(), W / 2), W - l.pad, l.logoY + 28);
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, l: PieceLayout, p: PieceInput, maxLines: number) {
  ctx.save();
  display(ctx, l.headlineSize);
  ctx.fillStyle = "#ffffff";
  const lines = wrap(ctx, p.theme.headline || p.theme.name, l.textW, maxLines);
  drawLines(ctx, lines, l.pad, l.headlineY - (lines.length - 1) * l.headlineSize * 0.98, l.headlineSize * 0.98);
  ctx.restore();
}

function drawCoupon(ctx: CanvasRenderingContext2D, l: PieceLayout, p: PieceInput, x: number, y: number) {
  if (!p.offer) return;
  const text = `CUPÓN ${p.offer.coupon.code}${p.offer.condition ? ` · ${p.offer.condition.replace(" de compra", "").toUpperCase()}` : ""}`;
  drawPill(ctx, text, x, y, { bg: p.skin.accent, ink: p.skin.accentInk, size: 30, maxWidth: l.textW });
}

/** Post 1:1: key visual de fondo, titular, descuento de marcador y cupón. */
function drawPost(ctx: CanvasRenderingContext2D, W: number, H: number, p: PieceInput) {
  const l = pieceLayout("post");
  drawBackdrop(ctx, W, H, l, p);
  drawHead(ctx, W, l, p);
  drawText(ctx, l, p, 2);
  drawDiscount(ctx, p.offer, l.pad, l.discountY, l.discountSize, p.skin.accent);
  drawCoupon(ctx, l, p, l.pad, l.couponY);
}

/** Historia 9:16: el key visual entero arriba, titular, descuento y la cuenta regresiva de marcador. */
function drawStory(ctx: CanvasRenderingContext2D, W: number, H: number, p: PieceInput) {
  const l = pieceLayout("story");
  drawBackdrop(ctx, W, H, l, p);
  drawHead(ctx, W, l, p);
  drawText(ctx, l, p, 2);
  drawDiscount(ctx, p.offer, l.pad, l.discountY, l.discountSize, p.skin.accent);
  const cd = campaignCountdown(p.theme, p.now);
  const box = l.countdown!;
  ctx.save();
  ctx.font = `800 30px ${MONO}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(cd.label.toUpperCase(), box.x, box.y);
  const cells = countdownCells(cd), gap = 24, cw = (box.w - gap * 2) / 3;
  cells.forEach((c, i) => {
    const x = box.x + i * (cw + gap);
    roundRect(ctx, x, box.y + 24, cw, box.h - 24, 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fill();
    ctx.fillStyle = p.skin.accent;
    ctx.textAlign = "center";
    ctx.font = `800 104px ${MONO}`;
    ctx.fillText(c.value, x + cw / 2, box.y + 150);
    ctx.font = `700 26px ${SANS}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(c.unit, x + cw / 2, box.y + 196);
  });
  ctx.restore();
  drawCoupon(ctx, l, p, l.pad, l.couponY);
  ctx.save();
  ctx.font = `600 30px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.textAlign = "left";
  ctx.fillText(STUDIO_BRAND.cta, l.pad, H - 60);
  ctx.restore();
}

/** Dibuja la pieza entera en un canvas del tamaño de la pieza. */
export function drawPiece(ctx: CanvasRenderingContext2D, kind: PieceKind, W: number, H: number, p: PieceInput) {
  ctx.clearRect(0, 0, W, H);
  if (kind === "post") drawPost(ctx, W, H, p);
  else if (kind === "story") drawStory(ctx, W, H, p);
  else drawGiftCard(ctx, W, H, p);
}
