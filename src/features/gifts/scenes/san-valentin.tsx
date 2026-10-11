import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

/** Corazón de 24 × 19 centrado en (0, 0). */
const HEART = "M0 9 C-14 0 -12 -10 -6 -10 C-3 -10 -1 -8 0 -6 C1 -8 3 -10 6 -10 C12 -10 14 0 0 9 Z";
/** Línea por donde se parte el lacre (centro en 150, 186); las grietas secundarias aparecen en el golpe `at`. */
const SPLIT = [[151, 150], [150, 170], [146, 178], [153, 186], [147, 194], [152, 202], [149, 210], [150, 226]];
const pts = (list: number[][]) => list.map(([x, y]) => `${x} ${y}`).join(" L");
const MAIN = `M${pts(SPLIT.slice(1, 7))}`;
const BRANCHES = [
  { d: "M153 186 L164 181 L172 184", at: 2 }, { d: "M147 194 L136 198 L129 195", at: 3 },
  { d: "M146 178 L136 173 L130 176", at: 4 }, { d: "M152 202 L160 206 L163 211", at: 4 },
];
const FLOATS = Array.from({ length: 8 }, (_, i) => ({ left: 22 + rand(i + 3) * 56, top: 26 + rand(i + 11) * 22, delay: 420 + i * 80, drift: (rand(i * 5 + 1) - 0.5) * 110, size: 12 + rand(i + 21) * 10 }));
const FLAP_EDGE = "M42 108 L141 188 Q150 195 159 188 L258 108";

