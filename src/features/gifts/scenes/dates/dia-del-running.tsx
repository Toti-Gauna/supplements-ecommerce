import type { Pose } from "@/components/illustrations/figure";
import { Athlete, Digits, Glow } from "@/components/illustrations/campaigns/b-stage";
import { mixPose } from "../stage/pose";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const S = 2.5, LINE = 600;
/** Zancada con la pierna derecha adelante (de perfil, hacia la derecha). */
const STRIDE_A: Pose = {
  head: [102, 42], neck: [95, 58], hip: [74, 104],
  arm: [[92, 62], [72, 76], [60, 64]], farArm: [[97, 62], [112, 80], [126, 68]],
  leg: [[74, 104], [104, 112], [100, 144], [111, 147]], farLeg: [[74, 104], [60, 140], [42, 174], [36, 184]],
};
/** La otra: piernas y brazos cruzados. */
const STRIDE_B: Pose = {
  ...STRIDE_A,
  arm: [[92, 62], [108, 80], [124, 70]], farArm: [[97, 62], [76, 76], [62, 64]],
  leg: [[74, 104], [62, 140], [44, 172], [38, 182]], farLeg: [[74, 104], [102, 114], [98, 146], [109, 149]],
};

/**
 * Día del Running: la recta final. Cada toque es una zancada: la corredora avanza hacia la cinta de llegada, el reloj
 * corre y el carril se ilumina; en la última, en cámara lenta, corta la cinta y el regalo espera en la meta.
 */
export default function DiaDelRunning({ u, c, t, steps, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const x = lerp(-60, 400, k);
  const pose = mixPose(STRIDE_A, STRIDE_B, (1 - Math.cos(t * Math.PI)) / 2);
  const broken = opened || k >= 0.98;
  const secs = (14.6 - 4.2 * k).toFixed(1);
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={LINE} spread={240} light="#fff6d6" panels={false} seed={79} />
      {/* La pista: carriles rojos en perspectiva y la línea de llegada. */}
      <path d={`M0 ${FLOOR}H800V1000H0Z`} fill="#5a1d17" opacity=".75" />
      <path d={[0, 1, 2, 3].map((i) => `M0 ${FLOOR + 30 + i * 62}H800`).join("")} stroke="#f2ede4" strokeOpacity=".55" strokeWidth="3" />
      <path d={`M${LINE} ${FLOOR}L${LINE + 40} 1000`} stroke="#f2ede4" strokeWidth="10" />
      <path d={`M${LINE} ${FLOOR}L${LINE + 40} 1000`} stroke="#000" strokeWidth="10" strokeDasharray="12 12" opacity=".7" />
      {/* Postes de la llegada y la cinta (entera o cortada en dos). */}
      <rect x={LINE - 6} y="430" width="10" height={FLOOR - 430} fill="#c9ced6" />
      <rect x={LINE + 64} y="440" width="10" height={FLOOR - 440} fill="#9aa3ad" opacity=".7" />
      {broken ? (
        <g>
          <path d={`M${LINE} 520q-26 60-70 90`} stroke={c.accent} strokeWidth="6" fill="none" />
          <path d={`M${LINE + 68} 528q20 70 60 100`} stroke={c.accent} strokeWidth="6" fill="none" />
        </g>
      ) : (
        <path d={`M${LINE} 520Q${LINE + 34} ${528 + k * 10} ${LINE + 68} 528`} stroke={c.accent} strokeWidth="6" fill="none" />
      )}
      {/* Reloj de la llegada. */}
      <rect x={LINE - 150} y="330" width="210" height="70" rx="4" fill="#07080a" stroke="#2c313a" strokeWidth="3" />
      <Digits value={secs.padStart(4, "0")} x={LINE - 134} y={343} h={44} color={c.accent} />
      <Glow cx={x + 200} cy={FLOOR + 10} rx={160} ry={20} color="#fff6d6" o={0.4} />
      <ellipse cx={x + 190} cy={FLOOR + 6} rx="70" ry="9" fill="#000" opacity=".45" />
      <Athlete pose={pose} x={x} y={FLOOR} s={S} rim={c.accent} rimDx={1.3} glow={k > 0.8 ? c.accent : undefined} />
    </g>
  );
}
