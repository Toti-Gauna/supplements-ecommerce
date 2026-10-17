import { PropDefs, Shaker, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Flare, useArtIds, W, type ArtIds } from "./stage";

const PINK = "#ffd1dc";
const ROSE = "#ff5a8a";

/** Línea de pulso que cruza la escena y, en el medio, dibuja el corazón. */
function Pulse({ ids, y }: { ids: ArtIds; y: number }) {
  const d = `M-20 ${y}H250l14 -34 16 70 16 -98 16 86 14 -24h34
    c-6 -40 50 -60 60 -16c10 -44 66 -24 60 16c-4 26 -40 48 -60 68c-20 -20 -56 -42 -60 -68
    h38l14 24 16 -86 16 98 16 -70 14 34H${W + 20}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={ROSE} strokeOpacity=".3" strokeWidth="16" />
      <path d={d} stroke={PINK} strokeWidth="3.5" />
      <path d={d} stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" />
      <defs>
        <radialGradient id={ids.id("heart")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset="1" stopColor={ROSE} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={400} cy={y + 16} r="120" fill={ids.url("heart")} />
    </g>
  );
}

const HIGH_FIVE = {
  head: [62, 40] as [number, number], neck: [60, 56] as [number, number], hip: [58, 110] as [number, number], chest: 10.5,
  arm: [[66, 60], [92, 44], [118, 26]] as [number, number][], farArm: [[56, 60], [46, 84], [52, 108]] as [number, number][],
  leg: [[58, 110], [70, 146], [66, 180], [80, 184]] as [number, number][], farLeg: [[58, 110], [48, 146], [44, 180], [56, 184]] as [number, number][],
};

/**
 * San Valentín: dos atletas chocan las manos en lo alto, con el destello del golpe; la línea del pulso cruza el box
 * y en el medio forma un corazón. Dos shakers y el pote de la pareja abajo.
 */
export function SanValentin() {
  const ids = useArtIds();
  const s = 3, y = FLOOR + 40 - 184 * s;
  return (
    <>
      <Backdrop ids={ids} from="#5c1028" to="#a8274a" glow="#ff5a8a" glowAt={[400, 420]} />
      <PropDefs ids={ids} volt={PINK} plasma={ROSE} />
      <Beam ids={ids} k="l" x0={200} x1={330} w={200} color={PINK} o={0.3} />
      <Beam ids={ids} k="r" x0={600} x1={470} w={200} color={PINK} o={0.3} />
      <Pulse ids={ids} y={520} />
      <Athlete pose={HIGH_FIVE} x={46} y={y} s={s} color="#160308" rim={PINK} rimDx={-2.4} rimDy={-1.2} />
      <Athlete pose={HIGH_FIVE} x={754} y={y} s={s} flip color="#160308" rim={PINK} rimDx={-2.4} rimDy={-1.2} />
      {/* El golpe de manos: destello y chispas de sudor. */}
      <Flare ids={ids} k="h" cx={400} cy={y + 26 * s} color="#fff" s={0.9} />
      <g stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".85">
        {[-70, -30, 10, 50, 90].map((a) => <path key={a} d="M400 240l0 -34" transform={`rotate(${a} 400 ${y + 26 * s})`} />)}
      </g>
      {/* Productos: dos shakers y el pote. */}
      <Shaker ids={ids} x={300} y={FLOOR + 170} s={0.9} body="#2a0a14" accent={PINK} tint={ROSE} />
      <Shaker ids={ids} x={500} y={FLOOR + 170} s={0.9} body="#2a0a14" accent={PINK} tint="#ffd1dc" />
      <Tub ids={ids} x={400} y={FLOOR + 230} s={0.92} body="#1c0610" band="#2a0a14" accent={PINK} tint={ROSE} />
      <Dust seed={71} n={80} x={100} y={80} w={600} h={700} color={PINK} rMax={2.4} o={0.5} />
    </>
  );
}
