import type { CSSProperties } from "react";
import { Kettlebell } from "@/components/illustrations/campaigns/b-gear";
import { Digits, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, type OpeningArtProps } from "../stage/types";

const T = { x: 400, y: 300, r: 110 };
const RINGS = [1, 0.8, 0.6, 0.4, 0.2];
/** Dónde pega cada tiro (corrido del centro, como pasa de verdad). */
const HITS: [number, number][] = [[0, 0], [-20, -10], [20, 10], [-5, 5], [0, 0]];

/** Pelota medicinal: cuero negro con costuras y el filo de luz. */
function MedBall({ x, y, r, accent }: { x: number; y: number; r: number; accent: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#16171a" />
      <path d={`M${x - r} ${y}Q${x} ${y + r * 0.5} ${x + r} ${y}M${x} ${y - r}Q${x - r * 0.4} ${y} ${x} ${y + r}`} stroke="#3a3c42" strokeWidth="3" fill="none" />
      <path d={`M${x + r * 0.2} ${y - r * 0.95}A${r} ${r} 0 0 1 ${x + r * 0.95} ${y - r * 0.2}`} stroke={accent} strokeWidth="4" fill="none" />
    </g>
  );
}

/**
 * CrossFit Open: wall balls al blanco. Cada toque lanza la pelota contra el blanco de la pared y prende un anillo;
 * con el quinto, el blanco (una compuerta redonda) se abre y el regalo está adentro, iluminado.
 */
export default function CrossfitOpen({ u, c, step, steps, opened, reduce }: OpeningArtProps) {
  const lit = opened ? steps : step;
  const swing = opened ? 1 : 0;
  const hit = HITS[Math.max(0, Math.min(step, HITS.length) - 1)]!;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={280} light="#ffe7d1" seed={71} />
      {/* El rig: barra de dominadas arriba del blanco. */}
      <rect x="120" y="110" width="560" height="16" fill="#2a3038" />
      <rect x="120" y="110" width="16" height="650" fill="#22272e" />
      <rect x="664" y="110" width="16" height="650" fill="#22272e" />
      {/* El hueco detrás de la compuerta (con luz cuando se abre). */}
      <circle cx={T.x} cy={T.y} r={T.r} fill="#050505" />
      <Glow cx={T.x} cy={T.y + 20} rx={T.r * 1.2} ry={T.r} color={c.accent} o={0.8 * swing} />
      <g style={{ transform: `scaleX(${1 - swing * 1.15})`, transformOrigin: `${T.x - T.r}px ${T.y}px`, transition: reduce ? undefined : "transform 700ms cubic-bezier(.34,1.3,.64,1)" } as CSSProperties}>
        {RINGS.map((k, i) => (
          <circle key={k} cx={T.x} cy={T.y} r={T.r * k} fill={i % 2 ? "#f2ede4" : i === 0 ? "#1a1c20" : c.accent} />
        ))}
        {RINGS.map((k, i) => (
          <circle key={`l${k}`} cx={T.x} cy={T.y} r={T.r * k - 4} fill="none" stroke={c.accent} strokeWidth="5" opacity={i < lit ? 1 : 0} className="op-fade" />
        ))}
        <circle cx={T.x} cy={T.y} r={T.r} fill={`url(#${u}-cyl)`} opacity=".35" />
      </g>
      <circle cx={T.x} cy={T.y} r={T.r + 6} fill="none" stroke="#2f353d" strokeWidth="10" />
      {step > 0 && !opened && (
        <g key={step} className="op-throw" style={{ "--fx": `${-hit[0]}px`, "--fy": "560px", "--fs": "2.4" } as CSSProperties}>
          <MedBall x={T.x + hit[0]} y={T.y + hit[1]} r={34} accent={c.accent} />
        </g>
      )}
      {/* Marcador del WOD y las pesas rusas al pie. */}
      <rect x="560" y="470" width="96" height="44" rx="3" fill="#07080a" />
      <Digits value={`0${Math.min(lit, 9)}:${String(12 + lit * 7).padStart(2, "0")}`} x={568} y={480} h={24} color={c.accent} />
      <Kettlebell u={u} cx={190} cy={FLOOR - 30} r={30} color="#15171b" band={c.accent} />
      <Kettlebell u={u} cx={250} cy={FLOOR - 24} r={24} color="#15171b" />
      <MedBall x={640} y={FLOOR - 32} r={32} accent={c.accent} />
    </g>
  );
}
