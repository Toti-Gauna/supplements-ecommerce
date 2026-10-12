import { STUDIO_BRAND } from "@/demo/fixtures/studio";
import { postLayout, potRect, storyBadge } from "@/demo/admin/studio/offer";
import { beats, easeOutBack, easeOutExpo, span } from "@/demo/admin/studio/timeline";
import { drawBackdrop } from "./backdrop";
import { priceTag, stackTotal, tierLadder } from "./info";
import { drawOfferBadge, offerBadge } from "./offer";
import { MONO, SANS, display, drawLines, drawLogo, drawPill, fitLine, spaced, wrap } from "./paint";
import type { StudioScene } from "./types";
import { drawVisual } from "./visual";

/** Encabezado: bajada, titular expandido y texto, con entrada en cascada. Devuelve el y final. */
export function heading(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, x: number, y: number, maxW: number, titleSize: number, align: CanvasTextAlign = "left") {
  const b = beats(s.duration);
  ctx.save();
  ctx.fillStyle = s.look.accent;
  ctx.font = `800 ${Math.round(titleSize * 0.3)}px ${MONO}`;
  drawLines(ctx, [fitLine(ctx, spaced(s.texts.eyebrow), maxW)], x, y, 0, easeOutExpo(span(t, b.eyebrow, 0.8)), align);
  ctx.fillStyle = "#ffffff";
  display(ctx, titleSize);
  let end = drawLines(ctx, wrap(ctx, s.texts.title, maxW, 3), x, y + titleSize * 1.15, titleSize * 1.04, easeOutExpo(span(t, b.title, 1)), align);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `500 ${Math.round(titleSize * 0.38)}px ${SANS}`;
  end = drawLines(ctx, wrap(ctx, s.texts.subtitle, maxW * 0.95, 3), x, end + titleSize * 0.18, titleSize * 0.5, easeOutExpo(span(t, b.title + 0.3, 1)), align);
  ctx.restore();
  return end;
}

/** Cartel de oferta de la temática (solo en la plantilla de oferta, con cupón y a la vista). */
export function badgeFor(s: StudioScene, u: number, maxInner: number) {
  return s.template === "offer" && s.offer && s.showOffer ? offerBadge(s.offer, s.look, u, maxInner) : null;
}

export const badgeIn = (s: StudioScene, t: number) => easeOutBack(span(t, beats(s.duration).offer, 0.7));

function cta(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, x: number, y: number, size: number, align: "center" | "right", maxWidth: number) {
  const c = easeOutExpo(span(t, beats(s.duration).cta, 0.8));
  ctx.save();
  ctx.globalAlpha *= c;
  drawPill(ctx, s.texts.cta, x, y + (1 - c) * 30, { bg: s.look.accent, ink: s.look.accentInk, size, align, maxWidth });
  ctx.restore();
}

/** Precio del pote a la vista, total del stack o premios del juego, según la plantilla. */
export function details(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, index: number, start: number, x: number, y: number, size: number, maxW: number, align: "left" | "center") {
  const k = easeOutExpo(span(t, (s.template === "offer" || s.template === "product" ? start : beats(s.duration).offer) + 0.4, 0.8));
  if (s.template === "stack") return stackTotal(ctx, s, x, y, size, align, k);
  if (s.template === "game") return tierLadder(ctx, s, x, y - size, size * 0.85, align, k);
  return priceTag(ctx, s, index, x, y, size, maxW, align, k, align === "center" ? 1 : 2);
}

export function drawPost(ctx: CanvasRenderingContext2D, s: StudioScene, t: number) {
  const { W } = s;
  const badge = badgeFor(s, 0.9, 320);
  const L = postLayout(W, badge);
  drawBackdrop(ctx, s.look, t, W, s.H);
  drawLogo(ctx, 80, 64, 44, "#ffffff");
  const shown = drawVisual(ctx, s, t, s.template === "stack" ? { cx: 770, floorY: 820, size: 300, width: 540 } : s.template === "game" ? { cx: 780, floorY: 820, size: 400, width: 460 } : { ...L.pot, width: L.pot.size * 0.72 });
  if (badge && L.badge) drawOfferBadge(ctx, badge, L.badge.x, L.badge.y, badgeIn(s, t));
  heading(ctx, s, t, 80, 200, 450, 70);
  details(ctx, s, t, shown.index, shown.start, 80, 730, 40, 440, "left");
  cta(ctx, s, t, W - 80, 930, 28, "right", 560);
  ctx.save();
  ctx.font = `700 22px ${MONO}`; ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(`${STUDIO_BRAND.handle} · ${STUDIO_BRAND.city}`.toUpperCase(), 80, 990);
  ctx.restore();
}

/** Historia 9:16: fuera de la franja de arriba (≈250 px, el nombre de la cuenta) y de la de abajo (≈220 px, responder). */
export function drawStory(ctx: CanvasRenderingContext2D, s: StudioScene, t: number) {
  const { W, H } = s;
  drawBackdrop(ctx, s.look, t, W, H);
  drawLogo(ctx, W / 2 - 115, 270, 44, "#ffffff");
  const end = heading(ctx, s, t, W / 2, 400, 880, 88, "center");
  // El visual arranca debajo del texto real y se achica si el texto es largo (precio siempre a la vista).
  const floorY = 1340, top = Math.max(840, end + 60);
  const size = Math.round(Math.min(640, (floorY - top) / 0.7));
  const area = s.template === "stack" ? { size: Math.min(380, size * 0.62), width: 900 } : s.template === "game" ? { size: Math.min(560, ((floorY - top) / 164) * 130), width: 760 } : { size, width: size * 0.72 };
  const shown = drawVisual(ctx, s, t, { cx: W / 2, floorY, ...area });
  const badge = badgeFor(s, 1, 330);
  if (badge) {
    const b = storyBadge(W, potRect({ cx: W / 2, floorY, size }), badge);
    drawOfferBadge(ctx, badge, b.x, b.y, badgeIn(s, t));
  }
  details(ctx, s, t, shown.index, shown.start, W / 2, 1470, 50, 900, "center");
  cta(ctx, s, t, W / 2, 1640, 32, "center", 900);
}

