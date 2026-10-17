import { Pack, PACK } from "@/components/illustrations/campaigns/b-packs";
import { Digits, Glow } from "@/components/illustrations/campaigns/b-stage";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, lerp, type OpeningArtProps } from "../stage/types";

const CX = 430, RISE = 180, PLATE_H = 15, STACK = 12;

/** Grilla de piso de laboratorio, en el cian de la fecha. */
function Grid({ color }: { color: string }) {
  const d = Array.from({ length: 13 }, (_, i) => `M${-400 + i * 133} 1000L${150 + i * 42} ${FLOOR}`).join("") + [790, 830, 885, 955].map((y) => `M0 ${y}H800`).join("");
  return <path d={d} stroke={color} strokeOpacity=".16" strokeWidth="1.5" />;
}

/**
 * CyberMonday: la máquina de poleas del box, conectada. Cada tirón sube la pila de placas por las guías y carga el
 * marcador un 20 %; al 100 % la pila queda arriba, iluminada, con el regalo encima.
 */
export default function CyberMonday({ u, c, t, steps, step, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const lift = RISE * k;
  const top = FLOOR - 26 - STACK * PLATE_H - lift;
  const pct = String(Math.round(Math.min(steps, opened ? steps : step) * (100 / steps))).padStart(3, " ");
  const handle = { x: 640, y: lerp(470, 640, k) };
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={CX} spread={230} light="#d9fffb" power={0.8} seed={17} />
      <Grid color={c.accent} />
      {/* Marco de la máquina, guías y polea de arriba. */}
      <rect x={CX - 120} y="150" width="18" height={FLOOR - 150} fill="#20252c" />
      <rect x={CX + 102} y="150" width="18" height={FLOOR - 150} fill="#20252c" />
      <rect x={CX - 130} y="140" width="260" height="22" fill="#2a3038" />
      <rect x={CX - 130} y="140" width="260" height="22" fill={`url(#${u}-v)`} opacity=".6" />
      <path d={`M${CX - 60} 162V${FLOOR - 20}M${CX + 60} 162V${FLOOR - 20}`} stroke="#aab3be" strokeWidth="5" />
      <circle cx={CX} cy="190" r="22" fill="#14171c" stroke="#5d6672" strokeWidth="5" />
      <circle cx="650" cy="230" r="16" fill="#14171c" stroke="#5d6672" strokeWidth="4" />
      {/* El cable: de la pila a la polea, a la polea del costado y a la manija. */}
      <path d={`M${CX} ${top}V190M${CX + 20} 186L${650} 216M666 230L${handle.x} ${handle.y}`} stroke="#c9ced6" strokeWidth="3" fill="none" />
      {/* Pila de placas: sube con cada tirón. */}
      <Glow cx={CX} cy={top + 80} rx={150} ry={120} color={c.accent} o={0.2 + k * 0.5} />
      {Array.from({ length: STACK }, (_, i) => {
        const y = top + i * PLATE_H;
        return (
          <g key={i}>
            <rect x={CX - 72} y={y} width="144" height={PLATE_H - 2} fill="#1b1f25" />
            <rect x={CX - 72} y={y} width="144" height={PLATE_H - 2} fill={`url(#${u}-v)`} opacity=".5" />
            <rect x={CX - 72} y={y} width="144" height="2" fill={c.accent} opacity={i < Math.round(k * STACK) ? 0.9 : 0.12} />
          </g>
        );
      })}
      <rect x={CX - 6} y={top - 10} width="12" height="14" fill="#aab3be" />
      <rect x={CX - 80} y={FLOOR - 26} width="160" height="26" fill="#14171c" />
      {/* La manija que se tira. */}
      <rect x={handle.x - 34} y={handle.y} width="68" height="12" rx="6" fill="#0f1114" stroke={c.accent} strokeWidth="2" />
      {/* Al frente, el banco con el shaker (la carga de verdad). */}
      <Pack u={u} kind="shaker" x={190} y={930} s={0.6} p={PACK.house} tint={c.accent} />
      <Pack u={u} kind="jar" x={300} y={935} s={0.55} p={PACK.pulso} tint={c.accent} />
      {/* Marcador de carga en la cabecera. */}
      <rect x={CX - 100} y="64" width="200" height="66" rx="4" fill="#03080b" stroke={c.accent} strokeOpacity=".5" />
      <Digits value={pct} x={CX - 76} y={78} h={38} color={c.accent} />
      <path d={`M${CX + 62} 82h22v12h-22zM${CX + 62} 100h22v12h-22z`} fill={c.accent} opacity={k} />
    </g>
  );
}
