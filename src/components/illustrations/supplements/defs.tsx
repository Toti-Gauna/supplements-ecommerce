import type { PackStyle } from "./types";
import { brand } from "@/config/brand";

/**
 * Definiciones compartidas de la librería de envases (IDs fijos). En la página van una sola vez (`GlobalArtDefs`); el
 * SVG que se pasa a imagen (`PackShot` del Estudio de contenido) las trae adentro. Sin variables CSS en los dibujos.
 */
export const DISPLAY_SVG = "'Archivo Variable','Arial Black',Arial,sans-serif";
export const MONO_SVG = "'JetBrains Mono Variable',ui-monospace,Menlo,monospace";

export function PackDefs() {
  return (
    <defs>
      {/* Volumen de cilindro: sombra a los costados, brillo a un tercio. Se aplica sobre la misma forma. */}
      <linearGradient id="sp-cyl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity=".55" />
        <stop offset=".1" stopColor="#000" stopOpacity=".16" />
        <stop offset=".25" stopColor="#fff" stopOpacity=".24" />
        <stop offset=".34" stopColor="#fff" stopOpacity=".05" />
        <stop offset=".62" stopColor="#000" stopOpacity="0" />
        <stop offset=".86" stopColor="#000" stopOpacity=".26" />
        <stop offset="1" stopColor="#000" stopOpacity=".55" />
      </linearGradient>
      <linearGradient id="sp-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".3" />
        <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".32" />
      </linearGradient>
      {/* Filo de luz eléctrica del lado derecho: voltio arriba, plasma abajo. */}
      <linearGradient id="sp-rim" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="340">
        <stop offset="0" stopColor={brand.signature.voltSoft} />
        <stop offset=".45" stopColor={brand.signature.volt} />
        <stop offset="1" stopColor={brand.signature.plasma} stopOpacity=".2" />
      </linearGradient>
      <linearGradient id="sp-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity=".05" />
        <stop offset=".18" stopColor="#fff" stopOpacity=".35" />
        <stop offset=".3" stopColor="#fff" stopOpacity=".04" />
        <stop offset=".85" stopColor="#fff" stopOpacity=".02" />
        <stop offset="1" stopColor="#fff" stopOpacity=".18" />
      </linearGradient>
      <radialGradient id="sp-shadow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#000" stopOpacity=".75" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sp-puff" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <radialGradient id="sp-heap" cx=".38" cy=".25" r=".85">
        <stop offset="0" stopColor="#fff" stopOpacity=".45" />
        <stop offset=".5" stopColor="#fff" stopOpacity=".05" />
        <stop offset="1" stopColor="#000" stopOpacity=".35" />
      </radialGradient>
    </defs>
  );
}

/** Tamaño de letra para que una palabra entre en `max` px (Archivo expandida, mayúsculas ≈ 0,9 em por letra). */
export function fitSize(text: string, max: number, preferred: number, perChar = 0.9): number {
  return Math.max(7, Math.min(preferred, max / Math.max(1, text.length * perChar)));
}

/** Volumen de cilindro sobre una forma ya pintada. */
export const Shade = ({ d, opacity = 1 }: { d: string; opacity?: number }) => <path d={d} fill="url(#sp-cyl)" opacity={opacity} />;

/** Filo de luz a la derecha del envase. */
export const Rim = ({ x, y1, y2 }: { x: number; y1: number; y2: number }) => (
  <g>
    <path d={`M${x} ${y1}V${y2}`} stroke="url(#sp-rim)" strokeWidth="7" opacity=".18" strokeLinecap="round" />
    <path d={`M${x} ${y1}V${y2}`} stroke="url(#sp-rim)" strokeWidth="2.2" strokeLinecap="round" />
  </g>
);

