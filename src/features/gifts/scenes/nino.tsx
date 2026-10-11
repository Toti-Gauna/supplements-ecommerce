import type { CSSProperties, ReactNode } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

const C = { x: 150, y: 160 };
/** Conos de la estrella: ángulo, color y golpe en que se le caen los flecos (0 = el de arriba, atado a la soga). */
const CONES = [
  { a: -90, c: "#ffd34d", l: "#fff0a8", at: 0 }, { a: -18, c: "#ff6fa8", l: "#ffc2da", at: 1 }, { a: 54, c: "#4cc38a", l: "#a8ecc8", at: 3 },
  { a: 126, c: "#1b74a6", l: "#6cbbe8", at: 2 }, { a: 198, c: "#ff8a3d", l: "#ffc796", at: 4 },
];
const FRINGE = ["#ffd34d", "#ff6fa8", "#4cc38a", "#1b74a6", "#ffffff"];
/** Rajadura del cuerpo (por donde se parte al abrir). */
const CRACK = "M128 134L139 145L132 156L147 164L140 177L157 185L150 199";
const CRACK_BACK = "V199L157 185L140 177L147 164L132 156L139 145L128 134";
const STRIPES = ["#ff6fa8", "#ffd34d", "#1b74a6", "#4cc38a", "#ff8a3d", "#ff6fa8", "#ffd34d"];
/** Lo que cae al romperse: [x, y, tipo, color]. */
const LOOT = [
  [80, 252, "ball", "#ff6fa8"], [102, 263, "candy", "#1b74a6"], [124, 253, "star", "#ffd34d"], [142, 267, "ball", "#4cc38a"], [160, 254, "candy", "#ff6fa8"], [180, 265, "star", "#ff8a3d"],
  [202, 254, "ball", "#1b74a6"], [222, 262, "candy", "#4cc38a"], [116, 272, "ball", "#ffd34d"], [196, 273, "candy", "#ff8a3d"], [150, 243, "star", "#ffd34d"],
  [62, 264, "star", "#ff6fa8"], [240, 251, "ball", "#ff8a3d"], [170, 275, "ball", "#ff6fa8"],
] as const;
const star = (R: number, r: number) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? r : R; return `${(Math.cos(a) * k).toFixed(1)},${(Math.sin(a) * k).toFixed(1)}`; }).join(" ");
const scallops = (y: number, w: number) => `M${-w} ${y}` + Array.from({ length: 4 }, () => `q${w / 4} 5 ${w / 2} 0`).join("");

