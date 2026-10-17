"use client";
import { useId } from "react";
import type { ClubMetal } from "@/demo/fixtures/club";
import { cn } from "@/lib/cn";

/** Tonos de cada metal: brillo, cuerpo, sombra y canto (arte SVG: colores literales, iguales en los dos modos). */
const METAL: Record<ClubMetal, { hi: string; mid: string; lo: string; edge: string; ink: string }> = {
  bronce: { hi: "#f6c08c", mid: "#c27a3e", lo: "#5e3014", edge: "#9a5626", ink: "#3d1d08" },
  plata: { hi: "#ffffff", mid: "#b8c0c9", lo: "#56606b", edge: "#8a939d", ink: "#2b3239" },
  oro: { hi: "#fff3b0", mid: "#e0ac2c", lo: "#6f4a08", edge: "#b8871b", ink: "#3f2a02" },
  platino: { hi: "#f5fcff", mid: "#c3d6e2", lo: "#5d7686", edge: "#93abba", ink: "#24343f" },
};
const STEP: Record<ClubMetal, number> = { bronce: 1, plata: 2, oro: 3, platino: 4 };
const TICKS = Array.from({ length: 36 }, (_, i) => (i * 360) / 36);

/**
 * Medalla de nivel del Club (R2c): cinta de competencia y un disco de pesas acuñado en metal, con moleteado en el
 * canto, el agujero de la barra y una celda grabada por nivel (platino suma el rayo). Bronce, plata, oro y platino.
 * Los degradés usan ids únicos por instancia (`useId`). `label` la nombra para lectores de pantalla.
 */
export function ClubMedal({ metal, label, className }: { metal: ClubMetal; label?: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const m = METAL[metal];
  const step = STEP[metal];
  const face = `md-face-${uid}`, rim = `md-rim-${uid}`, shine = `md-shine-${uid}`;
  return (
    <svg viewBox="0 0 80 100" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn("h-20 w-16 shrink-0", className)}>
      <defs>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m.hi} /><stop offset=".45" stopColor={m.mid} /><stop offset="1" stopColor={m.lo} />
        </linearGradient>
        <radialGradient id={face} cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor={m.hi} /><stop offset=".55" stopColor={m.mid} /><stop offset="1" stopColor={m.edge} />
        </radialGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Cinta: dos tiras de grafito con el filo del metal, cruzadas en V. */}
      <path d="M14 0h18l14 44-14 5Z" fill="#161a22" />
      <path d="M66 0H48L34 44l14 5Z" fill="#0e1117" />
      <path d="M20 0h4l13 41-3 1Z" fill={m.mid} opacity=".9" />
      <path d="M60 0h-4L43 41l3 1Z" fill={m.mid} opacity=".75" />
      <rect x="31" y="42" width="18" height="9" rx="1.5" fill={`url(#${rim})`} stroke={m.lo} strokeWidth=".8" />
      {/* Disco: canto moleteado, cara acuñada y bisel. */}
      <circle cx="40" cy="70" r="29" fill={`url(#${rim})`} stroke={m.lo} strokeWidth="1" />
      <g stroke={m.lo} strokeWidth="1.1" strokeOpacity=".55">
        {TICKS.map((a) => <line key={a} x1="40" y1="42.6" x2="40" y2="46" transform={`rotate(${a} 40 70)`} />)}
      </g>
      <circle cx="40" cy="70" r="22.5" fill={`url(#${face})`} stroke={m.lo} strokeOpacity=".6" strokeWidth="1.2" />
      <circle cx="40" cy="70" r="19.5" fill="none" stroke={m.hi} strokeOpacity=".55" strokeWidth=".8" strokeDasharray="2 2.4" />
      <circle cx="40" cy="64.5" r="5" fill={m.ink} stroke={m.hi} strokeOpacity=".6" strokeWidth="1" />
      <circle cx="40" cy="64.5" r="2.2" fill="#000" opacity=".55" />
      {step === 4 ? (
        <path d="M42.5 72 36 81h4l-2 7 7-9.5h-4.2l1.7-6.5Z" fill={m.ink} />
      ) : (
        Array.from({ length: 3 }, (_, i) => (
          <rect key={i} x={31.5 + i * 6} y="76" width="5" height="7" rx="1" fill={m.ink} opacity={i < step ? 0.9 : 0.18} />
        ))
      )}
      <path d="M17 64a23 23 0 0 1 46 0a29 18 0 0 0-46 0Z" fill={`url(#${shine})`} opacity=".7" />
    </svg>
  );
}
