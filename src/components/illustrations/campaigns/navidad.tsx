import { BOLT, Jar, PropDefs, Tub } from "./props";
import { Athlete, Backdrop, Beam, Dust, FLOOR, Flare, useArtIds, W } from "./stage";

const GOLD = "#f3c84c";
const GREEN = "#1f8a4f";

/** Un disco de goma visto de canto y un poco desde arriba: la cara elíptica y el borde. */
function Disc({ ids, y, rx, ry, color }: { ids: ReturnType<typeof useArtIds>; y: number; rx: number; ry: number; color: string }) {
  const th = Math.max(14, rx * 0.16);
  return (
    <g>
      <path d={`M${400 - rx} ${y}v${th}a${rx} ${ry} 0 0 0 ${rx * 2} 0v-${th}z`} fill={color} />
      <path d={`M${400 - rx} ${y}v${th}a${rx} ${ry} 0 0 0 ${rx * 2} 0v-${th}z`} fill={ids.url("cyl")} opacity=".85" />
      <ellipse cx={400} cy={y} rx={rx} ry={ry} fill={color} />
      <ellipse cx={400} cy={y} rx={rx} ry={ry} fill="#fff" opacity=".12" />
      <ellipse cx={400} cy={y} rx={rx * 0.22} ry={ry * 0.22} fill="#4a515c" />
      <ellipse cx={400} cy={y} rx={rx * 0.1} ry={ry * 0.1} fill="#05060a" />
    </g>
  );
}

/**
 * Navidad: un árbol de discos de goma verdes apilados en una barra vertical, con el cable de la polea enroscado y
 * sus puntos de luz; el rayo dorado arriba, los potes al pie como regalos, tiza cayendo como nieve y un atleta que
 * estira para poner el último disco.
 */
export function Navidad() {
  const ids = useArtIds();
  const discs: [number, number, string][] = [[FLOOR - 30, 210, "#145c36"], [FLOOR - 92, 180, GREEN], [FLOOR - 150, 152, "#145c36"], [FLOOR - 204, 126, GREEN], [FLOOR - 252, 100, "#145c36"], [FLOOR - 296, 76, GREEN], [FLOOR - 334, 54, "#145c36"]];
  const cable = `M700 90C600 150 560 ${FLOOR - 300} 440 ${FLOOR - 290}S300 ${FLOOR - 200} 340 ${FLOOR - 180}S560 ${FLOOR - 160} 560 ${FLOOR - 120}S260 ${FLOOR - 60} 260 ${FLOOR - 50}S640 ${FLOOR - 10} 640 ${FLOOR + 10}`;
  return (
    <>
      <Backdrop ids={ids} from="#0e3526" to="#1f6243" glow="#2f8a5c" glowAt={[400, 520]} />
      <PropDefs ids={ids} volt={GOLD} plasma="#2ee6d6" />
      <defs>
        <radialGradient id={ids.id("lamp")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".3" stopColor={GOLD} stopOpacity=".9" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <Beam ids={ids} k="g" x0={400} x1={400} w={250} color={GOLD} o={0.4} />
      {/* Columna de la polea: de ahí sale el cable que hace de guirnalda. */}
      <rect x={690} y={60} width="26" height={FLOOR - 60} fill={ids.url("steel")} />
      <circle cx={703} cy={92} r="26" fill="#0b0d11" stroke="#4a515c" strokeWidth="4" />
      <circle cx={703} cy={92} r="8" fill="#4a515c" />
      {/* Barra vertical y el árbol de discos. */}
      <rect x={391} y={FLOOR - 380} width="18" height={380} fill={ids.url("steel")} />
      {discs.map(([y, rx, c]) => <Disc key={y} ids={ids} y={y} rx={rx} ry={rx * 0.32} color={c} />)}
      <path d={cable} fill="none" stroke="#05060a" strokeWidth="7" strokeLinecap="round" />
      <path d={cable} fill="none" stroke="#9aa4b2" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      {[[585, 250], [470, FLOOR - 300], [360, FLOOR - 236], [330, FLOOR - 182], [470, FLOOR - 160], [556, FLOOR - 118], [430, FLOOR - 90], [280, FLOOR - 58], [360, FLOOR - 36], [520, FLOOR - 20], [640, FLOOR + 6]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="22" fill={ids.url("lamp")} opacity=".9" />
          <circle cx={x} cy={y} r="4" fill={i % 3 === 1 ? "#ff5a52" : "#fff"} />
        </g>
      ))}
      {/* El rayo dorado en la punta, con su destello. */}
      <path d={BOLT} transform={`translate(380 ${FLOOR - 450}) scale(1.05)`} fill={GOLD} />
      <path d={BOLT} transform={`translate(380 ${FLOOR - 450}) scale(1.05)`} fill="#fff" opacity=".35" />
      <Flare ids={ids} k="s" cx={402} cy={FLOOR - 420} color={GOLD} s={0.75} />
      {/* Atleta estirando para poner el último disco. */}
      <Athlete
        pose={{
          head: [66, 38], neck: [64, 54], hip: [60, 108], chest: 10.5,
          arm: [[68, 58], [84, 32], [96, 8]], farArm: [[60, 58], [74, 30], [88, 8]],
          leg: [[60, 108], [66, 144], [62, 178], [72, 182]], farLeg: [[60, 108], [52, 144], [50, 178], [60, 182]],
        }}
        x={30} y={FLOOR - 182 * 3.1 + 40} s={3.1} color="#06120b" rim={GOLD} rimDx={2.2} rimDy={-1}
        near={<g><circle cx="100" cy="4" r="13" fill="currentColor" stroke="none" /><circle cx="100" cy="4" r="4" fill="#0e3526" stroke="none" /></g>}
      />
      {/* Los potes al pie del árbol, como regalos. */}
      <Tub ids={ids} x={620} y={FLOOR + 150} s={0.9} body="#0c1f16" band="#122a1e" accent={GOLD} tint="#ff5a52" />
      <Jar ids={ids} x={500} y={FLOOR + 176} s={0.8} body="#0c1f16" band="#122a1e" accent={GOLD} tint="#2ee6d6" />
      <Tub ids={ids} x={220} y={FLOOR + 200} s={0.7} tall body="#0c1f16" band="#122a1e" accent={GOLD} tint={GOLD} />
      <Dust seed={41} n={130} x={0} y={0} w={W} h={FLOOR + 200} rMax={3.2} o={0.7} />
    </>
  );
}
