import { useId, type ReactNode } from "react";
import { Figure, type Pose } from "../figure";
import { cn } from "@/lib/cn";

/**
 * Escenario común de los key visuals (lote R3a, parte B): lienzo 800 × 1000 (post 4:5), luz de escenario, siluetas
 * sin cara y producto. Todo SVG y sin `<text>`; los ids salen de `useId` porque puede haber varias escenas por página.
 */
export const uidOf = (raw: string) => `kv${raw.replace(/[^a-zA-Z0-9]/g, "")}`;

interface SceneProps {
  id: string;
  className?: string;
  /** Cielo o pared: arriba y abajo. */
  sky: [string, string];
  children: (u: string) => ReactNode;
}

const CYL = [[0, "#000", 0.55], [0.1, "#000", 0.16], [0.25, "#fff", 0.24], [0.34, "#fff", 0.05], [0.62, "#000", 0], [0.86, "#000", 0.26], [1, "#000", 0.55]] as const;

export function Scene({ id, className, sky, children }: SceneProps) {
  const u = uidOf(useId());
  return (
    <svg viewBox="0 0 800 1000" aria-hidden="true" focusable="false" data-campaign={id} className={cn("block", className)}>
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        <linearGradient id={`${u}-cyl`} x1="0" y1="0" x2="1" y2="0">{CYL.map(([o, c, a]) => <stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}</linearGradient>
        <linearGradient id={`${u}-v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".3" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".32" /></linearGradient>
        <radialGradient id={`${u}-shadow`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".75" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${u}-vig`} cx=".5" cy=".46" r=".74"><stop offset=".5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".78" /></radialGradient>
        <filter id={`${u}-blur`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id={`${u}-soft`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
        <pattern id={`${u}-grain`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#fff" opacity=".16" /><circle cx="4.5" cy="4" r=".5" fill="#fff" opacity=".1" /></pattern>
      </defs>
      <rect width="800" height="1000" fill={`url(#${u}-sky)`} />
      {children(u)}
      <rect width="800" height="1000" fill={`url(#${u}-grain)`} opacity=".35" />
      <rect width="800" height="1000" fill={`url(#${u}-vig)`} />
    </svg>
  );
}

/** Haz de luz volumétrico: cono desde (x, y) que se abre hacia abajo, desenfocado. `tilt` lo inclina desde la fuente. */
export function Beam({ u, x, y = -20, top = 30, bottom = 300, h = 1020, tilt = 0, o = 0.55, color = "#fff" }: { u: string; x: number; y?: number; top?: number; bottom?: number; h?: number; tilt?: number; o?: number; color?: string }) {
  const g = uidOf(useId());
  return (
    <g transform={tilt ? `rotate(${tilt} ${x} ${y})` : undefined} filter={`url(#${u}-blur)`} opacity={o}>
      <linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".5" /><stop offset=".55" stopColor={color} stopOpacity=".14" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>
      <path d={`M${x - top} ${y}H${x + top}L${x + bottom} ${y + h}H${x - bottom}Z`} fill={`url(#${g})`} />
    </g>
  );
}

/** Halo o charco de luz: elipse con degradé radial del color dado. */
export function Glow({ cx, cy, rx, ry, color = "#fff", o = 0.5, k = 1 }: { cx: number; cy: number; rx: number; ry: number; color?: string; o?: number; k?: number }) {
  const g = uidOf(useId());
  return (
    <g opacity={o}>
      <radialGradient id={g} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor={color} stopOpacity={k} /><stop offset=".45" stopColor={color} stopOpacity={k * 0.28} /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${g})`} />
    </g>
  );
}

/** Sombra de contacto en el piso. */
export const Drop = ({ u, cx, cy, rx, ry, o = 0.8 }: { u: string; cx: number; cy: number; rx: number; ry: number; o?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${u}-shadow)`} opacity={o} />
);

/** Generador determinista (misma escena en el servidor y en el navegador). */
export function rnd(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/** Polvo de tiza o partículas en la luz: `n` puntos dentro de la caja, más grandes hacia el centro. */
export function Dust({ x, y, w, h, n = 20, seed = 7, color = "#fff", r = 2.4, o = 0.7 }: { x: number; y: number; w: number; h: number; n?: number; seed?: number; color?: string; r?: number; o?: number }) {
  const next = rnd(seed);
  // Dos capas en un solo path cada una (tenue y viva), en vez de un círculo por partícula.
  const layer = (k: number) => Array.from({ length: Math.ceil(n / 2) }, () => {
    const cx = (x + next() * w).toFixed(0), cy = (y + next() * h).toFixed(0), rr = (0.5 + next() * r * k).toFixed(1);
    return `M${cx} ${cy}m-${rr} 0a${rr} ${rr} 0 1 0 ${+rr * 2} 0a${rr} ${rr} 0 1 0 -${+rr * 2} 0`;
  }).join("");
  return <g fill={color}><path d={layer(0.7)} opacity={(o * 0.35).toFixed(2)} /><path d={layer(1)} opacity={o} /></g>;
}

interface AthleteProps {
  pose: Pose;
  /** Punto del piso de la silueta (y = 186 local) en la escena y escala. */
  x: number; y: number; s?: number;
  flip?: boolean;
  color?: string;
  /** Luz de borde: color y corrimiento local (positivo = borde a la derecha). */
  rim?: string; rimDx?: number;
  /** Resplandor detrás (sudor, contraluz). */
  glow?: string;
  far?: ReactNode; near?: ReactNode;
}

/**
 * Silueta de atleta de la librería (`Figure`, 160 × 200) llevada a la escena. La luz de borde y el resplandor salen
 * de un filtro sobre la misma silueta (copia corrida y copia desenfocada de su alfa), no de dibujarla tres veces.
 */
export function Athlete({ pose, x, y, s = 3, flip, color = "#07080b", rim, rimDx = 1.3, glow, far, near }: AthleteProps) {
  const f = uidOf(useId());
  const sx = flip ? -s : s;
  const fx = Boolean(rim || glow);
  return (
    <g transform={`translate(${x} ${y - 186 * s}) scale(${sx} ${s})`}>
      {fx && (
        <filter id={f} x="-40%" y="-30%" width="180%" height="160%" colorInterpolationFilters="sRGB">
          {/* Los miembros lejanos van a media opacidad: la curva deja la luz de borde casi solo sobre lo pleno. */}
          <feComponentTransfer in="SourceAlpha" result="a"><feFuncA type="gamma" exponent="3.5" /></feComponentTransfer>
          {glow && <><feGaussianBlur in="a" stdDeviation="7" result="gb" /><feFlood floodColor={glow} floodOpacity=".5" result="gc" /><feComposite in="gc" in2="gb" operator="in" result="glow" /></>}
          {rim && <><feOffset in="a" dx={rimDx} dy={-rimDx * 0.4} result="ro" /><feFlood floodColor={rim} result="rc" /><feComposite in="rc" in2="ro" operator="in" result="rim" /></>}
          <feMerge>{glow && <feMergeNode in="glow" />}{rim && <feMergeNode in="rim" />}<feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      )}
      <g color={color} filter={fx ? `url(#${f})` : undefined}><Figure pose={pose} far={far} near={near} /></g>
    </g>
  );
}

const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abfgcd" };
/** Segmentos a–g de un dígito de 10 × 18: [x, y, ancho, alto]. */
const CELL: Record<string, [number, number, number, number]> = { a: [1.4, 0, 7.2, 2], b: [8.4, 1.2, 2, 7], c: [8.4, 9.8, 2, 7], d: [1.4, 16, 7.2, 2], e: [-0.4, 9.8, 2, 7], f: [-0.4, 1.2, 2, 7], g: [1.4, 8, 7.2, 2] };

const box = (x: number, [rx, ry, w, hh]: [number, number, number, number]) => `M${x + rx} ${ry}h${w}v${hh}h-${w}z`;

/** Dígitos de marcador LED (7 segmentos, en itálica) sin `<text>`: "08:42". Dos paths: segmentos prendidos y apagados. */
export function Digits({ value, x, y, h = 60, color = "#ffd34d", ghost = true, o = 1, stroke }: { value: string; x: number; y: number; h?: number; color?: string; ghost?: boolean; o?: number; stroke?: number }) {
  const k = h / 18;
  let cx = 0, on = "", off = "";
  for (const ch of value) {
    if (ch === ":") on += `M${cx + 1} 4.6h2v2h-2zM${cx + 1} 11.6h2v2h-2z`;
    else if (ch === ".") on += `M${cx + 1} 16h2v2h-2z`;
    else {
      for (const s of SEG[ch] ?? "") on += box(cx, CELL[s]!);
      for (const c of Object.values(CELL)) off += box(cx, c);
    }
    cx += ch === ":" || ch === "." ? 5 : 12.5;
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) skewX(-8)`} fill={color} opacity={o}>
      {ghost && !stroke && <path d={off} opacity=".1" />}
      <path d={on} stroke={stroke ? color : undefined} strokeWidth={stroke ? stroke / k : undefined} fillOpacity={stroke ? 0 : undefined} />
    </g>
  );
}
