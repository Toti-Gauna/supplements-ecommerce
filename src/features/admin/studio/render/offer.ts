import { offerParts } from "@/demo/admin/studio/offer";
import { SANS, fitLine, roundRect, spaced } from "./paint";
import { measureCtx, sealSprite } from "./sprites";
import type { StudioScene } from "./types";

/**
 * Cartel de oferta (8.3.27): cupón con el valor grande y "OFF" al lado, el código debajo de una línea punteada y la
 * condición de compra en una franja propia. Sombra suave, giro leve y nada de letra diminuta ni texto cortado.
 */
type Offer = NonNullable<StudioScene["offer"]>;
interface Look { accent: string; accentInk: string }

const TILT = -0.06;
/** "OFF" al lado del valor, en proporción a su tamaño. */
const UNIT = 0.46;

interface Layout { w: number; h: number; u: number; vs: number; value: string[]; unit: string; cs: number; code: string; ks: number; cond: string[] }

/** Corta en dos líneas lo más parejas posible (para que no quede una palabra sola abajo). */
function balance(c: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (c.measureText(text).width <= maxW) return [text];
  const words = text.split(/\s+/);
  let best: string[] = [text], bestW = Infinity;
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const w = Math.max(...lines.map((l) => c.measureText(l).width));
    if (w < bestW) { best = lines; bestW = w; }
  }
  return bestW <= maxW ? best : best.map((l) => fitLine(c, l, maxW));
}

function measure(c: CanvasRenderingContext2D, offer: Offer, u: number, maxInner: number): Layout {
  const { value, unit } = offerParts(offer.label);
  const font = (size: number, weight = 800) => { c.font = `${weight} ${size}px ${SANS}`; };
  const rowW = (size: number, text: string) => { font(size); const w = c.measureText(text).width; font(size * UNIT); return w + (unit ? 10 * u + c.measureText(unit).width : 0); };
  // Valor: una línea achicando hasta un mínimo; si es una frase ("Envío gratis") va en dos líneas.
  let vs = 84 * u;
  while (vs > 60 * u && rowW(vs, value) > maxInner) vs -= 2 * u;
  let lines = [value];
  if (rowW(vs, value) > maxInner && value.includes(" ")) { font(vs); lines = balance(c, value, maxInner); }
  while (vs > 44 * u && Math.max(...lines.map((l) => rowW(vs, l))) > maxInner) { vs -= 2 * u; font(vs); if (lines.length > 1) lines = balance(c, value, maxInner); }
  // Código: se achica antes de cortarse (solo un código larguísimo llevaría "…").
  let cs = 40 * u;
  font(cs);
  while (cs > 26 * u && c.measureText(offer.code).width > maxInner) { cs -= 1 * u; font(cs); }
  const code = fitLine(c, offer.code, maxInner);
  const codeW = c.measureText(code).width;
  font(22 * u);
  const labelW = c.measureText(spaced("Código")).width;
  let inner = Math.min(maxInner, Math.max(200 * u, codeW, labelW, ...lines.map((l) => rowW(vs, l))));
  // Condición: una línea si entra con poco margen extra; si no, dos líneas parejas.
  const ks = 28 * u;
  let cond: string[] = [];
  if (offer.condition) {
    font(ks, 700);
    const cw = c.measureText(offer.condition).width;
    if (cw <= Math.min(maxInner, inner + 48 * u)) { inner = Math.max(inner, cw); cond = [offer.condition]; }
    else {
      // El cupón se ensancha lo necesario para las dos líneas (hasta el máximo del formato).
      cond = balance(c, offer.condition, maxInner);
      inner = Math.min(maxInner, Math.max(inner, ...cond.map((l) => c.measureText(l).width)));
    }
  }
  const h = 28 * u + lines.length * vs * 0.92 + 64 * u + 20 * u + cs * 0.8 + (cond.length ? 26 * u + cond.length * 36 * u + 20 * u : 28 * u);
  return { w: Math.round(inner + 64 * u), h: Math.round(h), u, vs, value: lines, unit, cs, code, ks, cond };
}

