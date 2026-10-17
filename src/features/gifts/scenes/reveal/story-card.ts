"use client";
import { brand } from "@/config/brand";
import { canvasPalette, canvasToPng } from "@/lib/share-png";

/**
 * Historia 9:16 del regalo (1080 × 1920) dibujada en el navegador: estudio neutro (nunca el color de una fecha), el
 * producto en su pedestal con luz de estudio, para quién es, el mensaje escrito a mano y de parte de quién. Sin
 * precio, sin link y sin el código del regalo (es una pieza para mostrar, no para canjear).
 */
export interface StoryData {
  to: string;
  from: string;
  product: string;
  variant: string;
  message: string;
  /** El envase como imagen (SVG del DOM pasado a imagen), o null si no se pudo. */
  art: CanvasImageSource | null;
}

const W = 1080, H = 1920, PAD = 88;

/** Parte un texto en renglones que entren en `max` px (como mucho `lines`, el último con "…"). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= max || !line) line = next;
    else { out.push(line); line = word; }
  }
  if (line) out.push(line);
  if (out.length <= lines) return out;
  const cut = out.slice(0, lines);
  cut[lines - 1] = `${cut[lines - 1]!.replace(/\s*\S*$/, "")}…`;
  return cut;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgb(${rgb} / ${alpha})`);
  g.addColorStop(1, `rgb(${rgb} / 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export async function renderGiftStory(d: StoryData): Promise<Blob> {
  await document.fonts?.ready;
  const c = canvasPalette();
  const script = getComputedStyle(document.documentElement).getPropertyValue("--font-script").trim() || "cursive";
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d")!;
  // Estudio neutro: grafito, luz cenital blanca y el piso con su línea.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#15181e");
  bg.addColorStop(0.62, "#0b0d10");
  bg.addColorStop(1, "#050607");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  glow(ctx, W / 2, 700, 720, "255 255 255", 0.16);
  ctx.fillStyle = "rgb(255 255 255 / 0.12)";
  ctx.fillRect(0, 1030, W, 2);
  // Encabezado: la marca y el rótulo de la pieza.
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = c.ink;
  ctx.font = `900 52px ${c.display}`;
  ctx.fillText(brand.name.toUpperCase(), PAD, 150);
  ctx.fillStyle = c.volt;
  ctx.font = `700 26px ${c.mono}`;
  ctx.textAlign = "right";
  ctx.fillText("TARJETA DE ATLETA · REGALO", W - PAD, 146);
  ctx.textAlign = "left";
  // Para quién: titular gigante en itálica, como un póster de competencia.
  ctx.fillStyle = c.ink;
  ctx.font = `italic 900 128px ${c.display}`;
  wrap(ctx, `PARA ${d.to.toUpperCase()}`, W - PAD * 2, 2).forEach((l, i) => ctx.fillText(l, PAD, 300 + i * 120));
  // El producto en su pedestal.
  glow(ctx, W / 2, 1010, 380, "255 255 255", 0.22);
  ctx.fillStyle = "rgb(0 0 0 / 0.55)";
  ctx.beginPath();
  ctx.ellipse(W / 2, 1036, 300, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  if (d.art) ctx.drawImage(d.art, W / 2 - 380, 430, 760, 760);
  // Nombre y variante.
  ctx.textAlign = "center";
  ctx.fillStyle = c.ink;
  ctx.font = `900 76px ${c.display}`;
  wrap(ctx, d.product.toUpperCase(), W - PAD * 2, 2).forEach((l, i) => ctx.fillText(l, W / 2, 1150 + i * 78));
  ctx.fillStyle = c.muted;
  ctx.font = `600 30px ${c.mono}`;
  if (d.variant) ctx.fillText(d.variant.toUpperCase(), W / 2, d.product.length > 22 ? 1286 : 1210);
  // El mensaje en un papel de tiza, apenas inclinado.
  const top = 1330;
  ctx.save();
  ctx.translate(W / 2, top + 210);
  ctx.rotate((-1.5 * Math.PI) / 180);
  ctx.fillStyle = "#f2efe6";
  ctx.fillRect(-(W / 2 - PAD), -210, W - PAD * 2, 420);
  ctx.fillStyle = "#14161a";
  ctx.textAlign = "left";
  ctx.font = `600 58px ${script}`;
  const lines = wrap(ctx, d.message ? `“${d.message}”` : "Un regalo para que entrenes con todo.", W - PAD * 2 - 100, 4);
  lines.forEach((l, i) => ctx.fillText(l, -(W / 2 - PAD) + 50, -120 + i * 70));
  ctx.textAlign = "right";
  ctx.font = `700 52px ${script}`;
  ctx.fillText(`— ${d.from}`, W / 2 - PAD - 50, 170);
  ctx.restore();
  // Pie: el voltio como filo de luz.
  ctx.fillStyle = c.volt;
  ctx.fillRect(PAD, H - 120, 120, 6);
  ctx.textAlign = "left";
  ctx.fillStyle = c.muted;
  ctx.font = `700 26px ${c.mono}`;
  ctx.fillText(`UN REGALO DE ${d.from.toUpperCase()} EN ${brand.name.toUpperCase()}`, PAD, H - 72, W - PAD * 2);
  return canvasToPng(canvas);
}
