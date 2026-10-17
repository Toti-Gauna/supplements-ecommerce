import { Barbell, PropDefs, Shaker, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Flare, useArtIds, W, type ArtIds } from "./stage";

const PINK = "#ffd6e7";
const MAGENTA = "#ff4fa3";
const BANDS = ["#ff4fa3", "#ffd6e7", "#c8ff2e", "#8b72ff", "#2ee6d6"];

/** Flor hecha de bandas elásticas: aros de banda como pétalos alrededor de un mosquetón. */
function BandFlower({ ids, x, y, r, seed }: { ids: ArtIds; x: number; y: number; r: number; seed: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.62} rx={r * 0.3} ry={r * 0.62} fill={BANDS[(i + seed) % BANDS.length]} fillOpacity=".3" stroke={BANDS[(i + seed) % BANDS.length]} strokeWidth={r * 0.11} transform={`rotate(${i * 60 + seed * 10})`} />
      ))}
      <circle cx={0} cy={0} r={r * 0.2} fill={ids.url("steel")} stroke="#fff" strokeOpacity=".4" strokeWidth="2" />
    </g>
  );
}

/**
 * Día de la Madre: una atleta fuerte bloquea el press por encima de la cabeza, a contraluz rosa; a su lado, el
 * ramo de flores hechas con bandas elásticas en un shaker y el pote de la campaña.
 */
export function DiaDeLaMadre() {
  const ids = useArtIds();
  const s = 3.3, y = FLOOR + 60 - 182 * s;
  const barY = y + 8 * s;
  return (
    <>
      <Backdrop ids={ids} from="#5e2440" to="#a9496d" glow="#ff4fa3" glowAt={[400, 420]} />
      <PropDefs ids={ids} volt={PINK} plasma={MAGENTA} />
      <Beam ids={ids} k="m" x0={400} x1={400} w={240} color={PINK} o={0.42} />
      {/* Ramo de bandas en el shaker (de florero), a la derecha. */}
      <g>
        <g stroke="#1a0a12" strokeWidth="7" strokeLinecap="round" fill="none">
          <path d={`M650 ${FLOOR + 140}q-20 -90 -60 -150M650 ${FLOOR + 140}q10 -100 40 -170M650 ${FLOOR + 140}q-6 -70 -2 -120`} />
        </g>
        <BandFlower ids={ids} x={590} y={FLOOR - 20} r={64} seed={0} />
        <BandFlower ids={ids} x={692} y={FLOOR - 40} r={56} seed={2} />
        <BandFlower ids={ids} x={650} y={FLOOR + 10} r={48} seed={4} />
        <Shaker ids={ids} x={650} y={FLOOR + 160} s={1.05} body="#2a0f1e" accent={PINK} tint={MAGENTA} />
      </g>
      {/* Atleta con la barra arriba, de frente, con la cola de caballo. */}
      <Athlete
        pose={{
          head: [60, 34], neck: [60, 50], hip: [60, 104], chest: 10, waist: 7, flat: true,
          arm: [[70, 54], [84, 32], [82, 8]], farArm: [[50, 54], [36, 32], [38, 8]],
          leg: [[60, 104], [76, 140], [80, 178], [86, 182]], farLeg: [[60, 104], [44, 140], [40, 178], [34, 182]],
        }}
        x={380 - 60 * s} y={y} s={s} color="#1a060f" rim={PINK} rimDx={-2.2} rimDy={-1.2}
        near={<path d="M52 32q-16 4-14 32" strokeWidth="6" />}
      />
      <Barbell ids={ids} x={380} y={barY} len={640} plates={[[46, 170], [38, 170], [28, 130]]} plateColor="#2a0f1e" />
      <Flare ids={ids} k="t" cx={380} cy={barY - 30} color={PINK} s={0.7} o={0.7} />
      {/* Pote de la campaña a la izquierda. */}
      <Tub ids={ids} x={150} y={FLOOR + 170} s={0.92} body="#1c0a14" band="#2a0f1e" accent={PINK} tint={MAGENTA} />
      <Dust seed={81} n={70} x={60} y={60} w={680} h={760} color={PINK} rMax={2.4} o={0.5} />
      <path d={`M0 ${900}L${W} ${780}`} stroke={PINK} strokeOpacity=".3" strokeWidth="2" />
    </>
  );
}
