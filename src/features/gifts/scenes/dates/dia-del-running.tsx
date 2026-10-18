import type { Pose } from "@/components/illustrations/figure";
import { Athlete, Glow } from "@/components/illustrations/campaigns/b-stage";
import { mixPose } from "../stage/pose";
import { lerp, type OpeningArtProps } from "../stage/types";
import { FinishGantry, Stadium, TRACK } from "./running-track";

/** Corriendo hacia la cámara (silueta de frente, centro local en x = 80): rodilla derecha arriba, brazo izquierdo adelante. */
const RUN_A: Pose = {
  head: [80, 30], neck: [80, 48], hip: [80, 104], chest: 13, waist: 9, headR: 10, flat: true,
  arm: [[93, 52], [106, 76], [90, 66]], farArm: [[67, 52], [58, 80], [62, 100]],
  leg: [[88, 104], [94, 128], [96, 156], [98, 162]], farLeg: [[72, 104], [70, 146], [70, 182], [68, 186]],
};
/** El otro paso: piernas y brazos cambiados. */
const RUN_B: Pose = {
  ...RUN_A,
  arm: [[93, 52], [102, 80], [98, 100]], farArm: [[67, 52], [54, 76], [70, 66]],
  leg: [[88, 104], [90, 146], [90, 182], [92, 186]], farLeg: [[72, 104], [66, 128], [64, 156], [62, 162]],
};
/** Cortando la cinta: pecho adelante y los brazos arriba en V. */
const WIN: Pose = {
  ...RUN_A,
  arm: [[93, 52], [108, 30], [118, 8]], farArm: [[67, 52], [52, 30], [42, 8]],
  leg: [[88, 104], [92, 144], [94, 182], [96, 186]], farLeg: [[72, 104], [68, 144], [66, 182], [64, 186]],
};

/** Cinta de llegada entre los postes: entera (se tensa cuando llega el pecho) o cortada, con las dos puntas cayendo. */
function Tape({ accent, push, broken }: { accent: string; push: number; broken: boolean }) {
  const [l, r] = TRACK.posts, y = TRACK.tape;
  const stroke = (d: string) => (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={accent} strokeWidth="9" />
      <path d={d} stroke="#fff" strokeWidth="2" opacity=".6" />
    </g>
  );
  if (broken) return <g>{stroke(`M${l} ${y}C${l + 120} ${y + 10} ${l + 230} ${y + 70} 300 ${y + 150}`)}{stroke(`M${r} ${y}C${r - 120} ${y + 14} ${r - 210} ${y + 80} 520 ${y + 170}`)}</g>;
  return stroke(`M${l} ${y}Q400 ${y + 8 + push * 22} ${r} ${y}`);
}

/**
 * Día del Running: la recta final de un estadio de noche, de frente. Cada toque es una zancada: la corredora se acerca
 * (crece en la perspectiva de la pista) y el reloj del pórtico corre; en la última, en cámara lenta, rompe la cinta con
 * los brazos arriba y el regalo espera en la llegada, sobre el podio.
 */
export default function DiaDelRunning({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : Math.min(1, t / steps);
  const foot = lerp(560, TRACK.finish + 6, k);
  const s = (2.6 * (foot - TRACK.horizon)) / (TRACK.finish - TRACK.horizon);
  const broken = opened || k >= 0.98;
  const stride = mixPose(RUN_A, RUN_B, (1 - Math.cos(t * Math.PI)) / 2);
  const pose = broken ? WIN : stride;
  return (
    <g>
      <Stadium u={u} c={c} />
      <FinishGantry c={c} secs={2512 + Math.round(k * 15)} />
      <ellipse cx={400} cy={foot + 2} rx={44 * s} ry={7 * s} fill="#000" opacity=".5" />
      <Glow cx={400} cy={foot - 90 * s} rx={70 * s} ry={110 * s} color={c.accent} o={k > 0.7 ? 0.45 : 0.15} />
      <Athlete pose={pose} x={400 - 80 * s} y={foot} s={s} rim={c.accent} rimDx={1.2} glow={broken ? c.accent : undefined} />
      <Tape accent={c.accent} push={Math.max(0, (k - 0.75) * 4)} broken={broken} />
      {opened && (
        <g className="op-in">
          <rect x="530" y="770" width="140" height="80" fill="#10141c" />
          <rect x="530" y="770" width="140" height="5" fill={c.accent} />
          <rect x="530" y="770" width="12" height="80" fill="#fff" opacity=".08" />
        </g>
      )}
    </g>
  );
}
