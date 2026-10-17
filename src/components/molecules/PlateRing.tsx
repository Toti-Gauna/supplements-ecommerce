import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const SEGMENTS = 24;
const R = 52;
/** Un gajo del aro como placa: arco grueso con luz entre placas. */
function arc(i: number): string {
  const gap = 2.2;
  const a0 = ((i * 360) / SEGMENTS + gap / 2 - 90) * (Math.PI / 180);
  const a1 = (((i + 1) * 360) / SEGMENTS - gap / 2 - 90) * (Math.PI / 180);
  const p = (a: number, r: number) => `${(60 + r * Math.cos(a)).toFixed(2)} ${(60 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(a0, R)}A${R} ${R} 0 0 1 ${p(a1, R)}L${p(a1, R - 9)}A${R - 9} ${R - 9} 0 0 0 ${p(a0, R - 9)}Z`;
}
const ARCS = Array.from({ length: SEGMENTS }, (_, i) => arc(i));

/**
 * Anillo de carga del box: 24 placas en círculo que se prenden con el avance (voltio del marcador, `--led-volt`) y la
 * lectura en el centro. Es un `progressbar` con su nombre; sin animación (la carga la cuenta el número, no el giro).
 */
export function PlateRing({ pct, label, children, className }: { pct: number; label: string; children?: ReactNode; className?: string }) {
  const value = Math.round(Math.min(100, Math.max(0, pct)));
  const lit = Math.round((value / 100) * SEGMENTS);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ color: "var(--led-volt)" }}>
        <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="1" />
        {ARCS.map((d, i) => (
          <path key={i} d={d} fill="currentColor" fillOpacity={i < lit ? 1 : 0.1} style={i < lit ? { filter: "drop-shadow(0 0 var(--led-glow) color-mix(in srgb, currentColor 45%, transparent))" } : undefined} />
        ))}
        <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeOpacity=".18" strokeDasharray="1 3" />
      </svg>
      <div className="absolute inset-[22%] grid place-items-center text-center">{children}</div>
    </div>
  );
}
