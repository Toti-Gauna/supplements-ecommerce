import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

const CELESTE = "#74acdf", GOLD = "#f3d27a", EDGE = "#bfb196";
// Ancho de cada hoja de la puerta por golpe (1 = cerrada); al abrir quedan casi de canto.
const LEAF = [1, 0.93, 0.84, 0.73, 0.6];
const STARS = Array.from({ length: 16 }, (_, i) => ({ x: 8 + rand(i + 500) * 284, y: 6 + rand(i + 530) * 92, r: 0.6 + rand(i + 560) * 1.1 }))
  .filter((s) => Math.abs(s.x - 150) > 40);
// Fuegos artificiales: centro, radio, color y demora.
const FIREWORKS = [{ x: 60, y: 60, r: 34, c: CELESTE, d: 250 }, { x: 232, y: 50, r: 36, c: GOLD, d: 420 }, { x: 112, y: 28, r: 22, c: "#ffffff", d: 600 }];

/** Columna salomónica: fuste con bandas en espiral, basa y capitel. */
function Column({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="140" width="12" height="96" fill="url(#in-col)" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} fill="none" strokeLinecap="round">
          <path d={`M${x} ${141 + i * 8}q6 1 12 6`} stroke={EDGE} strokeWidth="1.8" />
          <path d={`M${x + 1} ${145 + i * 8}q5 .8 10 5`} stroke="#fff" strokeOpacity=".7" strokeWidth="1" />
        </g>
      ))}
      <rect x={x - 3} y="132" width="18" height="8" rx="1" fill="#efe6d2" stroke={EDGE} strokeWidth=".8" />
      <rect x={x - 3} y="236" width="18" height="8" rx="1" fill="#e6dcc6" stroke={EDGE} strokeWidth=".8" />
    </g>
  );
}

/** Ventana con reja de hierro; al abrir se enciende por dentro. */
function Window({ x, lit }: { x: number; lit: boolean }) {
  return (
    <g>
      <rect x={x - 5} y="143" width="56" height="7" rx="1" fill="#e6dcc6" stroke={EDGE} strokeWidth=".6" />
      <rect x={x} y="150" width="46" height="70" fill="#262d3b" />
      <rect x={x} y="150" width="46" height="70" fill="url(#in-warm)" className="in-lit" style={{ opacity: lit ? 1 : 0 }} />
      <path d={`M${x} 150h8v70h-8zM${x + 38} 150h8v70h-8z`} fill="#5a3b22" opacity=".85" />
      <g stroke="#1b1f26" strokeWidth="2" fill="none">
        {[5, 14, 23, 32, 41].map((d) => <path key={d} d={`M${x + d} 146v76`} />)}
        <path d={`M${x - 2} 168h50M${x - 2} 198h50`} />
        {[5, 23, 41].map((d) => <path key={d} d={`M${x + d - 4} 146q4-8 8 0`} strokeWidth="1.4" />)}
      </g>
      <rect x={x - 6} y="220" width="58" height="6" rx="1" fill="#d8ccb2" />
    </g>
  );
}

