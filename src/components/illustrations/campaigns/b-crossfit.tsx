import type { Pose } from "../figure";
import { Kettlebell } from "./b-gear";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Digits, Drop, Dust, Glow, Scene } from "./b-stage";

const FLOOR = 700;
/** Swing de pesa rusa en el punto alto: brazos horizontales, cadera extendida. */
const SWING: Pose = {
  head: [81, 44], neck: [79, 61], hip: [76, 110], chest: 10.5,
  arm: [[82, 65], [100, 64], [117, 62]], farArm: [[77, 66], [96, 67], [113, 64]],
  leg: [[76, 110], [84, 146], [82, 180], [93, 184]], farLeg: [[76, 110], [72, 146], [70, 180], [81, 184]],
};
const WOD = ["08:42", "09:15", "11:03"];

/** CrossFit Open: swing en el piso de competencia, bajo los reflectores del rig, con el marcador de tiempos del WOD. */
export function CrossfitOpen({ className }: { className?: string }) {
  const s = 2.85, hx = 230 + 117 * s, hy = FLOOR - (186 - 62) * s;
  return (
    <Scene id="crossfit-open" className={className} sky={["#0f0704", "#4a2210"]}>
      {(u) => (
        <>
          {/* Rig: tres montantes, el travesaño con los reflectores y las barras de dominadas. */}
          <Beam u={u} x={250} y={90} top={26} bottom={260} h={900} o={0.5} color="#ffe6c8" />
          <Beam u={u} x={550} y={90} top={26} bottom={260} h={900} o={0.5} color="#ffe6c8" />
          <Glow cx={400} cy={520} rx={420} ry={320} color="#ff7a1a" o={0.22} />
          <rect y={FLOOR} width="800" height="300" fill="#0b0806" />
          <path d={[...Array.from({ length: 11 }, (_, i) => `M${-250 + i * 130} 1000L${300 + i * 20} ${FLOOR}`), "M0 760H800", "M0 850H800"].join("")} stroke="#ff7a1a" strokeOpacity=".16" strokeWidth="2" />
          <g transform="translate(520 790) scale(1 .42)"><Digits value="3" x={0} y={0} h={240} color="#ff7a1a" ghost={false} o={0.42} /></g>
          <Glow cx={400} cy={FLOOR + 12} rx={360} ry={70} color="#ffe6c8" o={0.45} />
          <g fill="#2a2420">
            <rect x="90" y="50" width="22" height={FLOOR - 50} /><rect x="389" y="50" width="22" height={FLOOR - 50} /><rect x="688" y="50" width="22" height={FLOOR - 50} />
            <rect x="80" y="50" width="640" height="20" /><rect x="80" y="262" width="640" height="10" />
          </g>
          <path d={Array.from({ length: 25 }, (_, i) => `M98 ${84 + i * 25}h6v8h-6zM397 ${84 + i * 25}h6v8h-6zM696 ${84 + i * 25}h6v8h-6z`).join("")} fill="#0b0806" />
          {[90, 389, 688].map((x) => <rect key={x} x={x} y="50" width="22" height={FLOOR - 50} fill={`url(#${u}-cyl)`} opacity=".7" />)}
          {[250, 550].map((x) => <g key={x}><rect x={x - 34} y="66" width="68" height="22" rx="3" fill="#1b1613" /><ellipse cx={x} cy="88" rx="26" ry="5" fill="#fff3dc" /><Glow cx={x} cy={88} rx={70} ry={30} color="#fff3dc" o={0.8} /></g>)}
          {/* Marcador: tres tiempos del WOD en LED naranja. */}
          <rect x="232" y="104" width="336" height="130" rx="4" fill="#070403" stroke="#ff7a1a" strokeOpacity=".5" strokeWidth="2" />
          <rect x="232" y="104" width="336" height="130" rx="4" fill={`url(#${u}-v)`} opacity=".25" />
          {WOD.map((t, i) => <g key={t}><rect x="250" y={118 + i * 38} width="18" height="26" rx="2" fill={i ? "#3b2a1c" : "#ff7a1a"} /><Digits value={t} x={300} y={118 + i * 38} h={26} color={i ? "#ffb070" : "#ff7a1a"} o={i ? 0.75 : 1} /></g>)}
          <Glow cx={400} cy={170} rx={200} ry={90} color="#ff7a1a" o={0.25} />
          <Drop u={u} cx={470} cy={FLOOR + 6} rx={200} ry={18} />
          <Athlete pose={SWING} x={230} y={FLOOR} s={s} rim="#ffb070" rimDx={1.3} glow="#ff7a1a" />
          <g transform={`rotate(-90 ${hx} ${hy})`}><Kettlebell u={u} cx={hx} cy={hy + 66} r={46} band="#ff7a1a" /></g>
          <Dust x={440} y={260} w={260} h={200} n={30} seed={4} r={2.8} />
          <Dust x={180} y={560} w={440} h={140} n={18} seed={13} r={2} o={0.5} />
          {/* Creatina, pre-entreno y el bloque de tiza, al borde del carril. */}
          <Glow cx={560} cy={910} rx={300} ry={80} color="#ffe6c8" o={0.22} />
          <Drop u={u} cx={560} cy={920} rx={240} ry={20} />
          <Pack u={u} kind="jar" x={720} y={916} s={0.7} p={PACK.forja} tint="#b8234a" />
          <Pack u={u} kind="jar" x={590} y={918} s={0.68} p={PACK.house} tint="#e8e4d8" />
          <Pack u={u} kind="chalk" x={440} y={922} s={0.62} p={PACK.house} tint="#c8ff2e" />
          <Dust x={360} y={860} w={200} h={60} n={12} seed={17} r={2} o={0.7} />
        </>
      )}
    </Scene>
  );
}
