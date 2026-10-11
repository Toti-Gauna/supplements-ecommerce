import { rand } from "@/features/themes/AmbientField";
import { backgroundSprite, blobSprite, raster } from "./sprites";
import type { StudioLook } from "./types";

/** Fondo animado de la temática en canvas: degradado, dos auroras que se mueven y las partículas de su `ambient`. */
export function drawBackdrop(ctx: CanvasRenderingContext2D, look: StudioLook, t: number, W: number, H: number) {
  ctx.drawImage(backgroundSprite(look.from, look.to, W, H), 0, 0);
  aurora(ctx, look.accent, W * (0.15 + 0.1 * Math.sin(t * 0.35)), H * (0.2 + 0.08 * Math.cos(t * 0.3)), Math.max(W, H) * 0.55, 0.16);
  aurora(ctx, look.to, W * (0.9 - 0.12 * Math.sin(t * 0.27)), H * (0.85 - 0.06 * Math.sin(t * 0.4)), Math.max(W, H) * 0.6, 0.45);
  particles(ctx, look, t, W, H);
}

function aurora(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(blobSprite(color), x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Las capas de partículas de la temática: caen, suben, cruzan o titilan (igual que en la tienda, más rápido). */
function particles(ctx: CanvasRenderingContext2D, look: StudioLook, t: number, W: number, H: number) {
  const scale = W / 420;
  const area = (W * H) / (1080 * 1080);
  look.layers.forEach((layer, li) => {
    const count = Math.round(layer.count * Math.min(1.6, 0.7 * area + 0.3));
    for (let i = 0; i < count; i++) {
      const r = (k: number) => rand(li * 997 + i * 31 + k);
      const size = (layer.size[0] + r(1) * (layer.size[1] - layer.size[0])) * scale;
      const period = (layer.duration[0] + r(2) * (layer.duration[1] - layer.duration[0])) / 1.6;
      const p = (t / period + r(8)) % 1;
      const particle = layer.particles[i % layer.particles.length]!;
      let x = r(3) * W, y = r(4) * H, alpha = layer.opacity * (0.6 + r(5) * 0.4), rot = 0;
      if (layer.motion === "fall") { y = -0.1 * H + p * 1.2 * H; x += Math.sin(p * Math.PI * 2 + r(6) * 6) * 30 * scale; rot = (r(7) - 0.5) * 12 * p; }
      else if (layer.motion === "rise") { y = 1.1 * H - p * 1.25 * H; x += Math.sin(p * Math.PI * 2) * 22 * scale; alpha *= Math.min(1, p * 8, (1 - p) * 8); }
      else if (layer.motion === "drift") { x = -0.12 * W + p * 1.24 * W; y += Math.sin(p * Math.PI * 4) * 18 * scale; }
      else alpha *= Math.sin(p * Math.PI);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(x, y);
      ctx.rotate(rot);
      if ("dot" in particle) {
        ctx.fillStyle = particle.dot.startsWith("var(") ? "#ffffff" : particle.dot;
        ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha *= 0.25;
        ctx.beginPath(); ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2); ctx.fill();
      } else if ("paper" in particle) {
        ctx.fillStyle = particle.paper;
        ctx.fillRect(-size * 0.3, -size / 2, size * 0.6, size);
      } else {
        const img = look.particleImgs[particle.decor];
        if (img) ctx.drawImage(raster(img, 64, 64), -size / 2, -size / 2, size, size);
      }
      ctx.restore();
    }
  });
}
