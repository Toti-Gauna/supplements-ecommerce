import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

/** Huevo con la punta arriba, apoyado en el nido. */
const EGG = "M150 62 C194 62 220 142 220 182 C220 222 190 246 150 246 C110 246 80 222 80 182 C80 142 106 62 150 62 Z";
/** Línea de corte en zigzag; el centro (índice 6) es donde pega el primer golpe. */
const ZIG: [number, number][] = [[70, 144], [84, 136], [96, 153], [109, 137], [122, 154], [136, 138], [150, 155], [164, 137], [177, 153], [190, 136], [203, 154], [216, 138], [230, 146]];
const pts = (list: number[][]) => list.map(([x, y]) => `${x} ${y}`).join(" L");
const CRACKS = [`M${pts(ZIG.slice(0, 7).reverse())}`, `M${pts(ZIG.slice(6))}`];
const CUT_TOP = `M40 0 L260 0 L260 146 L${pts([...ZIG].reverse())} L40 144 Z`;
const CUT_BOT = `M40 300 L40 144 L${pts(ZIG)} L260 146 L260 300 Z`;
/** Borde de atrás del cascarón abierto (se ve por encima del borde de adelante). */
const INNER = `M${pts(ZIG.map(([x, y]) => [150 + (x - 150) * 0.9, y - 12]))} L222 172 Q150 198 78 172 Z`;
/** Grietas secundarias y cascaritas que faltan (dejan ver la luz de adentro); `at` = golpe en que aparecen. */
const BRANCHES = [{ d: "M122 154 L116 167 L121 178", at: 2 }, { d: "M164 137 L170 124 L166 113", at: 2 }, { d: "M96 153 L90 166 L95 175", at: 3 },
  { d: "M190 136 L198 124 L195 112 L202 104", at: 3 }, { d: "M136 138 L131 122 L137 111", at: 4 }, { d: "M177 153 L184 168 L180 180", at: 4 }];
const CHIPS = [{ d: "M143 147 L150 155 L158 148 L152 141 Z", at: 3 }, { d: "M103 142 L109 137 L117 143 L110 150 Z", at: 4 }, { d: "M196 140 L203 154 L210 145 Z", at: 4 }];
/** Curva de las guardas (siguen la panza del huevo). */
const bend = (x: number, b: number) => { const t = (x - 60) / 180; return +(b + 32 * t * (1 - t)).toFixed(1); };
const ZIGZAG = `M${Array.from({ length: 21 }, (_, i) => `${60 + i * 9} ${bend(60 + i * 9, 104) + 6 + (i % 2 ? -3.5 : 3.5)}`).join(" L")}`;
const NEST = "M54 226 C58 256 104 262 150 262 C196 262 242 256 246 226 C222 238 188 240 150 240 C112 240 78 238 54 226 Z";
const STRAW = ["#e6c46a", "#c9993f", "#f3dc8e", "#a57630"];
const f = (n: number) => n.toFixed(1);
/** Pajitas del nido (adentro del frente) y hebras sueltas sobre el borde. */
const STRAWS = Array.from({ length: 34 }, (_, i) => { const x = 46 + rand(i + 3) * 160, y = 228 + rand(i + 41) * 32, w = 30 + rand(i + 77) * 44;
  return `M${f(x)} ${f(y)} Q${f(x + w / 2)} ${f(y + 9 - rand(i + 9) * 18)} ${f(x + w)} ${f(y + (rand(i + 5) - 0.5) * 12)}`; });
const TUFTS = Array.from({ length: 12 }, (_, i) => { const x = 60 + i * 16 + rand(i) * 8, y = 228 + 14 * (1 - ((x - 150) / 96) ** 2);
  return `M${f(x)} ${f(y)} q${f((rand(i + 2) - 0.5) * 10)} -6 ${f((rand(i + 4) - 0.5) * 22)} ${f(-7 - rand(i + 6) * 9)}`; });
