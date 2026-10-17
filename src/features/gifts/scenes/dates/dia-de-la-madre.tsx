import { Kettlebell } from "@/components/illustrations/campaigns/b-gear";
import { Glow } from "@/components/illustrations/campaigns/b-stage";
import { tone } from "@/components/illustrations/supplements/defs";
import { Footing, GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const START = 150, END = 640, MAT = "#c4577f";

/** Pelota de pilates apoyada al fondo, con su brillo. */
function Ball({ u, x, y, r }: { u: string; x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#7d3554" />
      <circle cx={x} cy={y} r={r} fill={`url(#${u}-cyl)`} opacity=".6" />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.3} ry={r * 0.16} fill="#fff" opacity=".22" transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.4})`} />
    </g>
  );
}

/**
 * Día de la Madre: la colchoneta del estudio. Cada toque la desenrolla una vuelta sobre el piso (el rollo avanza y se
 * achica); en la última queda extendida bajo la luz rosa y el regalo aparece donde terminaba el rollo.
 */
export default function DiaDeLaMadre({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const x = lerp(START, END, k);
  const r = lerp(92, 16, k);
  const spin = -k * 1440;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={430} spread={300} light="#ffe9f1" seed={29} />
      <Ball u={u} x={705} y={FLOOR - 74} r={74} />
      <Kettlebell u={u} cx={120} cy={FLOOR + 120} r={34} color="#e7b7c9" />
      <Kettlebell u={u} cx={190} cy={FLOOR + 132} r={28} color="#e7b7c9" />
      <Footing u={u} x={410} w={300} light="#ffe9f1" />
      {/* La parte extendida: una franja sobre el piso, con la textura de la goma. */}
      <path d={`M${START - 10} ${FLOOR - 6}L${x} ${FLOOR - 6}L${x + 14} ${FLOOR + 30}L${START - 30} ${FLOOR + 30}Z`} fill={MAT} />
      <path d={`M${START - 10} ${FLOOR - 6}L${x} ${FLOOR - 6}L${x + 14} ${FLOOR + 30}L${START - 30} ${FLOOR + 30}Z`} fill={`url(#${u}-v)`} opacity=".5" />
      <path d={Array.from({ length: Math.max(0, Math.floor((x - START) / 18)) }, (_, i) => `M${START + 4 + i * 18} ${FLOOR - 2}l-4 28`).join("")} stroke="#000" strokeOpacity=".12" strokeWidth="2" />
      <path d={`M${START - 30} ${FLOOR + 30}L${x + 14} ${FLOOR + 30}`} stroke={tone(MAT, -0.5)} strokeWidth="5" />
      {/* El rollo: gira y se achica. Adentro, la luz del regalo. */}
      <g transform={`translate(${x} ${FLOOR + 12 - r})`}>
        <Glow cx={0} cy={0} rx={r * 2.2} ry={r * 2.2} color={c.accent} o={0.25 + 0.5 * k} />
        <circle r={r} fill={tone(MAT, -0.15)} />
        <circle r={r} fill={`url(#${u}-cyl)`} opacity=".5" />
        <g transform={`rotate(${spin})`}>
          <path d={`M0 0m${-r * 0.2} 0a${r * 0.2} ${r * 0.2} 0 1 1 ${r * 0.4} 0a${r * 0.45} ${r * 0.45} 0 1 1 ${-r * 0.85} 0a${r * 0.7} ${r * 0.7} 0 1 1 ${r * 1.4} 0`}
            fill="none" stroke={tone(MAT, -0.55)} strokeWidth={Math.max(1.5, r * 0.06)} />
        </g>
        <circle r={r * 0.16} fill={c.accent} opacity={0.4 + 0.6 * k} />
      </g>
    </g>
  );
}
