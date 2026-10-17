import type { CSSProperties } from "react";
import { Beam, Glow } from "@/components/illustrations/campaigns/b-stage";
import { FLOOR, type OpeningArtProps } from "../stage/types";

const GOAL = { l: 110, r: 690, top: 250, bottom: 650 };
/** Agujeros del tablero de puntería, en el orden en que se patea. */
const HOLES: [number, number][] = [[215, 365], [585, 365], [215, 555], [400, 460]];

/** Pelota: blanca con paneles oscuros. */
function Ball({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f3f3ee" />
      <path d={`M${x} ${y - r * 0.35}l${r * 0.33} ${r * 0.24}l-${r * 0.13} ${r * 0.39}h-${r * 0.4}l-${r * 0.13}-${r * 0.39}Z`} fill="#16181c" />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="2" />
    </g>
  );
}

/**
 * Día del Futbolista: el tablero de puntería en el arco. Cada toque es un tiro a un agujero (los ángulos y el medio);
 * el agujero se prende. Con el último, el tablero se cae hacia atrás y el regalo está sobre la línea del arco.
 */
export default function DiaDelFutbolista({ u, c, step, opened, reduce }: OpeningArtProps) {
  const done = opened ? HOLES.length : step;
  const target = HOLES[Math.max(0, Math.min(step, HOLES.length) - 1)]!;
  return (
    <g>
      {/* Noche de cancha: cielo, dos torres de luz y el césped con franjas. */}
      <rect width="800" height={FLOOR} fill="#04140a" opacity=".55" />
      <Beam u={u} x={60} y={-20} top={20} bottom={260} tilt={-18} o={0.5} color="#f4fff2" />
      <Beam u={u} x={740} y={-20} top={20} bottom={260} tilt={18} o={0.5} color="#f4fff2" />
      <rect y="640" width="800" height="360" fill="#0f4a24" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} y={640 + i * 60} width="800" height="30" fill="#fff" opacity=".035" />)}
      <path d="M0 652H800M400 652V1000" stroke="#fff" strokeOpacity=".5" strokeWidth="4" />
      <Glow cx={400} cy={660} rx={420} ry={60} color="#f4fff2" o={0.3} />
      {/* El arco con la red. */}
      <path d={Array.from({ length: 30 }, (_, i) => `M${GOAL.l + i * 20} ${GOAL.top}V${GOAL.bottom}`).join("") + Array.from({ length: 20 }, (_, i) => `M${GOAL.l} ${GOAL.top + i * 20}H${GOAL.r}`).join("")}
        stroke="#e9f2ec" strokeOpacity=".16" strokeWidth="1.5" />
      <Glow cx={400} cy={560} rx={240} ry={120} color={c.accent} o={opened ? 0.4 : 0} />
      {/* El tablero: lona tensada con cuatro agujeros. Al final cae hacia atrás. */}
      <g style={{ transform: opened ? "scaleY(.06)" : "none", transformOrigin: `400px ${GOAL.bottom}px`, transition: reduce ? undefined : "transform 650ms cubic-bezier(.55,0,.4,1)" } as CSSProperties}>
        <rect x={GOAL.l + 14} y={GOAL.top + 14} width={GOAL.r - GOAL.l - 28} height={GOAL.bottom - GOAL.top - 14} fill="#173a7a" />
        <rect x={GOAL.l + 14} y={GOAL.top + 14} width={GOAL.r - GOAL.l - 28} height={GOAL.bottom - GOAL.top - 14} fill={`url(#${u}-v)`} opacity=".4" />
        {HOLES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="58" fill={i < done ? "#06120a" : "#0c214a"} stroke={i < done ? c.accent : "#e9f2ec"} strokeOpacity={i < done ? 1 : 0.5} strokeWidth="5" />
            {i < done && <Glow cx={x} cy={y} rx={70} ry={70} color={c.accent} o={0.35} />}
          </g>
        ))}
      </g>
      <path d={`M${GOAL.l} ${GOAL.bottom + 4}V${GOAL.top}H${GOAL.r}V${GOAL.bottom + 4}`} fill="none" stroke="#f4f6f2" strokeWidth="16" />
      <path d={`M${GOAL.l} ${GOAL.bottom + 4}V${GOAL.top}H${GOAL.r}V${GOAL.bottom + 4}`} fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="4" transform="translate(4 4)" />
      {/* La pelota: quieta en el punto penal, o volando hacia el agujero de este tiro. */}
      {step > 0 && !opened ? (
        <g key={step} className="op-throw" style={{ "--fx": `${400 - target[0]}px`, "--fy": `${880 - target[1]}px`, "--fs": "2.6" } as CSSProperties}>
          <Ball x={target[0]} y={target[1]} r={22} />
        </g>
      ) : null}
      {!opened && <Ball x={400} y={880} r={40} />}
      <ellipse cx="400" cy="918" rx="44" ry="7" fill="#000" opacity=".4" />
    </g>
  );
}