/** Día del Niño: una piñata estrella colgada de una soga. Se hamaca, pierde flecos y se raja; al final revienta. */
export default function PinataGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const crack = opened ? 1 : Math.min(hits, 4) / 4;
  const cone = (k: (typeof CONES)[number], i: number) => {
    const rad = (k.a * Math.PI) / 180, tx = C.x + Math.cos(rad) * 88, ty = C.y + Math.sin(rad) * 88;
    const fly = { "--dx": `${Math.cos(rad) * 120}px`, "--dy": `${Math.sin(rad) * 110 + 70}px`, "--r": `${(i % 2 ? 1 : -1) * (90 + i * 20)}deg` } as CSSProperties;
    return (
      <g key={k.a} className={`${k.at ? "pn-piece" : "pn-top"} ${opened ? "is-open" : ""}`} style={fly}>
        <g transform={`translate(${C.x} ${C.y}) rotate(${k.a + 90})`}>
          {!k.at && opened && <path d="M-22-28l5.5 6 5.5-6 5.5 6 5.5-6 5.5 6 5.5-6 5.5 6 5.5-6Z" fill={k.c} />}
          <path d="M-22-28L-2.5-85Q0-89 2.5-85L22-28Z" fill={`url(#pn-g${i})`} /><path d="M0-88L22-28H0Z" fill="#000" opacity=".14" />
          {[-40, -52, -64, -76].map((y) => <path key={y} d={scallops(y, (22 * (88 + y)) / 60)} stroke="#fff" strokeOpacity=".55" strokeWidth="1.8" fill="none" />)}
        </g>
        {k.at > 0 && (
          <g className={`pn-tassel ${hits >= k.at && !opened ? "is-off" : ""}`}>
            {FRINGE.map((f, j) => <path key={j} d={`M${tx + (j - 2) * 2.2} ${ty}q${(j - 2) * 1.6} 10 ${(j - 2) * 2.6} ${19 + (j % 2) * 5}`} stroke={f} strokeWidth="3" strokeLinecap="round" fill="none" />)}
          </g>
        )}
      </g>
    );
  };
  const half = (side: "l" | "r", body: ReactNode) => (
    <g className={`pn-half pn-half-${side} ${opened ? "is-open" : ""}`}><g clipPath={`url(#pn-${side})`}>{body}</g></g>
  );
  const body = (
    <>
      <g clipPath="url(#pn-disc)">
        {STRIPES.map((c, i) => { const y = 118 + i * 13; return <path key={i} d={`M108 ${y}H192V${y + 13}` + Array.from({ length: 12 }, () => "q-3.5 5-7 0").join("") + "Z"} fill={c} />; })}
        <circle cx="150" cy="160" r="41" fill="url(#pn-shade)" />
      </g>
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={CRACK} pathLength={1} stroke="#3b2547" strokeWidth={hits >= 3 || opened ? 5 : 3} className="pn-crack" style={{ strokeDasharray: 1, strokeDashoffset: 1 - crack, opacity: crack ? 1 : 0 }} />
        <path d={CRACK} pathLength={1} stroke="#ffe27a" strokeWidth="1.6" className="pn-crack" style={{ strokeDasharray: 1, strokeDashoffset: 1 - crack, opacity: hits >= 3 || opened ? 1 : 0 }} />
        <path d="M139 145L152 140M147 164L162 159L168 168" stroke="#3b2547" strokeWidth="2.4" className="pn-crack" style={{ opacity: hits >= 4 || opened ? 1 : 0 }} />
      </g>
    </>
  );
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits * 11} colors={FRINGE} shape="ribbon" count={9} y={56} spread={0.8} size={5} />}
        {opened && (
          <>
            <RevealBurst colors={["#1b74a6", "#ffd34d", "#ff6fa8", "#4cc38a"]} shapes={["square", "ribbon", "star"]} y={53} />
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} className="pn-rain absolute" style={{ left: `${4 + rand(i * 5) * 92}%`, top: "-4%", background: FRINGE[i % 4], animationDelay: `${200 + i * 80}ms`, "--drift": `${(rand(i * 3) - 0.5) * 80}px` } as CSSProperties} />
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="dia-del-nino" css={CSS} />
      <defs>
        {CONES.map((k, i) => <linearGradient key={i} id={`pn-g${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="-88" x2="0" y2="-28"><stop offset="0" stopColor={k.l} /><stop offset=".7" stopColor={k.c} /></linearGradient>)}
        <radialGradient id="pn-shade" cx=".35" cy=".3" r=".75"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".3" /></radialGradient>
        <clipPath id="pn-disc"><circle cx="150" cy="160" r="41" /></clipPath>
        <clipPath id="pn-l"><path d={`M0 0H128${CRACK.replace("M128 134", "L128 134")}V300H0Z`} /></clipPath>
        <clipPath id="pn-r"><path d={`M128 0H300V300H150${CRACK_BACK}Z`} /></clipPath>
      </defs>
      <Glow color="#ffd34d" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="264" rx={opened ? 92 : 62} ry="8" fill="#000" opacity=".3" className="pn-shadow" />

      {/* Piñata colgada: queda inclinada y se hamaca con cada golpe (la animación alterna para reiniciarse). */}
      <g className="pn-rest" style={{ transform: `rotate(${opened ? 0 : [0, 1.5, -2, 2.5, -3][hits] ?? 0}deg)` }}>
        <g className={hits > 0 && !opened ? (hits % 2 ? "pn-swing-a" : "pn-swing-b") : undefined}>
          <path d="M150-40V74" stroke="#c9a46a" strokeWidth="4" /><path d="M150-40V74" stroke="#8c6a3a" strokeWidth="4" strokeDasharray="3 4" />
          {CONES.map(cone)}
          {half("l", body)}{half("r", body)}
          <g className={`pn-piece ${opened ? "is-open" : ""}`} style={{ "--dx": "0px", "--dy": "-40px", "--r": "0deg" } as CSSProperties}>
            <path d="M144 76Q150 66 156 76Q150 82 144 76Z" fill="#ff6fa8" /><circle cx="150" cy="74" r="3" fill="#c9a46a" />
          </g>
        </g>
      </g>

      {/* Golosinas que caen y quedan en el piso. */}
      {opened && LOOT.map(([x, y, kind, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(1.25)`}>
          <g className="pn-loot" style={{ "--sx": `${(C.x - x) / 1.25}px`, "--sy": `${(C.y - y) / 1.25}px`, animationDelay: `${60 + i * 45}ms` } as CSSProperties}>
            {kind === "ball" && <><circle r="7.5" fill={c} /><circle cx="-2.5" cy="-2.5" r="2.4" fill="#fff" opacity=".6" /></>}
            {kind === "star" && <polygon points={star(9, 4)} fill={c} stroke="#fff6cf" strokeWidth="1" strokeLinejoin="round" />}
            {kind === "candy" && <g transform={`rotate(${(rand(i) - 0.5) * 50})`}><path d="M-7 0L-13-6V6ZM7 0L13-6V6Z" fill={c} opacity=".8" /><ellipse rx="8" ry="5.5" fill={c} /><path d="M-3-5Q0 0-3 5M3-5Q6 0 3 5" stroke="#fff" strokeOpacity=".6" strokeWidth="1.6" fill="none" /></g>}
          </g>
        </g>
      ))}
    </SceneFrame>
  );
}

