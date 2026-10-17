import type { Pose } from "../figure";
import { Glove, GloveHand, Towel } from "./b-gear";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Drop, Dust, Glow, Scene } from "./b-stage";

const CANVAS = 620, FLOOR = 760, POST = 640;
/** El boxeador en su rincón, guantes arriba, de perfil al público. */
const BOXER: Pose = {
  head: [70, 42], neck: [70, 60], hip: [66, 114], chest: 11,
  arm: [[78, 64], [100, 46], [98, 22]], farArm: [[62, 64], [40, 48], [42, 24]],
  leg: [[66, 114], [78, 148], [80, 182], [92, 186]], farLeg: [[66, 114], [54, 150], [46, 182], [58, 186]],
};
const ROPES = ["#ffd34d", "#f4f4ef", "#c1272d"];

/** Día del Boxeador (14 de septiembre): rincón del ring bajo la lámpara, toalla en la cuerda y los guantes en la lona. */
export function DiaDelBoxeador({ className }: { className?: string }) {
  return (
    <Scene id="dia-del-boxeador" className={className} sky={["#0e0204", "#5a0f14"]}>
      {(u) => (
        <>
          <linearGradient id={`${u}-mat`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9d1bc" /><stop offset=".6" stopColor="#8f8873" /><stop offset="1" stopColor="#2a261e" /></linearGradient>
          <Glow cx={400} cy={360} rx={440} ry={320} color="#ff6a3d" o={0.22} />
          <path d={Array.from({ length: 7 }, (_, i) => `M${i * 120 - 40} 0V${CANVAS}`).join("")} stroke="#fff" strokeOpacity=".03" strokeWidth="2" />
          <path d="M340 0h120l-10 40H350Z" fill="#1c1215" /><ellipse cx="400" cy="40" rx="58" ry="7" fill="#fff6dc" /><Glow cx={400} cy={44} rx={130} ry={40} color="#fff6dc" o={0.8} />
          <Beam u={u} x={400} y={44} top={60} bottom={330} h={940} o={0.6} color="#fff6dc" />
          {/* Lona, cuerdas hacia el esquinero y la toalla colgada. */}
          <rect y={CANVAS} width="800" height={1000 - CANVAS} fill={`url(#${u}-mat)`} />
          <path d={`M0 ${CANVAS + 40}H800M0 ${CANVAS + 200}H800`} stroke="#000" strokeOpacity=".12" strokeWidth="2" />
          <Glow cx={400} cy={FLOOR} rx={360} ry={80} color="#fff6dc" o={0.4} />
          {ROPES.map((c, i) => <path key={c} d={`M0 ${350 + i * 85}L${POST} ${318 + i * 95}L800 ${300 + i * 90}`} fill="none" stroke={c} strokeWidth="9" strokeLinejoin="round" />)}
          {ROPES.map((c, i) => <path key={c} d={`M0 ${350 + i * 85}L${POST} ${318 + i * 95}L800 ${300 + i * 90}`} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="2" transform="translate(0 -3)" />)}
          <rect x={POST - 14} y="230" width="28" height={CANVAS + 60 - 230} rx="4" fill="#15171b" />
          <rect x={POST - 20} y="250" width="40" height="300" rx="16" fill="#c1272d" /><rect x={POST - 20} y="250" width="40" height="300" rx="16" fill={`url(#${u}-cyl)`} opacity=".7" />
          <path d={`M${POST - 20} 322h40M${POST - 20} 417h40M${POST - 20} 512h40`} stroke="#000" strokeOpacity=".3" strokeWidth="3" />
          <Towel x={520} y={312} w={62} h={150} />
          {/* Banquito del rincón. */}
          <path d={`M560 ${CANVAS + 36}h70l6 90h-6l-5-80h-60l-5 80h-6zM556 ${CANVAS + 30}h78v8h-78z`} fill="#3a2a1c" />
          <Drop u={u} cx={420} cy={FLOOR + 4} rx={170} ry={18} />
          <Athlete pose={BOXER} x={200} y={FLOOR} s={3.1} color="#07080b" rim="#ffd34d" rimDx={1.4} glow="#ff6a3d"
            far={<GloveHand x={42} y={22} r={9.5} color="#8a1a20" />} near={<GloveHand x={98} y={20} r={10} color="#c1272d" />} />
          <Dust x={280} y={140} w={260} h={260} n={24} seed={14} r={2.4} color="#fff6dc" />
          {/* Guantes, vendas y proteína, en la lona. */}
          <Drop u={u} cx={200} cy={944} rx={150} ry={16} />
          <g transform="translate(200 936) scale(.72) translate(-200 -330)">
            <g transform="translate(356 10) scale(-0.94 0.94)"><Glove u={u} leather="#a51d24" band="#f3e9d8" accent="#d9a441" back /></g>
            <g transform="translate(28 0)"><Glove u={u} leather="#c1272d" band="#f3e9d8" accent="#d9a441" /></g>
          </g>
          <Drop u={u} cx={640} cy={944} rx={160} ry={16} />
          <Pack u={u} kind="tub" x={680} y={940} s={0.72} p={PACK.house} tint="#5a3220" />
          <Pack u={u} kind="sachet" x={540} y={944} s={0.5} p={PACK.house} tint="#2f8cff" />
        </>
      )}
    </Scene>
  );
}
