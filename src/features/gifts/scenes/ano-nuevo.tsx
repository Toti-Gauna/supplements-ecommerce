import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

const BOTTLE = "M137 64 L137 100 C137 120 104 130 104 162 L104 236 Q104 252 120 252 L180 252 Q196 252 196 236 L196 162 C196 130 163 120 163 100 L163 64 Z";
const INNER = "M141 66 L141 102 C141 122 108 132 108 162 L108 236 Q108 248 120 248 L180 248 Q192 248 192 236 L192 162 C192 132 159 122 159 102 L159 66 Z";
/** Nivel de la sidra por golpe: la presión la hace subir por el cuello. */
const LEVEL = [170, 150, 132, 114, 98];
/** Burbujas: cada tanda aparece (y sube a su lugar) en el golpe `at`. */
const BUBBLES = Array.from({ length: 36 }, (_, i) => {
  const at = 1 + (i % 4), neck = i % 9 === 8, top = LEVEL[at] ?? 98;
  return { at, x: neck ? 145 + rand(i + 1) * 10 : 113 + rand(i + 1) * 74, y: neck ? 102 + rand(i + 2) * 22 : top + 8 + rand(i + 2) * (236 - top), r: 1.2 + rand(i + 3) * 2.6, delay: rand(i + 4) * 260 };
});
/** Fuegos artificiales: centro, radio, color y demora. */
const FIREWORKS = [[70, 72, 42, "#f3dca6", 380], [232, 60, 36, "#9fb4ff", 560], [112, 30, 22, "#ffe7b0", 760], [204, 128, 22, "#f3dca6", 880]] as const;
const ray = (r: number, k: number, n: number) => { const a = (k / n) * Math.PI * 2; return [Math.cos(a), Math.sin(a)].map((v) => +(v * r).toFixed(1)); };
const DROPS = Array.from({ length: 16 }, (_, i) => ({ dx: (rand(i + 30) - 0.5) * 130, dy: -(100 + rand(i + 31) * 130), s: 4 + rand(i + 32) * 5, delay: 100 + rand(i + 33) * 240 }));

