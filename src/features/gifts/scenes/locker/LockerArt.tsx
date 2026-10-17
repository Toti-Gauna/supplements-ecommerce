import { Digits, Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { Towel } from "@/components/illustrations/campaigns/b-gear";
import { GymBackdrop } from "../stage/backdrop";
import { FLOOR, type StageColors } from "../stage/types";

export type LockerStatus = "idle" | "wrong" | "unlocking" | "open";

interface Props {
  u: string;
  c: StageColors;
  /** Lo que se marcó (hasta 4 dígitos): lo muestran las ruedas del candado. */
  digits: string;
  status: LockerStatus;
  /** Intentos fallidos (reinicia la sacudida del candado). */
  misses: number;
  /** Apertura de la puerta, de 0 (cerrada) a 1 (abierta). */
  swing: number;
}

const X = 260, Y = 130, W = 280, H = FLOOR - Y;
const STEEL = "#262b33";

/** Un locker de acero: rejilla, chapa con el número en LED y el refuerzo de la puerta. */
function Door({ u, x, w, lit, num }: { u: string; x: number; w: number; lit: string; num: string }) {
  return (
    <g>
      <rect x={x} y={Y} width={w} height={H} fill={STEEL} />
      <rect x={x} y={Y} width={w} height={H} fill={`url(#${u}-v)`} opacity=".5" />
      <path d={Array.from({ length: 6 }, (_, i) => `M${x + w * 0.22} ${Y + 44 + i * 13}h${w * 0.56}`).join("")} stroke="#000" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round" />
      <path d={Array.from({ length: 6 }, (_, i) => `M${x + w * 0.22} ${Y + 47 + i * 13}h${w * 0.56}`).join("")} stroke="#fff" strokeOpacity=".08" strokeWidth="2" strokeLinecap="round" />
      <rect x={x + w / 2 - 34} y={Y + 140} width="68" height="34" rx="3" fill="#07080a" />
      <Digits value={num} x={x + w / 2 - 18} y={Y + 148} h={18} color={lit} />
      <path d={`M${x + 14} ${Y + 210}h${w - 28}M${x + 14} ${Y + H - 90}h${w - 28}`} stroke="#fff" strokeOpacity=".06" strokeWidth="3" />
      <rect x={x} y={Y} width="3" height={H} fill="#fff" opacity=".12" />
    </g>
  );
}

/** Candado de cuatro ruedas: cada una muestra el dígito marcado (o una raya si falta). */
function Dial({ digits, status, misses, accent }: { digits: string; status: LockerStatus; misses: number; accent: string }) {
  const ok = status === "unlocking" || status === "open";
  return (
    <g transform="translate(479 486) scale(1.22) translate(-479 -486)"><g key={misses} className={status === "wrong" ? "lk-shake" : undefined}>
      <rect x="452" y="400" width="54" height="172" rx="6" fill="#0d0f13" stroke={ok ? accent : "#3b424c"} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => {
        const y = 414 + i * 38;
        const d = digits[i];
        return (
          <g key={i}>
            <rect x="460" y={y} width="38" height="32" rx="4" fill="#1b1f26" />
            <rect x="460" y={y} width="38" height="8" rx="4" fill="#fff" opacity=".07" />
            <path d={`M462 ${y + 4}v24M496 ${y + 4}v24`} stroke="#000" strokeOpacity=".5" strokeWidth="3" />
            <text x="479" y={y + 23} textAnchor="middle" fontFamily="monospace" fontWeight="800" fontSize="20" fill={d ? (ok ? accent : "#eef1f5") : "#59616d"}>{d ?? "–"}</text>
          </g>
        );
      })}
      <rect className={ok ? "lk-latch is-open" : "lk-latch"} x="506" y="470" width="22" height="34" rx="3" fill="#8e98a5" />
      <circle cx="479" cy="589" r="5" fill={ok ? accent : status === "wrong" ? "#ff6b5a" : "#3b424c"} />
    </g></g>
  );
}

/**
 * Locker del regalo: una fila de lockers de acero en el vestuario, el del medio con candado de combinación. Al marcar
 * la correcta, el pestillo corre, la puerta gira sobre la bisagra y se prende la luz de adentro.
 */
export function LockerArt({ u, c, digits, status, misses, swing }: Props) {
  const cos = Math.cos(swing * 1.9);
  const back = cos < 0;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={250} light="#eef3ff" power={0.7} seed={21} />
      <Door u={u} x={-30} w={270} lit="#59616d" num="23" />
      <Door u={u} x={560} w={270} lit="#59616d" num="25" />
      {/* Adentro: pared, estante, toalla y la luz que se enciende al abrir. */}
      <rect x={X} y={Y} width={W} height={H} fill="#07080a" />
      <g style={{ opacity: Math.min(1, swing * 1.6) }}>
        <Glow cx={400} cy={Y + 40} rx={200} ry={60} color={c.accent} o={0.9} />
        <path d={`M${X + 20} ${Y + 16}H${X + W - 20}L${X + W} ${FLOOR}H${X}Z`} fill={c.accent} opacity=".12" filter={`url(#${u}-blur)`} />
        <Glow cx={400} cy={FLOOR - 120} rx={150} ry={150} color="#fff7e0" o={0.35} />
        <rect x={X + 70} y={Y + 18} width={W - 140} height="8" rx="3" fill="#fffdf2" />
        <Dust x={X + 20} y={Y + 40} w={W - 40} h={460} n={18} seed={4} r={1.8} color="#fffdf2" o={0.5} />
      </g>
      <rect x={X + 10} y={Y + 300} width={W - 20} height="10" fill="#1d2229" />
      <g transform={`translate(${X + 40} ${Y + 120})`}><Towel x={0} y={0} w={46} h={120} color="#d9d4c6" /></g>
      <rect x={X} y={Y} width={W} height={H} fill="none" stroke="#000" strokeWidth="6" />
      {/* La puerta gira sobre la bisagra izquierda: se achica y, pasada la mitad, se ve su cara de adentro. */}
      <g transform={`translate(${X} 0) scale(${cos} 1) skewY(${-swing * 8}) translate(${-X} 0)`}>
        {back ? (
          <g><rect x={X} y={Y} width={W} height={H} fill="#14171c" /><rect x={X} y={Y} width={W} height={H} fill={`url(#${u}-v)`} opacity=".6" /></g>
        ) : (
          <g>
            <Door u={u} x={X} w={W} lit={c.accent} num="24" />
            <Dial digits={digits} status={status} misses={misses} accent={c.accent} />
          </g>
        )}
      </g>
      <rect x={X - 6} y={Y + 60} width="8" height="40" rx="2" fill="#8e98a5" />
      <rect x={X - 6} y={FLOOR - 120} width="8" height="40" rx="2" fill="#8e98a5" />
      <rect x="-40" y={Y - 14} width="880" height="16" fill="#14171c" />
      <rect x="-40" y={FLOOR - 4} width="880" height="10" fill="#0c0e11" />
    </g>
  );
}

export const LOCKER_CSS = `
.lk-shake { animation: lk-shake 420ms cubic-bezier(.36,.07,.19,.97) both; transform-box: fill-box; }
@keyframes lk-shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-7px); } 40%, 60% { transform: translateX(7px); } }
.lk-latch { transition: transform 360ms cubic-bezier(.34,1.56,.64,1); transform-box: fill-box; }
.lk-latch.is-open { transform: translateX(-26px); }
@media (prefers-reduced-motion: reduce) { .lk-shake { animation: none; } .lk-latch { transition: none; } }
`;
