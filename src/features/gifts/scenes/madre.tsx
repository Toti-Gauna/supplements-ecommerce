import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

/** Pétalos alrededor de la base de la flor (150, 150). `at` = golpe con el que se abre cada uno. */
const PETALS = [
  { closed: -8, open: -36, at: 3, back: true },
  { closed: 8, open: 36, at: 4, back: true },
  { closed: 0, open: 0, at: 5, back: true },
  { closed: -15, open: -68, at: 1, back: false },
  { closed: 15, open: 68, at: 2, back: false },
] as const;
const PETAL = "M150 150 C124 128 126 84 150 66 C174 84 176 128 150 150 Z";

/** Día de la Madre: una flor en su ramo de papel que se abre pétalo por pétalo, uno en cada golpe. */
export default function MotherGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const petal = (p: (typeof PETALS)[number], i: number) => {
    const isOpen = hits >= p.at || opened;
    const style = { transform: `rotate(${isOpen ? p.open : p.closed}deg) scale(${isOpen ? (p.at === 5 ? 1.12 : 1.04) : 0.62}, ${isOpen ? 1 : 0.94})` } as CSSProperties;
    return (
      <g key={i} className="mg-petal" style={style}>
        <path d={PETAL} fill={p.back ? "url(#mg-back)" : "url(#mg-front)"} />
        <path d="M150 146 C146 120 147 96 150 78" stroke="#fff" strokeOpacity=".35" strokeWidth="1.6" fill="none" />
      </g>
    );
  };
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 4} colors={["#f6b8c8", "#e88aa0", "#c25579"]} shape="petal" count={7} y={34} spread={0.8} size={9} />}
        {opened && (
          <>
            <RevealBurst colors={["#ffe0a8", "#f6b8c8", "#e88aa0", "#fff4d6"]} shapes={["petal", "heart", "star"]} y={36} />
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="mg-float absolute h-3 w-3" style={{ left: `${30 + rand(i) * 40}%`, top: `${26 + rand(i + 9) * 16}%`, animationDelay: `${300 + i * 90}ms`, "--drift": `${(rand(i * 5) - 0.5) * 120}px` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="madre" css={CSS} />
      <defs>
        <linearGradient id="mg-front" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#a9496d" /><stop offset=".55" stopColor="#e07a98" /><stop offset="1" stopColor="#f8c3d1" /></linearGradient>
        <linearGradient id="mg-back" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#8a3557" /><stop offset=".6" stopColor="#c95d82" /><stop offset="1" stopColor="#efa5bb" /></linearGradient>
        <linearGradient id="mg-paper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ead7b8" /><stop offset=".55" stopColor="#d9c09a" /><stop offset="1" stopColor="#bba07a" /></linearGradient>
        <radialGradient id="mg-heart"><stop offset="0" stopColor="#fff4d6" /><stop offset=".6" stopColor="#ffe0a8" /><stop offset="1" stopColor="#d2ad69" /></radialGradient>
      </defs>
      <Glow color="#ffe0a8" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="268" rx="50" ry="7" fill="#000" opacity=".35" />

      {/* Tallo y hojas. */}
      <path d="M150 150 C148 180 152 206 150 236" stroke="#4f6b3a" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M150 196 C126 186 112 168 108 150 C128 154 146 170 150 196 Z" fill="#6f8f5a" />
      <path d="M151 182 C172 170 190 166 200 150 C186 170 168 182 151 188 Z" fill="#86a56f" />

      {/* Flor: pétalos de atrás, centro dorado y pétalos de adelante. */}
      <g className={opened ? "mg-bloom is-open" : "mg-bloom"}>
        {PETALS.map((p, i) => (p.back ? petal(p, i) : null))}
        <g className="mg-heart" style={{ opacity: hits >= 2 || opened ? 1 : 0 }}>
          <circle cx="150" cy="128" r="13" fill="url(#mg-heart)" />
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            return <circle key={i} cx={150 + Math.cos(a) * 16} cy={128 + Math.sin(a) * 16} r="2.4" fill="#d2ad69" />;
          })}
        </g>
        {PETALS.map((p, i) => (p.back ? null : petal(p, i)))}
      </g>

      {/* Ramo de papel madera con cinta rosa. */}
      <path d="M92 168 L208 168 L162 268 L138 268 Z" fill="url(#mg-paper)" />
      <path d="M92 168 L150 190 L208 168 L200 182 L150 202 L100 182 Z" fill="#c9ad86" opacity=".7" />
      <path d="M118 168 L146 268 M182 168 L154 268" stroke="#a88c66" strokeOpacity=".4" strokeWidth="1.2" />
      <g className="mg-ribbon" style={{ transform: `rotate(${opened ? 0 : [0, -5, 6, -8, 9][hits] ?? 0}deg)` }}>
        <path d="M124 226 Q150 236 176 226 L174 236 Q150 246 126 236 Z" fill="#c25579" />
        <path d="M150 232 C136 216 118 218 122 230 C126 242 142 238 150 232 Z M150 232 C164 216 182 218 178 230 C174 242 158 238 150 232 Z" fill="#e07a98" />
        <path d="M147 234 L138 262 L146 258 M153 234 L162 262 L154 258" stroke="#a9496d" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="150" cy="232" r="5" fill="#a9496d" />
      </g>
    </SceneFrame>
  );
}

const CSS = `
.mg-petal { transform-box: view-box; transform-origin: 150px 150px; transition: transform 700ms cubic-bezier(.34,1.56,.64,1); }
.mg-heart { transition: opacity 500ms; }
.mg-ribbon { transform-box: fill-box; transform-origin: 50% 30%; transition: transform 400ms cubic-bezier(.34,1.56,.64,1); }
.mg-bloom.is-open { transform-box: view-box; transform-origin: 150px 150px; animation: mg-bloom 1.2s cubic-bezier(.16,1,.3,1) both; }
@keyframes mg-bloom { 0% { transform: scale(1); } 35% { transform: scale(1.12); } 100% { transform: scale(1.06); } }
.mg-float { background: linear-gradient(160deg, #f8c3d1, #e07a98); border-radius: 50% 0 50% 0; opacity: 0; animation: mg-float 2s ease-out both; }
@keyframes mg-float { 0% { opacity: 0; transform: translate(0,0) rotate(0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), -120px) rotate(260deg); } }
@media (prefers-reduced-motion: reduce) {
  .mg-petal, .mg-ribbon { transition: opacity 200ms; }
  .mg-bloom.is-open { animation: none; }
}
`;
