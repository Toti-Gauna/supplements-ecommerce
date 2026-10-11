import { useId } from "react";
import type { DecorProps } from "./types";

/** Siluetas grandes para la pantalla de carga de temporada: luna, bruja en escoba y Papá Noel con su trineo. */
export function Moon({ className, tint = "#ffe7b0" }: DecorProps & { tint?: string }) {
  const g = useId();
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs><radialGradient id={g} cx="38%" cy="35%" r="70%"><stop offset="0" stopColor="#fffaf0" /><stop offset=".55" stopColor={tint} /><stop offset="1" stopColor={tint} stopOpacity=".85" /></radialGradient></defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${g})`} />
      <circle cx="64" cy="38" r="7" fill="#000" opacity=".06" /><circle cx="40" cy="62" r="10" fill="#000" opacity=".05" /><circle cx="68" cy="66" r="5" fill="#000" opacity=".06" />
    </svg>
  );
}

export function WitchOnBroom({ className, color = "#120a18" }: DecorProps & { color?: string }) {
  return (
    <svg viewBox="0 0 120 60" aria-hidden="true" className={className} fill={color}>
      <path d="M6 46 18 41l84-13 1.5 2.6-84 14z" />
      <path d="M18 41 2 34l3 7-4 4 4 3-1 6 15-7z" />
      <path d="M57 40c-1-9 3-17 9-19 5-1 7 4 5 10l7 7z" />
      <path d="M60 23c-9 1-18 6-26 13 9-1 18-1 25 1z" />
      <circle cx="68" cy="17" r="4.6" />
      <path d="M61 15h13l-3-2.5-8-11.5 1.2 10.5z" />
      <path d="M69 25l12 7-1.6 2.2-12-6.4zM64 38l9 6.5 5-1 .6 2-6 1.4-10-7.4z" />
    </svg>
  );
}

function Reindeer({ x, nose }: { x: number; nose?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx="12" cy="24" rx="11" ry="5.5" />
      <path d="M20 21l5-8 2.5 1.4-4.5 8.6z" />
      <ellipse cx="27" cy="12" rx="4.6" ry="3.4" transform="rotate(-20 27 12)" />
      <path d="M25 9l-2-6M23 5l-3-1M27 8l1-6M28 4l3-1" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M5 27l-5 6M8 28l-1 8M17 28l5 7M19 27l7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {nose && <circle cx="31.5" cy="11" r="1.8" fill="#ff4b4b" />}
    </g>
  );
}

export function SantaSleigh({ className, color = "#0b1d15" }: DecorProps & { color?: string }) {
  return (
    <svg viewBox="0 0 170 48" aria-hidden="true" className={className} fill={color} style={{ color }}>
      <path d="M58 24 C80 20 100 22 112 20 M58 26 C84 26 104 26 140 22" stroke={color} strokeWidth="1" fill="none" opacity=".8" />
      <Reindeer x={104} /><Reindeer x={136} nose />
      <path d="M8 26h44c0 9-7 14-16 14H16C9 40 6 35 8 26z" />
      <path d="M4 44h50c5 0 8-3 8-7" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M14 40v4M44 40v4" stroke={color} strokeWidth="2" />
      <circle cx="16" cy="21" r="8" />
      <circle cx="36" cy="18" r="8.5" />
      <circle cx="40" cy="8" r="4.2" />
      <path d="M36 6c2-4 7-5 10-2l3 5-4-1z" />
    </svg>
  );
}
