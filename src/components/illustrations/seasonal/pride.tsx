import { useId } from "react";
import type { DecorProps } from "./types";

/** Orgullo: los seis colores de la bandera del Orgullo (reemplaza a San Patricio desde la Fase 5). */
export const PRIDE = ["#e5544a", "#f39a3c", "#f6c84c", "#4fb36a", "#4fa3e0", "#8a6fd6"];

export function RainbowArc({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {PRIDE.map((c, i) => <path key={c} d={`M${6 + i * 3.4} 46A${26 - i * 3.4} ${26 - i * 3.4} 0 0 1 ${58 - i * 3.4} 46`} fill="none" stroke={c} strokeWidth="3.6" />)}
      {[[10, 47], [54, 47]].map(([x, y]) => (
        <g key={x} fill="#fff">
          <circle cx={x! - 5} cy={y! + 2} r="4.5" /><circle cx={x} cy={y! - 1} r="6" /><circle cx={x! + 5.5} cy={y! + 2} r="4.2" /><rect x={x! - 9} y={y! + 1} width="19" height="5.5" rx="2.7" />
        </g>
      ))}
    </svg>
  );
}

export function PrideFlag({ className }: DecorProps) {
  const clip = useId();
  const wave = "M14 10c8-3 14 3 22 0s14-3 22 0v30c-8-3-14 3-22 0s-14-3-22 0z";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><clipPath id={clip}><path d={wave} /></clipPath></defs>
      <path d="M12 6v54" stroke="#d8c08a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="5" r="2.6" fill="#f3dca6" />
      <g clipPath={`url(#${clip})`}>{PRIDE.map((c, i) => <rect key={c} x="12" y={7 + i * 5.6} width="48" height="5.8" fill={c} />)}</g>
      <path d={wave} fill="none" stroke="#000" strokeOpacity=".12" />
    </svg>
  );
}

export function PrideHeart({ className }: DecorProps) {
  const clip = useId();
  const heart = "M32 56C18 46 6 36 6 23 6 14 13 8 21 8c5 0 9 3 11 7 2-4 6-7 11-7 8 0 15 6 15 15 0 13-12 23-26 33z";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><clipPath id={clip}><path d={heart} /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>{PRIDE.map((c, i) => <rect key={c} x="0" y={8 + i * 8.2} width="64" height="8.4" fill={c} />)}</g>
      <path d="M14 18c2-4 6-6 10-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" />
    </svg>
  );
}
