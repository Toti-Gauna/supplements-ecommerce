import type { Pose, Pt } from "@/components/illustrations/figure";
import { Bench, Plate } from "@/components/illustrations/campaigns/b-gear";
import { Athlete, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { mixPose, reach, toLocal, toScene } from "../stage/pose";
import { lerp, type OpeningArtProps } from "../stage/types";

const LIFT = { x: 218, y: 903, s: 3 };
const SPOT = { x: -16, y: 760, s: 3 };
/** Acostado en el banco, con la barra en el pecho (codos abajo). */
const DOWN: Pose = {
  head: [22, 98], neck: [40, 99], hip: [96, 102], chest: 11, waist: 8,
  arm: [[44, 96], [34, 110], [47, 84]], farArm: [[41, 101], [31, 114], [44, 88]],
  leg: [[96, 102], [126, 108], [132, 138], [143, 139]], farLeg: [[96, 102], [118, 112], [112, 138], [123, 140]],
};
/** Bloqueo: brazos extendidos. */
const UP: Pose = { ...DOWN, arm: [[44, 96], [46, 70], [48, 44]], farArm: [[41, 101], [44, 74], [46, 48]] };
/** El compañero, parado detrás de la cabecera, con las manos bajo la barra. */
const SPOTTER: Pose = {
  head: [86, 36], neck: [77, 50], hip: [50, 104], chest: 10,
  arm: [[80, 54], [102, 72], [120, 86]], farArm: [[75, 55], [98, 74], [116, 88]],
  leg: [[50, 104], [58, 146], [52, 180], [64, 184]], farLeg: [[50, 104], [40, 148], [33, 180], [45, 184]],
};

/** Parante del rack con su gancho J a la altura del bloqueo. */
function Upright({ x, hook }: { x: number; hook: number }) {
  return (
    <g>
      <rect x={x - 7} y="400" width="14" height="360" fill="#2a3038" />
      <path d={Array.from({ length: 12 }, (_, i) => `M${x} ${420 + i * 26}h0.1`).join("")} stroke="#07080a" strokeWidth="5" strokeLinecap="round" />
      <path d={`M${x - 10} ${hook + 18}h26v-26`} fill="none" stroke="#8e98a5" strokeWidth="7" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Día del Amigo: el spot del compañero. Cada toque es una repetición del press de banca: la barra sube un poco más y
 * el compañero acompaña con las manos abajo; en la última, en cámara lenta, la llevan juntos al rack.
 */
export default function DiaDelAmigo({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const lifter = mixPose(DOWN, UP, k);
  const hand = lifter.arm[2]!;
  const bar = toScene(hand, LIFT.x, LIFT.y, LIFT.s);
  // El compañero lleva las manos a la barra (un poco abajo, sin tocarla hasta la última).
  const grip: Pt = [bar[0] + 6, bar[1] + lerp(26, 10, k)];
  const near = toLocal(grip, SPOT.x, SPOT.y, SPOT.s);
  const far = toLocal([grip[0] - 8, grip[1] + 4], SPOT.x, SPOT.y, SPOT.s);
  const spotter: Pose = { ...SPOTTER, arm: reach([80, 54], near, 24, -1), farArm: reach([75, 55], far, 24, -1) };
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={260} light="#f6ffe0" seed={5} />
      <Upright x={352} hook={470} />
      <Bench u={u} x={252} y={658} w={310} />
      <Athlete pose={spotter} x={SPOT.x} y={SPOT.y} s={SPOT.s} rim={c.accent} rimDx={1.3} />
      <Athlete pose={lifter} x={LIFT.x} y={LIFT.y} s={LIFT.s} rim="#f6ffe0" rimDx={1.2} glow={c.accent} />
      <g>
        <circle cx={bar[0]} cy={bar[1]} r="13" fill="#9aa3ad" />
        <circle cx={bar[0]} cy={bar[1]} r="13" fill={`url(#${u}-cyl)`} opacity=".7" />
        <Plate u={u} cx={bar[0] + 42} cy={bar[1] + 9} r={58} color="#1f4fb8" />
      </g>
      {opened && <Glow cx={bar[0] + 30} cy={bar[1]} rx={140} ry={140} color={c.accent} o={0.5} />}
    </g>
  );
}
