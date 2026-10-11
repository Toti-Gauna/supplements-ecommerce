import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { VOLT } from "./wheel-art";

/** Polvo de tiza: posición (%), tamaño (px), retraso (s) y deriva (px), fijos para que el HTML sea siempre igual. */
const CHALK = Array.from({ length: 34 }, (_, i) => {
  const r = (k: number) => { const x = Math.sin((i + 3) * 91.17 * k + 12.9) * 43758.5453; return x - Math.floor(x); };
  return { x: Math.round(r(1) * 100), y: Math.round(r(2) * 100), s: Math.round((1.5 + r(3) * 3.5) * 10) / 10, d: Math.round(r(4) * 40) / 10, dx: Math.round((r(5) - 0.5) * 24), o: Math.round((0.18 + r(6) * 0.4) * 100) / 100 };
});

/** Línea de pulso de la marca (caja de 1200 × 120). */
const PULSE = "M0 60H470l16-30 20 70 24-96 22 84 16-28H1200";

/**
 * Escenario del disco: halo plasma y voltio detrás, línea de pulso que lo cruza y polvo de tiza en el aire. Mientras
 * gira el halo late más rápido; al frenar, el pulso se enciende una vez. Todo es decorado (aria-hidden) y con
 * "reducir movimiento" queda quieto.
 */
export function WheelStageDecor({ spinning, landed }: { spinning: boolean; landed: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-[18%] w-full -translate-y-1/2">
        <defs>
          <linearGradient id="wheel-pulse-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={VOLT} stopOpacity="0" />
            <stop offset=".3" stopColor={VOLT} stopOpacity=".5" />
            <stop offset=".7" stopColor={VOLT} stopOpacity=".5" />
            <stop offset="1" stopColor={VOLT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={PULSE} fill="none" stroke="url(#wheel-pulse-fade)" strokeOpacity=".7" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {landed && <path d={PULSE} pathLength={1} className="wheel-pulse-hit" fill="none" stroke={VOLT} strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className={cn("wheel-halo absolute left-1/2 top-1/2 aspect-square w-[calc(var(--dial)*1.24)] -translate-x-1/2 -translate-y-1/2 rounded-full", spinning && "is-spinning")} />
      <ChalkDust />
    </div>
  );
}

/** Polvo de tiza flotando (también detrás del cupón ganado). */
export function ChalkDust({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {CHALK.map((c, i) => (
        <span key={i} className="chalk-mote absolute rounded-full bg-on-night"
          style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.s, height: c.s, opacity: c.o, "--dx": `${c.dx}px`, animationDelay: `${c.d}s` } as CSSProperties} />
      ))}
    </span>
  );
}
