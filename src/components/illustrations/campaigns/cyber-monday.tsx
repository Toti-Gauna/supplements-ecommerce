import { Jar, PropDefs, Rack, Shaker, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, H, useArtIds, W } from "./stage";

const ION = "#3ff0e0";
const MAGENTA = "#ff4fd8";

/** Pista de circuito impreso: línea con quiebres a 90° y sus nodos. */
function Trace({ d, nodes, color }: { d: string; nodes: [number, number][]; color: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth="7" strokeOpacity=".16" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeOpacity=".9" strokeLinecap="round" strokeLinejoin="round" />
      {nodes.map(([x, y]) => <g key={`${x}${y}`}><circle cx={x} cy={y} r="7" fill="#03101a" stroke={color} strokeWidth="2.2" /><circle cx={x} cy={y} r="2.5" fill={color} /></g>)}
    </g>
  );
}

/**
 * CyberMonday: piso de placa de circuito con pistas que llegan al rack, el rack de neón cian con los potes de la
 * campaña (con un corrimiento de color, como una pantalla), la línea de escaneo y un velocista en los tacos.
 */
export function CyberMonday() {
  const ids = useArtIds();
  const perspective = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => `M${400 + i * 90} ${FLOOR}L${400 + i * 420} ${H + 60}`).join("");
  const rows = [0, 1, 2, 3, 4, 5].map((i) => { const y = FLOOR + 12 + i * i * 10; return `M0 ${y}H${W}`; }).join("");
  return (
    <>
      <Backdrop ids={ids} from="#03101a" to="#0c3a58" glow="#0e5f88" glowAt={[400, 500]} />
      <PropDefs ids={ids} volt={ION} plasma={MAGENTA} />
      <defs>
        <linearGradient id={ids.id("scan")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ION} stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor={ION} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.id("scanfade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ION} stopOpacity="0" />
          <stop offset="1" stopColor={ION} stopOpacity=".22" />
        </linearGradient>
      </defs>
      <Beam ids={ids} k="c" x0={400} x1={400} w={250} color={ION} o={0.3} />
      {/* Piso: grilla en fuga y pistas de circuito con nodos. */}
      <path d={perspective + rows} stroke={ION} strokeOpacity=".16" strokeWidth="1.5" fill="none" />
      <Trace color={ION} d={`M60 ${H - 40}V${FLOOR + 150}H200V${FLOOR + 40}H300`} nodes={[[60, H - 40], [200, FLOOR + 150], [300, FLOOR + 40]]} />
      <Trace color={ION} d={`M${W - 80} ${H - 20}V${FLOOR + 190}H560V${FLOOR + 60}H500`} nodes={[[W - 80, H - 20], [560, FLOOR + 190], [500, FLOOR + 60]]} />
      <Trace color={MAGENTA} d={`M400 ${H + 10}V${FLOOR + 120}H470V${FLOOR + 30}`} nodes={[[470, FLOOR + 120], [470, FLOOR + 30]]} />
      {/* Rack de neón y los potes con corrimiento cian/magenta. */}
      <Rack ids={ids} x={400} y={FLOOR} w={320} top={110} shelf={500} neon={ION} />
      <g opacity=".5" transform="translate(-9 0)"><Tub ids={ids} x={400} y={500} s={0.9} body={ION} band={ION} accent={ION} tint={ION} /></g>
      <g opacity=".5" transform="translate(9 0)"><Tub ids={ids} x={400} y={500} s={0.9} body={MAGENTA} band={MAGENTA} accent={MAGENTA} tint={MAGENTA} /></g>
      <Tub ids={ids} x={400} y={500} s={0.9} body="#071a26" band="#0a2435" accent={ION} tint={MAGENTA} />
      <Jar ids={ids} x={270} y={500} s={0.84} body="#071a26" band="#0a2435" accent={ION} tint={ION} lit={0.7} />
      <Shaker ids={ids} x={540} y={500} s={0.8} body="#0a2435" accent={ION} tint={ION} />
      {/* Línea de escaneo cruzando la escena. */}
      <rect x={0} y={330} width={W} height={60} fill={ids.url("scanfade")} />
      <rect x={0} y={388} width={W} height={3} fill={ids.url("scan")} />
      {/* Velocista en los tacos, a contraluz cian. */}
      <Athlete
        pose={{
          head: [104, 88], neck: [92, 100], hip: [56, 120], chest: 10, waist: 7.5,
          arm: [[94, 104], [108, 142], [112, 184]], farArm: [[90, 104], [100, 142], [104, 184]],
          leg: [[56, 120], [34, 152], [20, 184], [34, 184]], farLeg: [[56, 120], [82, 148], [78, 184], [92, 184]],
        }}
        x={120} y={FLOOR + 170 - 184 * 3.2} s={3.2} color="#02070c" rim={ION} rimDx={-2.4} rimDy={-1.4}
      />
      <path d={`M126 ${FLOOR + 170}h60l10 -22h-14zM222 ${FLOOR + 170}h44l8 -16h-12z`} fill="#0a2435" stroke={ION} strokeOpacity=".7" strokeWidth="2" />
      {/* Píxeles de datos. */}
      <g fill={ION} opacity=".6">
        {[[90, 160], [130, 220], [680, 140], [720, 260], [600, 90], [160, 300], [700, 420], [80, 520]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" />)}
      </g>
      <Dust seed={51} n={40} x={200} y={100} w={400} h={560} color={ION} rMax={1.8} o={0.45} />
    </>
  );
}
