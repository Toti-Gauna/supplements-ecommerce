import { useId, type ReactNode } from "react";
import { Figure, type Pose } from "../figure";

/**
 * Escenario común de los key visuals (R3a): lienzo 800 × 1000 (4:5), piso en y = 720, luz de estudio y texturas.
 * Todo con colores literales (es ilustración): cada escena armoniza con su piel (`skins.ts`) sobre su propio fondo
 * oscuro, así se ve igual en el modo claro y en el oscuro.
 */
export const W = 800;
export const H = 1000;
/** Línea donde la pared se encuentra con el piso de goma. */
export const FLOOR = 720;

export interface ArtIds {
  id: (k: string) => string;
  url: (k: string) => string;
}

/** Ids únicos por instancia para degradés y máscaras (hay varias escenas por página y el Estudio las pasa a imagen). */
export function useArtIds(): ArtIds {
  const base = `kv${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return { id: (k) => `${base}-${k}`, url: (k) => `url(#${base}-${k})` };
}

/** Pseudoazar determinista (mismo dibujo en el servidor y en el cliente). */
export function rng(seed: number): () => number {
  let s = (seed >>> 0) || 7;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Mezcla un color hacia negro (k < 0) o blanco (k > 0). */
export function tone(hex: string, k: number): string {
  const n = hex.replace("#", "");
  const v = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  const t = k < 0 ? 0 : 255;
  const a = Math.abs(k);
  return `#${v.map((c) => Math.round(c + (t - c) * a).toString(16).padStart(2, "0")).join("")}`;
}

interface BackdropProps {
  ids: ArtIds;
  /** Colores de la piel de la fecha (`from` oscuro, `to` claro): pared y halo. */
  from: string;
  to: string;
  /** Color del halo detrás del sujeto (si no, el `to` de la piel). */
  glow?: string;
  glowAt?: [number, number];
}

/** Pared en degradé, halo detrás del sujeto, piso de goma con líneas de fuga y viñeta. */
export function Backdrop({ ids, from, to, glow = to, glowAt = [400, 640] }: BackdropProps) {
  const dark = tone(from, -0.55);
  const lanes = [-3, -2, -1, 0, 1, 2, 3].map((i) => `M${400 + i * 150} ${FLOOR}L${400 + i * 560} ${H + 40}`).join("");
  return (
    <>
      <defs>
        <linearGradient id={ids.id("wall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset=".5" stopColor={from} />
          <stop offset="1" stopColor={tone(to, -0.3)} />
        </linearGradient>
        <radialGradient id={ids.id("halo")} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${glowAt[0]} ${glowAt[1]}) scale(440 320)`}>
          <stop offset="0" stopColor={glow} stopOpacity=".6" />
          <stop offset=".5" stopColor={glow} stopOpacity=".16" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.id("floor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone(from, -0.35)} />
          <stop offset=".25" stopColor="#0a0b0e" />
          <stop offset="1" stopColor="#040506" />
        </linearGradient>
        <radialGradient id={ids.id("vig")} cx=".5" cy=".5" r=".72">
          <stop offset=".5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".8" />
        </radialGradient>
        <pattern id={ids.id("grid")} width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="#fff" opacity=".07" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={ids.url("wall")} />
      <rect width={W} height={FLOOR} fill={ids.url("grid")} />
      <rect width={W} height={H} fill={ids.url("halo")} />
      <rect y={FLOOR} width={W} height={H - FLOOR} fill={ids.url("floor")} />
      <path d={lanes} stroke="#fff" strokeOpacity=".06" strokeWidth="2" />
      <path d={`M0 ${FLOOR}H${W}`} stroke="#fff" strokeOpacity=".12" strokeWidth="2" />
      <rect width={W} height={H} fill={ids.url("vig")} />
    </>
  );
}

interface BeamProps {
  ids: ArtIds;
  /** Sufijo del id (varios haces por escena). */
  k: string;
  /** Foco (arriba) y centro de la mancha en el piso. */
  x0: number;
  x1: number;
  y1?: number;
  /** Media anchura en el piso. */
  w: number;
  color: string;
  o?: number;
  lamp?: boolean;
}

/** Haz volumétrico: cono que se apaga hacia abajo, mancha en el piso y el foco con su aro. */
export function Beam({ ids, k, x0, x1, y1 = FLOOR + 60, w, color, o = 0.55, lamp = true }: BeamProps) {
  return (
    <g>
      <defs>
        <linearGradient id={ids.id(`beam${k}`)} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={o} />
          <stop offset=".55" stopColor={color} stopOpacity={o * 0.28} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={ids.id(`pool${k}`)} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={color} stopOpacity={o * 0.7} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={`M${x0 - 16} -10L${x0 + 16} -10L${x1 + w} ${y1}L${x1 - w} ${y1}Z`} fill={ids.url(`beam${k}`)} />
      <ellipse cx={x1} cy={y1} rx={w * 1.15} ry={w * 0.22} fill={ids.url(`pool${k}`)} />
      {lamp && (
        <g>
          <rect x={x0 - 34} y="-4" width="68" height="26" rx="3" fill="#0b0d11" />
          <rect x={x0 - 26} y="18" width="52" height="7" fill={color} opacity=".9" />
          <rect x={x0 - 26} y="18" width="52" height="7" fill="#fff" opacity=".5" />
        </g>
      )}
    </g>
  );
}

interface DustProps {
  seed: number;
  n: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  rMax?: number;
  o?: number;
}

/**
 * Polvo de tiza, chispas o brasas: puntos en tres tamaños (los grandes, pocos). Cada punto es un trazo de largo
 * cero con punta redonda: diez caracteres por partícula, así el polvo no pesa en el SVG.
 */
export function Dust({ seed, n, x, y, w, h, color = "#fff", rMax = 3, o = 0.6 }: DustProps) {
  const r = rng(seed);
  const dot = () => `M${Math.round(x + r() * w)} ${Math.round(y + r() * h)}h0`;
  const tiers: [number, number, number][] = [[0.6, rMax * 0.5, 1], [0.3, rMax * 1.2, 0.8], [0.1, rMax * 2, 0.55]];
  return (
    <g stroke={color} strokeLinecap="round" fill="none" opacity={o}>
      {tiers.map(([share, d, alpha], i) => <path key={i} d={Array.from({ length: Math.round(n * share) }, dot).join("")} strokeWidth={r1(d)} strokeOpacity={alpha} />)}
    </g>
  );
}

/** Destello de lente: halo, raya horizontal fina, aro y cruz. */
export function Flare({ ids, k, cx, cy, color, s = 1, o = 1 }: { ids: ArtIds; k: string; cx: number; cy: number; color: string; s?: number; o?: number }) {
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id={ids.id(`fl${k}`)} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".18" stopColor={color} stopOpacity=".55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.id(`st${k}`)} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={110 * s} fill={ids.url(`fl${k}`)} />
      <rect x={cx - 260 * s} y={cy - 1.5 * s} width={520 * s} height={3 * s} fill={ids.url(`st${k}`)} />
      <rect x={cx - 1 * s} y={cy - 70 * s} width={2 * s} height={140 * s} fill={ids.url(`st${k}`)} transform={`rotate(90 ${cx} ${cy})`} opacity=".7" />
      <circle cx={cx + 48 * s} cy={cy + 26 * s} r={14 * s} fill="none" stroke={color} strokeOpacity=".35" strokeWidth={2 * s} />
      <circle cx={cx + 96 * s} cy={cy + 52 * s} r={6 * s} fill={color} fillOpacity=".4" />
    </g>
  );
}

interface AthleteProps {
  pose: Pose;
  x: number;
  y: number;
  s?: number;
  /** Color de la silueta (casi negro) y del filo de luz. */
  color?: string;
  rim?: string;
  /** Hacia dónde cae el filo (en unidades de la pose). */
  rimDx?: number;
  rimDy?: number;
  flip?: boolean;
  far?: ReactNode;
  near?: ReactNode;
}

/**
 * Silueta sin cara apoyada en el piso del escenario, con un filo de luz: la misma figura en el color de la luz,
 * apenas corrida, entre dos copias oscuras (la de abajo tapa el filo donde los miembros lejanos son translúcidos).
 */
export function Athlete({ pose, x, y, s = 3, color = "#07080b", rim, rimDx = -3, rimDy = -1, flip = false, far, near }: AthleteProps) {
  const t = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
  const figure = <Figure pose={pose} far={far} near={near} />;
  return (
    <g>
      {rim && (
        <>
          <g transform={t} style={{ color }}>{figure}</g>
          <g transform={`${t} translate(${rimDx} ${rimDy})`} style={{ color: rim }} opacity=".92">{figure}</g>
        </>
      )}
      <g transform={t} style={{ color }}>{figure}</g>
    </g>
  );
}

/** Niebla o tiza baja sobre el piso: capas de elipses blancas muy tenues. */
export function Fog({ ids, k, y = FLOOR + 10, color = "#fff", o = 0.18 }: { ids: ArtIds; k: string; y?: number; color?: string; o?: number }) {
  return (
    <g>
      <defs>
        <radialGradient id={ids.id(`fog${k}`)} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={color} stopOpacity={o} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {[[120, y + 20, 300, 60], [430, y, 360, 70], [700, y + 30, 320, 55], [300, y + 70, 420, 60]].map(([cx, cy, rx, ry], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={ids.url(`fog${k}`)} />
      ))}
    </g>
  );
}
