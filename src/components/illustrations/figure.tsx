import { useId, type ReactNode } from "react";

export type Pt = [number, number];

/**
 * Pose de una silueta de atleta (sin cara). Cada miembro es una lista de articulaciones: hombro → codo → mano y
 * cadera → rodilla → tobillo (→ punta del pie). El lado cercano va pleno y adelante; el lejano, atrás y más tenue.
 */
export interface Pose {
  head: Pt;
  /** Centro de los hombros. */
  neck: Pt;
  hip: Pt;
  arm: Pt[];
  leg: Pt[];
  farArm: Pt[];
  farLeg: Pt[];
  /** Media anchura del torso en hombros y en cintura (de frente conviene más ancho). */
  chest?: number;
  waist?: number;
  headR?: number;
  /** De frente: los dos lados se ven igual de plenos (sin atenuar el lejano). */
  flat?: boolean;
}

/** Grosor por tramo: brazo y antebrazo; muslo, pierna y pie (más finos hacia la punta, como un cuerpo). */
const ARM = [10.5, 8.5];
const LEG = [14.5, 11.5, 7];
/** Luz que separa el brazo cercano del cuerpo cuando lo cruza (recorte, no color). */
const GAP = 4;

const r1 = (n: number) => Math.round(n * 10) / 10;

function Limb({ pts, w, extra = 0, stroke = "currentColor" }: { pts: Pt[]; w: number[]; extra?: number; stroke?: string }) {
  return (
    <>
      {pts.slice(1).map((b, i) => {
        const a = pts[i]!;
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={(w[i] ?? w[w.length - 1]!) + extra} />;
      })}
    </>
  );
}

/** Torso en cuña (hombros anchos, cintura angosta) entre el cuello y la cadera. */
function torso(neck: Pt, hip: Pt, a: number, b: number) {
  const dx = hip[0] - neck[0], dy = hip[1] - neck[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const at = (c: Pt, k: number) => `${r1(c[0] + nx * k)} ${r1(c[1] + ny * k)}`;
  return `M${at(neck, a)}L${at(hip, b)}L${at(hip, -b)}L${at(neck, -a)}Z`;
}

/**
 * Silueta de atleta en `currentColor`, trazo grueso redondeado. El brazo cercano recorta una luz fina sobre el torso
 * y la pierna para que la pose se lea aunque todo sea de un solo color. `far` y `near` suman lo que lleva en cada mano
 * (guantes, pelota): lo lejano, tenue con su brazo; lo cercano, adelante.
 */
export function Figure({ pose, far, near }: { pose: Pose; far?: ReactNode; near?: ReactNode }) {
  const mask = `fg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { head, neck, hip, arm, leg, farArm, farLeg, chest = 9.5, waist = 7, headR = 10.5, flat } = pose;
  // El recorte arranca a mitad del brazo: en el hombro el brazo nace del torso y no se separa.
  const [s, e] = [arm[0]!, arm[1]!];
  const cut: Pt[] = [[(s[0] + e[0]) / 2, (s[1] + e[1]) / 2], ...arm.slice(1)];
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <mask id={mask} maskUnits="userSpaceOnUse" x="-50" y="-50" width="300" height="300">
        <rect x="-50" y="-50" width="300" height="300" fill="white" />
        <Limb pts={cut} w={ARM} extra={GAP} stroke="black" />
      </mask>
      <g mask={`url(#${mask})`}>
        <g opacity={flat ? 1 : 0.5}>
          <Limb pts={farLeg} w={LEG} />
          <Limb pts={farArm} w={ARM} />
          {far}
        </g>
        <path d={torso(neck, hip, chest, waist)} fill="currentColor" strokeWidth="6" />
        <line x1={neck[0]} y1={neck[1]} x2={head[0]} y2={head[1]} strokeWidth="7" />
        <circle cx={head[0]} cy={head[1]} r={headR} fill="currentColor" stroke="none" />
        <Limb pts={leg} w={LEG} />
      </g>
      <Limb pts={arm} w={ARM} />
      {near}
    </g>
  );
}
