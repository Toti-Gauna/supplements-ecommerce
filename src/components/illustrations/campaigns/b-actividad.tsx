import { Figure, type Pose } from "../figure";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Drop, Dust, Glow, Scene } from "./b-stage";

const HORIZON = 600;
const WALK: Pose = {
  head: [78, 44], neck: [76, 60], hip: [70, 110],
  arm: [[78, 64], [72, 86], [84, 104]], farArm: [[74, 64], [82, 86], [70, 102]],
  leg: [[70, 110], [88, 144], [94, 180], [106, 184]], farLeg: [[70, 110], [58, 146], [48, 180], [58, 184]],
};
const STRETCH: Pose = {
  head: [74, 40], neck: [72, 56], hip: [64, 106],
  arm: [[76, 60], [88, 38], [86, 14]], farArm: [[68, 60], [58, 40], [60, 16]],
  leg: [[64, 106], [96, 128], [100, 180], [114, 184]], farLeg: [[64, 106], [40, 140], [20, 180], [10, 184]],
};
const RIDER: Pose = {
  head: [114, 72], neck: [102, 80], hip: [64, 98], chest: 8.5, waist: 6.5,
  arm: [[102, 84], [112, 98], [124, 110]], farArm: [[99, 84], [108, 100], [121, 113]],
  leg: [[64, 98], [92, 120], [86, 156], [95, 161]], farLeg: [[64, 98], [88, 113], [64, 144], [71, 148]],
};
const JOG: Pose = {
  head: [96, 44], neck: [90, 60], hip: [74, 106],
  arm: [[88, 64], [70, 78], [62, 66]], farArm: [[92, 64], [106, 82], [118, 72]],
  leg: [[74, 106], [100, 116], [98, 150], [110, 154]], farLeg: [[74, 106], [62, 142], [46, 176], [40, 184]],
};

/** Ciclista con su bici de ruta, en el lienzo de `Figure` (la rueda apoya en y = 175). */
function Cyclist({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y - 175 * s}) scale(${s})`} color="#04140e" fill="none" stroke="#04140e" strokeLinecap="round">
      <circle cx="38" cy="150" r="25" strokeWidth="4" /><circle cx="124" cy="150" r="25" strokeWidth="4" />
      <path d="M38 150L78 154L68 108ZM68 108H110M78 154L114 122M110 106L114 122L124 150M66 108l-2-6M58 101h14M110 106l8-3c7 0 9 4 9 9s-3 8-8 8" strokeWidth="3.6" />
      <Figure pose={RIDER} />
      <path d="M100 76Q98 58 115 56.5Q129 57 130 70" strokeWidth="4.6" />
    </g>
  );
}

/** Día de la Actividad Física: gente distinta moviéndose en el parque al amanecer: caminar, elongar, pedalear, trotar. */
export function DiaActividadFisica({ className }: { className?: string }) {
  return (
    <Scene id="dia-actividad-fisica" className={className} sky={["#03160f", "#1f8a5c"]}>
      {(u) => (
        <>
          <linearGradient id={`${u}-grass`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d4a32" /><stop offset=".35" stopColor="#0a3324" /><stop offset="1" stopColor="#04130d" /></linearGradient>
          <Glow cx={660} cy={470} rx={520} ry={300} color="#c8ff2e" o={0.4} />
          <circle cx="660" cy="468" r="86" fill="#f4ffb0" /><circle cx="660" cy="468" r="86" fill="#fff" opacity=".4" />
          {/* Arboleda alta en silueta: troncos hasta el borde y el follaje arriba; la luz pasa entre los troncos. */}
          <path d={[[110, 40, 230, 120], [430, 10, 250, 130], [720, 60, 210, 110], [260, 150, 120, 50], [600, 170, 110, 44]].map(([x, y, rx, ry]) => `M${x! - rx!} ${y}a${rx} ${ry} 0 1 0 ${rx! * 2} 0a${rx} ${ry} 0 1 0 -${rx! * 2} 0`).join("") + [[58, 22], [214, 16], [468, 26], [722, 18]].map(([x, w]) => `M${x! - w! / 2} 0h${w}l${w! * 0.3} ${HORIZON}h-${w! * 1.6}z`).join("")} fill="#031a12" />
          <path d="M214 180l-70 -90M468 200l90 -110M722 220l-60 -100" stroke="#031a12" strokeWidth="9" strokeLinecap="round" />
          {[18, 38, 58].map((t) => <Beam key={t} u={u} x={660} y={468} top={6} bottom={170} h={520} tilt={t} o={0.42} color="#f4ffb0" />)}
          <Beam u={u} x={660} y={468} top={6} bottom={70} h={420} tilt={-70} o={0.3} color="#f4ffb0" />
          <Beam u={u} x={560} y={-30} top={60} bottom={200} h={660} tilt={14} o={0.3} color="#f4ffb0" />
          <rect y={HORIZON} width="800" height={1000 - HORIZON} fill={`url(#${u}-grass)`} />
          <path d={`M0 1000C120 860 420 760 640 ${HORIZON + 20}L800 ${HORIZON + 12}L800 ${HORIZON + 60}C560 700 300 820 220 1000Z`} fill="#2b2822" />
          <path d={`M0 1000C120 860 420 760 640 ${HORIZON + 20}L800 ${HORIZON + 12}L800 ${HORIZON + 60}C560 700 300 820 220 1000Z`} fill={`url(#${u}-v)`} opacity=".4" />
          <Glow cx={620} cy={HORIZON + 10} rx={300} ry={48} color="#f4ffb0" o={0.5} />
          <Dust x={380} y={360} w={400} h={260} n={24} seed={8} r={2.2} color="#f4ffb0" o={0.6} />
          {/* La gente, de atrás hacia adelante: trote lejano, ciclista, elongación y caminata. */}
          <Athlete pose={JOG} x={570} y={HORIZON + 30} s={1.25} color="#04140e" rim="#f4ffb0" rimDx={1.3} />
          <Drop u={u} cx={560} cy={HORIZON + 92} rx={130} ry={10} />
          <Cyclist x={430} y={HORIZON + 88} s={1.55} />
          <Drop u={u} cx={300} cy={HORIZON + 148} rx={150} ry={12} />
          <Athlete pose={STRETCH} x={180} y={HORIZON + 146} s={2.1} color="#04140e" rim="#f4ffb0" rimDx={1.3} />
          <Drop u={u} cx={120} cy={HORIZON + 232} rx={120} ry={14} />
          <Athlete pose={WALK} x={-60} y={HORIZON + 230} s={2.75} color="#04140e" rim="#f4ffb0" rimDx={1.4} glow="#c8ff2e" />
          {/* Hidratación y vitaminas, a un costado del sendero. */}
          <Glow cx={600} cy={920} rx={300} ry={80} color="#f4ffb0" o={0.22} />
          <Drop u={u} cx={620} cy={936} rx={220} ry={18} />
          <Pack u={u} kind="bottle-sport" x={700} y={932} s={0.86} p={PACK.pulso} tint="#22d3c5" />
          <Pack u={u} kind="caps" x={560} y={936} s={0.66} p={PACK.house} tint="#d8f05a" />
          <Pack u={u} kind="sachet" x={440} y={936} s={0.52} p={PACK.house} tint="#2f8cff" />
        </>
      )}
    </Scene>
  );
}
