import type { Pose } from "@/components/illustrations/figure";
import { Athlete, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { toScene } from "../stage/pose";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const ATH = { x: 30, y: FLOOR, s: 2.7 };
/** En cuclillas, con un extremo de soga en cada mano a la altura de la cadera. */
const ROPER: Pose = {
  head: [72, 54], neck: [70, 70], hip: [56, 116], chest: 10.5,
  arm: [[76, 74], [94, 94], [112, 102]], farArm: [[70, 74], [88, 98], [106, 106]],
  leg: [[56, 116], [84, 138], [80, 182], [92, 186]], farLeg: [[56, 116], [46, 148], [40, 182], [52, 186]],
};
const ANCHOR = { x: 720, y: FLOOR - 30 };

/** Una soga como onda que viaja: más alta cerca de las manos y quieta en el anclaje. */
function wave(from: [number, number], amp: number, phase: number, lift: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const k = i / 40;
    const x = lerp(from[0], ANCHOR.x, k);
    const base = lerp(from[1], ANCHOR.y, Math.min(1, k * 1.4)) + lift * Math.sin(k * Math.PI) * 0.3;
    const y = base + Math.sin(k * 9 - phase) * amp * (1 - k) ** 0.8;
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join("");
}

/**
 * Hot Sale: sogas de batalla. Cada toque es una onda que viaja hasta el anclaje; las ondas crecen, el termómetro
 * del box sube y el aire se llena de chispas hasta que, en la última, todo se prende y aparece el regalo.
 */
export default function HotSale({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const amp = 8 + 46 * k;
  const phase = t * 4.2;
  const hand = toScene([112, 102], ATH.x, ATH.y, ATH.s);
  const far = toScene([106, 106], ATH.x, ATH.y, ATH.s);
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={430} spread={280} light="#ffe2b8" seed={19} />
      <Glow cx={520} cy={FLOOR - 40} rx={360} ry={120 + 80 * k} color="#ff6a1a" o={0.15 + 0.5 * k} />
      {/* Termómetro del box en la pared. */}
      <g>
        <rect x="690" y="150" width="34" height="300" rx="17" fill="#0d0e10" stroke="#3b3f45" strokeWidth="3" />
        <rect x="699" y={430 - 260 * k} width="16" height={20 + 260 * k} rx="8" fill={c.accent} />
        <circle cx="707" cy="460" r="26" fill={c.accent} />
        <Glow cx={707} cy={460} rx={70} ry={70} color={c.accent} o={0.6 * k} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="728" y={190 + i * 52} width="14" height="3" fill="#fff" opacity=".35" />)}
      </g>
      {/* Anclaje de las sogas. */}
      <rect x={ANCHOR.x - 18} y={ANCHOR.y - 20} width="44" height="50" rx="6" fill="#1a1c20" />
      <circle cx={ANCHOR.x + 4} cy={ANCHOR.y} r="12" fill="none" stroke="#aab3be" strokeWidth="5" />
      <path d={wave(far, amp * 0.9, phase + 0.7, 24)} stroke="#4a2a14" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d={wave(hand, amp, phase, 0)} stroke="#6b3d1c" strokeWidth="15" fill="none" strokeLinecap="round" />
      <path d={wave(hand, amp, phase, 0)} stroke="#ffb066" strokeOpacity=".35" strokeWidth="3" fill="none" transform="translate(0 -5)" />
      <Athlete pose={ROPER} x={ATH.x} y={ATH.y} s={ATH.s} rim="#ffd34d" rimDx={1.4} glow={k > 0.5 ? "#ff6a1a" : undefined} />
      <Dust x={260} y={380} w={460} h={360} n={Math.round(8 + 40 * k)} seed={23} r={2.6} color="#ffb347" o={0.3 + 0.6 * k} />
    </g>
  );
}
