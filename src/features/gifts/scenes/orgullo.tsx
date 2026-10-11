import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle } from "./kit";
import type { GiftSceneProps } from "./types";

/** Prisma: vértice (150, 70) y base de (78, 200) a (222, 200). La luz sale por la cara derecha en O. */
const PRISM = "M150 70 L222 200 L78 200 Z";
const O = [187, 136] as const;
const RAINBOW = ["#ff3b4a", "#ff8a2b", "#ffd93b", "#3fd07a", "#3b8cff", "#a35bff"];
/** Abanico: cada color abarca 9° desde -12° (rojo, se desvía menos) hasta 42° (violeta). */
const wedge = (i: number, len: number) => {
  const a0 = ((-12 + i * 9 - 0.4) * Math.PI) / 180, a1 = ((-3 + i * 9 + 0.4) * Math.PI) / 180;
  const p = (a: number) => `${(O[0] + Math.cos(a) * len).toFixed(1)} ${(O[1] + Math.sin(a) * len).toFixed(1)}`;
  return `M${O[0]} ${O[1]} L${p(a0)} L${p(a1)} Z`;
};
/** Grietas de luz: una por golpe. */
const CRACKS = [
  "M122 132 L133 141 L129 153 L140 161", "M150 92 L157 104 L150 114 L159 125",
  "M198 170 L185 163 L181 175 L168 173", "M110 184 L127 177 L137 186 L156 179 L171 189",
];
const SPARKS = [[150, 70, 1], [78, 200, 0.7], [222, 200, 0.7]];

