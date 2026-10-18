import { Beam, Digits, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import type { StageColors } from "../stage/types";

/** La recta final vista de frente (coordenadas del escenario): fuga en el horizonte, llegada cerca de la cámara. */
export const TRACK = { vx: 400, horizon: 430, finish: 850, tape: 560, posts: [70, 730] } as const;

/** Torre de luces del estadio: panel de reflectores, su halo y el haz que cae sobre la pista. */
function Floodlight({ u, x, tilt, light }: { u: string; x: number; tilt: number; light: string }) {
  const cells = Array.from({ length: 12 }, (_, i) => `M${x - 36 + (i % 4) * 19} ${96 + Math.floor(i / 4) * 15}h14v10h-14z`).join("");
  return (
    <g>
      <path d={`M${x - 3} 140L${x - 10} 400H${x + 10}L${x + 3} 140Z`} fill="#0b1220" />
      <rect x={x - 42} y="90" width="84" height="52" rx="3" fill="#0b1220" />
      <path d={cells} fill="#fffbea" />
      <Glow cx={x} cy={116} rx={150} ry={110} color={light} o={0.7} />
      <Beam u={u} x={x} y={120} top={40} bottom={240} h={760} tilt={tilt} o={0.32} color={light} />
    </g>
  );
}

/** Estadio de noche: tribuna con luces del público, dos torres, la pista en perspectiva y la línea de llegada. */
export function Stadium({ u, c }: { u: string; c: StageColors }) {
  const { horizon, finish } = TRACK;
  const lanes = [-700, -380, -60, 260, 540, 860, 1180, 1500].map((x) => `M${TRACK.vx} ${horizon}L${x} 1000`).join("");
  return (
    <g>
      <Glow cx={400} cy={horizon} rx={620} ry={220} color={c.to} o={0.7} />
      <rect y={horizon - 64} width="800" height="64" fill="#060b16" />
      <Dust x={0} y={horizon - 58} w={800} h={50} n={90} seed={17} r={1.6} color="#ffe7a8" o={0.5} />
      <rect y={horizon - 66} width="800" height="3" fill={c.accent} opacity=".5" />
      <Floodlight u={u} x={110} tilt={-16} light="#fff4d6" />
      <Floodlight u={u} x={690} tilt={16} light="#fff4d6" />
      {/* Pista: tartán que se aclara hacia la cámara, carriles que fugan y la llegada a cuadros. */}
      <path d={`M0 ${horizon}H800V1000H0Z`} fill="#3a1410" />
      <path d={`M${TRACK.vx} ${horizon}L-700 1000H1500Z`} fill="#8a3326" />
      <Glow cx={400} cy={900} rx={560} ry={200} color="#ffb48a" o={0.35} />
      <path d={lanes} stroke="#f4efe6" strokeOpacity=".7" strokeWidth="3" />
      {/* Bruma en el fondo de la recta: los carriles se pierden en vez de juntarse en un punto. */}
      <Glow cx={400} cy={horizon + 10} rx={360} ry={70} color="#2a0f0c" o={0.95} k={1} />
      <path d={`M0 ${finish}H800V${finish + 22}H0Z`} fill="#f4efe6" />
      <path d={Array.from({ length: 20 }, (_, i) => `M${i * 40} ${finish + (i % 2 ? 0 : 11)}h20v11h-20z`).join("")} fill="#14161a" opacity=".85" />
    </g>
  );
}

/** Pórtico de llegada: dos postes, el travesaño con el reloj de carrera (mm:ss) y su luz. */
export function FinishGantry({ c, secs }: { c: StageColors; secs: number }) {
  const [l, r] = TRACK.posts;
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <g>
      {[l, r].map((x) => (
        <g key={x}>
          <rect x={x - 12} y="250" width="24" height={TRACK.finish - 240} fill="#1a1f29" />
          <rect x={x - 12} y="250" width="6" height={TRACK.finish - 240} fill="#fff" opacity=".14" />
        </g>
      ))}
      <rect x={l - 30} y="236" width={r - l + 60} height="74" rx="4" fill="#0b0e14" stroke="#2b3240" strokeWidth="3" />
      <rect x={l - 30} y="304" width={r - l + 60} height="6" fill={c.accent} opacity=".85" />
      <Glow cx={400} cy={272} rx={160} ry={50} color={c.accent} o={0.35} />
      <Digits value={clock} x={330} y={248} h={48} color={c.accent} />
    </g>
  );
}