/** Año Nuevo: botella de sidra con papel dorado y moño. Sube la presión golpe a golpe; al abrir salta el corcho y estalla. */
export default function NewYearGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const open = opened ? " is-open" : "";
  const level = LEVEL[opened ? 4 : hits] ?? 98;
  const shine = opened ? 1 : hits / total;
  const cork = { transform: `translateY(${-([0, 3, 7, 11, 16][hits] ?? 16)}px) rotate(${[0, -3, 3, -4, 5][hits] ?? 0}deg)` };
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 60} colors={["#f3dca6", "#fff8e6", "#9fb4ff"]} shape="dot" count={7} y={14} spread={0.5} size={5} />}
        {opened && (
          <>
            <RevealBurst colors={["#f3dca6", "#fff8e6", "#9fb4ff", "#d4b06a"]} shapes={["star", "ribbon", "dot"]} y={18} />
            {DROPS.map((d, i) => (
              <span key={i} className="an-drop absolute rounded-full" style={{ left: "50%", top: "19%", width: d.s, height: d.s, "--dx": `${d.dx}px`, "--dy": `${d.dy}px`, animationDelay: `${d.delay}ms` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="ano-nuevo" css={CSS} />
      <defs>
        <linearGradient id="an-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a4a94" /><stop offset=".35" stopColor="#24306a" /><stop offset=".8" stopColor="#141c44" /><stop offset="1" stopColor="#0d1330" /></linearGradient>
        <linearGradient id="an-wine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fb4ff" stopOpacity=".5" /><stop offset=".25" stopColor="#6d80d8" stopOpacity=".3" /><stop offset="1" stopColor="#2a3670" stopOpacity=".15" /></linearGradient>
        <linearGradient id="an-cork" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a8875a" /><stop offset=".4" stopColor="#e2c49a" /><stop offset="1" stopColor="#9a7848" /></linearGradient>
        <linearGradient id="an-foil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7a5a22" /><stop offset=".3" stopColor="#e6c98a" /><stop offset=".55" stopColor="#b8913f" /><stop offset=".8" stopColor="#f3dca6" /><stop offset="1" stopColor="#8a6a2e" /></linearGradient>
        <linearGradient id="an-bow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset=".6" stopColor="#f3e6c8" /><stop offset="1" stopColor="#cdb27a" /></linearGradient>
        <linearGradient id="an-label" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e6bd" /><stop offset="1" stopColor="#d4b06a" /></linearGradient>
        <linearGradient id="an-jet" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff8e6" /><stop offset=".4" stopColor="#f3dca6" stopOpacity=".85" /><stop offset="1" stopColor="#f3dca6" stopOpacity="0" /></linearGradient>
        <clipPath id="an-inner"><path d={INNER} /></clipPath>
      </defs>
      <Glow color="#f3dca6" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="256" rx="70" ry="8" fill="#000" opacity=".45" />

      {/* Fuegos artificiales (solo al abrir) y chorro de espuma. */}
      {FIREWORKS.map(([x, y, r, c, delay]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g className={`an-fw${open}`} style={{ animationDelay: `${delay}ms` }} stroke={c} strokeLinecap="round">
            {Array.from({ length: 14 }, (_, k) => { const [a, b] = ray(r * 0.32, k, 14), [cx, cy] = ray(r, k, 14), [dx, dy] = ray(r * 1.14, k, 14); return (
              <g key={k}><line x1={a} y1={b} x2={cx} y2={cy} strokeWidth="1.8" /><circle cx={dx} cy={dy} r="1.9" fill={c} stroke="none" /></g>
            ); })}
            <circle r="3" fill="#fff8e6" stroke="none" />
          </g>
        </g>
      ))}
      <g className={`an-jet${open}`}>
        <path d="M150 60 C142 40 120 0 100 -30 L200 -30 C180 0 158 40 150 60 Z" fill="url(#an-jet)" />
        {["M148 58 C138 22 104 6 78 22", "M152 58 C162 22 196 6 222 22", "M146 58 C130 30 112 26 98 40", "M154 58 C170 30 188 26 202 40"].map((d, i) => (
          <path key={d} d={d} pathLength={1} className="an-stream" stroke={i < 2 ? "#fff8e6" : "#f3dca6"} strokeWidth={i < 2 ? 5 : 3.5} />
        ))}
      </g>

      {/* Vidrio, sidra que sube con la presión y burbujas. */}
      <path d={BOTTLE} fill="url(#an-glass)" />
      <g clipPath="url(#an-inner)">
        <g className="an-level" style={{ transform: `translateY(${level - 90}px)` }}>
          <rect x="100" y="90" width="100" height="170" fill="url(#an-wine)" />
          <rect x="100" y="89" width="100" height="2.5" fill="#f3dca6" opacity=".9" />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={104 + i * 8.4} cy={92} r={1.4 + rand(i + 50) * 1.8} fill="#fff8e6" opacity=".7" />)}
        </g>
        {BUBBLES.map((b, i) => (
          <circle key={i} className="an-bubble" cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#fff8e6" strokeWidth=".9"
            style={{ opacity: hits >= b.at || opened ? 0.85 : 0, transform: `translateY(${hits >= b.at || opened ? 0 : 34}px)`, transitionDelay: `${b.delay}ms` }} />
        ))}
      </g>
      <path d="M113 170 Q110 204 113 236" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" style={{ opacity: 0.12 + shine * 0.3, transition: "opacity 500ms" }} />
      <path d="M114 150 Q122 134 140 124" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" style={{ opacity: 0.1 + shine * 0.4, transition: "opacity 500ms" }} />
      <path d={BOTTLE} fill="none" stroke="#f3dca6" strokeWidth="1.5" style={{ opacity: 0.08 + shine * 0.5, transition: "opacity 500ms" }} />

      {/* Etiqueta. */}
      <rect x="114" y="176" width="72" height="48" rx="6" fill="url(#an-label)" />
      <rect x="118" y="180" width="64" height="40" rx="4" fill="none" stroke="#0d1330" strokeWidth="1" opacity=".55" />
      <path d="M150 186 L152 191 L157 191 L153 194 L155 199 L150 196 L145 199 L147 194 L143 191 L148 191 Z" fill="#0d1330" />
      <text x="150" y="213" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="10" fontWeight="700" letterSpacing="2.4" fill="#0d1330">SALUD</text>

      {/* Corcho con su bozal: asoma más con cada golpe y sale disparado al abrir. */}
      <g className={`an-cork${open}`} style={opened ? undefined : cork}>
        <rect x="141" y="46" width="18" height="34" rx="2" fill="#dcc096" />
        <path d="M143 56 H157 M143 64 H157" stroke="#a8875a" strokeWidth="1.2" />
        <path d="M133 48 Q133 29 150 29 Q167 29 167 48 L163 54 L137 54 Z" fill="url(#an-cork)" />
        <path d="M137 42 Q150 38 163 42" stroke="#8a6a3a" strokeWidth="1" fill="none" opacity=".6" />
        <path d="M144 32 L137 52 L137 62 M156 32 L163 52 L163 62 M150 30 V54" stroke="#f3dca6" strokeWidth="1.3" fill="none" />
        <circle cx="150" cy="31" r="6.5" fill="#f3dca6" stroke="#8a6a2e" strokeWidth="1" />
        <path d="M150 27.5 L151.2 30.2 L154 30.4 L151.8 32.2 L152.5 35 L150 33.4 L147.5 35 L148.2 32.2 L146 30.4 L148.8 30.2 Z" fill="#8a6a2e" />
      </g>

      {/* Papel dorado del cuello y moño de raso. */}
      <path d="M134 56 H166 V98 C166 108 171 114 178 118 L172 123 L166 118 L159 124 L152 118 L145 124 L138 118 L130 123 L122 118 C129 114 134 108 134 98 Z" fill="url(#an-foil)" />
      <rect x="131" y="55" width="38" height="10" rx="4.5" fill="url(#an-foil)" />
      <rect x="133" y="56" width="34" height="3" rx="1.5" fill="#fff4d6" opacity=".45" />
      <path d="M141 92 L146 106 M159 90 L156 104" stroke="#fff4d6" strokeWidth="1" opacity=".5" />
      <rect x="134" y="72" width="32" height="15" fill="#1b2552" />
      <path d="M134 73.5 H166 M134 85.5 H166" stroke="#f3dca6" strokeWidth="1" />
      <path d="M150 75.5 L151.4 78.4 L154.5 78.6 L152.1 80.6 L152.9 83.6 L150 81.9 L147.1 83.6 L147.9 80.6 L145.5 78.6 L148.6 78.4 Z" fill="#f3dca6" />
      <g className="an-bow" style={{ transform: `rotate(${opened ? 0 : [0, 4, -5, 6, -7][hits] ?? 0}deg)` }}>
        <path d="M147 112 L136 146 L143 141 L146 150 Z M153 112 L164 146 L157 141 L154 150 Z" fill="#cdb27a" />
        <path d="M150 110 C134 92 114 98 118 111 C122 124 140 120 150 110 Z M150 110 C166 92 186 98 182 111 C178 124 160 120 150 110 Z" fill="url(#an-bow)" />
        <path d="M150 110 C138 100 126 102 124 108 M150 110 C162 100 174 102 176 108" stroke="#b8913f" strokeWidth="1" fill="none" opacity=".6" />
        <rect x="144" y="104" width="12" height="12" rx="4" fill="#f3e6c8" stroke="#b8913f" strokeWidth=".8" />
      </g>

      {/* Espuma que rebalsa por el pico (queda al abrir). */}
      <g className={`an-foam${open}`} fill="#fff8e6">
        <circle cx="141" cy="56" r="7" /><circle cx="150" cy="51" r="9" /><circle cx="160" cy="56" r="7" /><circle cx="133" cy="62" r="4.5" /><circle cx="167" cy="61" r="5" />
        <path d="M136 60 Q134 74 137 82 Q140 74 139 62 Z M162 60 Q165 76 162 90 Q159 78 159 62 Z" />
      </g>
    </SceneFrame>
  );
}

const CSS = `
.an-level { transition: transform 700ms cubic-bezier(.34,1.56,.64,1); }
.an-bubble { transform-box: fill-box; transition: transform 900ms cubic-bezier(.16,1,.3,1), opacity 500ms; }
.an-cork { transform-box: fill-box; transform-origin: 50% 100%; transition: transform 380ms cubic-bezier(.34,1.56,.64,1); }
.an-cork.is-open { animation: an-cork 900ms cubic-bezier(.2,.8,.4,1) both; }
@keyframes an-cork { 0% { transform: translateY(-16px); } 12% { transform: translateY(-30px) rotate(-8deg); } 100% { transform: translate(60px,-270px) rotate(560deg); opacity: 0; } }
.an-bow { transform-box: fill-box; transform-origin: 50% 20%; transition: transform 420ms cubic-bezier(.34,1.56,.64,1); }
.an-jet, .an-foam, .an-fw { opacity: 0; }
.an-jet { transform-box: view-box; transform-origin: 150px 60px; }
.an-jet.is-open { animation: an-jet 1.1s cubic-bezier(.16,1,.3,1) 60ms both; }
@keyframes an-jet { 0% { opacity: 1; transform: scale(.2, 0); } 30% { opacity: 1; transform: scale(1, 1); } 100% { opacity: 0; transform: scale(1.3, 1.25); } }
.an-stream { fill: none; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; }
.is-open .an-stream { animation: an-stream 900ms cubic-bezier(.16,1,.3,1) 80ms both; }
@keyframes an-stream { 0% { stroke-dashoffset: 1; } 50% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: -.6; opacity: 0; } }
.an-foam { transform-box: fill-box; transform-origin: 50% 100%; }
.an-foam.is-open { animation: an-foam 600ms cubic-bezier(.34,1.56,.64,1) 200ms both; }
@keyframes an-foam { from { opacity: 0; transform: scale(.3); } to { opacity: 1; transform: scale(1); } }
.an-fw { transform-box: fill-box; transform-origin: 50% 50%; }
.an-fw.is-open { animation: an-fw 900ms cubic-bezier(.16,1,.3,1) both; }
@keyframes an-fw { 0% { opacity: 0; transform: scale(.15); } 15% { opacity: 1; } 55% { opacity: 1; transform: scale(1); } 100% { opacity: .55; transform: scale(1.06); } }
.an-drop { background: radial-gradient(circle at 35% 35%, #fff8e6, #f3dca6 60%, #d4b06a); opacity: 0; animation: an-drop 1s cubic-bezier(.2,.7,.4,1) both; }
@keyframes an-drop { 0% { opacity: 1; transform: translate(-50%,-50%) scale(.5); } 60% { opacity: 1; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1); } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx) * 1.2), calc(-50% + var(--dy) + 50px)) scale(.8); } }
@media (prefers-reduced-motion: reduce) {
  .an-level, .an-bubble, .an-cork, .an-bow { transition: opacity 200ms; }
  .an-cork.is-open, .an-jet.is-open { animation: none; opacity: 0; }
  .an-foam.is-open { animation: none; opacity: 1; transform: none; }
  .an-fw.is-open { animation: none; opacity: .55; transform: none; }
}
`;
