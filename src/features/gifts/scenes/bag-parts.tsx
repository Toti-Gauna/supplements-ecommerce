import type { ReactNode } from "react";
import { DISPLAY_SVG, Rim } from "@/components/illustrations/supplements/defs";
import type { BagColors } from "./bag-colors";
import { brand } from "@/config/brand";

/**
 * Piezas de la bolsa de boxeo (lienzo de 300 × 300). Cilindro de cuero de x 100 a 200, tapa en y 86 y base en 256;
 * el paño del frente (entre las costuras de x 121 y 179) es el que se rompe al abrirla.
 */
export const BODY = "M100 86A50 8 0 0 0 200 86V234C200 249 178 256 150 256C122 256 100 249 100 234Z";
const TOP_COLLAR = "M100 86A50 8 0 0 0 200 86V102A50 8 0 0 1 100 102Z";
const BASE = "M100 222A50 8 0 0 0 200 222V234C200 249 178 256 150 256C122 256 100 249 100 234Z";
export const PANEL = { x: 121, y: 111, w: 58, h: 115 };

/** Costuras que se abren golpe a golpe (en orden): costado izquierdo o derecho del paño, arriba o abajo. */
export const SEAMS = [
  { x: 121, y1: 168, y2: 220 },
  { x: 179, y1: 116, y2: 164 },
  { x: 121, y1: 116, y2: 162 },
  { x: 179, y1: 170, y2: 220 },
] as const;

