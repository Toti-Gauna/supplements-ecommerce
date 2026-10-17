/**
 * Dígitos de marcador LED de 7 segmentos, en itálica, para los key visuals (el descuento, la versión del año).
 * Son trazos, no texto: un post los lleva como elemento gráfico y el lector de pantalla no los lee.
 */

/** Segmentos encendidos por dígito: a (arriba), b, c (derecha), d (abajo), e, f (izquierda), g (medio). */
const SEG: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g",
};

const CW = 56, CH = 100, T = 12, GAP = 3;

/** Un segmento horizontal (hexágono apuntado) de `x` a `x + l`, centrado en `y`. */
const hseg = (x: number, y: number, l: number) => `M${x} ${y}l${T / 2} -${T / 2}h${l - T}l${T / 2} ${T / 2}l-${T / 2} ${T / 2}h-${l - T}z`;
/** Un segmento vertical de `y` a `y + l`, centrado en `x`. */
const vseg = (x: number, y: number, l: number) => `M${x} ${y}l${T / 2} ${T / 2}v${l - T}l-${T / 2} ${T / 2}l-${T / 2} -${T / 2}v-${l - T}z`;

const PATHS: Record<string, string> = {
  a: hseg(GAP, 0, CW - GAP * 2),
  g: hseg(GAP, CH / 2, CW - GAP * 2),
  d: hseg(GAP, CH, CW - GAP * 2),
  f: vseg(0, GAP, CH / 2 - GAP * 2),
  b: vseg(CW, GAP, CH / 2 - GAP * 2),
  e: vseg(0, CH / 2 + GAP, CH / 2 - GAP * 2),
  c: vseg(CW, CH / 2 + GAP, CH / 2 - GAP * 2),
};

interface LedProps {
  value: string;
  x: number;
  y: number;
  /** Alto del dígito (el ancho es 0,56 del alto). */
  h?: number;
  color?: string;
  /** Segmentos apagados, apenas visibles, como un marcador real. */
  ghost?: number;
  /** Inclinación de dorsal. */
  skew?: number;
}

/** Ancho total de un valor (para centrarlo). */
export const ledWidth = (value: string, h = 100) => (value.length * (CW + 18) - 18) * (h / CH);

export function Led({ value, x, y, h = 100, color = "#c8ff2e", ghost = 0.07, skew = -9 }: LedProps) {
  const k = h / CH;
  const on = value.split("").map((ch) => SEG[ch] ?? "");
  return (
    <g transform={`translate(${x} ${y}) skewX(${skew}) scale(${k})`}>
      {on.map((segs, i) => (
        <g key={i} transform={`translate(${i * (CW + 18)} 0)`}>
          <path d={Object.values(PATHS).join("")} fill={color} opacity={ghost} />
          <path d={segs.split("").map((s) => PATHS[s]).join("")} fill={color} stroke={color} strokeWidth="10" strokeOpacity=".18" strokeLinejoin="round" />
          <path d={segs.split("").map((s) => PATHS[s]).join("")} fill={color} />
          <path d={segs.split("").map((s) => PATHS[s]).join("")} fill="#fff" opacity=".35" />
        </g>
      ))}
    </g>
  );
}

/** Signo de porcentaje a la altura del marcador: dos aros y la barra, del mismo color. */
export function Percent({ x, y, h = 100, color = "#c8ff2e", skew = -9 }: { x: number; y: number; h?: number; color?: string; skew?: number }) {
  const k = h / CH;
  return (
    <g transform={`translate(${x} ${y}) skewX(${skew}) scale(${k})`} fill="none" stroke={color} strokeLinecap="round">
      <circle cx="14" cy="18" r="12" strokeWidth="9" />
      <circle cx="50" cy="82" r="12" strokeWidth="9" />
      <path d="M58 6L6 94" strokeWidth="10" />
      <circle cx="14" cy="18" r="12" strokeWidth="4" stroke="#fff" opacity=".35" />
      <circle cx="50" cy="82" r="12" strokeWidth="4" stroke="#fff" opacity=".35" />
      <path d="M58 6L6 94" strokeWidth="4" stroke="#fff" opacity=".35" />
    </g>
  );
}
