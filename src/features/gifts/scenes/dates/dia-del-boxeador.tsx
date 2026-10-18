import type { CSSProperties } from "react";
import type { Pose, Pt } from "@/components/illustrations/figure";
import { Athlete, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { OPENINGS } from "@/demo/engine/gift-openings";
import { GymBackdrop } from "../stage/backdrop";
import { fromScene, reach } from "../stage/pose";
import type { OpeningArtProps } from "../stage/types";
import { Bell, Corner, FpGlove, Mitt, Stool } from "./boxing-parts";

const COACH = { x: 370, y: 800, s: 2.6 };
const FOCUS = OPENINGS["dia-del-boxeador"].focus;
/** Tus puños en guardia (abajo, como en primera persona): izquierdo y derecho. */
const FISTS: [Pt, Pt] = [[176, 872], [624, 872]];

/** El entrenador de frente, en guardia de manoplas (en escena). Los brazos se calculan hasta cada manopla. */
const BASE: Pose = {
  head: [370, 398], neck: [370, 430], hip: [370, 590], chest: 16, waist: 12, headR: 10.5, flat: true,
  arm: [], farArm: [],
  leg: [[384, 592], [404, 690], [412, 790], [424, 800]], farLeg: [[356, 592], [336, 690], [328, 790], [316, 800]],
};

/** Las manoplas: arriba a los costados de la cara; al terminar, las baja (y el round termina con la campana). */
function mitts(opened: boolean): [Pt, Pt] {
  return opened ? [[452, 640], [288, 640]] : [[452, 430], [288, 430]];
}

/**
 * Día del Boxeador: el rincón del ring, en primera persona. El entrenador te pone las manoplas a los costados de la
 * cara y la que toca se enciende; cada toque es un golpe (jab, cross, gancho) con el guante de ese lado. El último, en
 * cámara lenta, suena la campana del poste: el entrenador baja las manoplas y el regalo te espera en el banquito del rincón.
 */
export default function DiaDelBoxeador({ u, c, step, steps, opened, reduce }: OpeningArtProps) {
  const [right, left] = mitts(opened);
  const coach: Pose = {
    ...BASE,
    arm: reach([406, 440], right, 62, 1),
    farArm: reach([334, 440], left, 62, -1),
  };
  // La que toca ahora (se enciende) y la del golpe que acaba de pasar (hacia donde va tu guante).
  const next = step < steps && !opened ? FOCUS[step]! : null;
  const hit = step > 0 ? FOCUS[Math.min(step, FOCUS.length) - 1]! : null;
  const leftHand = hit ? hit[0] < 370 : false;
  const fist = leftHand ? FISTS[0] : FISTS[1];
  const ringing = opened;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={420} spread={280} light="#fff1d6" panels={false} seed={83} />
      <Dust x={0} y={330} w={800} h={110} n={70} seed={29} r={1.4} color="#ffd9a0" o={0.35} />
      <Corner accent={c.accent} />
      <Bell ringing={ringing} accent={c.accent} />
      <Stool lit={opened} accent={c.accent} />
      <ellipse cx={370} cy={804} rx="110" ry="14" fill="#000" opacity=".45" />
      <Athlete pose={fromScene(coach, COACH.x, COACH.y, COACH.s)} x={COACH.x} y={COACH.y} s={COACH.s} rim={c.accent} rimDx={1.2} />
      <Mitt x={right[0]} y={right[1]} accent={c.accent} hot={!!next && next[0] > 370} />
      <Mitt x={left[0]} y={left[1]} accent={c.accent} hot={!!next && next[0] < 370} />
      {hit && !opened && <Glow cx={hit[0]} cy={hit[1]} rx={60} ry={60} color="#fff" o={0.35} />}
      {/* Tus guantes (pulgar hacia adentro): el del golpe va a la manopla y vuelve. */}
      {FISTS.map((f, i) => {
        const punching = f === fist && hit && !opened;
        const jab = punching ? ({ "--jx": `${hit[0] - f[0]}px`, "--jy": `${hit[1] - f[1]}px`, transformOrigin: `${f[0]}px ${f[1]}px` } as CSSProperties) : undefined;
        return (
          <g key={punching ? `hit-${step}` : `guard-${i}`} className={punching && !reduce ? "op-jab" : undefined} style={jab}>
            <FpGlove x={f[0]} y={punching ? f[1] : f[1] + 20} flip={i === 1} leather={punching ? "#c2252f" : "#9d1d28"} accent={c.accent} />
          </g>
        );
      })}
    </g>
  );
}
