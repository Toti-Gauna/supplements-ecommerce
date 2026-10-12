import { STUDIO_BRAND } from "@/demo/fixtures/studio";
import { formatARS } from "@/lib/money";
import { drawBackdrop } from "./backdrop";
import { labTag, priceTag, stackTotal, tierLadder } from "./info";
import { drawOfferBadge, offerBadge } from "./offer";
import { MONO, SANS, display, drawLines, drawLogo, drawPill, fitLine, wrap } from "./paint";
import { drawPot } from "./pot";
import { drawGameArt } from "./game-art";
import type { StudioScene } from "./types";
import { drawShelf } from "./visual";

/**
 * Diapositivas del carrusel (4:5) según la plantilla: portada, una por producto (oferta y stack), los datos del
 * producto destacado, cómo pedir (o cómo ganar el cupón) y el cierre con la oferta, el total o los premios.
 */
export type Slide = { kind: "cover" } | { kind: "product"; index: number } | { kind: "facts" } | { kind: "steps" } | { kind: "closing" };

export function carouselSlides(s: Pick<StudioScene, "products" | "template">): Slide[] {
  const middle: Slide[] = s.template === "game" ? [] : s.template === "product" ? [{ kind: "facts" }] : s.products.map((_, index) => ({ kind: "product" as const, index }));
  return [{ kind: "cover" }, ...middle, { kind: "steps" }, { kind: "closing" }];
}

const START = 0.4;

function counter(ctx: CanvasRenderingContext2D, s: StudioScene, i: number, n: number) {
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `700 26px ${MONO}`;
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  ctx.fillText(`${i + 1}/${n}`, s.W - 80, 96);
  drawLogo(ctx, 80, 74, 40, "#ffffff");
}

/** Lo principal de la portada y del cierre: la fila de potes, el pote destacado o el shaker del juego. */
function hero(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, cx: number, floorY: number, size: number) {
  if (s.template === "game") return drawGameArt(ctx, t, START, s.duration, { cx, top: floorY - size * 0.95, scale: size / 130, spread: 380 });
  if (s.template === "product" || s.products.length === 1) {
    const item = s.products[0];
    return void drawPot(ctx, item?.img ?? null, { cx, floorY, size: size * 1.6 }, { t, duration: s.duration, start: START, look: s.look, photo: item?.photo });
  }
  drawShelf(ctx, s, t, { cx, floorY, size, width: Math.min(880, size * 2.9) });
}

function cover(ctx: CanvasRenderingContext2D, s: StudioScene, t: number) {
  ctx.save();
  ctx.fillStyle = s.look.accent;
  ctx.font = `800 28px ${MONO}`;
  drawLines(ctx, [fitLine(ctx, s.texts.eyebrow.toUpperCase(), 920)], 80, 250, 0);
  ctx.fillStyle = "#ffffff";
  display(ctx, 92);
  const y = drawLines(ctx, wrap(ctx, s.texts.title, 920, 3), 80, 360, 96);
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `500 36px ${SANS}`;
  drawLines(ctx, wrap(ctx, s.texts.subtitle, 860, 3), 80, y + 16, 48);
  hero(ctx, s, t, s.W / 2, 1130, 300);
  drawPill(ctx, "Deslizá →", s.W - 80, s.H - 150, { bg: s.look.accent, ink: s.look.accentInk, size: 28, align: "right" });
}

function product(ctx: CanvasRenderingContext2D, s: StudioScene, t: number, index: number) {
  const item = s.products[index];
  if (!item) return;
  drawPot(ctx, item.img, { cx: s.W / 2, floorY: 900, size: 640 }, { t, duration: s.duration, start: START, seed: index + 1, look: s.look, photo: item.photo });
  priceTag(ctx, s, index, 80, 1060, 56, 920, "left", 1);
}

