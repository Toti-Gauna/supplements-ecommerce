import { useId } from "react";
import type { DecorProps } from "./types";

/** Fechas patrias: 25 de Mayo, 20 de Junio y 9 de Julio. Celeste de la bandera y dorado del Sol de Mayo. */
export const CELESTE = "#74acdf";
const CELESTE_DARK = "#4f8fc8";
const GOLD = "#f6c54c";

const polar = (r: number, a: number, cx = 32, cy = 32) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;

export function Escarapela({ className }: DecorProps) {
  const n = 28;
  const scallop = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, b = ((i + 0.5) / n) * Math.PI * 2;
    return `${i ? "L" : "M"}${polar(20.5, a, 32, 28)}Q${polar(24, b, 32, 28)} ${polar(20.5, ((i + 1) / n) * Math.PI * 2, 32, 28)}`;
  }).join("");
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M25 40 19 61l5.5-3.5L28 62l4-20z" fill={CELESTE} /><path d="M39 40l6 21-5.5-3.5L36 62l-4-20z" fill={CELESTE_DARK} />
      <path d={`${scallop}Z`} fill={CELESTE} />
      {Array.from({ length: n }, (_, i) => <path key={i} d={`M${polar(13, (i / n) * Math.PI * 2, 32, 28)}L${polar(21, (i / n) * Math.PI * 2, 32, 28)}`} stroke={CELESTE_DARK} strokeWidth=".9" />)}
      <circle cx="32" cy="28" r="13" fill="#fff" />
      {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${polar(7, (i / 20) * Math.PI * 2, 32, 28)}L${polar(12.6, (i / 20) * Math.PI * 2, 32, 28)}`} stroke="#d6e3ee" strokeWidth=".8" />)}
      <circle cx="32" cy="28" r="7" fill={CELESTE} /><circle cx="32" cy="28" r="2.6" fill={CELESTE_DARK} />
    </svg>
  );
}

/** Sol de Mayo: 32 rayos, rectos y flamígeros alternados, y la cara. */
export function SolDeMayo({ className }: DecorProps) {
  const g = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><radialGradient id={g} cx="40%" cy="38%" r="70%"><stop offset="0" stopColor="#ffe8a3" /><stop offset="1" stopColor={GOLD} /></radialGradient></defs>
      {Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2;
        if (i % 2 === 0) return <path key={i} d={`M${polar(11, a - 0.07)}L${polar(30, a)}L${polar(11, a + 0.07)}Z`} fill={GOLD} />;
        const m = a + 0.09;
        return <path key={i} d={`M${polar(11, a - 0.05)}Q${polar(18, m)} ${polar(21, a)}T${polar(28, a)}`} fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />;
      })}
      <circle cx="32" cy="32" r="12" fill={`url(#${g})`} stroke="#d9a52c" strokeWidth=".8" />
      <g fill="none" stroke="#b07d17" strokeWidth="1.1" strokeLinecap="round">
        <path d="M26 29q2-1.5 4 0M34 29q2-1.5 4 0M32 31v4l-1.5.8M28.5 37.5q3.5 2 7 0" />
      </g>
    </svg>
  );
}

/** Cabildo de Buenos Aires: dos pisos de arcos, la torre con su campana y la bandera arriba. */
export function Cabildo({ className }: DecorProps) {
  const arch = (x: number, y: number, h: number) => `M${x} ${y + h}v-${h - 3}a3 3 0 0 1 6 0v${h - 3}z`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M31.5 1.5v6" stroke="#8a8170" strokeWidth="1" /><path d="M32 1.8h7l-1.6 1.3L39 4.4h-7z" fill={CELESTE} /><path d="M32 2.9h6.4" stroke="#fff" strokeWidth=".9" />
      <path d="M27 14q5-7 10 0z" fill="#e9dfc9" stroke="#bfb196" strokeWidth=".8" />
      <rect x="26" y="14" width="12" height="17" fill="#fbf6ea" stroke="#bfb196" strokeWidth=".8" />
      <path d={arch(29.5, 17, 9)} fill="#4a5664" /><path d="M32.5 20.5a1.6 1.6 0 1 0 .01 0z" fill={GOLD} />
      <rect x="3" y="30" width="58" height="27" fill="#fbf6ea" stroke="#bfb196" strokeWidth=".8" />
      <path d="M2 30h60M3 43h58" stroke="#d9cdb3" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={`t${i}`} d={arch(5.6 + i * 7.9, 32.5, 9)} fill={i === 3 ? "#3d4856" : "#56627180"} />)}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={`b${i}`} d={arch(5.6 + i * 7.9, 45.5, 11.5)} fill="#4a5664" />)}
      <path d="M0 57h64" stroke="#8a8170" strokeWidth="1.6" />
    </svg>
  );
}

