import { Barbell, Plate, PropDefs, Shaker, Tub } from "./props";
import { Athlete, Backdrop, Dust, FLOOR, Flare, Fog, useArtIds, W } from "./stage";

const VOLT = "#c8ff2e";
const DAWN = "#ffb86b";

/**
 * Vuelta al gym: la luz del amanecer entra por la puerta del box y cruza el piso. Un atleta con el bolso en la
 * puerta, a contraluz; adelante, la barra vacía esperando y una nube de tiza recién aplaudida.
 */
export function VueltaAlGym() {
  const ids = useArtIds();
  const door = { x: 290, y: 150, w: 220, h: FLOOR - 150 };
  return (
    <>
      <Backdrop ids={ids} from="#1b1240" to="#5a3fe6" glow="#5a3fe6" glowAt={[400, 420]} />
      <PropDefs ids={ids} volt={VOLT} plasma="#8b72ff" />
      <defs>
        <linearGradient id={ids.id("dawn")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c4ff" />
          <stop offset=".45" stopColor="#ffb86b" />
          <stop offset="1" stopColor="#fff1c2" />
        </linearGradient>
        <linearGradient id={ids.id("slab")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={DAWN} stopOpacity=".55" />
          <stop offset="1" stopColor={DAWN} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.id("rays")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c2" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff1c2" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={ids.id("chalk")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Puerta abierta: marco de acero y el amanecer afuera. */}
      <rect x={door.x - 18} y={door.y - 18} width={door.w + 36} height={door.h + 18} fill="#0c0a1c" />
      <rect x={door.x} y={door.y} width={door.w} height={door.h} fill={ids.url("dawn")} />
      <rect x={door.x} y={door.y} width={door.w} height={door.h * 0.08} fill="#fff" opacity=".3" />
      <path d={`M${door.x + door.w / 2 - 4} ${door.y}v${door.h}`} stroke="#0c0a1c" strokeWidth="8" />
      {/* Rayos que cruzan la sala y la losa de luz sobre el piso. */}
      <path d={`M${door.x} ${door.y}L${door.x + door.w} ${door.y}L${W + 100} ${FLOOR + 400}L-100 ${FLOOR + 400}Z`} fill={ids.url("rays")} opacity=".5" />
      <path d={`M${door.x} ${FLOOR}H${door.x + door.w}L${W - 40} ${1000}H${-60}Z`} fill={ids.url("slab")} />
      {/* Discos guardados contra la pared, a la derecha. */}
      <Plate ids={ids} x={690} y={FLOOR - 92} r={92} color="#1d1a35" />
      <Plate ids={ids} x={640} y={FLOOR - 70} r={70} color="#141229" />
      <Plate ids={ids} x={110} y={FLOOR - 80} r={80} color="#1a1733" />
      {/* Atleta en la puerta, con el bolso al hombro, a contraluz. */}
      <Athlete
        pose={{
          head: [64, 44], neck: [62, 60], hip: [60, 112], chest: 10.5,
          arm: [[66, 64], [76, 88], [68, 112]], farArm: [[58, 64], [50, 86], [54, 108]],
          leg: [[60, 112], [68, 148], [66, 182], [78, 184]], farLeg: [[60, 112], [50, 148], [48, 182], [58, 184]],
        }}
        x={318} y={FLOOR - 184 * 2.35 + 4} s={2.35} color="#0a0818" rim={DAWN} rimDx={-2.2} rimDy={0}
        far={<g><path d="M58 64l-18 8" strokeWidth="4" /><rect x="22" y="70" width="28" height="46" rx="7" fill="currentColor" stroke="none" transform="rotate(12 36 93)" /></g>}
      />
      <Flare ids={ids} k="d" cx={400} cy={300} color="#fff1c2" s={1} o={0.9} />
      {/* Productos del regreso: pote y shaker, a la izquierda, con la luz rasante. */}
      <Tub ids={ids} x={150} y={FLOOR + 190} s={0.9} body="#15112b" band="#1f1a3a" accent={VOLT} tint="#2ee6d6" />
      <Shaker ids={ids} x={262} y={FLOOR + 206} s={0.86} body="#1a1535" accent={VOLT} tint="#8b72ff" />
      {/* La barra vacía en el piso, esperando, con la luz rasante del amanecer sobre el acero, y la nube de tiza. */}
      <ellipse cx={500} cy={FLOOR + 186} rx={310} ry={22} fill="#000" opacity=".5" />
      <g transform={`translate(0 ${FLOOR + 176})`}>
        <Barbell ids={ids} x={500} y={0} len={620} plates={[]} />
        <rect x={190} y={-8} width={620} height="4" rx="2" fill={DAWN} opacity=".75" />
        <rect x={190} y={-8} width={620} height="4" rx="2" fill="#fff" opacity=".35" />
        <rect x={370} y={-15} width="24" height="30" rx="3" fill="#fff1c2" opacity=".45" />
        <rect x={606} y={-15} width="24" height="30" rx="3" fill="#fff1c2" opacity=".45" />
        <rect x={400} y={-9} width={200} height="18" rx="4" fill="#fff" opacity=".22" />
      </g>
      <circle cx={560} cy={FLOOR + 90} r={210} fill={ids.url("chalk")} />
      <circle cx={660} cy={FLOOR + 150} r={120} fill={ids.url("chalk")} opacity=".7" />
      <Dust seed={31} n={110} x={380} y={580} w={380} h={340} rMax={3} o={0.75} />
      <Dust seed={32} n={50} x={250} y={160} w={300} h={560} color="#fff1c2" rMax={1.8} o={0.45} />
      <Fog ids={ids} k="f" y={FLOOR + 120} o={0.1} />
    </>
  );
}
