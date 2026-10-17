import { Digits, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const L = 190, R = 610, TOP = 300;

/** Locker vecino, cerrado y a oscuras, con su número apagado. */
function Neighbor({ x, w, num }: { x: number; w: number; num: string }) {
  return (
    <g>
      <rect x={x} y={TOP - 30} width={w} height={FLOOR - TOP + 30} fill="#14161a" />
      <path d={Array.from({ length: 5 }, (_, i) => `M${x + w * 0.2} ${TOP + 10 + i * 12}h${w * 0.6}`).join("")} stroke="#000" strokeWidth="5" strokeLinecap="round" />
      <rect x={x + w / 2 - 26} y={TOP + 90} width="52" height="26" rx="2" fill="#07080a" />
      <Digits value={num} x={x + w / 2 - 14} y={TOP + 95} h={15} color="#3a3f47" ghost={false} />
    </g>
  );
}

/**
 * Black Friday: la persiana del box. Negro total; cada tirón levanta la persiana de acero un tramo, entra luz voltio
 * por abajo y, arriba del todo, se ve el regalo iluminado adentro. Los lockers vecinos quedan cerrados.
 */
export default function BlackFriday({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const edge = lerp(FLOOR, TOP + 26, k);
  const slats = Math.max(0, Math.floor((edge - TOP) / 22));
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={240} light="#e8ecf2" power={0.55} panels={false} seed={13} />
      <Neighbor x={-20} w={190} num="13" />
      <Neighbor x={630} w={190} num="15" />
      {/* Adentro del locker: oscuro, con la luz voltio que crece a medida que sube la persiana. */}
      <rect x={L} y={TOP} width={R - L} height={FLOOR - TOP} fill="#050506" />
      <g opacity={0.25 + k * 0.75}>
        <Glow cx={400} cy={FLOOR - 40} rx={260} ry={150} color={c.accent} o={0.55} />
        <rect x={L + 30} y={TOP + 16} width={R - L - 60} height="6" rx="3" fill={c.accent} opacity={k} />
        <path d={`M${L + 40} ${TOP + 22}H${R - 40}L${R} ${FLOOR}H${L}Z`} fill={c.accent} opacity={0.1 * k} filter={`url(#${u}-blur)`} />
        <Dust x={L + 20} y={TOP + 40} w={R - L - 40} h={FLOOR - TOP - 60} n={20} seed={6} r={1.8} color={c.accent} o={0.4 * k} />
      </g>
      {/* La luz que se escapa por debajo de la persiana. */}
      <Glow cx={400} cy={edge + 6} rx={240} ry={22 + k * 40} color={c.accent} o={0.6 * (1 - k * 0.4)} />
      {/* La persiana: lamas de acero cepillado y la manija abajo. */}
      <g>
        <rect x={L} y={TOP} width={R - L} height={edge - TOP} fill="#22262d" />
        {Array.from({ length: slats }, (_, i) => (
          <g key={i}>
            <rect x={L} y={edge - 22 * (i + 1)} width={R - L} height="20" fill={`url(#${u}-v)`} opacity=".55" />
            <path d={`M${L} ${edge - 22 * (i + 1) + 20}H${R}`} stroke="#000" strokeOpacity=".7" strokeWidth="2" />
          </g>
        ))}
        <rect x={L} y={edge - 12} width={R - L} height="12" fill="#3a414b" />
        <rect x="370" y={edge - 9} width="60" height="7" rx="3" fill="#aab3be" />
      </g>
      {/* La caja del rollo, arriba, con el letrero LED. */}
      <rect x={L - 16} y={TOP - 46} width={R - L + 32} height="50" fill="#0c0d10" />
      <rect x={L - 16} y={TOP - 46} width={R - L + 32} height="50" fill={`url(#${u}-v)`} opacity=".4" />
      <Digits value="14" x={386} y={TOP - 36} h={26} color={c.accent} />
      <rect x={L - 6} y={TOP} width="8" height={FLOOR - TOP} fill="#2f353d" />
      <rect x={R - 2} y={TOP} width="8" height={FLOOR - TOP} fill="#2f353d" />
    </g>
  );
}
