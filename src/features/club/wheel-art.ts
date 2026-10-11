/**
 * Arte del "Disco olímpico" (Fase 4): colores reglamentarios de los discos de pesas, luces del aro y luz del escenario.
 * Son colores del dibujo SVG (no cambian con el modo claro/oscuro), por eso viven acá y no como tokens de la UI.
 */

export interface PlateColor {
  /** Goma en la cara del disco, en el centro del gajo y en el borde. */
  base: string;
  dark: string;
  light: string;
  /** Texto e ícono sobre el gajo (contraste ≥ 4,5:1 con `base`). */
  ink: string;
  /** Rótulo en relieve del borde, como en un disco de verdad. */
  weight: string;
}

/** Rojo 25, azul 20, amarillo 15 y verde 10 kg: se repiten en ese orden alrededor del disco. */
export const PLATES: PlateColor[] = [
  { base: "#cc2229", dark: "#7c0d12", light: "#e8434a", ink: "#ffffff", weight: "25 KG" },
  { base: "#1f50c8", dark: "#0d2668", light: "#3d6fe3", ink: "#ffffff", weight: "20 KG" },
  { base: "#f2c21b", dark: "#a87b06", light: "#ffd84a", ink: "#14110a", weight: "15 KG" },
  { base: "#12803f", dark: "#08431f", light: "#1fa457", ink: "#ffffff", weight: "10 KG" },
];

export const plateFor = (i: number) => PLATES[i % PLATES.length]!;

/** Luces LED del aro de goma. */
export const LEDS = 24;

/** Voltio, plasma e ion de la marca (los mismos de `docs/tono-visual.md`). */
export const VOLT = "#c8ff2e";
export const VOLT_SOFT = "#e3ff8f";
export const PLASMA = "#8b72ff";
export const ION = "#2ee6d6";

/** Luz del escenario sin temática: ion profundo desde abajo y plasma detrás del disco. */
export const STAGE_GLOW: [string, string] = ["#0f5f58", PLASMA];

/** Cupón ganado sin temática: noche → plasma profundo, con el valor en voltio. */
export const COUPON_COLORS = { from: "#0e1117", to: "#2a1f6b", accent: VOLT, ink: "#0a0c10" };

/** Punto en el disco: ángulo en grados desde las 12 en sentido horario. */
export function polar(cx: number, cy: number, radius: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

/** Gajo de corona (entre dos radios) como trazo SVG. */
export function sectorPath(cx: number, cy: number, inner: number, outer: number, from: number, to: number): string {
  const [ax, ay] = polar(cx, cy, outer, from);
  const [bx, by] = polar(cx, cy, outer, to);
  const [c1, d1] = polar(cx, cy, inner, to);
  const [e1, f1] = polar(cx, cy, inner, from);
  const large = to - from > 180 ? 1 : 0;
  return `M${ax} ${ay}A${outer} ${outer} 0 ${large} 1 ${bx} ${by}L${c1} ${d1}A${inner} ${inner} 0 ${large} 0 ${e1} ${f1}Z`;
}

/**
 * Motas de la goma (caucho reciclado): posiciones fijas con un azar determinista, así el HTML es siempre igual.
 * Devuelve [x, y, radio, claro] en la caja de 400 del disco.
 */
export const RUBBER_FLECKS: [number, number, number, boolean][] = Array.from({ length: 240 }, (_, i) => {
  const r = (k: number) => { const x = Math.sin((i + 1) * 12.9898 * k + 78.233) * 43758.5453; return x - Math.floor(x); };
  const [x, y] = polar(200, 200, 60 + r(1) * 132, r(2) * 360);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round((0.5 + r(3) * 1.1) * 100) / 100, r(4) > 0.55];
});
