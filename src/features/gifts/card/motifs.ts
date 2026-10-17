import { brand } from "@/config/brand";
import type { CardPalette } from "./designs";

/**
 * Motivos de la tarjeta: la apertura que eligió quien regala, dibujada con luz de estudio. La bolsa de boxeo cuelga de
 * su cadena con la marca y una costura; el locker de acero tiene la ruedita de la combinación tapada y una luz que se
 * escapa por la rendija. Coordenadas de diseño (tarjeta de 1080 × 1350).
 */
type Ctx = CanvasRenderingContext2D;

function floorShadow(ctx: Ctx, cx: number, y: number, w: number) {
  const g = ctx.createRadialGradient(cx, y, 4, cx, y, w);
  g.addColorStop(0, "rgb(0 0 0 / 0.55)");
  g.addColorStop(1, "rgb(0 0 0 / 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, y, w, w * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Cilindro: oscuro en los bordes, luz a la derecha (como los envases de la tienda). */
function cylinder(ctx: Ctx, x: number, w: number, [dark, mid, edge]: [string, string, string]) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, dark);
  g.addColorStop(0.42, mid);
  g.addColorStop(0.7, edge);
  g.addColorStop(0.86, mid);
  g.addColorStop(1, dark);
  return g;
}

export function drawBag(ctx: Ctx, cx: number, top: number, p: CardPalette, display: string) {
  const w = 270, h = 560, x = cx - w / 2, y = top + 180;
  ctx.save();
  // Cadena: eslabones alternados.
  ctx.strokeStyle = "#9aa4b2";
  ctx.lineWidth = 7;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    if (i % 2) ctx.ellipse(cx, top + 14 + i * 26, 6, 15, 0, 0, Math.PI * 2);
    else ctx.ellipse(cx, top + 14 + i * 26, 12, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Correas al cuerpo.
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, top + 160); ctx.lineTo(x + 30, y + 10);
  ctx.moveTo(cx, top + 160); ctx.lineTo(x + w - 30, y + 10);
  ctx.stroke();
  floorShadow(ctx, cx, y + h + 90, 230);
  // Cuerpo con volumen y filo de luz.
  ctx.fillStyle = cylinder(ctx, x, w, p.leather);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [60, 60, 70, 70]);
  ctx.fill();
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w - 12, y + 60); ctx.lineTo(x + w - 12, y + h - 70);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Bandas de la marca.
  ctx.fillStyle = p.accent;
  for (const by of [y + 70, y + h - 120]) ctx.fillRect(x, by, w, 22);
  // Costura que se abre.
  ctx.setLineDash([10, 9]);
  ctx.strokeStyle = "rgb(255 255 255 / 0.28)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 60, y + 120); ctx.lineTo(x + 60, y + h - 140);
  ctx.stroke();
  ctx.setLineDash([]);
  // La marca en vertical.
  ctx.save();
  ctx.translate(cx + 18, y + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgb(255 255 255 / 0.9)";
  ctx.font = `800 96px ${display}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(brand.mark, 0, 0, h - 220);
  ctx.restore();
  // Huellas de tiza de los golpes.
  ctx.fillStyle = "rgb(255 255 255 / 0.1)";
  for (const [hx, hy, r] of [[x + 80, y + 300, 46], [x + 190, y + 210, 34], [x + 150, y + 420, 30]] as const) {
    ctx.beginPath(); ctx.ellipse(hx, hy, r, r * 0.8, 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawLocker(ctx: Ctx, cx: number, top: number, p: CardPalette, mono: string) {
  const w = 350, h = 660, x = cx - w / 2, y = top + 130;
  ctx.save();
  floorShadow(ctx, cx, y + h + 30, 250);
  // Luz que se escapa por la rendija de abajo.
  const leak = ctx.createLinearGradient(0, y + h - 6, 0, y + h + 60);
  leak.addColorStop(0, p.accent);
  leak.addColorStop(1, "rgb(0 0 0 / 0)");
  ctx.fillStyle = leak;
  ctx.globalAlpha = 0.65;
  ctx.fillRect(x + 10, y + h - 6, w - 20, 60);
  ctx.globalAlpha = 1;
  // Puerta de acero cepillado.
  ctx.fillStyle = cylinder(ctx, x, w, ["#1c2129", "#5b6472", "#c9d0da"]);
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();
  ctx.strokeStyle = "rgb(0 0 0 / 0.5)"; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "rgb(255 255 255 / 0.05)";
  for (let i = 0; i < h; i += 5) ctx.fillRect(x + 6, y + i, w - 12, 1);
  // Rejillas de ventilación.
  ctx.fillStyle = "#0b0d10";
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.roundRect(x + 70, y + 46 + i * 24, w - 140, 10, 5); ctx.fill(); }
  // Chapa con el número del locker.
  ctx.fillStyle = p.accent;
  ctx.fillRect(x + w / 2 - 54, y + 210, 108, 48);
  ctx.fillStyle = p.onAccent;
  ctx.font = `800 30px ${mono}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("N.º 07", x + w / 2, y + 235);
  // Combinación tapada: cuatro rodillos.
  const dy = y + 360;
  ctx.fillStyle = "#0b0d10";
  ctx.beginPath(); ctx.roundRect(x + 50, dy, w - 100, 110, 10); ctx.fill();
  for (let i = 0; i < 4; i++) {
    const rx = x + 66 + i * ((w - 132) / 4);
    const g = ctx.createLinearGradient(0, dy + 12, 0, dy + 98);
    g.addColorStop(0, "#3a414c"); g.addColorStop(0.5, "#eef1f5"); g.addColorStop(1, "#3a414c");
    ctx.fillStyle = g;
    ctx.fillRect(rx, dy + 12, (w - 132) / 4 - 10, 86);
    ctx.fillStyle = "#0b0d10";
    ctx.font = `800 52px ${mono}`;
    ctx.fillText("?", rx + ((w - 132) / 4 - 10) / 2, dy + 57);
  }
  // Manija.
  ctx.fillStyle = "#0b0d10";
  ctx.beginPath(); ctx.roundRect(x + w - 64, y + 520, 26, 110, 13); ctx.fill();
  ctx.restore();
}
