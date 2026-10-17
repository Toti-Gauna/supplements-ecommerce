import type { Pose } from "../figure";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Drop, Dust, Glow, Scene } from "./b-stage";

const SEA = 556, SAND = 640;
/** Corredor en plena zancada, de perfil, a contraluz del amanecer. */
const RUNNER: Pose = {
  head: [102, 42], neck: [95, 58], hip: [74, 104],
  arm: [[92, 62], [72, 76], [60, 64]], farArm: [[97, 62], [112, 80], [126, 68]],
  leg: [[74, 104], [104, 112], [100, 144], [111, 147]], farLeg: [[74, 104], [60, 140], [42, 174], [36, 184]],
};

/** Operación verano: amanece en la costa de Mar del Plata; un corredor por la orilla, el muelle y el pedido en la arena. */
export function OperacionVerano({ className }: { className?: string }) {
  return (
    <Scene id="operacion-verano" className={className} sky={["#03182a", "#0b6f96"]}>
      {(u) => (
        <>
          <linearGradient id={`${u}-dawn`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd34d" stopOpacity="0" /><stop offset="1" stopColor="#ff9a3c" stopOpacity=".75" /></linearGradient>
          <linearGradient id={`${u}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c7aa3" /><stop offset="1" stopColor="#042a3d" /></linearGradient>
          <linearGradient id={`${u}-sand`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b2a2b" /><stop offset=".3" stopColor="#4a4038" /><stop offset="1" stopColor="#1a1512" /></linearGradient>
          <rect y="260" width="800" height={SEA - 260} fill={`url(#${u}-dawn)`} />
          <Glow cx={540} cy={SEA} rx={520} ry={330} color="#ffb547" o={0.6} />
          {[-210, -190, -170, -150, -130].map((t) => <Beam key={t} u={u} x={540} y={SEA} top={8} bottom={120} h={700} tilt={t} o={0.22} color="#ffd34d" />)}
          <circle cx="540" cy={SEA} r="132" fill="#ffd34d" />
          <circle cx="540" cy={SEA} r="132" fill="#fff3c4" opacity=".55" />
          {/* Mar: franja con el reflejo del sol y el muelle en silueta. */}
          <rect y={SEA} width="800" height={SAND - SEA} fill={`url(#${u}-sea)`} />
          <Glow cx={540} cy={SEA + 40} rx={110} ry={60} color="#ffd34d" o={0.7} />
          <path d={[566, 580, 596, 612, 628].map((y, i) => `M${i * 70} ${y}h${60 + i * 30}M${300 + i * 90} ${y}h${40 + i * 20}M${560 - i * 40} ${y + 6}h${80}`).join("")} stroke="#fff" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" />
          <path d={`M430 ${SEA - 8}H800V${SEA}H430Z` + Array.from({ length: 9 }, (_, i) => `M${450 + i * 42} ${SEA}v${22 + i * 2}h5v-${22 + i * 2}z`).join("")} fill="#031420" />
          <path d={`M430 ${SEA - 22}H800`} stroke="#031420" strokeWidth="2" />
          {/* Arena mojada: el sol se refleja hasta la orilla; espuma en la línea del agua. */}
          <rect y={SAND} width="800" height={1000 - SAND} fill={`url(#${u}-sand)`} />
          <Glow cx={540} cy={SAND + 40} rx={190} ry={60} color="#ffb547" o={0.55} />
          <path d={`M0 ${SAND}q100 -8 200 0t200 0t200 0t200 0`} fill="none" stroke="#dfe9ea" strokeOpacity=".45" strokeWidth="4" />
          <path d={`M0 ${SAND + 14}q90 -6 180 0t180 0t180 0t180 0t80 0`} fill="none" stroke="#dfe9ea" strokeOpacity=".16" strokeWidth="2" />
          <path d={[[60, 760], [96, 744], [130, 752], [166, 736]].map(([x, y]) => `M${x} ${y}a9 5 0 1 0 18 0a9 5 0 1 0 -18 0`).join("")} fill="#000" opacity=".3" />
          <Drop u={u} cx={290} cy={724} rx={150} ry={14} />
          <Athlete pose={RUNNER} x={50} y={722} s={2.7} color="#05070a" rim="#ffd34d" rimDx={1.4} glow="#ffb547" />
          <Dust x={60} y={640} w={160} h={80} n={14} seed={21} r={1.8} color="#e8d9b8" o={0.6} />
          {/* El pedido en la arena: L-carnitina, isolate y termogénico. */}
          <Glow cx={600} cy={930} rx={300} ry={80} color="#ffb547" o={0.3} />
          <Drop u={u} cx={600} cy={944} rx={230} ry={20} />
          <Pack u={u} kind="tub-tall" x={640} y={940} s={0.8} p={PACK.krono} tint="#5a3220" />
          <Pack u={u} kind="bottle" x={500} y={944} s={0.72} p={PACK.krono} tint="#ffa630" />
          <Pack u={u} kind="caps" x={750} y={948} s={0.6} p={PACK.forja} tint="#ff7a1a" />
        </>
      )}
    </Scene>
  );
}