function paint(c: CanvasRenderingContext2D, L: Layout, look: Look) {
  const { w, h, u } = L, r = 30 * u;
  c.shadowColor = "rgba(0,0,0,0.28)"; c.shadowBlur = 30 * u; c.shadowOffsetY = 12 * u;
  roundRect(c, 0, 0, w, h, r);
  c.fillStyle = look.accent; c.fill();
  c.shadowColor = "transparent";
  let y = 28 * u;
  c.fillStyle = look.accentInk;
  c.textBaseline = "alphabetic";
  for (const line of L.value) {
    y += L.vs * 0.78;
    c.font = `800 ${L.vs}px ${SANS}`;
    const vw = c.measureText(line).width;
    c.font = `800 ${L.vs * UNIT}px ${SANS}`;
    const uw = L.unit ? 10 * u + c.measureText(L.unit).width : 0;
    const x0 = (w - vw - uw) / 2;
    c.textAlign = "left";
    c.font = `800 ${L.vs}px ${SANS}`;
    c.fillText(line, x0, y);
    if (L.unit) { c.font = `800 ${L.vs * UNIT}px ${SANS}`; c.fillText(L.unit, x0 + vw + 10 * u, y); }
    y += L.vs * 0.14;
  }
  // Línea punteada con muescas a los costados, como un cupón.
  y += 24 * u;
  c.save();
  c.globalCompositeOperation = "destination-out";
  for (const x of [0, w]) { c.beginPath(); c.arc(x, y, 13 * u, 0, Math.PI * 2); c.fill(); }
  c.restore();
  c.save();
  c.globalAlpha = 0.4; c.strokeStyle = look.accentInk; c.lineWidth = 3 * u; c.setLineDash([10 * u, 9 * u]);
  c.beginPath(); c.moveTo(24 * u, y); c.lineTo(w - 24 * u, y); c.stroke();
  c.restore();
  c.textAlign = "center";
  y += 40 * u;
  c.save(); c.globalAlpha = 0.75; c.font = `800 ${22 * u}px ${SANS}`; c.fillText(spaced("Código"), w / 2, y); c.restore();
  y += 20 * u + L.cs * 0.8;
  c.font = `800 ${L.cs}px ${SANS}`;
  c.fillText(L.code, w / 2, y);
  if (!L.cond.length) return;
  y += 26 * u;
  c.save();
  c.globalAlpha = 0.12;
  c.beginPath(); c.roundRect(0, y, w, h - y, [0, 0, r, r]); c.fill();
  c.restore();
  c.font = `700 ${L.ks}px ${SANS}`;
  L.cond.forEach((line, i) => c.fillText(line, w / 2, y + 20 * u + L.ks * 0.82 + i * 36 * u));
}

/** Cartel ya dibujado (con sombra y giro) y el tamaño del cupón sin márgenes, para ubicarlo. */
export function offerBadge(offer: Offer, look: Look, u: number, maxInner: number) {
  const fontReady = typeof document !== "undefined" && document.fonts.check(`800 40px ${SANS}`);
  const probe = measureCtx();
  if (!probe) return null;
  const L = measure(probe, offer, u, maxInner);
  const m = Math.round(70 * u);
  const key = `${look.accent}|${look.accentInk}|${offer.label}|${offer.code}|${offer.condition}|${u}|${maxInner}|${fontReady}`;
  const sprite = sealSprite(key, L.w + m * 2, L.h + m * 2, (c) => {
    c.translate(m + L.w / 2, m + L.h / 2);
    c.rotate(TILT);
    c.translate(-L.w / 2, -L.h / 2);
    paint(c, L, look);
  });
  return { sprite, w: L.w, h: L.h, margin: m };
}

/** Dibuja el cartel con su esquina superior izquierda (sin girar) en x, y; `k` lo hace entrar con rebote. */
export function drawOfferBadge(ctx: CanvasRenderingContext2D, badge: NonNullable<ReturnType<typeof offerBadge>>, x: number, y: number, k = 1) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x + badge.w / 2, y + badge.h / 2);
  ctx.scale(k, k);
  ctx.drawImage(badge.sprite, -badge.w / 2 - badge.margin, -badge.h / 2 - badge.margin);
  ctx.restore();
}