/** Producto destacado: precio por servicio, servicios, lote y cómo se toma. */
function facts(ctx: CanvasRenderingContext2D, s: StudioScene, t: number) {
  const p = s.products[0]?.data;
  if (!p) return;
  drawPot(ctx, s.products[0]!.img, { cx: 790, floorY: 1080, size: 520 }, { t, duration: s.duration, start: START, look: s.look, photo: s.products[0]!.photo });
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.save(); display(ctx, 64); const y = drawLines(ctx, wrap(ctx, p.name, 560, 3), 80, 280, 70); ctx.restore();
  let at = y + 40;
  if (p.perServing && s.showPrice) {
    ctx.font = `800 96px ${MONO}`; ctx.fillStyle = s.look.accent; ctx.fillText(formatARS(p.perServing), 80, at + 80);
    ctx.font = `600 34px ${SANS}`; ctx.fillStyle = "#ffffff"; ctx.fillText(`por servicio${p.servings ? ` · ${p.servings} servicios` : ""}`, 80, at + 130);
    at += 170;
  }
  if (p.lot) at = labTag(ctx, p.lot, 80, at, 26, "left") + 30;
  if (p.usage) { ctx.font = `500 32px ${SANS}`; ctx.fillStyle = "rgba(255,255,255,0.86)"; drawLines(ctx, wrap(ctx, `Cómo tomarlo: ${p.usage}`, 520, 5), 80, at + 34, 44); }
}

function steps(ctx: CanvasRenderingContext2D, s: StudioScene) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  display(ctx, 80);
  drawLines(ctx, s.template === "game" ? ["Cómo ganar", "tu cupón"] : ["Cómo pedir", "el tuyo"], 80, 300, 88);
  ctx.restore();
  s.steps.forEach((step, i) => {
    const y = 560 + i * 170;
    ctx.fillStyle = s.look.accent;
    ctx.beginPath(); ctx.arc(130, y, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.look.accentInk;
    ctx.font = `800 46px ${MONO}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), 130, y + 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 40px ${SANS}`;
    ctx.textAlign = "left";
    ctx.fillText(fitLine(ctx, step, 800), 220, y + 2);
  });
}

/** Cierre: la oferta, el total del stack, la escalera de premios o el precio, con el llamado a la acción. */
function closing(ctx: CanvasRenderingContext2D, s: StudioScene) {
  const o = s.template === "offer" && s.showOffer ? s.offer : null;
  const badge = o ? offerBadge(o, s.look, 1.7, 760) : null;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = s.look.accent;
  ctx.font = `800 28px ${MONO}`;
  ctx.fillText(fitLine(ctx, s.texts.eyebrow.toUpperCase(), 920), s.W / 2, 250);
  if (badge) drawOfferBadge(ctx, badge, (s.W - badge.w) / 2, 300 + Math.max(0, (640 - badge.h) / 2));
  else if (s.template === "stack") { drawShelf(ctx, s, s.duration, { cx: s.W / 2, floorY: 760, size: 260, width: 820 }); stackTotal(ctx, s, s.W / 2, 880, 60, "center", 1); }
  else if (s.template === "game") {
    ctx.save(); ctx.fillStyle = "#ffffff"; display(ctx, 72); ctx.fillText("Premios por puntaje", s.W / 2, 360); ctx.restore();
    tierLadder(ctx, s, s.W / 2, 430, 56, "center", 1);
    hero(ctx, s, s.duration, s.W / 2, 1050, 230);
  }
  else if (s.template === "product") { hero(ctx, s, s.duration, s.W / 2, 800, 300); priceTag(ctx, s, 0, s.W / 2, 950, 56, 900, "center", 1); }
  else {
    ctx.save(); ctx.fillStyle = "#ffffff"; display(ctx, 104); ctx.fillText(STUDIO_BRAND.seal, s.W / 2, 560); ctx.restore();
    ctx.font = `500 44px ${SANS}`; ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.fillText(`con lote y vencimiento, en ${STUDIO_BRAND.city}`, s.W / 2, 650);
  }
  drawPill(ctx, s.texts.cta, s.W / 2, s.H - 260, { bg: "#ffffff", ink: "#0a0c10", size: 32, align: "center", maxWidth: 940 });
}

export function drawSlide(ctx: CanvasRenderingContext2D, s: StudioScene, index: number, t: number) {
  const slides = carouselSlides(s);
  const i = Math.min(Math.max(0, index), slides.length - 1);
  const slide = slides[i]!;
  drawBackdrop(ctx, s.look, t, s.W, s.H);
  counter(ctx, s, i, slides.length);
  if (slide.kind === "cover") cover(ctx, s, t);
  else if (slide.kind === "product") product(ctx, s, t, slide.index);
  else if (slide.kind === "facts") facts(ctx, s, t);
  else if (slide.kind === "steps") steps(ctx, s);
  else closing(ctx, s);
}
