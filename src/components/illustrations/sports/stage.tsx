import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Lienzo común de los deportes: 160 × 200 con el piso en y = 186, para que todas las escenas queden alineadas en
 * una grilla. Todo en `currentColor`; los detalles van con opacidad (sin colores fijos ni degradados).
 */
export function Stage({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 200" aria-hidden="true" focusable="false" className={cn("block", className)}
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="80" cy="92" r="74" fill="currentColor" fillOpacity=".06" stroke="none" />
      <circle cx="80" cy="92" r="74" strokeOpacity=".1" strokeWidth="1" />
      {children}
    </svg>
  );
}

/** Sombra en el piso (más chica y tenue si el atleta está en el aire). */
export function Shadow({ cx, rx, y = 188, o = 0.2 }: { cx: number; rx: number; y?: number; o?: number }) {
  return <ellipse cx={cx} cy={y} rx={rx} ry={rx / 9} fill="currentColor" fillOpacity={o} stroke="none" />;
}

/** Trazos de movimiento o fondo: un grupo tenue. */
export function Faint({ o = 0.35, w = 2, children, dash }: { o?: number; w?: number; children: ReactNode; dash?: string }) {
  return <g strokeOpacity={o} strokeWidth={w} strokeDasharray={dash}>{children}</g>;
}

/** Malla de red (arcos, redes, alambrado): líneas verticales y horizontales cada `step`. */
export function Mesh({ x, y, w, h, step = 6, o = 0.22 }: { x: number; y: number; w: number; h: number; step?: number; o?: number }) {
  const v = Array.from({ length: Math.floor(w / step) + 1 }, (_, i) => `M${x + i * step} ${y}v${h}`);
  const hz = Array.from({ length: Math.floor(h / step) + 1 }, (_, i) => `M${x} ${y + i * step}h${w}`);
  return <path d={[...v, ...hz].join("")} strokeOpacity={o} strokeWidth="1" />;
}

/** Pelota de fútbol: pentágono central y costuras hacia el borde. */
export function SoccerBall({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  const k = r / 11;
  const pent = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [x + Math.cos(a) * 4.4 * k, y + Math.sin(a) * 4.4 * k] as const;
  });
  const seams = pent.map(([px, py]) => `M${px.toFixed(1)} ${py.toFixed(1)}L${(x + (px - x) * 2.3).toFixed(1)} ${(y + (py - y) * 2.3).toFixed(1)}`);
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="currentColor" fillOpacity=".16" strokeWidth="3" />
      <path d={`M${pent.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join("L")}Z`} fill="currentColor" stroke="none" />
      <path d={seams.join("")} strokeWidth="1.6" />
    </g>
  );
}

/** Pelota de básquet: costuras en cruz y las dos curvas laterales. */
export function Basketball({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="currentColor" fillOpacity=".22" strokeWidth="3" />
      <path d={`M${x - r} ${y}h${r * 2}M${x} ${y - r}v${r * 2}M${x - r * 0.68} ${y - r * 0.74}c${r * 0.5} ${r * 0.4} ${r * 0.5} ${r * 1.08} 0 ${r * 1.48}M${x + r * 0.68} ${y - r * 0.74}c${-r * 0.5} ${r * 0.4} ${-r * 0.5} ${r * 1.08} 0 ${r * 1.48}`} strokeWidth="1.6" />
    </g>
  );
}

/** Pelota de vóley: tres paneles curvos que giran alrededor del centro. */
export function Volleyball({ x, y, r = 10 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="currentColor" fillOpacity=".16" strokeWidth="3" />
      <g strokeWidth="1.6" transform={`translate(${x} ${y}) scale(${r / 10})`}>
        <path d="M0 0C-1 -5 -5 -8.5 -8 -6M0 0C5 -1 8 2 9.6 4M0 0C-4 3 -4 8 -2.6 9.6" />
        <path d="M-3.4 -9.4C1 -7 3 -3 2.4 0.4M8.6 -4.6C5 -2 1 -1 -1.6 1.6M-7.8 6C-4 4.4 -1.4 1.8 -0.6 -1" strokeOpacity=".6" />
      </g>
    </g>
  );
}

/** Pelotita de tenis o pádel con su costura curva. */
export function SmallBall({ x, y, r = 4.6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="currentColor" fillOpacity=".4" strokeWidth="2.2" />
      <path d={`M${x - r * 0.75} ${y - r * 0.55}q${r * 0.75} ${r * 0.9} ${r * 1.5} 0`} strokeWidth="1.2" />
    </g>
  );
}
