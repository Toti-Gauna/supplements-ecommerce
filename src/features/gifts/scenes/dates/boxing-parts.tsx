import { Glow } from "@/components/illustrations/campaigns/b-stage";
import { tone } from "@/components/illustrations/supplements/defs";
import { FLOOR } from "../stage/types";

/** Piezas del rincón del ring (coordenadas del escenario). Ilustración: colores literales. */
export const CORNER = { post: 700, top: 270, stool: [606, 694] as const, bell: [700, 300] as const };
const ROPES = ["#c1272d", "#f4f4ef", "#1f4fb8"];

/** Lona del ring iluminada (clara al centro, como bajo la lámpara) y el poste del rincón con sus tres cuerdas. */
export function Corner({ accent }: { accent: string }) {
  const p = CORNER.post;
  return (
    <g>
      <path d={`M0 ${FLOOR}H800V1000H0Z`} fill="#7d776c" />
      <Glow cx={400} cy={860} rx={520} ry={200} color="#f2ece0" o={0.75} />
      <path d={`M0 ${FLOOR}H800`} stroke="#000" strokeOpacity=".35" strokeWidth="6" />
      <rect x={p - 13} y={CORNER.top} width="26" height={FLOOR - CORNER.top + 6} fill="#20242b" />
      <rect x={p - 13} y={CORNER.top} width="7" height={FLOOR - CORNER.top + 6} fill="#fff" opacity=".16" />
      <rect x={p - 22} y={CORNER.top + 130} width="44" height="230" rx="10" fill="#7a1018" />
      <rect x={p - 22} y={CORNER.top + 130} width="12" height="230" rx="6" fill="#fff" opacity=".14" />
      <rect x={p - 22} y={CORNER.top + 240} width="44" height="6" fill={accent} opacity=".9" />
      {ROPES.map((col, i) => {
        const y = 440 + i * 70;
        return (
          <g key={col} strokeLinecap="round">
            <path d={`M-20 ${y + 36}L${p} ${y}L840 ${y + 74}`} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="13" transform="translate(0 5)" />
            <path d={`M-20 ${y + 36}L${p} ${y}L840 ${y + 74}`} fill="none" stroke={col} strokeWidth="11" />
            <path d={`M-20 ${y + 32}L${p} ${y - 4}L840 ${y + 70}`} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" />
          </g>
        );
      })}
    </g>
  );
}

/** Campana del ring en lo alto del poste: bronce con brillo, el martillo y, al sonar, las ondas. */
export function Bell({ ringing, accent }: { ringing: boolean; accent: string }) {
  const [x, y] = CORNER.bell;
  return (
    <g>
      {ringing && <Glow cx={x} cy={y} rx={130} ry={130} color={accent} o={0.8} />}
      <path d={`M${x} ${y - 34}v-14`} stroke="#3a3f47" strokeWidth="8" />
      <path d={`M${x - 46} ${y + 26}Q${x - 46} ${y - 40} ${x} ${y - 40}Q${x + 46} ${y - 40} ${x + 46} ${y + 26}Z`} fill="#b07a1e" />
      <path d={`M${x - 34} ${y + 18}Q${x - 36} ${y - 26} ${x - 6} ${y - 32}`} fill="none" stroke="#ffe29a" strokeWidth="6" strokeLinecap="round" opacity=".8" />
      <rect x={x - 52} y={y + 22} width="104" height="10" rx="5" fill="#8a5c12" />
      <circle cx={x} cy={y - 4} r="9" fill="#5a3c0c" />
      {ringing && (
        <g className="op-in" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round">
          {[64, 92, 120].map((r) => <path key={r} d={`M${x - r} ${y - r * 0.4}A${r} ${r} 0 0 1 ${x - r * 0.4} ${y - r}M${x + r * 0.4} ${y - r}A${r} ${r} 0 0 1 ${x + r} ${y - r * 0.4}`} opacity={1.2 - r / 120} />)}
        </g>
      )}
    </g>
  );
}

/** Banquito del rincón (madera y acero): el regalo aparece arriba. */
export function Stool({ lit, accent }: { lit: boolean; accent: string }) {
  const [x, y] = CORNER.stool;
  return (
    <g>
      {lit && <Glow cx={x} cy={y} rx={150} ry={60} color={accent} o={0.6} />}
      <path d={`M${x - 40} ${y + 8}L${x - 52} ${FLOOR + 4}M${x + 40} ${y + 8}L${x + 52} ${FLOOR + 4}M${x - 46} ${y + 50}H${x + 46}`} stroke="#2b3038" strokeWidth="8" strokeLinecap="round" />
      <rect x={x - 54} y={y - 2} width="108" height="14" rx="3" fill="#6b4626" />
      <rect x={x - 54} y={y - 2} width="108" height="4" rx="2" fill="#fff" opacity=".22" />
      <ellipse cx={x} cy={FLOOR + 6} rx="66" ry="8" fill="#000" opacity=".35" />
    </g>
  );
}

/** Manopla del entrenador de frente: almohadilla de cuero, borde grueso y el blanco del centro (se enciende si es la que toca). */
export function Mitt({ x, y, accent, hot }: { x: number; y: number; accent: string; hot: boolean }) {
  return (
    <g>
      {hot && <Glow cx={x} cy={y} rx={70} ry={80} color={accent} o={0.7} />}
      <ellipse cx={x} cy={y} rx="40" ry="48" fill="#14161b" />
      <ellipse cx={x - 3} cy={y - 3} rx="32" ry="39" fill="#2a2d34" />
      <ellipse cx={x - 3} cy={y - 3} rx="20" ry="25" fill={hot ? accent : "#3a3e47"} />
      <ellipse cx={x - 3} cy={y - 3} rx="8" ry="10" fill="#0b0c0e" opacity=".8" />
      <path d={`M${x - 26} ${y - 26}Q${x - 6} ${y - 42} ${x + 16} ${y - 34}`} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** Tu guante en primera persona (lo ves desde atrás): cuero con brillo, costura de nudillos, pulgar y el puño con la banda. */
export function FpGlove({ x, y, flip, leather, accent }: { x: number; y: number; flip?: boolean; leather: string; accent: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M-62 70Q-70 150-60 190H60Q70 150 62 70Z" fill="#ece6d8" />
      <path d="M-64 96H64V124H-64Z" fill="#14161b" />
      <path d="M-64 102H64" stroke={accent} strokeWidth="3" />
      <path d="M-96 0Q-104-108 0-118Q104-108 96 0Q90 92 0 100Q-90 92-96 0Z" fill={leather} />
      <path d="M-96 0Q-104-108 0-118Q104-108 96 0Q90 92 0 100Q-90 92-96 0Z" fill={tone(leather, -0.6)} opacity=".35" transform="translate(10 8) scale(.96)" />
      <path d="M-70-64Q-30-100 30-96" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="14" strokeLinecap="round" />
      <path d="M-80-6Q0-40 80-6" fill="none" stroke={tone(leather, -0.45)} strokeWidth="4" />
      <path d="M70 6Q118 0 112 50Q104 82 66 72" fill={tone(leather, -0.12)} />
      <path d="M70 6Q118 0 112 50" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="4" />
    </g>
  );
}
