import type { Pose } from "../figure";
import { Barbell, Medal } from "./b-gear";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Drop, Dust, Glow, Scene } from "./b-stage";

const FLOOR = 700;
/** Padre: de costado, inclinado apenas hacia la barra, las dos manos en el disco. */
const DAD: Pose = {
  head: [72, 44], neck: [71, 61], hip: [64, 112], chest: 10.5, waist: 7.5,
  arm: [[74, 65], [96, 92], [110, 115]], farArm: [[68, 65], [88, 95], [106, 117]],
  leg: [[64, 112], [78, 146], [80, 180], [93, 184]], farLeg: [[64, 112], [54, 148], [46, 180], [57, 184]],
};
/** Hijo: más chico, cabeza grande, los brazos a la altura del hombro para llegar a la barra. */
const KID: Pose = {
  head: [70, 48], neck: [70, 66], hip: [66, 116], chest: 8, waist: 6.5, headR: 12.5,
  arm: [[74, 70], [92, 66], [106, 64]], farArm: [[66, 70], [86, 70], [103, 67]],
  leg: [[66, 116], [74, 150], [76, 182], [88, 185]], farLeg: [[66, 116], [58, 150], [52, 182], [62, 185]],
};

/** Día del Padre: padre e hijo cargan la barra juntos en el rack; la medalla cuelga del montante. */
export function DiaDelPadre({ className }: { className?: string }) {
  return (
    <Scene id="dia-del-padre" className={className} sky={["#0b1420", "#2e4c6e"]}>
      {(u) => (
        <>
          <path d={Array.from({ length: 9 }, (_, i) => `M${i * 100 - 20} 0V${FLOOR}`).join("") + `M0 160H800M0 ${FLOOR - 120}H800`} stroke="#fff" strokeOpacity=".035" strokeWidth="2" />
          <Glow cx={400} cy={430} rx={420} ry={300} color="#ffcf5c" o={0.28} />
          <Beam u={u} x={400} top={46} bottom={340} o={0.5} color="#fff6dc" />
          <Beam u={u} x={120} y={-40} top={14} bottom={150} tilt={-16} o={0.35} color="#ffcf5c" />
          <Beam u={u} x={690} y={-40} top={14} bottom={150} tilt={16} o={0.35} color="#ffcf5c" />
          {/* Piso de caucho con los carriles en fuga. */}
          <rect y={FLOOR} width="800" height="300" fill="#090d12" />
          <path d={[...Array.from({ length: 9 }, (_, i) => `M${-200 + i * 150} 1000L${280 + i * 30} ${FLOOR}`), "M0 760H800", "M0 850H800"].join("")} stroke="#f2f0ea" strokeOpacity=".06" strokeWidth="1.5" />
          <Glow cx={400} cy={FLOOR + 10} rx={380} ry={70} color="#fff6dc" o={0.45} />
          {/* Rack: dos montantes con agujeros, travesaño y los soportes de la barra. */}
          <g fill="#2a3039">
            <rect x="142" y="80" width="24" height={FLOOR - 80} /><rect x="634" y="80" width="24" height={FLOOR - 80} />
            <rect x="130" y="80" width="540" height="16" /><rect x="120" y={FLOOR - 10} width="68" height="12" /><rect x="612" y={FLOOR - 10} width="68" height="12" />
          </g>
          <path d={Array.from({ length: 22 }, (_, i) => `M151 ${112 + i * 26}h6v9h-6zM643 ${112 + i * 26}h6v9h-6z`).join("")} fill="#0a0d12" />
          <rect x="142" y="80" width="24" height={FLOOR - 80} fill={`url(#${u}-cyl)`} opacity=".7" /><rect x="634" y="80" width="24" height={FLOOR - 80} fill={`url(#${u}-cyl)`} opacity=".7" />
          <path d="M166 480h26v30h-26M634 480h-26v30h26" fill="none" stroke="#3b434e" strokeWidth="10" strokeLinejoin="round" />
          <Medal u={u} x={200} y={300} r={34} ribbon="#b8234a" gold="#ffcf5c" len={200} />
          <Drop u={u} cx={150} cy={FLOOR + 6} rx={140} ry={16} />
          <Drop u={u} cx={690} cy={FLOOR + 6} rx={90} ry={12} />
          <Barbell u={u} x={400} y={496} w={440} plates={[[24, 196, "#1f4fb8"]]} />
          {/* El disco que entra el padre (rojo de 25) y el chico de 10 (verde). */}
          <rect x={212} y={392} width="26" height="208" rx="7" fill="#c1272d" /><rect x={212} y={392} width="26" height="208" rx="7" fill={`url(#${u}-v)`} opacity=".7" />
          <rect x={616} y={430} width="18" height="132" rx="5" fill="#2a9d4a" /><rect x={616} y={430} width="18" height="132" rx="5" fill={`url(#${u}-v)`} opacity=".7" />
          <Athlete pose={DAD} x={-96} y={FLOOR} s={3} rim="#ffcf5c" rimDx={1.4} glow="#ffcf5c" />
          <Athlete pose={KID} x={826} y={FLOOR} s={1.85} flip rim="#ffcf5c" rimDx={1.4} glow="#ffcf5c" />
          <Dust x={170} y={380} w={110} h={200} n={22} seed={3} r={2.6} />
          <Dust x={560} y={400} w={110} h={170} n={14} seed={11} r={2} />
          {/* El pedido: creatina, whey y shaker, en el piso del box. */}
          <Glow cx={600} cy={900} rx={260} ry={70} color="#fff6dc" o={0.3} />
          <Drop u={u} cx={620} cy={904} rx={190} ry={18} />
          <Pack u={u} kind="tub" x={690} y={900} s={0.72} p={PACK.house} tint="#5a3220" />
          <Pack u={u} kind="jar" x={548} y={904} s={0.64} p={PACK.house} tint="#e8e4d8" />
          <Pack u={u} kind="shaker" x={440} y={900} s={0.58} p={{ ...PACK.house, body: "#dfe5ee", ink: "#0b0d10" }} tint="#5a3220" />
        </>
      )}
    </Scene>
  );
}
