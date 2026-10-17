import { BOLT, Jar, PropDefs, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Fog, useArtIds, W, type ArtIds } from "./stage";

const ORANGE = "#ff8a1f";
const PUMPKIN = "#e8701a";

/** Pesa rusa calabaza: el cuerpo gajado con el rayo calado y la luz saliendo de adentro, el asa de hierro arriba. */
function PumpkinBell({ ids, x, y, r }: { ids: ArtIds; x: number; y: number; r: number }) {
  const cy = y - r * 0.9;
  const handle = `M${x - r * 0.5} ${cy - r * 0.55}q0-${r * 1.0} ${r * 0.5}-${r * 1.0}t${r * 0.5} ${r * 1.0}`;
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={r * 1.15} ry={r * 0.2} fill={ids.url("shadow")} />
      <path d={handle} fill="none" stroke="#15181d" strokeWidth={r * 0.24} strokeLinecap="round" />
      <path d={handle} fill="none" stroke="#fff" strokeOpacity=".15" strokeWidth={r * 0.07} strokeLinecap="round" />
      <ellipse cx={x} cy={cy} rx={r} ry={r * 0.88} fill={PUMPKIN} />
      {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => <ellipse key={k} cx={x + r * k * 0.95} cy={cy} rx={r * (0.3 + Math.abs(k) * 0.15)} ry={r * 0.86} fill="none" stroke="#8a3a08" strokeOpacity=".55" strokeWidth={r * 0.035} />)}
      <ellipse cx={x} cy={cy} rx={r} ry={r * 0.88} fill={ids.url("sphere")} />
      <path d={BOLT} transform={`translate(${x - r * 0.2} ${cy - r * 0.5}) scale(${r / 100})`} fill="#1a0b06" />
      <path d={BOLT} transform={`translate(${x - r * 0.2} ${cy - r * 0.5}) scale(${r / 100})`} fill={ids.url("glow")} />
      <rect x={x - r * 0.7} y={y - r * 0.12} width={r * 1.4} height={r * 0.12} fill="#000" opacity=".5" />
    </g>
  );
}

/**
 * Halloween: el "monstruo del pump". Una silueta enorme hace el peso muerto sumo de una pesa rusa calabaza con el
 * rayo calado que ilumina desde adentro; niebla en el piso, brasas y la luz naranja desde arriba.
 */
export function Halloween() {
  const ids = useArtIds();
  const s = 3.4, y = FLOOR + 90 - 184 * s;
  return (
    <>
      <Backdrop ids={ids} from="#160d22" to="#3d2255" glow="#ff8a1f" glowAt={[400, 560]} />
      <PropDefs ids={ids} volt={ORANGE} plasma="#8b72ff" />
      <defs>
        <radialGradient id={ids.id("glow")} cx=".5" cy=".4" r=".7">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset=".5" stopColor="#ffb347" />
          <stop offset="1" stopColor={ORANGE} />
        </radialGradient>
        <radialGradient id={ids.id("moon")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffb347" stopOpacity=".35" />
          <stop offset=".6" stopColor="#ff8a1f" stopOpacity=".12" />
          <stop offset="1" stopColor="#ff8a1f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={400} cy={330} r={300} fill={ids.url("moon")} />
      <circle cx={400} cy={330} r="210" fill="none" stroke={ORANGE} strokeOpacity=".25" strokeWidth="2" />
      <Beam ids={ids} k="o" x0={400} x1={400} w={260} color={ORANGE} o={0.38} />
      {/* Productos de la campaña, en la sombra con el filo naranja. */}
      <Tub ids={ids} x={130} y={FLOOR + 150} s={0.9} tall body="#140a1c" band="#1e1030" accent={ORANGE} tint={ORANGE} />
      <Jar ids={ids} x={690} y={FLOOR + 120} s={0.9} body="#140a1c" band="#1e1030" accent={ORANGE} tint="#8b72ff" />
      {/* El monstruo, de frente, con los trapecios al cielo. */}
      <Athlete
        pose={{
          head: [60, 60], neck: [60, 78], hip: [60, 124], chest: 17, waist: 9, headR: 9.5, flat: true,
          arm: [[78, 82], [78, 116], [72, 150]], farArm: [[42, 82], [42, 116], [48, 150]],
          leg: [[60, 124], [94, 152], [100, 182], [110, 184]], farLeg: [[60, 124], [26, 152], [20, 182], [10, 184]],
        }}
        x={400 - 60 * s} y={y} s={s} color="#0b0612" rim={ORANGE} rimDx={0} rimDy={-2.4}
        near={<path d="M42 80q18-16 36 0" strokeWidth="13" />}
      />
      <PumpkinBell ids={ids} x={400} y={y + 150 * s + 150} r={92} />
      <Fog ids={ids} k="h" y={FLOOR + 60} color="#c9b6ff" o={0.22} />
      <Dust seed={91} n={80} x={100} y={100} w={600} h={720} color={ORANGE} rMax={2.4} o={0.55} />
      <path d={`M0 ${920}L${W} ${800}`} stroke={ORANGE} strokeOpacity=".3" strokeWidth="2" />
    </>
  );
}
