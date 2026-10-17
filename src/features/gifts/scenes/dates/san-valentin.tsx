import { Bench } from "@/components/illustrations/campaigns/b-gear";
import { Pack, PACK } from "@/components/illustrations/campaigns/b-packs";
import { Digits, Glow } from "@/components/illustrations/campaigns/b-stage";
import { Footing, GymBackdrop } from "../stage/backdrop";
import { lerp, type OpeningArtProps } from "../stage/types";

const SCREEN = { x: 150, y: 170, w: 500, h: 250 };

/** Trazo de pulso: línea base con un latido cada `gap`; `amp` crece con las pulsaciones. */
function ecg(y: number, amp: number, gap: number, shift: number): string {
  let d = `M${SCREEN.x + 20} ${y}`;
  for (let x = SCREEN.x + 20 + shift; x < SCREEN.x + SCREEN.w - 40; x += gap) {
    d += `L${x} ${y}l8 ${-amp * 0.18}l6 ${amp * 0.18}l8 ${amp * 0.3}l7 ${-amp * 1.3}l8 ${amp * 1.5}l6 ${-amp * 0.5}`;
  }
  return `${d}L${SCREEN.x + SCREEN.w - 20} ${y}`;
}

/**
 * San Valentín: el pulsómetro de a dos. Cada toque acelera los dos pulsos de la pantalla del box (el tuyo y el de
 * quien te lo regala); se acercan, en la última se sincronizan en uno solo y el regalo aparece en el banco.
 */
export default function SanValentin({ u, c, t, steps, step, opened }: OpeningArtProps) {
  const k = opened ? 1 : t / steps;
  const bpm = Math.round(lerp(88, 188, opened ? 1 : step / steps));
  const gap = lerp(150, 62, k);
  const amp = lerp(24, 46, k);
  const split = lerp(70, 0, opened ? 1 : k * 0.85);
  const mid = SCREEN.y + 140;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={260} light="#ffe3ea" seed={43} />
      <Glow cx={400} cy={SCREEN.y + 120} rx={360} ry={180} color={c.accent} o={0.15 + 0.4 * k} />
      <rect x={SCREEN.x - 14} y={SCREEN.y - 14} width={SCREEN.w + 28} height={SCREEN.h + 28} rx="12" fill="#0b0b0e" />
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="4" fill="#06070a" />
      <path d={Array.from({ length: 9 }, (_, i) => `M${SCREEN.x + i * 62} ${SCREEN.y}v${SCREEN.h}`).join("") + Array.from({ length: 5 }, (_, i) => `M${SCREEN.x} ${SCREEN.y + i * 62}h${SCREEN.w}`).join("")}
        stroke={c.accent} strokeOpacity=".07" />
      <path d={ecg(mid - split / 2, amp, gap, (t * 40) % gap)} stroke="#ffffff" strokeOpacity=".8" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <path d={ecg(mid + split / 2, amp, gap, ((t * 40) + gap * 0.3 * (1 - k)) % gap)} stroke={c.accent} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      <path d={ecg(mid + split / 2, amp, gap, ((t * 40) + gap * 0.3 * (1 - k)) % gap)} stroke={c.accent} strokeWidth="10" strokeOpacity=".18" fill="none" strokeLinejoin="round" />
      <rect x={SCREEN.x + SCREEN.w - 156} y={SCREEN.y + 16} width="140" height="62" rx="4" fill="#0e0f13" />
      <Digits value={String(bpm).padStart(3, " ")} x={SCREEN.x + SCREEN.w - 144} y={SCREEN.y + 26} h={42} color={k > 0.7 ? c.accent : "#ffffff"} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={SCREEN.x + 24 + i * 34} y={SCREEN.y + 26} width="26" height="14" rx="2" fill={i <= Math.round(k * 4) ? c.accent : "#1d1f25"} opacity={0.4 + i * 0.15} />
      ))}
      <rect x={SCREEN.x + SCREEN.w / 2 - 6} y={SCREEN.y + SCREEN.h + 14} width="12" height="40" fill="#1b1d22" />
      <Bench u={u} x={250} y={640} w={300} />
      <Footing u={u} x={400} w={190} light="#ffe3ea" />
      {/* De a dos: un shaker para cada uno al pie del banco. */}
      <Pack u={u} kind="shaker" x={150} y={925} s={0.62} p={{ ...PACK.house, body: "#dfe5ee", ink: "#0b0d10" }} tint={c.accent} />
      <Pack u={u} kind="shaker" x={650} y={925} s={0.62} p={PACK.house} tint="#e5576f" />
    </g>
  );
}