/** Degradés de la escena, con ids únicos por instancia (la vista previa y la apertura pueden convivir). */
export function BagDefs({ uid, c }: { uid: string; c: BagColors }) {
  return (
    <defs>
      <linearGradient id={`${uid}-leather`} gradientUnits="userSpaceOnUse" x1="100" y1="0" x2="200" y2="0">
        <stop offset="0" stopColor={c.leatherLo} /><stop offset=".16" stopColor={c.leather} /><stop offset=".36" stopColor={c.leatherHi} />
        <stop offset=".58" stopColor={c.leather} /><stop offset=".88" stopColor={c.leatherLo} /><stop offset="1" stopColor={c.leatherLo} />
      </linearGradient>
      <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f2f5f8" /><stop offset=".5" stopColor="#9aa6b4" /><stop offset="1" stopColor="#4c5663" />
      </linearGradient>
      <radialGradient id={`${uid}-glow`}>
        <stop offset="0" stopColor={c.accent} stopOpacity=".55" /><stop offset=".5" stopColor={c.accent} stopOpacity=".14" /><stop offset="1" stopColor={c.accent} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-light`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={c.accent} /><stop offset=".5" stopColor="#ffffff" /><stop offset="1" stopColor={c.accent} />
      </linearGradient>
      <radialGradient id={`${uid}-cavity`} cx=".5" cy=".55" r=".7">
        <stop offset="0" stopColor="#ffffff" /><stop offset=".3" stopColor={c.accent} /><stop offset="1" stopColor={c.inside} />
      </radialGradient>
      <radialGradient id={`${uid}-dent`}>
        <stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset=".6" stopColor="#000" stopOpacity=".15" /><stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-halo`}>
        <stop offset="0" stopColor="#ffffff" stopOpacity=".8" /><stop offset=".22" stopColor={c.accent} stopOpacity=".42" /><stop offset=".6" stopColor={c.accent} stopOpacity=".1" /><stop offset="1" stopColor={c.accent} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-ray`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity=".7" /><stop offset=".55" stopColor={c.accent} stopOpacity=".25" /><stop offset="1" stopColor={c.accent} stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/** Soporte del techo, cadena, argolla y las dos cadenas de atrás. */
export function Chain({ uid }: { uid: string }) {
  const steel = `url(#${uid}-steel)`;
  return (
    <g>
      <rect x="132" y="-4" width="36" height="9" rx="2.5" fill="#2b323c" /><rect x="132" y="-4" width="36" height="3" rx="1.5" fill="#fff" opacity=".12" />
      {[9, 18, 27].map((y, i) => (i % 2
        ? <rect key={y} x="148.6" y={y - 5} width="2.8" height="10" rx="1.4" fill={steel} />
        : <ellipse key={y} cx="150" cy={y} rx="3.4" ry="5.4" fill="none" stroke={steel} strokeWidth="2.2" />))}
      <circle cx="150" cy="38" r="5.6" fill="none" stroke={steel} strokeWidth="2.6" />
      <path d="M147 42L124 80M153 42L176 80" stroke="#59636f" strokeWidth="2" strokeDasharray="4 2.2" strokeLinecap="round" />
    </g>
  );
}

/** Las dos cadenas de adelante (van sobre la tapa y lo que tenga encima). */
export function FrontStraps({ uid }: { uid: string }) {
  return <path d="M146 42L108 89M154 42L192 89" stroke={`url(#${uid}-steel)`} strokeWidth="2.4" strokeDasharray="4.5 2.2" strokeLinecap="round" />;
}

/** Tapa vista apenas de arriba, con la chapa del giratorio. */
export function Cap({ c }: { c: BagColors }) {
  return (
    <g>
      <ellipse cx="150" cy="86" rx="50" ry="8" fill={c.cap} />
      <ellipse cx="150" cy="85.4" rx="40" ry="5.2" fill="#000" opacity=".22" />
      <path d="M104 85Q150 76 196 85" stroke="#fff" strokeOpacity=".16" strokeWidth="1.4" fill="none" />
    </g>
  );
}

/** Cuero con volumen: lo que se rompe (el paño) es una copia recortada de esto. */
export function Leather({ uid, children }: { uid: string; children?: ReactNode }) {
  return (
    <g>
      <path d={BODY} fill={`url(#${uid}-leather)`} />
      <path d="M100 150H200M100 186H200" stroke="#000" strokeOpacity=".1" strokeWidth="1" />
      {children}
      <path d={BODY} fill="url(#sp-cyl)" opacity=".45" />
    </g>
  );
}

/** La bolsa entera: cuero, detalle de la fecha, costuras del paño, refuerzos con la marca y filo de luz. */
export function Skin({ uid, c, children }: { uid: string; c: BagColors; children?: ReactNode }) {
  const { x, y, w, h } = PANEL;
  return (
    <g>
      <Leather uid={uid}>{children}</Leather>
      <path d={`M${x} ${y - 3}V${y + h + 4}M${x + w} ${y - 3}V${y + h + 4}`} stroke="#000" strokeOpacity=".4" strokeWidth="1.8" />
      <path d={`M${x + 2.6} ${y}V${y + h + 2}M${x + w - 2.6} ${y}V${y + h + 2}`} stroke={c.accent} strokeOpacity=".75" strokeWidth="1.1" strokeDasharray="3 3" />
      <path d={TOP_COLLAR} fill={c.band} />
      <path d={BASE} fill={c.band} />
      <path d="M100 89.5A50 8 0 0 0 200 89.5M100 99A50 8 0 0 0 200 99M100 225.5A50 8 0 0 0 200 225.5" fill="none" stroke={c.accent} strokeOpacity=".7" strokeWidth="1" strokeDasharray="2.6 2.6" />
      <text x="150" y="103" textAnchor="middle" fill={c.accent} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%", letterSpacing: "0.22em" }} fontSize="9.5">{brand.mark}</text>
      <path d={TOP_COLLAR} fill="url(#sp-cyl)" opacity=".5" /><path d={BASE} fill="url(#sp-cyl)" opacity=".5" />
      <g opacity=".35"><Rim x={198} y1={98} y2={236} /></g>
    </g>
  );
}

/** Forma de ojal (la costura abierta), de alto y2 − y1 y ancho total 2·w. */
const lens = (x: number, y1: number, y2: number, w: number) => `M${x} ${y1}Q${x - w} ${(y1 + y2) / 2} ${x} ${y2}Q${x + w} ${(y1 + y2) / 2} ${x} ${y1}Z`;

/** Una costura abierta: luz de adentro, hilos cortados y, la primera vez, un arco eléctrico. `open` de 0 a 1. */
export function SeamSlit({ seam, open, fresh, uid, c }: { seam: (typeof SEAMS)[number]; open: number; fresh: boolean; uid: string; c: BagColors }) {
  const { x, y1, y2 } = seam;
  const out = x < 150 ? -1 : 1;
  const threads = [0.22, 0.42, 0.62, 0.8].map((t) => { const y = y1 + (y2 - y1) * t; return `M${x - 4} ${y - 1.5}l2.6 1.4M${x + 4} ${y + 1.5}l-2.6-1.4`; }).join("");
  // Se abre desde la línea de la costura (no desde el centro de su caja, que incluye la luz que se escapa).
  const transformOrigin = `${x}px ${(y1 + y2) / 2}px`;
  return (
    <g data-seam="open" className="bk-seam" style={{ transform: `scaleX(${open})`, transformOrigin }}>
      <g className="bk-seam-in" style={{ transformOrigin }}>
        <path d={`M${x} ${y1 + 6}L${x + out * 34} ${y1 - 8}L${x + out * 34} ${y2 + 8}L${x} ${y2 - 6}Z`} fill={`url(#${uid}-glow)`} opacity=".7" />
        <path d={lens(x, y1 - 3, y2 + 3, 11)} fill={c.accent} opacity=".3" />
        <path d={lens(x, y1, y2, 6)} fill={`url(#${uid}-light)`} />
        <path d={threads} stroke={c.accent} strokeWidth="1.1" strokeLinecap="round" />
      </g>
      {fresh && <path className="bk-arc" d={`M${x} ${y1 + 6}l-3 9l5 4l-4 10l4 5l-3 9`} stroke="#fff" strokeWidth="1.4" fill="none" strokeLinejoin="round" />}
    </g>
  );
}

/** Lo que queda a la vista al caer el paño: el hueco iluminado con el borde de cuero rasgado. */
export function Cavity({ uid, c }: { uid: string; c: BagColors }) {
  const { x, y, w, h } = PANEL;
  const teeth = Array.from({ length: 9 }, (_, i) => `${x + (w / 8) * i} ${y + (i % 2 ? 4 : 0)}`).join("L");
  const bottom = Array.from({ length: 9 }, (_, i) => `${x + w - (w / 8) * i} ${y + h - (i % 2 ? 4 : 0)}`).join("L");
  return (
    <g className="bk-cavity">
      <rect x={x} y={y} width={w} height={h} rx="3" fill={`url(#${uid}-cavity)`} />
      <path d={`M${teeth}L${x + w - 3} ${y + h / 2}L${bottom}L${x + 3} ${y + h / 2}Z`} fill="none" stroke={c.leatherLo} strokeWidth="3" strokeLinejoin="bevel" />
    </g>
  );
}
