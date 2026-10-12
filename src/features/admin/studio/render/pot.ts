import { potDrop, sweepAt } from "@/demo/admin/studio/timeline";
import type { PotSpot } from "@/demo/admin/studio/offer";
import { CARD_PAD, cardSprite, raster } from "./sprites";
import type { Img } from "./types";

/**
 * Los potes animados del Estudio: el envase SVG de la librería (pasado a imagen) sobre un pedestal iluminado, como
 * en la ficha. Cae con un rebote, flota apenas, lo cruza un filo de luz y saltan chispas en el aro del pedestal.
 * Todo depende solo de `t` (la grabación y la vista previa dibujan lo mismo) y el cuadro final queda quieto.
 */
export interface PotLook { accent: string; glow: string }

/** Pedestal: halo en el piso, cilindro grafito y aro con el acento (el mismo de `Studio` en la librería). */
export function drawPedestal(ctx: CanvasRenderingContext2D, cx: number, floorY: number, w: number, look: PotLook) {
  const rx = w / 2, ry = w * 0.068, depth = w * 0.05;
  ctx.save();
  // Halo elíptico en el piso: un círculo con degradado, aplastado (sin bordes rectos).
  ctx.save();
  ctx.translate(cx, floorY + depth);
  ctx.scale(1, 0.32);
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 1.3);
  halo.addColorStop(0, `${look.accent}70`);
  halo.addColorStop(1, `${look.accent}00`);
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(0, 0, rx * 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#0b0e13";
  ctx.fillRect(cx - rx, floorY, rx * 2, depth);
  ctx.beginPath(); ctx.ellipse(cx, floorY + depth, rx, ry, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = "#181d26";
  ctx.beginPath(); ctx.ellipse(cx, floorY, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = look.accent; ctx.globalAlpha = 0.75; ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.beginPath(); ctx.ellipse(cx, floorY, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

/** Número pseudoaleatorio estable (las chispas son iguales en la vista previa y en el video). */
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Chispas en el aro: trazos quebrados que cambian 12 veces por segundo. En el cuadro final queda una sola, quieta. */
function drawArcs(ctx: CanvasRenderingContext2D, cx: number, floorY: number, w: number, t: number, seed: number, still: boolean, color: string) {
  const frame = still ? 7 : Math.floor(t * 12);
  const count = still ? 1 : 2;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, w * 0.006); ctx.lineJoin = "round";
  ctx.shadowColor = color; ctx.shadowBlur = w * 0.03;
  for (let k = 0; k < count; k++) {
    const r = (i: number) => hash(seed * 31 + frame * 7 + k * 13 + i);
    if (!still && r(0) < 0.35) continue;
    const a0 = Math.PI * (0.15 + r(1) * 0.7), len = 0.25 + r(2) * 0.25;
    ctx.globalAlpha = still ? 0.55 : 0.5 + r(3) * 0.5;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (len * i) / 6;
      const jitter = (r(10 + i) - 0.5) * w * 0.05;
      const x = cx + Math.cos(a) * (w / 2) * (1 + jitter / w), y = floorY - Math.sin(a) * w * 0.25 + jitter;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

const flares = new Map<string, HTMLCanvasElement>();

/** El pote con la banda de luz encima, solo sobre sus píxeles (source-atop en un lienzo aparte, reusado). */
function potWithSweep(img: HTMLCanvasElement, k: number): HTMLCanvasElement {
  const key = `${img.width}x${img.height}`;
  let c = flares.get(key);
  if (!c) { c = document.createElement("canvas"); c.width = img.width; c.height = img.height; flares.set(key, c); if (flares.size > 6) flares.delete(flares.keys().next().value!); }
  const g = c.getContext("2d");
  if (!g) return img;
  g.globalCompositeOperation = "source-over";
  g.clearRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "source-atop";
  const x = -c.width * 0.4 + k * c.width * 1.6;
  const band = g.createLinearGradient(x - c.width * 0.18, 0, x + c.width * 0.18, c.height * 0.2);
  band.addColorStop(0, "rgba(255,255,255,0)"); band.addColorStop(0.5, "rgba(230,255,170,0.55)"); band.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = band;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export interface DrawPotOpts { t: number; duration: number; start: number; delay?: number; seed?: number; look: PotLook; pedestal?: boolean; photo?: boolean }

/**
 * Un pote en `spot` (centro, piso del pedestal y lado del cuadro). Una foto propia del dueño va como tarjeta
 * recortada sobre el pedestal, sin filo de luz. Devuelve el avance de la caída (0–1) para encadenar el precio.
 */
export function drawPot(ctx: CanvasRenderingContext2D, img: Img | null, spot: PotSpot, o: DrawPotOpts): number {
  const { cx, floorY, size } = spot;
  const drop = potDrop(o.t, o.start, o.delay);
  const still = o.t >= o.duration - 0.05;
  if (o.pedestal !== false) drawPedestal(ctx, cx, floorY, size * 0.72, o.look);
  if (drop <= 0) return 0;
  const landed = o.start + (o.delay ?? 0) + 0.75;
  const bob = still || o.t < landed ? 0 : Math.sin((o.t - landed) * 1.7 + (o.seed ?? 0)) * size * 0.01;
  const y = floorY - size * (330 / 400) - (1 - drop) * size * 0.9 + bob;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, drop * 1.6);
  // Sombra de contacto: más chica y suave mientras el pote está en el aire.
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath(); ctx.ellipse(cx, floorY, size * 0.26 * Math.min(1, drop), size * 0.03, 0, 0, Math.PI * 2); ctx.fill();
  if (img && o.photo) {
    const w = size * 0.62, h = size * 0.74, lift = (1 - drop) * size * 0.9 - bob;
    ctx.drawImage(cardSprite(img, w, h, 28, cover), cx - w / 2 - CARD_PAD, floorY - h - size * 0.03 - lift - CARD_PAD);
  } else if (img) {
    const r = raster(img, size, size);
    const k = sweepAt(o.t, landed, o.duration);
    ctx.drawImage(k === null ? r : potWithSweep(r, k), cx - size / 2, y);
  }
  ctx.restore();
  if (o.pedestal !== false && drop >= 1) drawArcs(ctx, cx, floorY, size * 0.72, o.t, o.seed ?? 1, still, o.look.accent);
  return drop;
}

function cover(c: CanvasRenderingContext2D, img: Img, w: number, h: number) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih);
  c.drawImage(img, (iw - w / s) / 2, (ih - h / s) / 2, w / s, h / s, 0, 0, w, h);
}