/** Orgullo: prisma de cristal. Cada golpe abre una grieta de luz y aviva el haz; al abrir, despliega el arcoíris. */
export default function PrideGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const open = opened ? " is-open" : "";
  const beam = opened ? 1 : [0.14, 0.32, 0.5, 0.7, 0.88][hits] ?? 0.88;
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 80} colors={["#ffffff", "#ff9fd0", "#cdb8ff"]} shape="shard" count={8} y={46} spread={0.75} size={8} />}
        {opened && <RevealBurst colors={["#ffffff", ...RAINBOW]} shapes={["square", "ribbon", "star"]} x={54} y={45} />}
      </>
    )}>
      <SceneStyle id="orgullo" css={CSS} />
      <defs>
        <linearGradient id="or-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".7" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" /></linearGradient>
        <linearGradient id="or-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".5" /><stop offset=".45" stopColor="#d9c8ff" stopOpacity=".18" /><stop offset="1" stopColor="#ff9fd0" stopOpacity=".3" /></linearGradient>
        <linearGradient id="or-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3d2766" /><stop offset=".45" stopColor="#2c1a4c" /><stop offset="1" stopColor="#190f2e" /></linearGradient>
        <linearGradient id="or-slab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3d8c" /><stop offset="1" stopColor="#2e1d4f" /></linearGradient>
        <radialGradient id="or-core"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".4" stopColor="#ff9fd0" stopOpacity=".45" /><stop offset="1" stopColor="#ff9fd0" stopOpacity="0" /></radialGradient>
        <radialGradient id="or-fade" gradientUnits="userSpaceOnUse" cx={O[0]} cy={O[1]} r="132"><stop offset=".4" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
        <mask id="or-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="340" height="300"><rect width="340" height="300" fill="url(#or-fade)" /></mask>
        <filter id="or-blur" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><feGaussianBlur stdDeviation="3" /></filter>
        <clipPath id="or-clip"><path d={PRISM} /></clipPath>
      </defs>
      <Glow color="#ff9fd0" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="100" ry="8" fill="#000" opacity=".45" />

      {/* Haz blanco que entra por la izquierda: más intenso con cada golpe. */}
      <g style={{ opacity: beam, transition: "opacity 500ms" }}>
        <path d="M-10 154 L114 135 L107 148 L-10 186 Z" fill="url(#or-beam)" filter="url(#or-blur)" />
        <path d="M-10 162 L114 135 L107 148 L-10 178 Z" fill="url(#or-beam)" />
      </g>

      {/* Arcoíris: asoma tenue en los últimos golpes y se despliega en abanico al abrir. */}
      <g style={{ opacity: opened ? 0 : [0, 0, 0, 0.3, 0.6][hits] ?? 0.6, transition: "opacity 500ms" }}>
        {RAINBOW.map((c, i) => <path key={c} d={wedge(i, 30)} fill={c} />)}
      </g>
      <g mask="url(#or-mask)">
        {/* Se dibuja de violeta a rojo: todas parten del ángulo del rojo y se abren como un abanico de mano. */}
        {RAINBOW.map((c, i) => ({ c, i })).reverse().map(({ c, i }) => (
          <path key={c} className={`or-band${open}`} d={wedge(i, 200)} fill={c} opacity=".9" style={{ "--from": `${-i * 9}deg` } as CSSProperties} />
        ))}
      </g>

      {/* Pedestal de piedra con un corazón grabado. */}
      <rect x="78" y="212" width="144" height="32" fill="url(#or-stone)" />
      <path d="M102 214 V242 M126 214 V242 M174 214 V242 M198 214 V242" stroke="#000" strokeOpacity=".25" strokeWidth="2" />
      <path d="M150 234 C141 228 140 222 145 221 C147.5 220.5 149 222 150 223.5 C151 222 152.5 220.5 155 221 C160 222 159 228 150 234 Z" fill="#ff9fd0" opacity=".55" />
      <rect x="60" y="244" width="180" height="12" rx="3" fill="url(#or-slab)" />
      <rect x="64" y="200" width="172" height="12" rx="3" fill="url(#or-slab)" />
      <path d="M68 200.8 H232" stroke="#ff9fd0" strokeWidth="1.4" style={{ opacity: 0.25 + beam * 0.5, transition: "opacity 500ms" }} />

      {/* Cristal: caras facetadas, luz interna y grietas. */}
      <g className={`or-prism${open}`}>
        <path d={PRISM} fill="url(#or-face)" />
        <path d="M150 70 L150 168 L78 200 Z" fill="#fff" opacity=".1" />
        <path d="M150 70 L150 168 L222 200 Z" fill="#2b0d22" opacity=".18" />
        <path d="M78 200 L150 168 L222 200 Z" fill="#ff9fd0" opacity=".12" />
        <g clipPath="url(#or-clip)">
          <path d="M114 135 L183 130 L190 143 L107 148 Z" fill="#fff" style={{ opacity: beam * 0.45, transition: "opacity 500ms" }} />
          <ellipse cx="150" cy="150" rx="46" ry="40" fill="url(#or-core)" style={{ opacity: opened ? 0.9 : hits * 0.16, transition: "opacity 500ms" }} />
          {CRACKS.map((d, i) => (
            <g key={d} className="or-crack" style={{ strokeDashoffset: hits > i || opened ? 0 : 1 }}>
              <path d={d} pathLength={1} stroke="#ff9fd0" strokeWidth="5" filter="url(#or-blur)" />
              <path d={d} pathLength={1} stroke="#fff" strokeWidth="1.5" />
            </g>
          ))}
        </g>
        <path d={PRISM} fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M150 70 L150 168 M78 200 L150 168 L222 200" stroke="#fff" strokeOpacity=".3" strokeWidth="1" fill="none" />
        <path d="M144 84 L92 186" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" />
        <path className={`or-flash${open}`} d={PRISM} fill="#fff" />
      </g>
      {SPARKS.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className={`or-spark${open}`} d="M0 -12 L2.6 -2.6 L12 0 L2.6 2.6 L0 12 L-2.6 2.6 L-12 0 L-2.6 -2.6 Z" fill="#fff" style={{ animationDelay: `${600 + i * 120}ms` }} />
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.or-crack path { fill: none; stroke-dasharray: 1; stroke-linecap: round; stroke-linejoin: round; stroke-dashoffset: inherit; transition: stroke-dashoffset 520ms cubic-bezier(.16,1,.3,1); }
.or-band { transform-box: view-box; transform-origin: ${O[0]}px ${O[1]}px; transform: scale(0); }
.or-band.is-open { animation: or-band 1.1s cubic-bezier(.22,1,.36,1) 160ms both; }
@keyframes or-band { 0% { transform: rotate(var(--from)) scale(.05); } 28% { transform: rotate(var(--from)) scale(1); } 100% { transform: rotate(0deg) scale(1); } }
.or-prism { transform-box: view-box; transform-origin: 150px 200px; }
.or-prism.is-open { animation: or-prism 600ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes or-prism { 30% { transform: scale(1.06); } 100% { transform: scale(1); } }
.or-flash, .or-spark { opacity: 0; }
.or-flash.is-open { animation: or-flash 700ms ease-out both; }
@keyframes or-flash { 15% { opacity: .85; } 100% { opacity: 0; } }
.or-spark { transform-box: fill-box; transform-origin: 50% 50%; }
.or-spark.is-open { animation: or-spark 700ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes or-spark { 0% { opacity: 0; transform: scale(0) rotate(-45deg); } 100% { opacity: .95; transform: scale(1) rotate(0); } }
@media (prefers-reduced-motion: reduce) {
  .or-crack path { transition: none; }
  .or-band.is-open, .or-spark.is-open { animation: none; transform: none; }
  .or-spark.is-open { opacity: .95; }
  .or-prism.is-open, .or-flash.is-open { animation: none; }
}
`;