const CSS = `
.pn-rest { transform-box: view-box; transform-origin: 150px -40px; transition: transform 600ms cubic-bezier(.34,1.56,.64,1); }
.pn-swing-a, .pn-swing-b { transform-box: view-box; transform-origin: 150px -40px; }
.pn-swing-a { animation: pn-swing-a 1.2s cubic-bezier(.3,.6,.4,1) both; }
.pn-swing-b { animation: pn-swing-b 1.2s cubic-bezier(.3,.6,.4,1) both; }
@keyframes pn-swing-a { 0%, 100% { transform: none; } 18% { transform: rotate(8deg); } 42% { transform: rotate(-5deg); } 66% { transform: rotate(2.5deg); } 86% { transform: rotate(-1deg); } }
@keyframes pn-swing-b { 0%, 100% { transform: none; } 18% { transform: rotate(-8deg); } 42% { transform: rotate(5deg); } 66% { transform: rotate(-2.5deg); } 86% { transform: rotate(1deg); } }
.pn-tassel { transform-box: fill-box; transform-origin: 50% 0%; transition: transform 700ms cubic-bezier(.5,0,.75,0), opacity 700ms ease-in; }
.pn-tassel.is-off { opacity: 0; transform: translateY(60px) rotate(25deg); }
.pn-crack { transition: stroke-dashoffset 500ms cubic-bezier(.16,1,.3,1), opacity 250ms, stroke-width 300ms; }
.pn-shadow { transition: rx 600ms; }
.pn-piece, .pn-half { transform-box: fill-box; transform-origin: 50% 50%; }
.pn-top { transform-box: view-box; transform-origin: 150px 72px; }
.pn-top.is-open { animation: pn-dangle 1.4s cubic-bezier(.3,.6,.4,1) both; }
@keyframes pn-dangle { 0% { transform: none; } 18% { transform: translateY(-8px) rotate(24deg); } 42% { transform: rotate(-15deg); } 66% { transform: rotate(7deg); } 86% { transform: rotate(-3deg); } 100% { transform: rotate(0); } }
.pn-piece.is-open { animation: pn-fly 1s cubic-bezier(.25,.6,.5,1) both; }
@keyframes pn-fly { 0% { transform: none; } 100% { transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(.7); opacity: 0; } }
.pn-half-l.is-open { animation: pn-half-l 1s cubic-bezier(.4,0,.7,.5) both; }
.pn-half-r.is-open { animation: pn-half-r 1s cubic-bezier(.4,0,.7,.5) both; }
@keyframes pn-half-l { 0% { transform: none; } 20% { transform: translate(-10px,-8px) rotate(-10deg); } 100% { transform: translate(-60px,110px) rotate(-70deg); opacity: 0; } }
@keyframes pn-half-r { 0% { transform: none; } 20% { transform: translate(10px,-8px) rotate(10deg); } 100% { transform: translate(60px,110px) rotate(70deg); opacity: 0; } }
.pn-loot { transform-box: fill-box; transform-origin: 50% 50%; animation: pn-loot 1.1s cubic-bezier(.3,.5,.5,1) both; }
@keyframes pn-loot {
  0% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(.3) rotate(0); }
  10% { opacity: 1; }
  35% { transform: translate(calc(var(--sx) * .55), calc(var(--sy) * .55 - 50px)) scale(1) rotate(140deg); }
  80% { transform: translate(0, 0) scale(1) rotate(330deg); }
  90% { transform: translate(0, -7px) scale(1) rotate(350deg); }
  100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(360deg); }
}
.pn-rain { width: 7px; height: 10px; border-radius: 1px; opacity: 0; animation: pn-rain 2.4s linear both; }
@keyframes pn-rain { 0% { opacity: 0; transform: translate(0,0) rotate(0); } 10% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), 330px) rotate(420deg); } }
@media (prefers-reduced-motion: reduce) {
  .pn-rest, .pn-tassel, .pn-crack { transition: opacity 200ms; }
  .pn-swing-a, .pn-swing-b { animation: none; }
  .pn-top.is-open { animation: none; }
  .pn-piece.is-open, .pn-half-l.is-open, .pn-half-r.is-open { animation: none; opacity: 0; }
  .pn-loot { animation: none; }
}
`;
