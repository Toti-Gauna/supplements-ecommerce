import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";

type Pt = [number, number];
interface Pose {
  head: Pt;
  /** Cuello → cadera. */
  torso: Pt[];
  limbs: Pt[][];
  /** Equipo (barra, discos, soga), en trazo fino. */
  gear?: string;
}

/** Poses propias por objetivo, en una grilla de 120 × 200 con el piso en y = 190. Sin caras: solo la silueta. */
const POSES: Record<Goal, Pose> = {
  "masa-muscular": { head: [60, 28], torso: [[60, 46], [60, 104]], limbs: [[[44, 52], [18, 60], [22, 32]], [[76, 52], [102, 60], [98, 32]], [[53, 104], [46, 148], [44, 188]], [[67, 104], [74, 148], [76, 188]]] },
  fuerza: { head: [60, 28], torso: [[60, 46], [60, 104]], limbs: [[[46, 52], [44, 80], [44, 110]], [[74, 52], [76, 80], [76, 110]], [[54, 104], [52, 148], [50, 188]], [[66, 104], [68, 148], [70, 188]]],
    gear: "M4 110h112M8 92v36M14 96v28M112 92v36M106 96v28" },
  energia: { head: [74, 30], torso: [[68, 46], [54, 100]], limbs: [[[66, 52], [86, 70], [100, 56]], [[64, 52], [46, 66], [36, 86]], [[54, 100], [80, 122], [76, 156]], [[54, 100], [40, 142], [16, 160]]] },
  recuperacion: { head: [58, 26], torso: [[58, 44], [58, 102]], limbs: [[[58, 50], [74, 28], [82, 8]], [[56, 52], [42, 82], [46, 112]], [[58, 102], [60, 146], [60, 188]], [[56, 102], [50, 140], [46, 112]]] },
  definicion: { head: [60, 30], torso: [[60, 48], [60, 104]], limbs: [[[46, 54], [28, 84], [24, 104]], [[74, 54], [92, 84], [96, 104]], [[54, 104], [48, 140], [52, 176]], [[66, 104], [72, 140], [68, 176]]],
    gear: "M24 104C10 30 110 30 96 104M24 104c4 50 68 82 72 0" },
  resistencia: { head: [64, 28], torso: [[62, 46], [58, 102]], limbs: [[[62, 52], [76, 74], [88, 68]], [[60, 52], [48, 74], [40, 90]], [[58, 102], [74, 138], [66, 176]], [[58, 102], [50, 142], [30, 158]]] },
  salud: { head: [60, 32], torso: [[60, 50], [60, 106]], limbs: [[[56, 54], [48, 24], [58, 4]], [[64, 54], [72, 24], [62, 4]], [[60, 106], [60, 148], [60, 188]], [[60, 106], [84, 128], [62, 146]]] },
};

const line = (pts: Pt[]) => pts.map((p) => p.join(",")).join(" ");

/**
 * Silueta de atleta (sin cara) para los paneles de objetivo: trazo grueso redondeado, como una figura recortada
 * contra la luz del box. Toma `currentColor`; el equipo va más tenue.
 */
export function AthleteSilhouette({ goal, className }: { goal: Goal; className?: string }) {
  const p = POSES[goal] ?? POSES.fuerza;
  return (
    <svg viewBox="0 0 120 200" aria-hidden="true" focusable="false" className={cn("block", className)} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {p.gear && <path d={p.gear} strokeWidth="3.5" strokeOpacity=".55" />}
      <polyline points={line(p.torso)} strokeWidth="24" />
      {p.limbs.map((l, i) => <polyline key={i} points={line(l)} strokeWidth={i < 2 ? 10 : 13} />)}
      <circle cx={p.head[0]} cy={p.head[1]} r="11" fill="currentColor" stroke="none" />
    </svg>
  );
}
