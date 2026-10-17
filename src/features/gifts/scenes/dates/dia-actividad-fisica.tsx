import type { Pose } from "@/components/illustrations/figure";
import { Athlete, Digits, Glow } from "@/components/illustrations/campaigns/b-stage";
import { Bench } from "@/components/illustrations/campaigns/b-gear";
import { mixPose, toScene } from "../stage/pose";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const J = { x: 50, s: 2.6 };
/** De frente, con un mango de la soga en cada mano y las piernas juntas. */
const STAND: Pose = {
  head: [76, 40], neck: [76, 58], hip: [76, 110], chest: 13, waist: 9, flat: true,
  arm: [[88, 62], [96, 88], [106, 100]], farArm: [[64, 62], [56, 88], [46, 100]],
  leg: [[82, 110], [84, 148], [84, 182], [92, 186]], farLeg: [[70, 110], [68, 148], [68, 182], [60, 186]],
};
/** En el aire: rodillas apenas dobladas, pies juntos. */
const AIR: Pose = { ...STAND, leg: [[82, 110], [88, 146], [84, 176], [92, 180]], farLeg: [[70, 110], [64, 146], [68, 176], [60, 180]] };

/** Bolso de gimnasio sobre el banco, con el cierre que se va abriendo. */
function GymBag({ u, open, accent }: { u: string; open: number; accent: string }) {
  const zip = lerp(470, 730, open);
  return (
    <g>
      <rect x="460" y="560" width="280" height="96" rx="30" fill="#1d2430" />
      <rect x="460" y="560" width="280" height="96" rx="30" fill={`url(#${u}-v)`} opacity=".6" />
      <path d="M520 560q0-46 40-46h80q40 0 40 46" fill="none" stroke="#0e1218" strokeWidth="12" />
      <Glow cx={(470 + zip) / 2} cy={566} rx={(zip - 470) / 2 + 20} ry={24} color={accent} o={0.9 * open} />
      <path d={`M470 566H${zip}`} stroke={accent} strokeWidth="5" opacity={open > 0 ? 1 : 0} />
      <path d={`M${zip} 566H730`} stroke="#9aa3ad" strokeWidth="3" strokeDasharray="3 3" />
      <rect x={zip - 6} y="558" width="12" height="18" rx="2" fill="#c9ced6" />
      <rect x="470" y="600" width="70" height="8" rx="2" fill={accent} opacity=".8" />
    </g>
  );
}

/**
 * Día de la Actividad Física: saltar la soga. Cada toque es un salto (la soga pasa por abajo de los pies y vuelve
 * por arriba); el contador suma y el cierre del bolso se abre un tramo. En el último salto, el bolso se abre.
 */
export default function DiaActividadFisica({ u, c, t, steps, step, opened }: OpeningArtProps) {
  const frac = t - Math.floor(t);
  const hop = opened ? 0 : Math.sin(Math.PI * frac);
  const pose = mixPose(STAND, AIR, hop);
  const y = FLOOR - hop * 70;
  const left = toScene(pose.farArm[2]!, J.x, y, J.s);
  const right = toScene(pose.arm[2]!, J.x, y, J.s);
  // La soga gira: abajo de los pies cuando está en el aire, arriba de la cabeza al apoyar.
  const angle = frac * Math.PI * 2;
  const ropeY = (left[1] + right[1]) / 2 + Math.cos(angle) * -400 + 40;
  const rope = `M${left[0]} ${left[1]}C${left[0] - 30} ${ropeY} ${right[0] + 30} ${ropeY} ${right[0]} ${right[1]}`;
  const behind = Math.cos(angle) > 0;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={330} spread={220} light="#eaffd6" seed={73} />
      <Bench u={u} x={450} y={656} w={300} />
      <GymBag u={u} open={opened ? 1 : t / steps} accent={c.accent} />
      <rect x="520" y="230" width="190" height="80" rx="4" fill="#07080a" stroke={c.accent} strokeOpacity=".4" />
      <Digits value={String(opened ? steps : step).padStart(3, "0")} x={548} y={246} h={48} color={c.accent} />
      <ellipse cx={J.x + 76 * J.s} cy={FLOOR + 6} rx={80 - hop * 30} ry="9" fill="#000" opacity={0.5 - hop * 0.25} />
      {behind && <path d={rope} stroke="#d8dde4" strokeWidth="4" fill="none" opacity=".75" />}
      <Athlete pose={pose} x={J.x} y={y} s={J.s} rim={c.accent} rimDx={1.2} />
      {!behind && <path d={rope} stroke="#eef2f6" strokeWidth="4.5" fill="none" />}
    </g>
  );
}