export function Empanada({ className }: DecorProps) {
  const g = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2c37a" /><stop offset="1" stopColor="#c98a3d" /></linearGradient></defs>
      <path d="M24 14c-2-4 2-6 0-10M32 13c-2-4 2-6 0-10M40 14c-2-4 2-6 0-10" stroke="#fff" strokeOpacity=".75" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M6 48C10 28 22 19 32 19s22 9 26 29c-8 4-44 4-52 0z" fill={`url(#${g})`} />
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12, a = Math.PI + t * Math.PI;
        return <ellipse key={i} cx={32 + Math.cos(a) * 24} cy={47 + Math.sin(a) * 25} rx="3" ry="2.2" transform={`rotate(${(a * 180) / Math.PI + 90} ${32 + Math.cos(a) * 24} ${47 + Math.sin(a) * 25})`} fill="#e3a752" stroke="#b97a33" strokeWidth=".7" />;
      })}
      <path d="M16 40c5-6 11-9 16-9" stroke="#fff" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Paraguas de 1810 (la plaza bajo la lluvia esperando noticias del Cabildo). */
export function Paraguas({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 6v2" stroke="#8a8170" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 32C6 17 18 8 32 8s26 9 28 24c-3-3-8-3-11 0-3-3-8-3-11 0-3-3-9-3-12 0-3-3-8-3-11 0-3-3-8-3-11 0z" fill="#26364a" />
      <path d="M32 8c-6 6-8 16-6 24M32 8c6 6 8 16 6 24M32 8c-14 4-21 13-21 24M32 8c14 4 21 13 21 24" stroke="#3d5168" strokeWidth="1.2" fill="none" />
      <path d="M14 18c4-5 9-7 14-8" stroke="#fff" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 32v20c0 5-8 5-8 0" stroke="#7a5a36" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Bandera argentina flameando, con el Sol de Mayo. */
export function Bandera({ className }: DecorProps) {
  const clip = useId();
  const wave = "M14 10c8-3 14 3 22 0s14-3 22 0v30c-8-3-14 3-22 0s-14-3-22 0z";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><clipPath id={clip}><path d={wave} /></clipPath></defs>
      <path d="M12 6v54" stroke="#d8c08a" strokeWidth="3" strokeLinecap="round" /><circle cx="12" cy="5" r="2.6" fill={GOLD} />
      <g clipPath={`url(#${clip})`}>
        <rect x="12" y="6" width="48" height="12" fill={CELESTE} /><rect x="12" y="18" width="48" height="11" fill="#fff" /><rect x="12" y="29" width="48" height="13" fill={CELESTE} />
        <circle cx="36" cy="24" r="3.4" fill={GOLD} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${polar(3.6, (i / 12) * Math.PI * 2, 36, 24)}L${polar(5.6, (i / 12) * Math.PI * 2, 36, 24)}`} stroke={GOLD} strokeWidth=".9" />)}
      </g>
      <path d={wave} fill="none" stroke="#000" strokeOpacity=".12" />
    </svg>
  );
}

/** Casa Histórica de Tucumán: muro encalado, rejas y la portada con columnas salomónicas. */
export function CasaTucuman({ className }: DecorProps) {
  const column = (x: number) => (
    <g>
      <rect x={x} y="27" width="4" height="29" fill="#f1e9d8" stroke="#c7b896" strokeWidth=".6" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${x} ${29 + i * 4}l4 2.6`} stroke="#c7b896" strokeWidth=".8" />)}
    </g>
  );
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="1" y="22" width="62" height="4" fill="#b5583a" /><path d="M1 22h62" stroke="#8f4129" strokeWidth="1" />
      <rect x="1" y="26" width="62" height="31" fill="#f7f2e6" />
      {[5, 49].map((x) => (
        <g key={x}>
          <rect x={x} y="33" width="10" height="14" rx="1" fill="#3b4250" />
          {[2.5, 5, 7.5].map((d) => <path key={d} d={`M${x + d} 33v14`} stroke="#a3a9b3" strokeWidth=".9" />)}
          <path d={`M${x} 40h10`} stroke="#a3a9b3" strokeWidth=".9" />
        </g>
      ))}
      <path d="M19 27q0-13 13-15 13 2 13 15z" fill="#f1e9d8" stroke="#c7b896" strokeWidth=".8" />
      <path d="M26 20q6-6 12 0" stroke="#c7b896" strokeWidth=".8" fill="none" />
      {column(20)}{column(40)}
      <path d="M26 56V40a6 6 0 0 1 12 0v16z" fill="#6b4428" /><path d="M32 34v22M29 38v18M35 38v18" stroke="#4e2f1a" strokeWidth=".7" />
      <path d="M31.5 2v10" stroke="#8a8170" strokeWidth="1" /><path d="M32 2h7l-1.6 1.3L39 4.6h-7z" fill={CELESTE} /><path d="M32 3.3h6.4" stroke="#fff" strokeWidth=".9" />
      <path d="M0 57h64" stroke="#8a8170" strokeWidth="1.6" />
    </svg>
  );
}