function Pattern({ x, y, w, h, pack }: { x: number; y: number; w: number; h: number; pack: PackStyle }) {
  const a = pack.accent;
  switch (pack.pattern) {
    case "bolt":
      return <path d={`M${x + w * 0.8} ${y - 2}h${w * 0.18}l-${w * 0.1} ${h * 0.42}h${w * 0.09}L${x + w * 0.68} ${y + h + 2}l${w * 0.07}-${h * 0.46}h-${w * 0.09}z`} fill={a} opacity=".92" />;
    case "stripes":
      return <g fill={a}>{[0, 1, 2].map((i) => <path key={i} d={`M${x + w * 0.7 + i * w * 0.08} ${y + h}l${w * 0.16} -${h}h${w * 0.045}l-${w * 0.16} ${h}z`} opacity={1 - i * 0.25} />)}</g>;
    case "wave":
      return <path d={`M${x} ${y + h * 0.62}h${w * 0.22}l${w * 0.05}-${h * 0.22}l${w * 0.07} ${h * 0.4}l${w * 0.06}-${h * 0.3}l${w * 0.04} ${h * 0.12}H${x + w}`} fill="none" stroke={a} strokeWidth={Math.max(1.6, h * 0.025)} strokeLinejoin="round" opacity=".95" />;
    case "grid":
      return <g>{Array.from({ length: 5 }, (_, r) => Array.from({ length: 4 }, (_, c) => <circle key={`${r}-${c}`} cx={x + w * 0.72 + c * w * 0.065} cy={y + h * 0.18 + r * h * 0.13} r={Math.max(0.9, w * 0.009)} fill={a} opacity=".7" />))}<circle cx={x + w * 0.82} cy={y + h * 0.42} r={h * 0.2} fill="none" stroke={a} strokeWidth="1.5" opacity=".6" /></g>;
  }
}

/** Rótulo de laboratorio: marca chica, línea grande, dato en mono, dibujo de la marca y franja del sabor abajo. */
export function Label({ x, y, w, h, pack, tint, shade = true }: { x: number; y: number; w: number; h: number; pack: PackStyle; tint: string; shade?: boolean }) {
  const lineSize = fitSize(pack.line, w * (pack.pattern === "wave" ? 0.84 : 0.64), h * 0.28);
  const pad = w * 0.08;
  const stripe = h * 0.13;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={pack.band} />
      {/* Un <svg> anidado recorta su contenido sin ids (los clipPath con id fallan si el primero está oculto). */}
      <svg x={x} y={y} width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`} overflow="hidden">
        <Pattern x={x} y={y} w={w} h={h - stripe} pack={pack} />
      </svg>
      <text x={x + pad} y={y + h * 0.2} fill={pack.ink} opacity=".82" style={{ fontFamily: MONO_SVG, fontWeight: 700, letterSpacing: "0.14em" }} fontSize={Math.max(6, h * 0.075)}>{pack.mark}</text>
      <text x={x + pad} y={y + h * 0.2 + lineSize * 1.08} fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={lineSize}>{pack.line}</text>
      {pack.sub && <text x={x + pad} y={y + h - stripe - h * 0.08} fill={pack.ink} opacity=".7" style={{ fontFamily: MONO_SVG, fontWeight: 600, letterSpacing: "0.08em" }} fontSize={Math.max(5.5, h * 0.065)}>{pack.sub}</text>}
      <rect x={x} y={y + h - stripe} width={w} height={stripe} fill={tint} />
      <rect x={x} y={y + h - stripe} width={w} height={stripe * 0.3} fill="#fff" opacity=".22" />
      {shade && <rect x={x} y={y} width={w} height={h} fill="url(#sp-cyl)" opacity=".75" />}
    </g>
  );
}

/** Mezcla un color hacia negro (k < 0) o blanco (k > 0). Para tapas y bordes sin pedir otro color a la marca. */
export function tone(hex: string, k: number): string {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n.slice(0, 6);
  const v = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const t = k < 0 ? 0 : 255;
  const a = Math.abs(k);
  return `#${v.map((c) => Math.round(c + (t - c) * a).toString(16).padStart(2, "0")).join("")}`;
}
