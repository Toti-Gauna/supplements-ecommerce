import { Pack, PACK } from "@/components/illustrations/campaigns/b-packs";
import { Glow } from "@/components/illustrations/campaigns/b-stage";
import { SPARKLE } from "../kit";

const RAYS = [-72, -48, -24, 0, 24, 48, 72];
const TWINKLES = [{ dx: 92, dy: -170, s: 1.6, d: 520 }, { dx: -96, dy: -120, s: 1.1, d: 680 }, { dx: 70, dy: -40, s: 0.9, d: 820 }];

/**
 * El regalo que aparece en la escena (común a todas las fechas): halo y rayos detrás, el fogonazo y el pote "Edición
 * regalo" que sube iluminado, con tres destellos. `x`, `y`: el piso donde se apoya. Una sola vez (`data-reveal`).
 */
export function StageReveal({ u, x, y, accent }: { u: string; x: number; y: number; accent: string }) {
  const cy = y - 90;
  return (
    <g data-reveal="tub">
      <g className="op-halo"><Glow cx={x} cy={cy} rx={300} ry={300} color={accent} o={0.75} /></g>
      <g className="op-rays" opacity=".7">
        {RAYS.map((a, i) => (
          <path key={a} d={`M${x} ${cy}L${x - 12} ${cy - 330}H${x + 12}Z`} fill={i % 2 ? accent : "#fff"} opacity={i % 2 ? 0.4 : 0.3} transform={`rotate(${a} ${x} ${cy})`} filter={`url(#${u}-soft)`} />
        ))}
      </g>
      <circle className="op-flash" cx={x} cy={cy} r="60" fill="#fff" />
      <g className="op-tub">
        <Glow cx={x} cy={y + 2} rx={150} ry={22} color={accent} o={0.7} />
        <ellipse cx={x} cy={y + 2} rx="90" ry="10" fill="#000" opacity=".45" />
        <Pack u={u} kind="tub" x={x} y={y} s={0.9} p={PACK.house} tint={accent} />
      </g>
      {TWINKLES.map((t) => (
        <g key={t.d} transform={`translate(${x + t.dx} ${y + t.dy}) scale(${t.s})`}>
          <path className="op-twinkle" d={SPARKLE} fill="#fff" style={{ animationDelay: `${t.d}ms` }} />
        </g>
      ))}
    </g>
  );
}