/** Hoja izquierda de la puerta (la derecha es su espejo): madera, cuarterones, clavos y llamador. */
function Leaf() {
  return (
    <>
      <path d="M116 238V174A34 34 0 0 1 150 140V238Z" fill="url(#in-wood)" stroke="#3e2412" strokeWidth="1" />
      <path d="M121 176A29 29 0 0 1 145 146.5V176Z" fill="#000" opacity=".18" />
      <rect x="121" y="182" width="24" height="24" rx="1.5" fill="#000" opacity=".2" /><rect x="121" y="212" width="24" height="21" rx="1.5" fill="#000" opacity=".2" />
      <path d="M121 206h24M121 233h24" stroke="#fff" strokeOpacity=".16" />
      {[186, 202, 216, 229].map((y) => [125, 133, 141].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#d9b777" opacity=".8" />))}
      <circle cx="143" cy="196" r="3.6" fill="none" stroke="#d9b777" strokeWidth="1.4" />
      <path d="M150 140V238" stroke={GOLD} strokeWidth="2" className="in-edge" />
    </>
  );
}

/** 9 de Julio: la Casa de Tucumán de noche. Cada golpe entreabre las puertas; al abrir, la luz inunda y hay fuegos artificiales. */
export default function IndependenceGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const s = opened ? 0.12 : LEAF[hits] ?? 0.6;
  const gap = 1 - s, p = opened ? 1 : hits / total;
  const leaf = { transform: `scaleX(${s})` };
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 60} colors={[GOLD, "#fff4d6", "#e6dcc6"]} shape={hits % 2 ? "star" : "dot"} count={8} y={64} spread={0.8} size={6} />}
        {opened && <RevealBurst colors={[GOLD, "#ffffff", CELESTE, "#fff4d6"]} shapes={["star", "dot"]} y={62} />}
      </>
    )}>
      <SceneStyle id="independencia" css={CSS} />
      <defs>
        <radialGradient id="in-sky" cx=".5" cy=".42" r=".5"><stop offset="0" stopColor="#24508a" stopOpacity=".75" /><stop offset=".6" stopColor="#0a1830" stopOpacity=".5" /><stop offset="1" stopColor="#0a1830" stopOpacity="0" /></radialGradient>
        <linearGradient id="in-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf7ee" /><stop offset="1" stopColor="#e3d8c0" /></linearGradient>
        <linearGradient id="in-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d9cdb3" /><stop offset=".4" stopColor="#fbf7ee" /><stop offset="1" stopColor="#cbbd9f" /></linearGradient>
        <linearGradient id="in-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a341c" /><stop offset=".6" stopColor="#7a4a2a" /><stop offset="1" stopColor="#6a3e22" /></linearGradient>
        <radialGradient id="in-inside" cx=".5" cy=".62" r=".7"><stop offset="0" stopColor="#fffbe8" /><stop offset=".45" stopColor="#ffe9a8" /><stop offset="1" stopColor="#e0a94a" /></radialGradient>
        <radialGradient id="in-slit"><stop offset="0" stopColor="#fff4d0" stopOpacity=".95" /><stop offset=".4" stopColor={GOLD} stopOpacity=".45" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
        <linearGradient id="in-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".85" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
        <radialGradient id="in-warm" cx=".5" cy=".7" r=".7"><stop offset="0" stopColor="#ffe9a8" /><stop offset="1" stopColor="#d9963a" /></radialGradient>
      </defs>
      <circle cx="150" cy="150" r="150" fill="url(#in-sky)" />
      {STARS.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff" opacity={0.35 + (i % 3) * 0.2} />)}
      <Glow color={GOLD} hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="140" ry="8" fill="#000" opacity=".35" />

      {/* Fuegos artificiales celestes, blancos y dorados (detrás de la casa). */}
      {opened && !reduce && FIREWORKS.map((f) => (
        <g key={f.x} transform={`translate(${f.x} ${f.y})`}>
          <path className="in-trail" d="M0 4v18" stroke={f.c} strokeWidth="2" strokeLinecap="round" style={{ animationDelay: `${f.d - 250}ms` }} />
          <g className="in-fw" style={{ animationDelay: `${f.d}ms` } as CSSProperties}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2, c = i % 2 ? f.c : "#fff4d6";
              return (
                <g key={i}>
                  <path d={`M${Math.cos(a) * f.r * 0.25} ${Math.sin(a) * f.r * 0.25}L${Math.cos(a) * f.r} ${Math.sin(a) * f.r}`} stroke={c} strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx={Math.cos(a) * f.r * 1.12} cy={Math.sin(a) * f.r * 1.12} r="1.8" fill={c} />
                </g>
              );
            })}
          </g>
        </g>
      ))}
      {/* Fachada encalada con techo de tejas y zócalo. */}
      <rect x="16" y="124" width="268" height="128" fill="url(#in-wall)" />
      <path d="M10 126L18 112H282L290 126Z" fill="#b5583a" /><path d="M10 126H290" stroke="#7d3520" strokeWidth="2" />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${20 + i * 12} 113q6 7 12 0`} stroke="#8f4129" strokeWidth="1.2" fill="none" />)}
      <rect x="16" y="126" width="268" height="5" fill="#000" opacity=".08" />
      <rect x="16" y="238" width="268" height="14" fill="#d8ccb2" /><path d="M16 238H284" stroke={EDGE} />
      <Window x={30} lit={opened} /><Window x={224} lit={opened} />

      {/* Portada: frontis curvo con volutas, entablamento y la bandera arriba. */}
      <path d="M150 82V46" stroke="#8a8170" strokeWidth="1.6" />
      <path className={`in-flag ${opened ? "is-open" : ""}`} d="M151 47q7-2 13 0t12 0v16q-6-2-12 0t-13 0z" fill={CELESTE} />
      <path d="M151 52.5q7-2 13 0t12 0v5q-6-2-12 0t-13 0z" fill="#fff" />
      <path d="M90 126C90 108 108 108 116 98C125 87 137 82 150 80C163 82 175 87 184 98C192 108 210 108 210 126Z" fill="#f1e9d8" stroke={EDGE} strokeWidth="1" />
      <path d="M104 120c0-8 6-10 12-14M196 120c0-8-6-10-12-14M128 110q22-20 44 0" stroke={EDGE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="150" cy="104" r="7" fill="none" stroke={EDGE} strokeWidth="1.4" /><circle cx="150" cy="104" r="3" fill={GOLD} opacity=".9" />
      <rect x="88" y="124" width="124" height="9" fill="#efe6d2" stroke={EDGE} strokeWidth=".8" />
      <Column x={98} /><Column x={190} />

      {/* De noche la cal se ve azulada; con cada golpe la entibia la luz de la puerta. */}
      <g className="in-night" fill="#142c55" style={{ opacity: 0.32 * (1 - p) }}>
        <rect x="10" y="112" width="280" height="140" /><path d="M90 126C90 108 108 108 116 98C125 87 137 82 150 80C163 82 175 87 184 98C192 108 210 108 210 126Z" />
      </g>
      <ellipse className="in-night" cx="150" cy="200" rx="120" ry="90" fill="url(#in-slit)" style={{ opacity: opened ? 0.5 : p * 0.32 }} />

      {/* Vano de la puerta: adentro, la luz dorada que se filtra por la rendija. */}
      <path d="M112 238V174A38 38 0 0 1 188 174V238" fill="none" stroke="#e6dcc6" strokeWidth="5" />
      <path d="M116 238V174A34 34 0 0 1 184 174V238Z" fill="url(#in-inside)" />
      <path d="M130 238V188A20 20 0 0 1 170 188V238" stroke="#e0a94a" strokeOpacity=".45" strokeWidth="3" fill="none" />
      <g className={`in-leaf ${opened ? "is-open" : ""}`} style={leaf}><Leaf /></g>
      <g transform="translate(300 0) scale(-1 1)"><g className={`in-leaf ${opened ? "is-open" : ""}`} style={leaf}><Leaf /></g></g>
      <ellipse className="in-slit" cx="150" cy="190" rx="40" ry="62" fill="url(#in-slit)" style={{ opacity: opened ? 0.9 : Math.min(1, p * 1.4), transform: `scaleX(${0.2 + gap * 1.6})` }} />
      <path d="M108 238h84v6h-84zM102 244h96v6h-96z" fill="#e6dcc6" stroke={EDGE} strokeWidth=".6" />
      <path className="in-floor" d="M116 250H184L250 266H50Z" fill="url(#in-floor)" style={{ opacity: opened ? 0.9 : p, transform: `scaleX(${gap})` }} />
      {opened && <circle className="in-flood" cx="150" cy="196" r="150" fill="url(#in-slit)" />}

    </SceneFrame>
  );
}

const CSS = `
.in-leaf { transform-box: fill-box; transform-origin: 0% 50%; transition: transform 700ms cubic-bezier(.34,1.56,.64,1); }
.in-leaf.is-open { animation: in-open 1s cubic-bezier(.2,.8,.3,1) both; }
@keyframes in-open { 0% { transform: scaleX(.6); } 55% { transform: scaleX(.06); } 78% { transform: scaleX(.16); } 100% { transform: scaleX(.12); } }
.in-slit, .in-floor { transform-box: fill-box; transform-origin: 50% 0; transition: transform 700ms cubic-bezier(.34,1.56,.64,1), opacity 500ms; }
.in-slit { transform-origin: 50% 50%; }
.in-lit { transition: opacity 900ms 300ms; }
.in-night { transition: opacity 600ms; }
.in-flood { transform-box: fill-box; transform-origin: 50% 50%; animation: in-flood 1.3s cubic-bezier(.16,1,.3,1) both; }
@keyframes in-flood { 0% { opacity: 0; transform: scale(.2); } 35% { opacity: .95; } 100% { opacity: .45; transform: scale(1); } }
.in-flag.is-open { transform-box: fill-box; transform-origin: 0% 50%; animation: in-flutter .9s ease-in-out 200ms both; }
@keyframes in-flutter { 25% { transform: skewY(-6deg) scaleX(.94); } 55% { transform: skewY(5deg); } 80% { transform: skewY(-2deg); } 100% { transform: none; } }
.in-trail { opacity: 0; transform-box: fill-box; transform-origin: 50% 100%; animation: in-trail 280ms ease-in both; }
@keyframes in-trail { 0% { opacity: 0; transform: translateY(110px); } 30% { opacity: 1; } 100% { opacity: 0; transform: none; } }
.in-fw { opacity: 0; transform-box: view-box; transform-origin: 0 0; animation: in-fw 950ms cubic-bezier(.16,1,.3,1) both; }
@keyframes in-fw { 0% { opacity: 0; transform: scale(.1); } 12% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: scale(1.15) translateY(8px); } }
@media (prefers-reduced-motion: reduce) {
  .in-leaf, .in-slit, .in-floor { transition: opacity 200ms; }
  .in-leaf.is-open { animation: none; transform: scaleX(.12); }
  .in-flood { animation: none; opacity: .45; }
  .in-flag.is-open { animation: none; }
}
`;