/** San Valentín: carta con lacre en forma de corazón. Cada golpe lo agrieta; al abrir se voltea la solapa y sube la carta. */
export default function ValentineGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const open = opened ? " is-open" : "";
  const lift = opened ? 1 : [1, 1, 0.985, 0.962, 0.93][hits] ?? 0.93;
  const crack = opened ? 1 : [0, 0.45, 0.72, 1, 1][hits] ?? 1;
  const apart = opened ? 0 : [0, 0.3, 0.6, 1, 1.7][hits] ?? 1.7;
  const half = (side: -1 | 1) => ({ transform: `translate(${side * apart}px, ${-(1 - lift) * 86}px) rotate(${side * apart * 2.5}deg)` });
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 40} colors={["#ffd1dc", "#ff8fab", "#a8274a"]} shape="heart" count={7} y={60} spread={0.75} size={11} />}
        {opened && (
          <>
            <RevealBurst colors={["#ffd1dc", "#ff8fab", "#a8274a", "#fff4d6"]} shapes={["heart", "star", "heart"]} y={30} />
            {FLOATS.map((f, i) => (
              <span key={i} className="sv-float absolute" style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size * 0.9, animationDelay: `${f.delay}ms`, "--drift": `${f.drift}px` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="san-valentin" css={CSS} />
      <defs>
        <linearGradient id="sv-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fdf6ea" /><stop offset=".6" stopColor="#f2e3cb" /><stop offset="1" stopColor="#e0c8a4" /></linearGradient>
        <linearGradient id="sv-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ecdabd" /><stop offset="1" stopColor="#fcf4e6" /></linearGradient>
        <linearGradient id="sv-lining" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6e1230" /><stop offset="1" stopColor="#b8304f" /></linearGradient>
        <pattern id="sv-hearts" width="18" height="16" patternUnits="userSpaceOnUse"><path d={HEART} fill="#ffd1dc" opacity=".22" transform="translate(9 8) scale(.36)" /></pattern>
        <radialGradient id="sv-wax" gradientUnits="userSpaceOnUse" cx="140" cy="174" r="42"><stop offset="0" stopColor="#e04b72" /><stop offset=".5" stopColor="#a8274a" /><stop offset="1" stopColor="#6a1230" /></radialGradient>
        <linearGradient id="sv-heart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7b9c" /><stop offset=".55" stopColor="#d83a63" /><stop offset="1" stopColor="#a8274a" /></linearGradient>
        <filter id="sv-blur" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><feGaussianBlur stdDeviation="4" /></filter>
        <clipPath id="sv-clip"><rect x="44" y="0" width="212" height="246" /></clipPath>
        <clipPath id="sv-cut-l"><path d={`M100 150 L${pts(SPLIT)} L100 226 Z`} /></clipPath>
        <clipPath id="sv-cut-r"><path d={`M200 150 L${pts(SPLIT)} L200 226 Z`} /></clipPath>
        {/* Lacre en forma de corazón con sus grietas: se dibuja en dos mitades que se separan al romperse. */}
        <g id="sv-seal">
          <path d={HEART} fill="#7a1636" transform="translate(150 187) scale(2.9)" />
          <path d={HEART} fill="url(#sv-wax)" transform="translate(150 186) scale(2.6)" />
          <path d={HEART} fill="none" stroke="#5a0d26" strokeWidth=".8" opacity=".6" transform="translate(150 185.5) scale(2.05)" />
          <path d={HEART} fill="none" stroke="#f08aa6" strokeWidth=".5" opacity=".5" transform="translate(150 186.6) scale(2.05)" />
          <path d={HEART} fill="#8e1b3c" transform="translate(150 185) scale(1.15)" />
          <path d={HEART} fill="none" stroke="#f590ab" strokeWidth=".8" opacity=".75" transform="translate(149.4 184.3) scale(1.15)" />
          <path d="M127 170 Q130 162 139 161" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".4" />
          <path d={MAIN} pathLength={1} className="sv-crack" stroke="#ff9db5" strokeWidth="3" opacity=".45" style={{ strokeDashoffset: 1 - crack }} />
          <path d={MAIN} pathLength={1} className="sv-crack" stroke="#2e0410" strokeWidth="1.8" style={{ strokeDashoffset: 1 - crack }} />
          {BRANCHES.map((b) => <path key={b.d} d={b.d} pathLength={1} className="sv-crack" stroke="#2e0410" strokeWidth="1.4" style={{ strokeDashoffset: hits >= b.at || opened ? 0 : 1 }} />)}
        </g>
      </defs>
      <Glow color="#ff8fab" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="256" rx="110" ry="9" fill="#000" opacity=".38" />

      <g className="sv-env" style={{ transform: `rotate(${opened ? 0 : [0, -2, 2.5, -3, 3.5][hits] ?? 0}deg)` }}>
        <g className={hits === 0 ? "" : hits % 2 ? "sv-shake-a" : "sv-shake-b"}>
          {/* Interior: forro bordó con corazoncitos, solapa abierta (atrás) y la carta. */}
          <g className={`sv-flap-back${open}`}>
            <path d="M44 108 L140 34 Q150 27 160 34 L256 108 Z" fill="url(#sv-lining)" stroke="#f2e3cb" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M44 108 L140 34 Q150 27 160 34 L256 108 Z" fill="url(#sv-hearts)" />
          </g>
          <rect x="44" y="108" width="212" height="138" fill="url(#sv-lining)" />
          <rect x="44" y="108" width="212" height="138" fill="url(#sv-hearts)" />
          <g clipPath="url(#sv-clip)">
            <g className={`sv-letter${open}`}>
              <rect x="66" y="120" width="168" height="170" rx="4" fill="#fffaf3" />
              <rect x="72" y="126" width="156" height="158" rx="2" fill="none" stroke="#ffd1dc" strokeWidth="1.5" />
              <g transform="translate(150 176)"><g className={`sv-big${open}`}>
                <path d={HEART} fill="url(#sv-heart)" transform="scale(3)" />
                <path d="M-22 -18 Q-15 -26 -6 -22" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity=".55" />
              </g></g>
              <text x="150" y="223" textAnchor="middle" fontFamily="var(--font-display, serif)" fontStyle="italic" fontSize="15" fill="#a8274a">Con amor</text>
              <path d="M102 234 H198 M112 244 H188" stroke="#e9c2cc" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>

          {/* Frente del sobre (bolsillo) con sus pliegues. */}
          <path d="M44 108 L150 180 L256 108 L256 246 L44 246 Z" fill="url(#sv-paper)" />
          <path d="M44 246 L132 186 M256 246 L168 186" stroke="#cfb48c" strokeWidth="1.4" opacity=".8" />
          <path d="M44 108 L150 180 L256 108" stroke="#d8c09a" strokeWidth="1.2" fill="none" />
          <text x="58" y="236" fontFamily="var(--font-display, serif)" fontStyle="italic" fontSize="12" fill="#a8274a" opacity=".75">para vos</text>
          {[[228, 232, 0.42], [238, 225, 0.32], [245, 234, 0.26]].map(([x, y, s]) => <path key={x} d={HEART} fill="#d8436a" opacity=".7" transform={`translate(${x} ${y}) scale(${s})`} />)}

          {/* Solapa cerrada: se levanta un poco con cada golpe (escapa luz rosa) y se voltea al abrir. */}
          <g className={`sv-flap${open}`} style={{ transform: `scaleY(${lift})` }}>
            <path d={FLAP_EDGE} stroke="#ff6f93" strokeWidth="8" fill="none" filter="url(#sv-blur)" style={{ opacity: [0, 0.15, 0.4, 0.7, 1][hits] ?? 1, transition: "opacity 400ms" }} />
            <path d={`${FLAP_EDGE} Z`} fill="#3a0d1a" opacity=".1" transform="translate(0 3)" />
            <path d={`${FLAP_EDGE} Z`} fill="url(#sv-flap)" stroke="#d3b98f" strokeWidth="1.4" strokeLinejoin="round" />
          </g>

          {/* Sello de lacre partido en dos mitades. */}
          <g className={`sv-half sv-l${open}`} style={half(-1)}><use href="#sv-seal" clipPath="url(#sv-cut-l)" /></g>
          <g className={`sv-half sv-r${open}`} style={half(1)}><use href="#sv-seal" clipPath="url(#sv-cut-r)" /></g>
        </g>
      </g>
    </SceneFrame>
  );
}

const CSS = `
.sv-env, .sv-shake-a, .sv-shake-b { transform-box: view-box; transform-origin: 150px 246px; }
.sv-env { transition: transform 460ms cubic-bezier(.34,1.56,.64,1); }
.sv-shake-a { animation: sv-shake-a 420ms ease-out; }
.sv-shake-b { animation: sv-shake-b 420ms ease-out; }
@keyframes sv-shake-a { 20% { transform: rotate(-1.6deg); } 40% { transform: rotate(1.4deg); } 60% { transform: rotate(-1deg); } 80% { transform: rotate(.5deg); } }
@keyframes sv-shake-b { 20% { transform: rotate(1.6deg); } 40% { transform: rotate(-1.4deg); } 60% { transform: rotate(1deg); } 80% { transform: rotate(-.5deg); } }
.sv-crack { fill: none; stroke-dasharray: 1; stroke-linejoin: round; transition: stroke-dashoffset 420ms cubic-bezier(.16,1,.3,1); }
.sv-flap, .sv-flap-back { transform-box: view-box; transform-origin: 150px 108px; transition: transform 420ms cubic-bezier(.34,1.56,.64,1); }
.sv-flap-back { transform: scaleY(0); }
.sv-flap.is-open { animation: sv-flap 420ms cubic-bezier(.5,0,.75,0) both; }
@keyframes sv-flap { to { transform: scaleY(0); } }
.sv-flap-back.is-open { animation: sv-flap-back 420ms cubic-bezier(.16,1,.3,1) 400ms both; }
@keyframes sv-flap-back { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.sv-half { transform-box: view-box; transform-origin: 150px 186px; transition: transform 420ms cubic-bezier(.34,1.56,.64,1); }
.sv-l.is-open { animation: sv-l 700ms cubic-bezier(.3,.6,.5,1) both; }
.sv-r.is-open { animation: sv-r 700ms cubic-bezier(.3,.6,.5,1) both; }
@keyframes sv-l { 20% { transform: translate(-10px,-12px) rotate(-14deg); } 100% { transform: translate(-80px,70px) rotate(-120deg); opacity: 0; } }
@keyframes sv-r { 20% { transform: translate(10px,-12px) rotate(14deg); } 100% { transform: translate(80px,76px) rotate(110deg); opacity: 0; } }
.sv-letter { transform-box: view-box; transform-origin: 150px 200px; }
.sv-letter.is-open { animation: sv-letter 800ms cubic-bezier(.34,1.4,.64,1) 520ms both; }
@keyframes sv-letter { from { transform: translateY(0); } to { transform: translateY(-92px); } }
.sv-big { transform-box: fill-box; transform-origin: 50% 50%; }
.sv-big.is-open { animation: sv-big 700ms cubic-bezier(.34,1.56,.64,1) 820ms both; }
@keyframes sv-big { 0% { transform: scale(.4); } 55% { transform: scale(1.22); } 100% { transform: scale(1); } }
.sv-float { clip-path: path('M5 9C1 6 0 4 0 2.6 0 1 1.2 0 2.6 0 3.6 0 4.4.6 5 1.5 5.6.6 6.4 0 7.4 0 8.8 0 10 1 10 2.6 10 4 9 6 5 9Z'); background: linear-gradient(160deg, #ffd1dc, #e0466f); opacity: 0; animation: sv-float 1.5s ease-out both; }
@keyframes sv-float { 0% { opacity: 0; transform: translate(0,0) scale(.6); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), -130px) scale(1.1) rotate(20deg); } }
@media (prefers-reduced-motion: reduce) {
  .sv-env, .sv-flap, .sv-flap-back, .sv-half, .sv-crack { transition: none; }
  .sv-shake-a, .sv-shake-b { animation: none; }
  .sv-flap.is-open, .sv-l.is-open, .sv-r.is-open { animation: none; opacity: 0; }
  .sv-flap-back.is-open, .sv-big.is-open { animation: none; transform: none; }
  .sv-letter.is-open { animation: none; transform: translateY(-92px); }
}
`;
