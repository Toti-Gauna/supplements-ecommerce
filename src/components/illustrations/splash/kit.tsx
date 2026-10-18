import type { ReactNode } from "react";
import type { ArtIds } from "../campaigns/stage";

/**
 * Utilería de las capas de la pantalla de carga por fecha (R3c). Cada capa es un SVG suelto de 800 × 600 (4:3, el
 * escenario) que se publica en `public/splash/<id>/<n>.svg` y el CSS apila y mueve: todas comparten el mismo sistema
 * de coordenadas, así una pieza que se mueve calza con el fondo. Colores literales (es ilustración y va siempre sobre
 * la noche); sin texto (el nombre y el descuento son HTML encima, sobre la caja de LED).
 */
export const SW = 800;
export const SH = 600;

/** Ids fijos: cada capa es su propio documento, no hay choque entre escenas. */
export const ids: ArtIds = { id: (k) => k, url: (k) => `url(#${k})` };

export function Layer({ children }: { children: ReactNode }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH}>{children}</svg>;
}

/** Degradé vertical de varias paradas `[offset, color, opacidad?]`. */
export function VGrad({ id, stops, x2 = 0, y2 = 1 }: { id: string; stops: [number, string, number?][]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
    </linearGradient>
  );
}

/** Halo radial (luz de estudio) centrado en (cx, cy). */
export function Glow({ id, cx, cy, rx, ry, color, o = 0.5 }: { id: string; cx: number; cy: number; rx: number; ry: number; color: string; o?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={color} stopOpacity={o} />
          <stop offset=".45" stopColor={color} stopOpacity={o * 0.35} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
}

/**
 * Caja de marcador LED (sin dígitos: el número es HTML encima). `x, y, w, h` es el vidrio negro, donde el CSS de la
 * escena ubica `.splash-score`; el marco de acero lo rodea con 8 de borde.
 */
export function LedBox({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  const lines = Array.from({ length: Math.floor(h / 6) }, (_, i) => `M${x} ${y + 3 + i * 6}h${w}`).join("");
  return (
    <g>
      <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} rx="4" fill="#07080a" stroke="#2d323b" strokeWidth="3" />
      <path d={`M${x - 8} ${y - 8}h${w + 16}`} stroke="#fff" strokeOpacity=".2" strokeWidth="2" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill="#010102" />
      <rect x={x} y={y} width={w} height={h} fill={color} opacity=".05" />
      <path d={lines} stroke="#fff" strokeOpacity=".035" strokeWidth="1" />
      <path d={`M${x} ${y}h${w * 0.55}l-${w * 0.18} ${h}H${x}z`} fill="#fff" opacity=".035" />
      {[x - 4, x + w + 4].map((bx) => <circle key={bx} cx={bx} cy={y - 4} r="2" fill="#4a515c" />)}
    </g>
  );
}

/** Viñeta: los bordes del escenario se van a la noche (el fondo de la pantalla de carga). */
export function Vignette({ o = 0.85 }: { o?: number }) {
  return (
    <>
      <defs>
        <radialGradient id="vig" cx=".5" cy=".46" r=".62">
          <stop offset=".55" stopColor="#050608" stopOpacity="0" />
          <stop offset="1" stopColor="#050608" stopOpacity={o} />
        </radialGradient>
      </defs>
      <rect width={SW} height={SH} fill="url(#vig)" />
    </>
  );
}

/** Puntos de grilla de la pared (la misma textura de los key visuals). */
export function DotGrid({ x = 0, y = 0, w = SW, h = SH, o = 0.06 }: { x?: number; y?: number; w?: number; h?: number; o?: number }) {
  return (
    <>
      <defs>
        <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#fff" opacity={o} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill="url(#dots)" />
    </>
  );
}
