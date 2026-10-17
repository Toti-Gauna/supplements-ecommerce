import type { Pose } from "../figure";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Digits, Drop, Dust, Glow, Scene } from "./b-stage";

const SEA = 470, GROUND = 700;
/** De frente, llegando: rodilla arriba, brazos bombeando, el pecho contra la cinta. */
const LEAD: Pose = {
  head: [88, 36], neck: [85, 54], hip: [78, 110], chest: 13.5, waist: 8.5, flat: true,
  arm: [[97, 58], [116, 78], [104, 58]], farArm: [[73, 58], [60, 86], [74, 108]],
  leg: [[84, 110], [98, 130], [92, 146], [104, 150]], farLeg: [[72, 110], [70, 148], [70, 182], [62, 188]],
};
const CHASE: Pose = {
  head: [76, 40], neck: [78, 58], hip: [80, 110], chest: 12.5, waist: 8, flat: true,
  arm: [[90, 62], [104, 90], [88, 104]], farArm: [[66, 62], [48, 80], [60, 60]],
  leg: [[86, 110], [92, 148], [96, 180], [104, 186]], farLeg: [[74, 110], [62, 134], [68, 150], [60, 156]],
};

/** Día del Running: la llegada en la costa, al amanecer, con el reloj de la meta y la cinta que se corta. */
export function DiaDelRunning({ className }: { className?: string }) {
  return (
    <Scene id="dia-del-running" className={className} sky={["#050e24", "#1f4fa8"]}>
      {(u) => (
        <>
          <linearGradient id={`${u}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a6fd6" /><stop offset="1" stopColor="#0b1d3a" /></linearGradient>
          <linearGradient id={`${u}-ground`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#252a3a" /><stop offset="1" stopColor="#0a0c14" /></linearGradient>
          <Glow cx={400} cy={SEA} rx={520} ry={320} color="#ffd34d" o={0.5} />
          <circle cx="400" cy={SEA - 6} r="84" fill="#ffd34d" /><circle cx="400" cy={SEA - 6} r="84" fill="#fff3c4" opacity=".5" />
          <rect y={SEA} width="800" height={GROUND - 160 - SEA} fill={`url(#${u}-sea)`} />
          <Glow cx={400} cy={SEA + 30} rx={90} ry={50} color="#ffd34d" o={0.7} />
          <path d={[484, 500, 516, 530].map((y, i) => `M${20 + i * 60} ${y}h${80 + i * 20}M${420 + i * 50} ${y}h${60 + i * 30}`).join("")} stroke="#fff" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" />
          {/* Rambla: baldosas en fuga y la alfombra de cronometraje bajo el arco. */}
          <rect y={GROUND - 160} width="800" height={1000 - GROUND + 160} fill={`url(#${u}-ground)`} />
          <path d={[...Array.from({ length: 9 }, (_, i) => `M${-220 + i * 155} 1000L${300 + i * 25} ${GROUND - 160}`), `M0 ${GROUND - 100}H800`, "M0 790H800", "M0 900H800"].join("")} stroke="#f2f0ea" strokeOpacity=".07" strokeWidth="1.5" />
          <rect x="110" y={GROUND - 14} width="580" height="28" fill="#111420" /><rect x="110" y={GROUND - 14} width="580" height="4" fill="#ffd34d" opacity=".7" />
          <Glow cx={400} cy={GROUND} rx={360} ry={60} color="#ffe9a8" o={0.4} />
          {/* Arco de meta: postes, viga a cuadros y el reloj LED. */}
          <Beam u={u} x={400} y={244} top={120} bottom={300} h={520} o={0.35} color="#ffe9a8" />
          <g fill="#1a1d2a">
            <rect x="118" y="172" width="28" height={GROUND - 172} /><rect x="654" y="172" width="28" height={GROUND - 172} />
            <rect x="104" y="172" width="592" height="72" rx="3" />
          </g>
          <rect x="118" y="172" width="28" height={GROUND - 172} fill={`url(#${u}-cyl)`} opacity=".7" /><rect x="654" y="172" width="28" height={GROUND - 172} fill={`url(#${u}-cyl)`} opacity=".7" />
          <path d={Array.from({ length: 34 }, (_, i) => `M${112 + i * 17} ${i % 2 ? 178 : 195}h17v17h-17z`).join("")} fill="#f4f4ef" opacity=".9" />
          <path d={Array.from({ length: 34 }, (_, i) => `M${112 + i * 17} ${i % 2 ? 195 : 178}h17v17h-17z`).join("")} fill="#0a0c14" />
          <rect x="300" y="172" width="200" height="72" fill="#05060b" stroke="#ffd34d" strokeOpacity=".6" strokeWidth="2" />
          <Digits value="42:07" x={326} y={190} h={38} color="#ffd34d" />
          <Glow cx={400} cy={208} rx={130} ry={50} color="#ffd34d" o={0.4} />
          {/* Los que vienen atrás, más chicos y en penumbra; adelante, el que corta la cinta. */}
          <Athlete pose={CHASE} x={400} y={GROUND - 30} s={2.1} color="#070a14" rim="#ffd34d" rimDx={1.1} />
          <Athlete pose={CHASE} x={68} y={GROUND - 12} s={2.35} flip color="#070a14" rim="#ffd34d" rimDx={-1.1} />
          <Drop u={u} cx={400} cy={GROUND + 10} rx={120} ry={16} />
          <Athlete pose={LEAD} x={172} y={GROUND + 8} s={2.85} color="#05070c" rim="#ffe9a8" rimDx={1.4} glow="#ffd34d" />
          <path d="M132 430C220 440 300 452 352 448" fill="none" stroke="#ffd34d" strokeWidth="12" strokeLinecap="round" />
          <path d="M668 430C600 438 560 520 536 600" fill="none" stroke="#ffd34d" strokeWidth="12" strokeLinecap="round" />
          <path d="M132 430C220 440 300 452 352 448M668 430C600 438 560 520 536 600" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3" />
          <Dust x={300} y={380} w={240} h={320} n={16} seed={2} r={2.2} color="#ffe9a8" o={0.6} />
          {/* Geles, sales y botella en la mesa de hidratación. */}
          <Glow cx={620} cy={920} rx={280} ry={70} color="#ffe9a8" o={0.22} />
          <Drop u={u} cx={620} cy={940} rx={220} ry={18} />
          <Pack u={u} kind="gel" x={520} y={940} s={0.6} p={PACK.forja} tint="#ffa630" />
          <Pack u={u} kind="sachet" x={640} y={942} s={0.52} p={PACK.house} tint="#2f8cff" />
          <Pack u={u} kind="bottle-sport" x={750} y={940} s={0.8} p={PACK.pulso} tint="#ffd34d" />
        </>
      )}
    </Scene>
  );
}
