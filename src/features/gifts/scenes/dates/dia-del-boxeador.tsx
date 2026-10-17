import type { CSSProperties } from "react";
import type { Pose, Pt } from "@/components/illustrations/figure";
import { Athlete, Glow } from "@/components/illustrations/campaigns/b-stage";
import { OPENINGS } from "@/demo/engine/gift-openings";
import { reach, toLocal } from "../stage/pose";
import { GymBackdrop } from "../stage/backdrop";
import type { OpeningArtProps } from "../stage/types";

const COACH = { x: 330, y: 820, s: 3 };
/** El entrenador de frente, en guardia de manoplas. Los brazos se calculan hasta cada manopla. */
const BASE: Pose = {
  head: [70, 42], neck: [70, 60], hip: [66, 114], chest: 12.5, waist: 9, flat: true,
  arm: [], farArm: [],
  leg: [[72, 114], [80, 148], [82, 182], [92, 186]], farLeg: [[60, 114], [52, 150], [46, 182], [36, 186]],
};
const ROPES = ["#c1272d", "#f4f4ef", "#1f4fb8"];
const FOCUS = OPENINGS["dia-del-boxeador"].focus;

/** Manopla: almohadilla redonda con el centro marcado. */
function Mitt({ x, y, accent, hot }: { x: number; y: number; accent: string; hot: boolean }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="30" ry="36" fill="#1a1b1f" />
      <ellipse cx={x} cy={y} rx="20" ry="25" fill={hot ? accent : "#2b2d33"} />
      <circle cx={x} cy={y} r="7" fill="#0b0c0e" />
    </g>
  );
}

/** Guante en primera persona (abajo, como si fueran tus manos). */
function Glove({ x, y, flip, color }: { x: number; y: number; flip?: boolean; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <rect x="-46" y="60" width="92" height="90" rx="14" fill="#efe9dc" />
      <path d="M-70 10Q-74-70 0-74Q74-70 70 10Q66 70 0 74Q-66 70-70 10Z" fill={color} />
      <path d="M-40-40Q0-58 40-40" stroke="#fff" strokeOpacity=".35" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M38 6q30-10 26 26" stroke="#000" strokeOpacity=".3" strokeWidth="6" fill="none" />
    </g>
  );
}

/**
 * Día del Boxeador: el rincón del ring y las manoplas del entrenador. Cada toque es un golpe en primera persona (jab,
 * cross, gancho) a la manopla que te pone; en el último, el entrenador baja las manoplas y te da el regalo.
 */
export default function DiaDelBoxeador({ u, c, step, opened, reduce }: OpeningArtProps) {
  const at = (opened ? [470, 470] : FOCUS[Math.min(step, FOCUS.length - 1)]!) as Pt;
  const other: Pt = opened ? [560, 470] : [at[0] < 480 ? at[0] + 110 : at[0] - 110, at[1] + 50];
  const loc = (p: Pt) => toLocal(p, COACH.x, COACH.y, COACH.s);
  const coach: Pose = { ...BASE, arm: reach([84, 64], loc(at), 30, 1), farArm: reach([56, 64], loc(other), 30, -1) };
  const right = step % 2 === 1;
  const target = FOCUS[Math.max(0, Math.min(step, FOCUS.length) - 1)]!;
  const fist: Pt = right ? [600, 900] : [200, 900];
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={460} spread={260} light="#fff1d6" seed={83} />
      {/* El rincón: poste y las tres cuerdas que se abren hacia los costados. */}
      <rect x="670" y="300" width="24" height="460" fill="#2a2d33" />
      {ROPES.map((col, i) => (
        <g key={col}>
          <path d={`M-20 ${520 + i * 70}L682 ${380 + i * 70}`} stroke={col} strokeWidth="9" />
          <path d={`M682 ${380 + i * 70}L820 ${430 + i * 70}`} stroke={col} strokeWidth="9" opacity=".8" />
        </g>
      ))}
      <Athlete pose={coach} x={COACH.x} y={COACH.y} s={COACH.s} rim={c.accent} rimDx={1.3} />
      {!opened && <Mitt x={at[0]} y={at[1]} accent={c.accent} hot={step > 0} />}
      {!opened && <Mitt x={other[0]} y={other[1]} accent={c.accent} hot={false} />}
      {opened && <Glow cx={470} cy={480} rx={160} ry={160} color={c.accent} o={0.5} />}
      {/* Tus guantes: el que pega va hacia la manopla y vuelve. */}
      <g key={step} className={step > 0 && !opened && !reduce ? "op-jab" : undefined}
        style={{ "--jx": `${target[0] - fist[0]}px`, "--jy": `${target[1] - fist[1]}px`, transformOrigin: `${fist[0]}px ${fist[1]}px` } as CSSProperties}>
        <Glove x={right ? 600 : 200} y={900} flip={!right} color="#b8232f" />
      </g>
      <Glove x={right ? 200 : 600} y={930} flip={right} color="#9d1d28" />
    </g>
  );
}
