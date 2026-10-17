import type { Pose } from "../figure";
import { Bench, Plate } from "./b-gear";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Drop, Dust, Glow, Scene } from "./b-stage";

const FLOOR = 700;
/** El que empuja: acostado en el banco (cabeza a la izquierda), brazos extendidos en el bloqueo. */
const LIFTER: Pose = {
  head: [22, 98], neck: [40, 99], hip: [96, 102], chest: 11, waist: 8,
  arm: [[44, 96], [46, 70], [48, 44]], farArm: [[41, 101], [44, 74], [46, 48]],
  leg: [[96, 102], [126, 108], [132, 138], [143, 139]], farLeg: [[96, 102], [118, 112], [112, 138], [123, 140]],
};
/** El compañero: parado detrás de la cabecera, inclinado sobre la barra con las manos listas. */
const SPOTTER: Pose = {
  head: [86, 36], neck: [77, 50], hip: [50, 104], chest: 10,
  arm: [[80, 54], [102, 72], [120, 86]], farArm: [[75, 55], [98, 74], [116, 88]],
  leg: [[50, 104], [58, 146], [52, 180], [64, 184]], farLeg: [[50, 104], [40, 148], [33, 180], [45, 184]],
};

/** Día del Amigo: un compañero cuida el PR de otro, bajo un solo reflector. */
export function DiaDelAmigo({ className }: { className?: string }) {
  return (
    <Scene id="dia-del-amigo" className={className} sky={["#021311", "#0a4a43"]}>
      {(u) => (
        <>
          <path d={Array.from({ length: 9 }, (_, i) => `M${i * 100 - 20} 0V${FLOOR}`).join("") + `M0 ${FLOOR - 110}H800`} stroke="#fff" strokeOpacity=".035" strokeWidth="2" />
          <rect y="128" width="800" height="4" fill="#e3ff8f" opacity=".5" />
          <Glow cx={400} cy={150} rx={420} ry={60} color="#e3ff8f" o={0.25} />
          <rect y={FLOOR} width="800" height="300" fill="#070b0a" />
          <path d={[...Array.from({ length: 9 }, (_, i) => `M${-200 + i * 150} 1000L${280 + i * 30} ${FLOOR}`), "M0 770H800", "M0 870H800"].join("")} stroke="#f2f0ea" strokeOpacity=".05" strokeWidth="1.5" />
          {/* Un solo reflector sobre el banco; el resto queda en penumbra. */}
          <Glow cx={400} cy={480} rx={300} ry={300} color="#f3ffd6" o={0.22} />
          <Beam u={u} x={400} top={38} bottom={250} o={0.75} color="#f6ffe0" />
          <Glow cx={400} cy={FLOOR + 10} rx={330} ry={62} color="#f6ffe0" o={0.55} />
          <path d="M360 0h80l-8 26h-64Z" fill="#2a3139" /><ellipse cx="400" cy="26" rx="32" ry="4" fill="#fffdf2" />
          <Drop u={u} cx={420} cy={FLOOR + 4} rx={240} ry={18} />
          <Bench u={u} x={252} y={598} w={310} />
          <Athlete pose={SPOTTER} x={-16} y={FLOOR} s={3} rim="#e3ff8f" rimDx={1.3} />
          <Athlete pose={LIFTER} x={218} y={843} s={3} rim="#f6ffe0" rimDx={1.2} glow="#e3ff8f" />
          {/* La barra de punta: manga, collar y el disco de 20 adelante. */}
          <circle cx="362" cy="417" r="13" fill="#9aa3ad" /><circle cx="362" cy="417" r="13" fill={`url(#${u}-cyl)`} opacity=".7" />
          <Plate u={u} cx={404} cy={426} r={58} color="#1f4fb8" />
          <Dust x={300} y={340} w={200} h={120} n={18} seed={5} r={2.2} color="#f6ffe0" />
          <Dust x={240} y={560} w={360} h={120} n={14} seed={9} r={1.6} color="#f6ffe0" o={0.5} />
          {/* Lo que usa el compañero: shaker, sales y aminoácidos, al pie del banco. */}
          <Glow cx={190} cy={900} rx={240} ry={70} color="#f6ffe0" o={0.22} />
          <Drop u={u} cx={190} cy={906} rx={190} ry={18} />
          <Pack u={u} kind="shaker" x={110} y={900} s={0.66} p={{ ...PACK.house, body: "#dfe5ee", ink: "#0b0d10" }} tint="#e5576f" />
          <Pack u={u} kind="jar" x={232} y={904} s={0.62} p={PACK.krono} tint="#2f8cff" />
          <Pack u={u} kind="sachet" x={340} y={904} s={0.5} p={PACK.house} tint="#2f8cff" />
        </>
      )}
    </Scene>
  );
}