const SPARKS = [[96, 92, 1], [206, 82, 0.8], [118, 56, 0.7], [190, 116, 0.6], [78, 130, 0.6], [224, 126, 0.9]];
/** Lluvia de mini huevitos al abrir. */
const MINI = Array.from({ length: 14 }, (_, i) => ({ left: 6 + rand(i + 60) * 88, delay: 120 + rand(i + 70) * 520, fall: 220 + rand(i + 80) * 90,
  rot: (rand(i + 90) - 0.5) * 320, color: ["#ffe28a", "#f4a7c9", "#9fd6ff", "#b8eaa0", "#c9b3ff", "#fff6e6"][i % 6] }));

/** Pascuas: huevo pintado en su nido. Cada golpe abre una grieta de luz; al final vuela la tapa y asoma un pollito. */
export default function EasterGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const crack = opened ? 1 : [0, 0.3, 0.52, 0.74, 0.92][hits] ?? 0.92;
  const open = opened ? " is-open" : "";
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 20} colors={["#7556a8", "#ffe28a", "#f6f0ff", "#a48ad4"]} shape="shard" count={8} x={hits % 2 ? 46 : 54} y={48} spread={0.8} size={9} />}
        {opened && (
          <>
            <RevealBurst colors={["#ffe28a", "#fff6d8", "#a48ad4", "#f4a7c9"]} shapes={["shard", "star", "dot"]} y={42} />
            {MINI.map((m, i) => (
              <span key={i} className="pq-mini absolute" style={{ left: `${m.left}%`, top: "-4%", "--c": m.color, "--fall": `${m.fall}px`, "--rot": `${m.rot}deg`, animationDelay: `${m.delay}ms` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="pascuas" css={CSS} />
      <defs>
        <radialGradient id="pq-body" cx=".36" cy=".3" r=".85"><stop offset="0" stopColor="#b9a2e6" /><stop offset=".45" stopColor="#8a6bc0" /><stop offset="1" stopColor="#4a3180" /></radialGradient>
        <linearGradient id="pq-shade" x1="0" y1="0" x2="1" y2=".3"><stop offset=".45" stopColor="#1f1040" stopOpacity="0" /><stop offset="1" stopColor="#1f1040" stopOpacity=".55" /></linearGradient>
        <radialGradient id="pq-chick" cx=".4" cy=".35" r=".75"><stop offset="0" stopColor="#fff6c4" /><stop offset=".55" stopColor="#ffd84d" /><stop offset="1" stopColor="#e9a923" /></radialGradient>
        <linearGradient id="pq-straw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c99a45" /><stop offset="1" stopColor="#6e4a1e" /></linearGradient>
        <linearGradient id="pq-inner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#e2d2b8" /></linearGradient>
        <radialGradient id="pq-light"><stop offset="0" stopColor="#fff3b8" stopOpacity=".95" /><stop offset=".5" stopColor="#ffe28a" stopOpacity=".45" /><stop offset="1" stopColor="#ffe28a" stopOpacity="0" /></radialGradient>
        <filter id="pq-blur" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><feGaussianBlur stdDeviation="2.4" /></filter>
        <clipPath id="pq-shell"><path d={EGG} /></clipPath>
        <clipPath id="pq-cut-top"><path d={CUT_TOP} /></clipPath>
        <clipPath id="pq-cut-bot"><path d={CUT_BOT} /></clipPath>
        <clipPath id="pq-nest"><path d={NEST} /></clipPath>
        {/* El huevo pintado: se dibuja dos veces (mitad de arriba y de abajo). */}
        <g id="pq-egg">
          <path d={EGG} fill="url(#pq-body)" />
          <g clipPath="url(#pq-shell)">
            {[[150, 78, 5, "#ffe28a"], [131, 90, 3.5, "#ffe28a"], [169, 90, 3.5, "#ffe28a"], [140, 70, 2, "#fff"], [160, 70, 2, "#fff"], [150, 95, 2.2, "#f4a7c9"]].map(([x, y, r, c]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c as string} />)}
            <path d="M60 104 Q150 120 240 104 L240 116 Q150 132 60 116 Z" fill="#ffe28a" />
            <path d={ZIGZAG} stroke="#7556a8" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
            {[85, 115, 145, 175, 205].map((x) => <circle key={x} cx={x + 3} cy={bend(x + 3, 130)} r="2.4" fill="#fff" opacity=".85" />)}
            {[70, 100, 130, 160, 190, 220].map((x) => <circle key={x} cx={x} cy={bend(x, 160)} r="6" fill="#ffe28a" />)}
            <path d="M60 184 Q150 200 240 184 L240 208 Q150 224 60 208 Z" fill="#ffe28a" />
            <path d="M60 187 Q150 203 240 187 M60 205 Q150 221 240 205" stroke="#f4a7c9" strokeWidth="2.2" fill="none" />
            {Array.from({ length: 9 }, (_, i) => 66 + i * 21).map((x) => <circle key={x} cx={x} cy={bend(x, 184) + 12} r="4.4" fill="#7556a8" />)}
            <path d={EGG} fill="url(#pq-shade)" />
            <ellipse rx="12" ry="27" fill="#fff" opacity=".24" transform="translate(116 110) rotate(24)" />
          </g>
        </g>
      </defs>
      <Glow color="#ffe28a" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="262" rx="104" ry="9" fill="#000" opacity=".4" />
      <ellipse cx="150" cy="228" rx="96" ry="14" fill="#5e4119" />
      <ellipse cx="150" cy="231" rx="82" ry="9" fill="#2f1f0c" />

      {/* Adentro: pared del cascarón, luz dorada y el pollito con vincha de orejitas de conejo. */}
      <g className={`pq-inside${open}`}>
        <path d={INNER} fill="url(#pq-inner)" clipPath="url(#pq-shell)" />
        <ellipse cx="150" cy="128" rx="84" ry="62" fill="url(#pq-light)" />
      </g>
      <g className={`pq-chick${open}`}>
        <path d="M136 104 C124 88 121 66 129 57 C140 63 146 86 144 104 Z M164 104 C176 88 179 66 171 57 C160 63 154 86 156 104 Z" fill="#fffaf2" />
        <path d="M137 99 C130 88 128 73 132 66 C138 72 141 87 141 99 Z M163 99 C170 88 172 73 168 66 C162 72 159 87 159 99 Z" fill="#f4a7c9" />
        <circle cx="150" cy="130" r="32" fill="url(#pq-chick)" />
        <path d="M124 112 A32 32 0 0 1 176 112" stroke="#7556a8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M147 99 Q146 90 151 87 M151 99 Q156 92 161 94" stroke="#e9a923" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="139" cy="125" r="3.8" fill="#2a1846" /><circle cx="161" cy="125" r="3.8" fill="#2a1846" />
        <circle cx="140.4" cy="123.6" r="1.3" fill="#fff" /><circle cx="162.4" cy="123.6" r="1.3" fill="#fff" />
        <path d="M143 134 L157 134 L150 143 Z" fill="#f39b2b" />
        <ellipse cx="130" cy="136" rx="5" ry="3" fill="#ff9fb5" opacity=".7" /><ellipse cx="170" cy="136" rx="5" ry="3" fill="#ff9fb5" opacity=".7" />
      </g>

      {/* Mitad de abajo (queda en el nido) y mitad de arriba (sale volando girando). */}
      <use href="#pq-egg" clipPath="url(#pq-cut-bot)" />
      <path className={`pq-inside${open}`} d={`M${pts(ZIG)}`} stroke="#fff6e6" strokeWidth="3" fill="none" strokeLinejoin="round" clipPath="url(#pq-shell)" />
      <g className={`pq-top${open}`}><use href="#pq-egg" clipPath="url(#pq-cut-top)" /></g>

      {/* Grieta: crece desde el centro con cada golpe y deja escapar luz. */}
      <g className={`pq-crack${open}`} clipPath="url(#pq-shell)">
        {CRACKS.map((d) => <path key={d} d={d} pathLength={1} className="pq-line" stroke="#ffe28a" strokeWidth="7" opacity={0.25 + crack * 0.6} filter="url(#pq-blur)" style={{ strokeDashoffset: 1 - crack }} />)}
        {BRANCHES.map((b) => <path key={b.d} d={b.d} pathLength={1} className="pq-line" stroke="#2a1846" strokeWidth="1.6" style={{ strokeDashoffset: hits >= b.at ? 0 : 1 }} />)}
        {CRACKS.map((d) => <path key={d} d={d} pathLength={1} className="pq-line" stroke="#2a1846" strokeWidth="2.4" style={{ strokeDashoffset: 1 - crack }} />)}
        {CHIPS.map((c) => <path key={c.d} d={c.d} className="pq-chip" fill="#ffe28a" stroke="#2a1846" strokeWidth="1.4" style={{ opacity: hits >= c.at ? 1 : 0, transform: `scale(${hits >= c.at ? 1 : 0.3})` }} />)}
      </g>
      <g className={`pq-inside${open}`}>
        {[[113, -40], [187, 40]].map(([x, a]) => (
          <g key={x} transform={`translate(${x} 146) rotate(${a})`}><ellipse className="pq-wing" rx="9" ry="14" fill="#ffd84d" /></g>
        ))}
      </g>

      {/* Frente del nido de paja. */}
      <path d={NEST} fill="url(#pq-straw)" />
      <g clipPath="url(#pq-nest)" fill="none" strokeLinecap="round">
        {STRAWS.map((d, i) => <path key={i} d={d} stroke={STRAW[i % 4]} strokeWidth={1.4 + (i % 3) * 0.5} opacity=".9" />)}
      </g>
      {TUFTS.map((d, i) => <path key={i} d={d} stroke={STRAW[(i + 1) % 4]} strokeWidth="1.6" fill="none" strokeLinecap="round" />)}

      {SPARKS.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className={`pq-spark${open}`} d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4 Z" fill="#fff3b8" style={{ animationDelay: `${520 + i * 90}ms` }} />
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.pq-line { fill: none; stroke-dasharray: 1; stroke-linejoin: miter; transition: stroke-dashoffset 480ms cubic-bezier(.16,1,.3,1), opacity 400ms; }
.pq-chip { transform-box: fill-box; transform-origin: 50% 50%; transition: transform 380ms cubic-bezier(.34,1.56,.64,1), opacity 200ms; }
.pq-crack.is-open { opacity: 0; transition: opacity 160ms; }
.pq-top { transform-box: view-box; transform-origin: 150px 110px; }
.pq-top.is-open { animation: pq-top 1s cubic-bezier(.3,.7,.4,1) both; }
@keyframes pq-top { 18% { transform: translate(4px,-28px) rotate(10deg); } 100% { transform: translate(120px,-210px) rotate(330deg) scale(.7); opacity: 0; } }
.pq-inside, .pq-spark { opacity: 0; }
.pq-inside.is-open { animation: pq-fade 500ms ease-out 120ms both; }
@keyframes pq-fade { to { opacity: 1; } }
.pq-chick { transform-box: view-box; transform-origin: 150px 170px; opacity: 0; }
.pq-chick.is-open { animation: pq-chick 820ms cubic-bezier(.34,1.56,.64,1) 260ms both; }
@keyframes pq-chick { 0% { opacity: 0; transform: translateY(84px) scale(.8); } 12% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.pq-wing { transform-box: fill-box; transform-origin: 50% 100%; }
.is-open .pq-wing { animation: pq-pop 500ms cubic-bezier(.34,1.56,.64,1) 640ms both; }
.pq-spark { transform-box: fill-box; transform-origin: 50% 50%; }
.pq-spark.is-open { animation: pq-pop 600ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes pq-pop { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
.pq-mini { width: 11px; height: 14px; margin-left: -5px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: linear-gradient(180deg, var(--c) 0 42%, #fff 42% 56%, var(--c) 56%); opacity: 0; animation: pq-rain 1.1s cubic-bezier(.45,0,.75,.5) both; }
@keyframes pq-rain { 0% { opacity: 0; transform: translateY(0) rotate(0); } 12%, 82% { opacity: 1; } 100% { opacity: 0; transform: translateY(var(--fall)) rotate(var(--rot)); } }
@media (prefers-reduced-motion: reduce) {
  .pq-line, .pq-chip { transition: opacity 200ms; }
  .pq-top.is-open { animation: none; opacity: 0; }
  .pq-inside.is-open, .pq-chick.is-open, .pq-spark.is-open, .is-open .pq-wing { animation: none; opacity: 1; transform: none; }
}
`;
