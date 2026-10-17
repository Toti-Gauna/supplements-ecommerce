import type { Pose } from "../figure";
import { Pack, PACK } from "./b-packs";
import { Athlete, Beam, Drop, Dust, Glow, Scene } from "./b-stage";

const PITCH = 520, FLOOR = 760;
/** Remate: pierna de pegada extendida, brazos abiertos para equilibrar. */
const STRIKE: Pose = {
  head: [70, 42], neck: [66, 58], hip: [60, 106],
  arm: [[64, 62], [46, 76], [30, 70]], farArm: [[68, 62], [86, 70], [98, 58]],
  leg: [[60, 106], [88, 128], [110, 140], [119, 136]], farLeg: [[60, 106], [62, 144], [60, 180], [70, 184]],
};

/** Pelota: cuero blanco con los pentágonos negros y las costuras. */
function Ball({ u, x, y, r }: { u: string; x: number; y: number; r: number }) {
  const pent = (cx: number, cy: number, k: number, rot = 0) => `M${Array.from({ length: 5 }, (_, i) => { const a = rot + -Math.PI / 2 + (i * 2 * Math.PI) / 5; return `${(cx + Math.cos(a) * k).toFixed(1)} ${(cy + Math.sin(a) * k).toFixed(1)}`; }).join("L")}Z`;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f4f4ef" />
      <path d={pent(x, y, r * 0.36) + pent(x - r * 0.72, y - r * 0.5, r * 0.24, 0.6) + pent(x + r * 0.72, y - r * 0.5, r * 0.24, -0.6) + pent(x, y + r * 0.84, r * 0.22, Math.PI) + pent(x - r * 0.78, y + r * 0.45, r * 0.2, 2.2) + pent(x + r * 0.78, y + r * 0.45, r * 0.2, -2.2)} fill="#15171b" />
      <circle cx={x} cy={y} r={r} fill={`url(#${u}-cyl)`} opacity=".7" />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#000" strokeOpacity=".3" strokeWidth="2" />
    </g>
  );
}

/** Día del Futbolista: remate bajo los reflectores del estadio, con el pasto mojado saltando en la pegada. */
export function DiaDelFutbolista({ className }: { className?: string }) {
  return (
    <Scene id="dia-del-futbolista" className={className} sky={["#02090a", "#0a2a14"]}>
      {(u) => (
        <>
          <linearGradient id={`${u}-grass`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e8a45" /><stop offset=".5" stopColor="#15632f" /><stop offset="1" stopColor="#06200f" /></linearGradient>
          {/* Tribuna en silueta con las filas de butacas, y las dos torres de iluminación. */}
          <path d={`M0 300L140 260H660L800 300V${PITCH}H0Z`} fill="#06120a" />
          <path d={Array.from({ length: 9 }, (_, i) => `M0 ${320 + i * 22}H800`).join("")} stroke="#fff" strokeOpacity=".05" strokeWidth="2" />
          <path d={`M0 ${PITCH - 24}H800`} stroke="#f4f4ef" strokeOpacity=".25" strokeWidth="3" />
          {[[90, 1], [710, -1]].map(([x, d]) => (
            <g key={x}>
              <rect x={x! - 6} y="40" width="12" height={PITCH - 64} fill="#0b1510" />
              <rect x={x! - 48} y="20" width="96" height="40" rx="3" fill="#101a14" />
              <path d={Array.from({ length: 10 }, (_, i) => `M${x! - 42 + (i % 5) * 19} ${26 + Math.floor(i / 5) * 16}h14v10h-14z`).join("")} fill="#fffbe6" />
              <Glow cx={x!} cy={40} rx={150} ry={70} color="#fffbe6" o={0.8} />
              <Beam u={u} x={x!} y={60} top={40} bottom={330} h={900} tilt={-26 * d!} o={0.5} color="#fffbe6" />
            </g>
          ))}
          <Glow cx={400} cy={400} rx={420} ry={260} color="#fffbe6" o={0.18} />
          {/* Arco de fondo y césped con las franjas de corte en fuga. */}
          <path d={`M300 ${PITCH - 110}V${PITCH + 6}M500 ${PITCH - 110}V${PITCH + 6}M296 ${PITCH - 112}H504`} stroke="#f4f4ef" strokeOpacity=".8" strokeWidth="6" strokeLinecap="square" />
          <path d={[...Array.from({ length: 9 }, (_, i) => `M${312 + i * 22} ${PITCH - 108}V${PITCH + 4}`), ...Array.from({ length: 6 }, (_, i) => `M304 ${PITCH - 100 + i * 18}H496`)].join("")} stroke="#f4f4ef" strokeOpacity=".18" strokeWidth="1" />
          <rect y={PITCH} width="800" height={1000 - PITCH} fill={`url(#${u}-grass)`} />
          <path d={[0, 2, 4, 6].map((i) => `M${-60 + i * 180} 1000L${320 + i * 44} ${PITCH}L${360 + i * 44} ${PITCH}L${90 + i * 180} 1000Z`).join("")} fill="#000" opacity=".16" />
          <path d={`M0 ${PITCH + 12}H800M-100 1000L300 ${PITCH}M900 1000L500 ${PITCH}`} stroke="#f4f4ef" strokeOpacity=".45" strokeWidth="4" />
          <Glow cx={400} cy={FLOOR} rx={360} ry={70} color="#fffbe6" o={0.35} />
          <Drop u={u} cx={420} cy={FLOOR + 4} rx={170} ry={16} />
          <Athlete pose={STRIKE} x={210} y={FLOOR} s={3.1} color="#05080a" rim="#fffbe6" rimDx={-1.4} glow="#fffbe6" />
          <Dust x={150} y={120} w={500} h={400} n={20} seed={19} r={1.6} color="#fffbe6" o={0.4} />
          {/* Pasto mojado que salta en la pegada y la pelota saliendo. */}
          <Dust x={500} y={600} w={120} h={160} n={22} seed={6} r={2.4} color="#bfe8a8" />
          <path d="M520 722q22-30 54-40M530 736q30-22 70-24M510 708q10-36 36-52" fill="none" stroke="#bfe8a8" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
          <path d="M600 548h-70M604 572h-56M598 596h-66" stroke="#f4f4ef" strokeOpacity=".4" strokeWidth="4" strokeLinecap="round" />
          <Ball u={u} x={660} y={566} r={44} />
          {/* Sales, geles y botella, en la línea del lateral. */}
          <Glow cx={200} cy={930} rx={280} ry={70} color="#fffbe6" o={0.2} />
          <Drop u={u} cx={210} cy={944} rx={210} ry={18} />
          <Pack u={u} kind="bottle-sport" x={100} y={940} s={0.84} p={PACK.pulso} tint="#f4f4ef" />
          <Pack u={u} kind="sachet" x={230} y={944} s={0.52} p={PACK.house} tint="#2f8cff" />
          <Pack u={u} kind="gel" x={350} y={944} s={0.56} p={PACK.forja} tint="#ffa630" />
        </>
      )}
    </Scene>
  );
}
