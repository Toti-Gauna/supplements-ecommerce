import { Barbell, Kettlebell } from "@/components/illustrations/campaigns/b-gear";
import { Beam, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, type OpeningArtProps } from "../stage/types";

/** Reflectores del techo, uno por palanca (de izquierda a derecha). */
const LAMPS = [300, 440, 580, 710];
const PANEL = { x: 92, y: 380, w: 116, h: 180 };

/** Tablero eléctrico del box: cuatro palancas que suben una por toque, con su luz testigo. */
function Breaker({ on, accent }: { on: number; accent: string }) {
  return (
    <g>
      <rect x={PANEL.x - 8} y={PANEL.y - 8} width={PANEL.w + 16} height={PANEL.h + 16} rx="6" fill="#0b0b0e" />
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="3" fill="#1d1f24" stroke="#3a3d44" strokeWidth="2" />
      <path d={`M${PANEL.x} ${PANEL.y + 30}h${PANEL.w}`} stroke={accent} strokeWidth="4" strokeDasharray="10 8" opacity=".7" />
      {[0, 1, 2, 3].map((i) => {
        const x = PANEL.x + 18 + i * 26;
        const up = i < on;
        return (
          <g key={i}>
            <rect x={x - 8} y={PANEL.y + 60} width="16" height="70" rx="3" fill="#0a0b0d" />
            <rect className="op-ease" x={x - 6} y={PANEL.y + 64} width="12" height="26" rx="2" fill={up ? "#e9e4d8" : "#5c6068"}
              style={{ transform: `translateY(${up ? 0 : 36}px)` }} />
            <circle cx={x} cy={PANEL.y + 150} r="5" fill={up ? accent : "#26282d"} />
            {up && <Glow cx={x} cy={PANEL.y + 150} rx={18} ry={18} color={accent} o={0.8} />}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Halloween: el box a oscuras. Cada toque sube una palanca del tablero y prende un reflector; con cada luz aparece
 * algo más del box (la barra, las pesas rusas) hasta que, con todo prendido, el regalo queda en el centro.
 */
export default function Halloween({ u, c, step, t, steps, opened }: OpeningArtProps) {
  const on = opened ? steps : step;
  const k = opened ? 1 : t / steps;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={520} spread={260} light="#ffe8c9" power={0.08 + 0.92 * k} panels={false} seed={31} />
      <rect width="800" height={FLOOR} fill="#000" opacity={0.55 * (1 - k)} />
      {LAMPS.map((x, i) => (
        <g key={x} opacity={i < on ? 1 : 0} className="op-fade">
          <Beam u={u} x={x} top={18} bottom={110} o={0.5} color={i % 2 ? "#ff9a3d" : "#ffe8c9"} />
          <Glow cx={x} cy={FLOOR + 6} rx={120} ry={22} color="#ffe8c9" o={0.5} />
        </g>
      ))}
      {LAMPS.map((x, i) => (
        <g key={`l${x}`}>
          <path d={`M${x - 28} 0h56l-6 22h-44Z`} fill="#1a1c20" />
          <ellipse cx={x} cy="22" rx="22" ry="3.5" fill={i < on ? "#fff7e0" : "#2a2c31"} />
        </g>
      ))}
      <g opacity={0.15 + 0.85 * k}>
        <g transform="translate(520 0)"><Barbell u={u} x={0} y={FLOOR - 92} w={420} plates={[[22, 184, "#3a2a1e"], [16, 150, c.accent]]} /></g>
        <Kettlebell u={u} cx={330} cy={FLOOR - 34} r={34} color="#1e1a24" band={c.accent} />
        <Kettlebell u={u} cx={740} cy={FLOOR - 30} r={30} color="#1e1a24" />
      </g>
      <Breaker on={on} accent={c.accent} />
      <Glow cx={150} cy={470} rx={140} ry={140} color={c.accent} o={0.12 + 0.2 * k} />
    </g>
  );
}
