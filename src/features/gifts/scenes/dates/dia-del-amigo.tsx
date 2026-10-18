import type { Pose, Pt } from "@/components/illustrations/figure";
import { Barbell } from "@/components/illustrations/campaigns/b-gear";
import { Athlete, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { fromScene, mixPose, reach } from "../stage/pose";
import { lerp, type OpeningArtProps } from "../stage/types";
import { BenchEnd, RACK, RackBack, RackHooks } from "./amigo-rack";

/** La barra: en el pecho, en el bloqueo y apoyada en los ganchos del rack. */
const CHEST = 586, LOCK = 440;
const LIFT = { x: 400, y: 760, s: 2.4 };
const SPOT = { x: 400, y: 700, s: 2.2 };
const PLATES: [number, number, string][] = [[26, 196, "#c1272d"], [20, 168, "#1f4fb8"], [12, 120, "#e3b22a"]];

/** El que empuja, visto desde sus pies: rodillas arriba, pies en el piso y los brazos a la barra (en escena). */
const LIFTER: Pose = {
  head: [400, 548], neck: [400, 578], hip: [400, 640], chest: 15, waist: 11, headR: 10, flat: true,
  arm: [], farArm: [],
  leg: [[414, 644], [452, 652], [466, 748], [470, 758]], farLeg: [[386, 644], [348, 652], [334, 748], [330, 758]],
};
/** El compañero, detrás de la cabecera, inclinado hacia la barra (abajo) o erguido con la barra arriba. */
const SPOT_LOW: Pose = {
  head: [400, 408], neck: [400, 432], hip: [400, 520], chest: 14, waist: 10, headR: 10, flat: true,
  arm: [], farArm: [],
  leg: [[412, 520], [430, 610], [424, 700], [430, 704]], farLeg: [[388, 520], [370, 610], [376, 700], [370, 704]],
};
const SPOT_HIGH: Pose = { ...SPOT_LOW, head: [400, 366], neck: [400, 392], hip: [400, 486], leg: [[412, 470], [424, 588], [424, 700], [430, 704]], farLeg: [[388, 470], [376, 588], [376, 700], [370, 704]] };

/** Brazos del compañero (en escena), de los hombros a las manos, con los codos hacia afuera. */
const spotArms = (pose: Pose, hands: [Pt, Pt]): Pose => ({
  ...pose,
  arm: reach([pose.neck[0] + 30, pose.neck[1] + 4], hands[0], 82, -1),
  farArm: reach([pose.neck[0] - 30, pose.neck[1] + 4], hands[1], 82, 1),
});

/** Brazos del que empuja: abajo, el antebrazo vertical bajo la barra; arriba, el brazo bloqueado y recto. */
function liftArms(k: number, bar: number): Pose {
  const side = (dir: 1 | -1): Pt[] => {
    const shoulder: Pt = [400 + dir * 34, 584], hand: Pt = [400 + dir * 84, bar + 4];
    const bent: Pt = [hand[0] + dir * 8, hand[1] + 58];
    const straight: Pt = [(shoulder[0] + hand[0]) / 2, (shoulder[1] + hand[1]) / 2];
    return [shoulder, [lerp(bent[0], straight[0], k), lerp(bent[1], straight[1], k)], hand];
  };
  return { ...LIFTER, arm: side(1), farArm: side(-1) };
}

/**
 * Día del Amigo: el spot del compañero, visto desde los pies del banco. Cada toque es una repetición: la barra sube y
 * el compañero, detrás de la cabecera, la acompaña con las manos abajo; en la última, en cámara lenta, la llevan juntos
 * a los ganchos. Al apoyarla, se prende el rack y el regalo aparece arriba, sobre el travesaño.
 */
export default function DiaDelAmigo({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : Math.min(1, t / steps);
  const bar = opened ? RACK.hook - 6 : lerp(CHEST, LOCK, k);
  const lifter = liftArms(k, bar);
  const spotter = spotArms(mixPose(SPOT_LOW, SPOT_HIGH, k), [[426, bar + 10], [374, bar + 10]]);
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={250} light="#f6ffe0" seed={5} />
      <RackBack u={u} on={opened} accent={c.accent} />
      <Athlete pose={fromScene(spotter, SPOT.x, SPOT.y, SPOT.s)} x={SPOT.x} y={SPOT.y} s={SPOT.s} color="#1a222c" rim={c.accent} rimDx={1.1} />
      <BenchEnd u={u} />
      <Athlete pose={fromScene(lifter, LIFT.x, LIFT.y, LIFT.s)} x={LIFT.x} y={LIFT.y} s={LIFT.s} rim="#f6ffe0" rimDx={-1.1} glow={k > 0.7 ? c.accent : undefined} />
      <Glow cx={400} cy={bar} rx={300} ry={36} color="#f6ffe0" o={0.25} />
      <Barbell u={u} x={400} y={bar} w={600} plates={PLATES} />
      <RackHooks on={opened} accent={c.accent} />
      <ellipse cx={400} cy={RACK.top - 4} rx="190" ry="8" fill="#000" opacity={opened ? 0 : 0.2} />
    </g>
  );
}
