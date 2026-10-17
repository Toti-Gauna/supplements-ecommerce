import { Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { Footing, GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const R = 210;

/** Cubierta de tractor en perspectiva: `lift` de 0 (acostada) a 1 (parada de frente). */
function Tire({ u, cx, cy, rx, ry }: { u: string; cx: number; cy: number; rx: number; ry: number }) {
  const depth = Math.max(10, 70 * (1 - ry / rx));
  return (
    <g>
      <ellipse cx={cx} cy={cy + depth} rx={rx} ry={ry} fill="#060606" />
      <rect x={cx - rx} y={cy} width={rx * 2} height={depth} fill="#0d0d0e" />
      <rect x={cx - rx} y={cy} width={rx * 2} height={depth} fill={`url(#${u}-cyl)`} opacity=".7" />
      <path d={Array.from({ length: 22 }, (_, i) => `M${cx - rx + 6 + i * (rx * 2 - 12) / 21} ${cy + 4}v${depth - 8}`).join("")} stroke="#2b2b2e" strokeWidth="5" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#18181a" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#2f3034" strokeWidth="14" strokeDasharray="10 9" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.56} ry={ry * 0.56} fill="#050505" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.56} ry={ry * 0.56} fill="none" stroke="#3b3c40" strokeWidth="4" />
      <path d={`M${cx - rx * 0.8} ${cy - ry * 0.5}A${rx} ${ry} 0 0 1 ${cx + rx * 0.2} ${cy - ry * 0.98}`} stroke="#fff" strokeOpacity=".12" strokeWidth="5" fill="none" />
    </g>
  );
}

/**
 * Día del Padre: dar vuelta la cubierta de tractor (strongman). Cada empujón la levanta un poco más y por abajo se
 * escapa la luz; en el último, en cámara lenta, la cubierta cae del otro lado y queda el regalo donde estaba.
 */
export default function DiaDelPadre({ u, c, t, steps, step, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const a = Math.min(1, k) * (Math.PI / 2) * 0.86;
  const tire = opened
    ? { cx: 400, cy: 600, rx: 180, ry: 40 }
    : { cx: 400, cy: lerp(FLOOR - 50, FLOOR - 50 - R * 0.9, Math.sin(a)), rx: R, ry: lerp(56, R * 0.92, Math.sin(a)) };
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={300} light="#fff1d0" seed={53} />
      <Footing u={u} x={400} w={240} light="#fff1d0" />
      {/* La maza del strongman, tirada al frente, y el balde de tiza. */}
      <g transform="rotate(-8 600 900)">
        <rect x="430" y="893" width="230" height="12" rx="6" fill="#6b4a2b" />
        <rect x="430" y="893" width="230" height="4" rx="2" fill="#fff" opacity=".18" />
        <rect x="640" y="868" width="64" height="62" rx="6" fill="#1b1d21" />
        <rect x="640" y="868" width="64" height="62" rx="6" fill={`url(#${u}-v)`} opacity=".6" />
      </g>
      <path d="M90 870h96l-10 70H100Z" fill="#e9e4d8" />
      <ellipse cx="138" cy="870" rx="48" ry="9" fill="#f7f5ef" />
      <Dust x={80} y={820} w={120} h={60} n={14} seed={3} r={2.4} color="#f7f5ef" o={0.6} />
      {/* La luz que hay debajo de la cubierta: se escapa a medida que sube. */}
      <Glow cx={400} cy={FLOOR - 20} rx={260} ry={50 + 90 * k} color={c.accent} o={0.2 + 0.6 * k} />
      {opened ? (
        <g opacity=".85"><Tire u={u} {...tire} /></g>
      ) : (
        <g key={step} className={step > 0 ? "op-kick" : undefined}><Tire u={u} {...tire} /></g>
      )}
      {step > 0 && !opened && (
        <g key={`d${step}`} className="op-in"><Dust x={160} y={FLOOR - 70} w={480} h={90} n={22} seed={59 + step} r={3} color="#e8e1cf" o={0.6} /></g>
      )}
    </g>
  );
}
