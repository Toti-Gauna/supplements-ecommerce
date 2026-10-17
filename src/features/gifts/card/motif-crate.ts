import { brand } from "@/config/brand";
import type { CardPalette } from "./designs";

/**
 * Motivo de la tarjeta cuando la apertura es la propia de la fecha (árbol de discos, sogas, cubierta…): un cajón de
 * equipamiento cerrado con la faja de "Edición regalo", bajo la luz. La apertura de verdad es sorpresa: se ve al abrir.
 */
export function drawCrate(ctx: CanvasRenderingContext2D, cx: number, top: number, p: CardPalette, display: string, mono: string) {
  const w = 330, h = 300, x = cx - w / 2, y = top + 430;
  ctx.save();
  const shadow = ctx.createRadialGradient(cx, y + h + 24, 4, cx, y + h + 24, 240);
  shadow.addColorStop(0, "rgb(0 0 0 / 0.55)");
  shadow.addColorStop(1, "rgb(0 0 0 / 0)");
  ctx.fillStyle = shadow;
  ctx.beginPath(); ctx.ellipse(cx, y + h + 24, 240, 38, 0, 0, Math.PI * 2); ctx.fill();
  // Tapa en perspectiva y frente con volumen.
  ctx.fillStyle = p.leather[2];
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y - 70); ctx.lineTo(x + w + 40, y - 70); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  const front = ctx.createLinearGradient(x, 0, x + w, 0);
  front.addColorStop(0, p.leather[0]); front.addColorStop(0.6, p.leather[1]); front.addColorStop(1, p.leather[0]);
  ctx.fillStyle = front;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = p.leather[0];
  ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + 40, y - 70); ctx.lineTo(x + w + 40, y + h - 70); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  // Tablas y remaches.
  ctx.fillStyle = "rgb(0 0 0 / 0.35)";
  for (const ly of [y + 100, y + 200]) ctx.fillRect(x, ly, w, 4);
  ctx.fillStyle = "rgb(255 255 255 / 0.35)";
  for (const [rx, ry] of [[x + 16, y + 16], [x + w - 16, y + 16], [x + 16, y + h - 16], [x + w - 16, y + h - 16]] as const) { ctx.beginPath(); ctx.arc(rx, ry, 5, 0, Math.PI * 2); ctx.fill(); }
  // Faja en diagonal con la marca, en la luz de señal.
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y - 70, w + 40, h + 70); ctx.clip();
  ctx.fillStyle = p.accent;
  ctx.beginPath(); ctx.moveTo(x - 20, y + 170); ctx.lineTo(x + w + 60, y + 40); ctx.lineTo(x + w + 60, y + 110); ctx.lineTo(x - 20, y + 240); ctx.closePath(); ctx.fill();
  ctx.translate(cx + 10, y + 150);
  ctx.rotate(-0.36);
  ctx.fillStyle = p.onAccent;
  ctx.font = `800 40px ${display}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(`${brand.mark} · REGALO`, 0, 0, w);
  ctx.restore();
  // Rótulo de lo que se hace para abrirlo, como etiqueta de envío.
  ctx.fillStyle = p.paper;
  ctx.fillRect(x + 24, y + 222, 190, 56);
  ctx.fillStyle = p.paperInk;
  ctx.font = `800 18px ${mono}`;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("ADENTRO:", x + 36, y + 240);
  ctx.font = `700 16px ${mono}`;
  ctx.fillText("SORPRESA", x + 36, y + 262, 166);
  ctx.restore();
}
