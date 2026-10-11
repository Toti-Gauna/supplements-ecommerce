import { STUDIO_BRAND } from "@/demo/fixtures/studio";
import { formatARS } from "@/lib/money";
import { drawBackdrop } from "./backdrop";
import { drawOfferBadge, offerBadge } from "./offer";
import { DISPLAY, SANS, drawCard, drawLines, drawLogo, drawPill, fitLine, wrap } from "./paint";
import { raster } from "./sprites";
import type { StudioScene } from "./types";

/** Diapositivas del carrusel: portada, una por producto, "cómo pedir" y la oferta con el cierre. */
export type Slide = { kind: "cover" } | { kind: "product"; index: number } | { kind: "steps" } | { kind: "offer" };

export function carouselSlides(s: Pick<StudioScene, "products">): Slide[] {
  return [{ kind: "cover" }, ...s.products.map((_, index) => ({ kind: "product" as const, index })), { kind: "steps" }, { kind: "offer" }];
}

function counter(ctx: CanvasRenderingContext2D, s: StudioScene, i: number, n: number) {
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `700 26px ${SANS}`;
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  ctx.fillText(`${i + 1}/${n}`, s.W - 80, 96);
  drawLogo(ctx, 80, 74, 40, "#ffffff");
}

function cover(ctx: CanvasRenderingContext2D, s: StudioScene) {
  ctx.fillStyle = s.look.accent;
  ctx.font = `800 30px ${SANS}`;
  drawLines(ctx, [s.texts.eyebrow.toUpperCase()], 80, 300, 0);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 104px ${DISPLAY}`;
  const y = drawLines(ctx, wrap(ctx, s.texts.title, 900, 3), 80, 420, 108);
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `500 38px ${SANS}`;
  drawLines(ctx, wrap(ctx, s.texts.subtitle, 820, 3), 80, y + 20, 52);
  if (s.cast.length) s.cast.forEach((img, i) => ctx.drawImage(raster(img, 470, 362), 120 + i * 360, 860));
  else if (s.hero) ctx.drawImage(raster(s.hero, 420, 420), s.W - 520, 760);
  drawPill(ctx, "Deslizá →", s.W - 80, s.H - 150, { bg: s.look.accent, ink: s.look.accentInk, size: 30, align: "right" });
}

function product(ctx: CanvasRenderingContext2D, s: StudioScene, index: number) {
  const item = s.products[index];
  if (!item) return;
  drawCard(ctx, item.img, 190, 170, 700, 760, { rotate: -1.5 });
  const p = item.data;
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 64px ${DISPLAY}`;
  const y = drawLines(ctx, wrap(ctx, p.name, 920, 2), 80, 1050, 68);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `500 32px ${SANS}`;
  drawLines(ctx, wrap(ctx, p.short, 920, 2), 80, y + 4, 42);
  if (s.showPrice) {
    const deal = s.showOffer && p.offerPrice !== null;
    drawPill(ctx, formatARS(deal ? p.offerPrice! : p.price), s.W - 80, 120 + 660, { bg: deal ? s.look.accent : "#ffffff", ink: deal ? s.look.accentInk : "#1c2016", size: 40, align: "right" });
    if (deal) drawPill(ctx, `Antes ${formatARS(p.price)}`, s.W - 80, 120 + 560, { bg: "rgba(0,0,0,0.45)", ink: "#ffffff", size: 26, align: "right" });
  }
}

function steps(ctx: CanvasRenderingContext2D, s: StudioScene) {
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 84px ${DISPLAY}`;
  drawLines(ctx, ["Cómo pedir", "el tuyo"], 80, 300, 90);
  s.steps.forEach((step, i) => {
    const y = 560 + i * 170;
    ctx.fillStyle = s.look.accent;
    ctx.beginPath(); ctx.arc(130, y, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.look.accentInk;
    ctx.font = `800 48px ${SANS}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), 130, y + 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 42px ${SANS}`;
    ctx.textAlign = "left";
    ctx.fillText(step, 220, y + 2);
  });
}

function offer(ctx: CanvasRenderingContext2D, s: StudioScene) {
  const o = s.showOffer ? s.offer : null;
  const badge = o ? offerBadge(o, s.look, 1.7, 760) : null;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = s.look.accent;
  ctx.font = `800 30px ${SANS}`;
  ctx.fillText(fitLine(ctx, s.texts.eyebrow.toUpperCase(), 920), s.W / 2, badge ? 260 : 380);
  if (badge) drawOfferBadge(ctx, badge, (s.W - badge.w) / 2, 320 + Math.max(0, (620 - badge.h) / 2));
  else {
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 104px ${DISPLAY}`;
    ctx.fillText(STUDIO_BRAND.handMade, s.W / 2, 560);
    ctx.font = `500 44px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fillText(`en ${STUDIO_BRAND.city}`, s.W / 2, 650);
  }
  drawPill(ctx, s.texts.cta, s.W / 2, s.H - 300, { bg: "#ffffff", ink: "#1c2016", size: 32, align: "center" });
  if (s.cast.length) s.cast.forEach((img, i) => ctx.drawImage(raster(img, 260, 200), s.W / 2 - 270 + i * 280, s.H - 215));
  else if (s.hero) ctx.drawImage(raster(s.hero, 170, 170), s.W / 2 - 85, s.H - 190);
}

export function drawSlide(ctx: CanvasRenderingContext2D, s: StudioScene, index: number, t: number) {
  const slides = carouselSlides(s);
  const i = Math.min(Math.max(0, index), slides.length - 1);
  const slide = slides[i]!;
  drawBackdrop(ctx, s.look, t, s.W, s.H);
  counter(ctx, s, i, slides.length);
  if (slide.kind === "cover") cover(ctx, s);
  else if (slide.kind === "product") product(ctx, s, slide.index);
  else if (slide.kind === "steps") steps(ctx, s);
  else offer(ctx, s);
}
