import { Barbell, Bench } from "@/components/illustrations/campaigns/b-gear";
import { Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

/** Rack de sentadillas: dos parantes con agujeros, travesaño y la barra cargada en los ganchos. */
function Rack({ u, accent }: { u: string; accent: string }) {
  const posts = [230, 570];
  return (
    <g>
      {posts.map((x) => (
        <g key={x}>
          <rect x={x - 12} y="230" width="24" height={FLOOR - 230} fill="#2a3038" />
          <rect x={x - 12} y="230" width="24" height={FLOOR - 230} fill={`url(#${u}-v)`} opacity=".5" />
          <path d={Array.from({ length: 16 }, (_, i) => `M${x} ${256 + i * 30}h0.1`).join("")} stroke="#07080a" strokeWidth="7" strokeLinecap="round" />
        </g>
      ))}
      <rect x="218" y="222" width="364" height="18" fill="#2f353d" />
      <rect x="218" y="236" width="364" height="3" fill={accent} opacity=".7" />
      <Barbell u={u} x={400} y={430} w={520} plates={[[24, 190, "#1f4fb8"], [18, 150, "#e3b22a"]]} />
    </g>
  );
}

/**
 * Vuelta al gym: el rack estuvo tapado todo el verano. Cada tirón saca un poco más la lona (vuela el polvo), aparece
 * la barra cargada y, al sacarla del todo, el regalo espera en el banco, bajo la luz.
 */
export default function VueltaAlGym({ u, c, t, steps, step, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const left = lerp(190, 700, k);
  const drop = lerp(0, 460, k * k);
  const tarp = `M${left} ${200 + drop * 0.5}Q${(left + 620) / 2} ${180 + drop * 0.7} 630 ${210 + drop}L${660 + 40 * k} ${FLOOR}L${left - 30 + 60 * k} ${FLOOR}Q${left - 10} ${(FLOOR + 200) / 2 + drop * 0.3} ${left} ${200 + drop * 0.5}Z`;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={280} light="#efe9ff" seed={47} />
      <Rack u={u} accent={c.accent} />
      <Bench u={u} x={270} y={630} w={260} />
      <Glow cx={400} cy={600} rx={200} ry={120} color={c.accent} o={0.15 + 0.35 * k} />
      {k < 1 && (
        <g>
          <path d={tarp} fill="#5a5f66" />
          <path d={tarp} fill={`url(#${u}-v)`} opacity=".55" />
          <path d={`M${left + 40} ${260 + drop * 0.5}Q${left + 80} ${480 + drop * 0.2} ${left + 30} ${FLOOR - 10}M${(left + 640) / 2} ${230 + drop * 0.6}Q${(left + 640) / 2 + 30} ${500} ${(left + 640) / 2 - 10} ${FLOOR - 10}`}
            stroke="#000" strokeOpacity=".22" strokeWidth="6" fill="none" />
          <circle cx={left + 4} cy={200 + drop * 0.5 + 10} r="7" fill="#c9ced6" />
        </g>
      )}
      <g key={step} className="op-in">
        <Dust x={left - 120} y={200} w={360} h={520} n={step ? 30 : 10} seed={51 + step} r={3} color="#e9e2d0" o={0.55} />
      </g>
    </g>
  );
}
