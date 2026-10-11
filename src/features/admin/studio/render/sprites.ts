import type { Img } from "./types";

/**
 * Mapas de bits que se arman una vez y se copian en cada cuadro (VEL-62: el video graba a tiempo real y redibujar
 * vectores, sombras y degradados grandes en cada cuadro bajaba a 7–12 cuadros por segundo).
 */
type Source = Img | HTMLCanvasElement;

function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/** Contexto 2D o un contexto que no dibuja nada: si Safari llegó a su tope de memoria de canvas, la pieza sale sin ese detalle en vez de romperse. */
function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D | null {
  return c.getContext("2d");
}

/** Saca la entrada más vieja y libera su memoria (ancho 0). */
function evict(map: Map<string, HTMLCanvasElement>, max: number) {
  while (map.size > max) {
    const [k, c] = map.entries().next().value!;
    c.width = 0; c.height = 0;
    map.delete(k);
  }
}

const rasters = new WeakMap<Source, Map<string, HTMLCanvasElement>>();

/** La ilustración (SVG) pasada a mapa de bits al tamaño en que se dibuja. */
export function raster(img: Source, w: number, h: number): HTMLCanvasElement {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  let byImg = rasters.get(img);
  if (!byImg) { byImg = new Map(); rasters.set(img, byImg); }
  let c = byImg.get(key);
  if (!c) { c = canvas(w, h); ctx2d(c)?.drawImage(img, 0, 0, c.width, c.height); byImg.set(key, c); }
  return c;
}

const NO_IMG = {};
const cards = new WeakMap<object, Map<string, HTMLCanvasElement>>();
export const CARD_PAD = 110;

/** Tarjeta de producto con su sombra y la imagen recortada (cover), con margen para la sombra. */
export function cardSprite(img: Img | null, w: number, h: number, radius: number, cover: (ctx: CanvasRenderingContext2D, img: Img, w: number, h: number) => void): HTMLCanvasElement {
  const key = `${Math.round(w)}x${Math.round(h)}x${radius}`;
  const k = img ?? NO_IMG;
  let byImg = cards.get(k);
  if (!byImg) { byImg = new Map(); cards.set(k, byImg); }
  let c = byImg.get(key);
  if (!c) {
    c = canvas(w + CARD_PAD * 2, h + CARD_PAD * 2);
    byImg.set(key, c);
    const ctx = ctx2d(c);
    if (!ctx) return c;
    ctx.translate(CARD_PAD, CARD_PAD);
    ctx.shadowColor = "rgba(0,0,0,0.38)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 28;
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, radius);
    ctx.fillStyle = "#efe6d4"; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.clip();
    if (img) cover(ctx, img, w, h);
  }
  return c;
}

const backgrounds = new Map<string, HTMLCanvasElement>();

/** Degradado de fondo de la temática (estático). */
export function backgroundSprite(from: string, to: string, W: number, H: number): HTMLCanvasElement {
  const key = `${from}|${to}|${W}x${H}`;
  let c = backgrounds.get(key);
  if (!c) {
    c = canvas(W, H);
    const ctx = ctx2d(c);
    if (ctx) {
      const g = ctx.createRadialGradient(W * 0.82, H * 0.42, 0, W * 0.82, H * 0.42, Math.max(W, H) * 1.05);
      g.addColorStop(0, to); g.addColorStop(0.72, from); g.addColorStop(1, from);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    backgrounds.set(key, c);
    // Solo la temática actual en sus tres formatos (cada fondo a tamaño real pesa varios MB).
    evict(backgrounds, 3);
  }
  return c;
}

const blobs = new Map<string, HTMLCanvasElement>();

/** Mancha de luz (aurora): un círculo con degradado radial que se escala al dibujar. */
export function blobSprite(color: string): HTMLCanvasElement {
  let c = blobs.get(color);
  if (!c) {
    c = canvas(256, 256);
    const ctx = ctx2d(c);
    if (ctx) {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, color); g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
    blobs.set(color, c);
    evict(blobs, 12);
  }
  return c;
}

const seals = new Map<string, HTMLCanvasElement>();

/** Cartel de oferta ya dibujado (con sombra y giro), por colores, texto y tamaño. */
export function sealSprite(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  let c = seals.get(key);
  if (!c) {
    c = canvas(w, h);
    const ctx = ctx2d(c);
    if (ctx) paint(ctx);
    seals.set(key, c);
    evict(seals, 8);
  }
  return c;
}

let measurer: CanvasRenderingContext2D | null | undefined;

/** Contexto chico solo para medir texto antes de armar un mapa de bits. */
export function measureCtx(): CanvasRenderingContext2D | null {
  if (measurer === undefined) measurer = ctx2d(canvas(1, 1));
  return measurer;
}
