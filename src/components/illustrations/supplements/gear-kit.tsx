import { DISPLAY_SVG, MONO_SVG, fitSize, tone } from "./defs";
import type { PackStyle } from "./types";

/**
 * Piezas comunes de los accesorios (straps, guantes, bolso…): sombra de contacto, costuras, parche bordado de la marca
 * y tinta legible sobre el color del producto. Mismo lienzo que los envases (400 × 400, piso en y = 330).
 */

/** Sombra de contacto apoyada en el piso: un halo ancho y un núcleo oscuro pegado al objeto. */
export function Contact({ cx = 200, rx, y = 329, o = 1 }: { cx?: number; rx: number; y?: number; o?: number }) {
  return (
    <g opacity={o}>
      <ellipse cx={cx} cy={y} rx={rx * 1.12} ry={rx * 0.1} fill="url(#sp-shadow)" opacity=".7" />
      <ellipse cx={cx} cy={y} rx={rx * 0.86} ry={rx * 0.045} fill="#000" opacity=".45" />
    </g>
  );
}

/** Luminancia relativa (0 negro, 1 blanco) para decidir la tinta sobre el color del producto. */
export function luma(hex: string): number {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n.slice(0, 6);
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tinta impresa sobre el producto: clara sobre colores oscuros, grafito sobre claros. */
export const printOn = (hex: string) => (luma(hex) < 0.5 ? "#f4f6f8" : "#14171c");

/** Costura: un trazo punteado del color dado (sobre cuero, neoprene o nylon). */
export function Stitch({ d, color, w = 1.4, o = 0.85 }: { d: string; color: string; w?: number; o?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="4 3" strokeLinecap="round" opacity={o} />;
}

/** Parche bordado con la marca: fondo de la marca, borde cosido del acento y la marca en su tinta. */
export function Patch({ x, y, w, h, pack, rotate = 0, sub }: { x: number; y: number; w: number; h: number; pack: PackStyle; rotate?: number; sub?: string }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const size = fitSize(pack.mark, w * 0.84, h * (sub ? 0.36 : 0.46), 0.82);
  return (
    <g transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(4, h * 0.18)} fill={pack.band} />
      <rect x={x} y={y} width={w} height={h} rx={Math.min(4, h * 0.18)} fill="url(#sp-v)" opacity=".7" />
      <rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx={Math.min(3, h * 0.14)} fill="none" stroke={pack.accent} strokeWidth="1.1" strokeDasharray="2.6 2" opacity=".9" />
      <text x={cx} y={sub ? cy + size * 0.12 : cy + size * 0.36} textAnchor="middle" fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={size}>{pack.mark}</text>
      {sub && <text x={cx} y={cy + size * 0.12 + h * 0.26} textAnchor="middle" fill={pack.accent} style={{ fontFamily: MONO_SVG, fontWeight: 700, letterSpacing: "0.12em" }} fontSize={Math.max(5, h * 0.17)}>{sub}</text>}
    </g>
  );
}

/** Espiral de Arquímedes (cara de un rollo de tela visto de frente), con achatamiento vertical `sy`. */
export function spiral(cx: number, cy: number, r: number, turns: number, sy = 1, r0 = 0): string {
  const steps = Math.round(turns * 36);
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const rr = r0 + (r - r0) * t;
    return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * sy).toFixed(1)}`;
  });
  return `M${pts.join("L")}`;
}

/** Punto de una elipse (ángulo en grados, 90 = adelante/abajo). */
export function onEllipse(cx: number, cy: number, rx: number, ry: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [+(cx + Math.cos(a) * rx).toFixed(1), +(cy + Math.sin(a) * ry).toFixed(1)];
}

/** Tono del material visto de espaldas o por dentro (más oscuro y algo apagado). */
export const inside = (hex: string) => tone(hex, -0.42);
