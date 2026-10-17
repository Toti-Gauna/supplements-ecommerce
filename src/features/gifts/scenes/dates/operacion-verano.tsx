import { Dust, Glow } from "@/components/illustrations/campaigns/b-stage";
import { FLOOR, type OpeningArtProps } from "../stage/types";

const SAND = "#c9a36a";
/** Costuras que se abren, una por golpe. */
const CRACKS = ["M384 668l10 14-8 12 12 10", "M420 664l-6 16 10 10-4 14", "M360 690l16 6 4 14", "M440 692l-14 8 2 16"];

/** Bolsa de arena (sandbag) acostada: lona militar con dos manijas y el cierre al medio. */
function Sandbag({ u, cracks, accent }: { u: string; cracks: number; accent: string }) {
  return (
    <g>
      <rect x="270" y="640" width="260" height="110" rx="46" fill="#4b4f37" />
      <rect x="270" y="640" width="260" height="110" rx="46" fill={`url(#${u}-v)`} opacity=".6" />
      <path d="M300 650h200M300 740h200" stroke="#000" strokeOpacity=".2" strokeWidth="3" strokeDasharray="6 5" />
      <path d="M330 640q-4-26 22-26h30q26 0 22 26M394 640q-4-26 22-26h30q26 0 22 26" fill="none" stroke="#2b2e20" strokeWidth="10" />
      {CRACKS.slice(0, cracks).map((d, i) => (
        <g key={i}>
          <path d={d} stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" opacity=".35" />
          <path d={d} stroke="#fff7d6" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

/**
 * Operación verano: entrenamiento en la playa al amanecer. Cada toque levanta la bolsa de arena y la estampa contra
 * el piso; vuela arena y se abre una costura con luz. En el último golpe la bolsa se parte y sale el regalo.
 */
export default function OperacionVerano({ u, c, step, steps, opened, reduce }: OpeningArtProps) {
  const cracks = opened ? CRACKS.length : Math.min(step, CRACKS.length);
  return (
    <g>
      {/* Cielo del amanecer, sol bajo y el mar. */}
      <rect width="800" height="560" fill="#0b4f6e" opacity=".55" />
      <Glow cx={560} cy={500} rx={420} ry={260} color="#ffb347" o={0.55} />
      <circle cx="560" cy="500" r="72" fill={c.accent} opacity=".95" />
      <Glow cx={560} cy={500} rx={150} ry={150} color={c.accent} o={0.6} />
      <rect y="540" width="800" height="120" fill="#063247" />
      <path d={Array.from({ length: 6 }, (_, i) => `M${120 + i * 110} ${560 + (i % 3) * 22}h${60 + (i % 2) * 40}`).join("")} stroke="#ffd34d" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 640Q400 610 800 640V1000H0Z" fill="#5c4630" />
      <path d="M0 640Q400 610 800 640V1000H0Z" fill={`url(#${u}-v)`} opacity=".5" />
      <Dust x={0} y={660} w={800} h={340} n={60} seed={61} r={1.6} color="#e9cf9c" o={0.35} />
      <ellipse cx="400" cy={FLOOR - 4} rx="230" ry="22" fill="#000" opacity=".35" />
      {opened ? (
        <g transform="translate(0 30)" opacity=".9">
          <path d="M270 700q20-50 80-46l40 30 30-34q70-4 110 50v40H270Z" fill="#4b4f37" />
          <path d="M290 720q110-30 220 0" stroke={SAND} strokeWidth="18" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g key={step} className={step > 0 && !reduce ? "op-slam" : undefined}><g transform="translate(400 750) scale(1.4) translate(-400 -750)"><Sandbag u={u} cracks={cracks} accent={c.accent} /></g></g>
      )}
      {step > 0 && (
        <g key={`s${step}`} className="op-in">
          <Dust x={230} y={680} w={340} h={90} n={step >= steps || opened ? 40 : 24} seed={67 + step} r={3.2} color={SAND} o={0.8} />
        </g>
      )}
    </g>
  );
}

