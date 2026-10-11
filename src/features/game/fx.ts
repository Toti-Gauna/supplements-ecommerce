/**
 * Efectos de Shaker Rush que no son juego: polvo que salta al atrapar, puntos que suben, onda del rayo y sacudón al
 * chocar chatarra. Viven en un ref y se mutan en el lugar (no hay React por cuadro). Con "reducir movimiento" no se
 * crean partículas, ondas ni sacudón; los puntos aparecen quietos y se desvanecen.
 */
interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Popup { x: number; y: number; text: string; color: string; life: number }
interface Ring { x: number; y: number; life: number; color: string }

export interface Fx {
  particles: Particle[];
  popups: Popup[];
  rings: Ring[];
  shake: number;
  still: boolean;
}

const MAX_PARTICLES = 90;
const POPUP_SEC = 0.8;
const RING_SEC = 0.55;
const SHAKE_SEC = 0.22;

export const createFx = (still: boolean): Fx => ({ particles: [], popups: [], rings: [], shake: 0, still });

export function burst(fx: Fx, x: number, y: number, colors: string[], count = 10, power = 1): void {
  if (fx.still) return;
  for (let i = 0; i < count && fx.particles.length < MAX_PARTICLES; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const v = (90 + Math.random() * 170) * power;
    const max = 0.35 + Math.random() * 0.35;
    fx.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: max, max, color: colors[i % colors.length]!, size: 1.6 + Math.random() * 2.4 });
  }
}

export function popup(fx: Fx, x: number, y: number, text: string, color: string): void {
  fx.popups.push({ x, y, text, color, life: POPUP_SEC });
  if (fx.popups.length > 8) fx.popups.shift();
}

export function ring(fx: Fx, x: number, y: number, color: string): void {
  if (!fx.still) fx.rings.push({ x, y, life: RING_SEC, color });
}

export function shake(fx: Fx): void {
  if (!fx.still) fx.shake = SHAKE_SEC;
}

export function updateFx(fx: Fx, dt: number): void {
  for (const p of fx.particles) { p.life -= dt; p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  fx.particles = fx.particles.filter((p) => p.life > 0);
  for (const p of fx.popups) { p.life -= dt; if (!fx.still) p.y -= 38 * dt; }
  fx.popups = fx.popups.filter((p) => p.life > 0);
  for (const r of fx.rings) r.life -= dt;
  fx.rings = fx.rings.filter((r) => r.life > 0);
  fx.shake = Math.max(0, fx.shake - dt);
}

export const fxAlive = (fx: Fx) => fx.particles.length + fx.popups.length + fx.rings.length > 0 || fx.shake > 0;

/** Desplazamiento del sacudón: 5 unidades que se apagan en 220 ms. */
export function shakeOffset(fx: Fx): [number, number] {
  if (fx.shake <= 0) return [0, 0];
  const k = (fx.shake / SHAKE_SEC) * 5;
  return [(Math.random() - 0.5) * 2 * k, (Math.random() - 0.5) * 2 * k];
}

export function drawFx(ctx: CanvasRenderingContext2D, fx: Fx): void {
  for (const p of fx.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.lineWidth = 3;
  for (const r of fx.rings) {
    const k = 1 - r.life / RING_SEC;
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = r.color;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 20 + k * 70, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.font = "800 17px 'Archivo Variable', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(5,6,8,0.85)";
  for (const p of fx.popups) {
    ctx.globalAlpha = Math.min(1, (p.life / POPUP_SEC) * 1.6);
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}
