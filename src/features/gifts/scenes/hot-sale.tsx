import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

/** Capas de la llama (de afuera hacia adentro), con la base en (150, 136). */
const FLAME_OUT = "M150 137C127 134 119 116 127 99C130 107 135 109 138 105C134 93 141 83 153 74C152 87 162 91 166 101C169 97 170 92 169 87C181 100 179 129 150 137Z";
const FLAME_MID = "M150 136C135 133 131 120 136 109C139 115 144 115 145 111C144 102 149 95 157 90C157 100 164 104 165 112C168 124 162 133 150 136Z";
const MINI = "M0 8C-5 7-6 2-3-3C-2 0 0 0 0-2C0-5 2-7 4-8C3-4 6-2 5 2C5 5 3 8 0 8Z";
const FLAME_IN = "M150 135C142 133 140 125 143 118C146 122 150 121 150 117C151 112 154 108 157 107C157 113 160 116 160 121C160 129 156 134 150 135Z";

/** Hot Sale: caja rojo fuego con una llama en lugar de moño. La llama crece, la caja se calienta y al abrir estalla. */
export default function HotSaleGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const pick = (v: number[]) => (opened ? v[4] : v[Math.min(hits, 4)]) ?? 0;
  const heat = pick([0, 0.25, 0.48, 0.72, 0.95]);
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits * 5} colors={["#ffd34d", "#ff8a1f", "#fff4c2"]} shape="dot" count={9} y={30 - hits * 3} spread={0.6} size={6} />}
        {opened && (
          <>
            <RevealBurst colors={["#ffd34d", "#ff8a1f", "#fff4c2", "#ff4d1f"]} shapes={["dot", "star"]} y={38} />
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2 + rand(i) * 0.5, r = 90 + rand(i + 4) * 50;
              return <span key={i} className="hs-tag absolute" style={{ left: "50%", top: "38%", background: ["#ffd34d", "#fff4c2", "#ff8a1f"][i % 3], animationDelay: `${80 + i * 45}ms`, "--dx": `${Math.cos(a) * r}px`, "--dy": `${Math.sin(a) * r * 0.8}px`, "--rot": `${(rand(i * 3) - 0.5) * 300}deg` } as CSSProperties}>%</span>;
            })}
          </>
        )}
      </>
    )}>
      <SceneStyle id="hot-sale" css={CSS} />
      <defs>
        <linearGradient id="hs-front" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d84e24" /><stop offset=".55" stopColor="#b8391a" /><stop offset="1" stopColor="#7a1f0c" /></linearGradient>
        <linearGradient id="hs-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2602f" /><stop offset="1" stopColor="#a22e10" /></linearGradient>
        <linearGradient id="hs-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7a1d0a" /><stop offset=".5" stopColor="#5e1508" /><stop offset="1" stopColor="#420e05" /></linearGradient>
        <linearGradient id="hs-f1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff8a1f" /><stop offset="1" stopColor="#ff3d1a" /></linearGradient>
        <linearGradient id="hs-f2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffd34d" /><stop offset="1" stopColor="#ffa53a" /></linearGradient>
        <radialGradient id="hs-heat" cy=".1" r=".9"><stop offset="0" stopColor="#ffd34d" stopOpacity=".75" /><stop offset=".6" stopColor="#ff8a1f" stopOpacity=".25" /><stop offset="1" stopColor="#ff8a1f" stopOpacity="0" /></radialGradient>
        <radialGradient id="hs-halo" cy=".62"><stop offset="0" stopColor="#ffd34d" stopOpacity=".8" /><stop offset=".5" stopColor="#ff8a1f" stopOpacity=".3" /><stop offset="1" stopColor="#ff8a1f" stopOpacity="0" /></radialGradient>
        <linearGradient id="hs-ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff4c2" stopOpacity=".95" /><stop offset="1" stopColor="#ffd34d" stopOpacity="0" /></linearGradient>
      </defs>
      <Glow color="#ff8a1f" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="88" ry="10" fill="#000" opacity=".4" />

      {/* Calor que sube por los costados. */}
      <g className="hs-fade" style={{ opacity: opened ? 0 : heat }} stroke="#ffd34d" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".6">
        <path d="M74 126q-6-9 0-18t0-18M226 126q6-9 0-18t0-18" /><path d="M94 116q-4-7 0-14t0-14M206 116q4-7 0-14t0-14" strokeOpacity=".6" />
      </g>

      {/* Al abrir: interior encendido y rayos. */}
      {opened && (
        <>
          <g className="hs-rays">{[-54, -32, -12, 12, 32, 54].map((a, i) => <path key={a} d="M150 156L137 24L163 24Z" fill="url(#hs-ray)" opacity={i % 2 ? 0.55 : 0.9} transform={`rotate(${a} 150 156)`} />)}</g>
          <path d="M82 158H218L210 149H90Z" fill="#3a0c04" /><path d="M90 149H210" stroke="#ffd34d" strokeWidth="2.4" />
          <ellipse className="hs-ember" cx="150" cy="152" rx="56" ry="9" fill="url(#hs-halo)" />
        </>
      )}

      {/* Caja: se calienta (bordes encendidos y brillo desde arriba). */}
      <rect x="82" y="158" width="136" height="98" rx="6" fill="url(#hs-front)" />
      <rect x="82" y="158" width="136" height="98" rx="6" fill="url(#hs-heat)" className="hs-fade" style={{ opacity: heat }} />
      {[[106, 178, -12], [194, 180, 10], [112, 236, 8], [190, 234, -8], [124, 184, 6], [178, 232, -4]].map(([x, y, r], i) => <path key={i} d={MINI} fill="#ff9a3a" opacity={i > 3 ? 0.14 : 0.24} transform={`translate(${x} ${y}) rotate(${r}) scale(${i > 3 ? 0.8 : 1.3})`} />)}
      <rect x="82" y="244" width="136" height="12" rx="4" fill="#000" opacity=".16" />
      <rect x="141" y="158" width="18" height="98" fill="url(#hs-band)" />
      <rect x="82" y="196" width="136" height="16" fill="url(#hs-band)" />
      <path d="M141 158V256M159 158V256M82 196H218M82 212H218" stroke="#ffd34d" strokeOpacity=".5" strokeWidth="1" />
      <rect x="82" y="158" width="136" height="98" rx="6" fill="none" stroke="#ffd34d" strokeWidth="7" className="hs-fade" style={{ opacity: heat * 0.25 }} />
      <rect x="82" y="158" width="136" height="98" rx="6" fill="none" stroke="#ffe27a" strokeWidth="2" className="hs-fade" style={{ opacity: heat }} />

      {/* Etiqueta "%" colgada de la caja (se balancea con cada golpe). */}
      <g className="hs-tag-hang" style={{ transform: `rotate(${opened ? 6 : pick([0, 14, -12, 18, -16])}deg)` }}>
        <path d="M212 166Q222 178 224 193" stroke="#ffd34d" strokeWidth="1.5" fill="none" />
        <path d="M224 186L235 195V220Q235 222 233 222H215Q213 222 213 220V195Z" fill="#ffd34d" stroke="#c98a12" strokeWidth="1" />
        <circle cx="224" cy="195" r="2.2" fill="#5e1508" />
        <text x="224" y="215" textAnchor="middle" fontFamily="var(--font-display, sans-serif)" fontSize="13" fontWeight="800" fill="#5e1508">%</text>
      </g>

      {/* Tapa con el nudo de la llama: tiembla en los últimos golpes y sale volando al abrir. */}
      <g className={`hs-lid ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `translateY(${pick([0, 0, -1, -3, -6])}px) rotate(${pick([0, 0, 1, -1.5, 2])}deg)` }}>
        <rect x="72" y="134" width="156" height="28" rx="6" fill="url(#hs-lid)" />
        <rect x="72" y="156" width="156" height="6" rx="3" fill="#000" opacity=".2" />
        <rect x="141" y="134" width="18" height="28" fill="url(#hs-band)" />
        <rect x="72" y="134" width="156" height="28" rx="6" fill="none" stroke="#ffe27a" strokeWidth="2" className="hs-fade" style={{ opacity: heat }} />
        <ellipse cx="150" cy="135" rx="13" ry="4.5" fill="#ffd34d" /><ellipse cx="150" cy="134" rx="8" ry="2.2" fill="#5e1508" />
      </g>

      {/* Llama: crece y se pone más amarilla con cada golpe; al abrir estalla. */}
      <g className={`hs-flame ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `scale(${pick([1, 1.14, 1.3, 1.46, 1.62])})` }}>
        <g className={hits > 0 && !opened ? (hits % 2 ? "hs-flare-a" : "hs-flare-b") : undefined}>
          <ellipse cx="150" cy="112" rx="40" ry="44" fill="url(#hs-halo)" className="hs-fade" style={{ opacity: 0.35 + heat * 0.65 }} />
          <path d={FLAME_OUT} fill="url(#hs-f1)" />
          <path d={FLAME_OUT} fill="url(#hs-f2)" className="hs-fade" style={{ opacity: heat * 0.7 }} />
          <g className="hs-core" style={{ transform: `scale(${pick([1, 1.12, 1.24, 1.36, 1.5])})` }}><path d={FLAME_MID} fill="#ffa53a" /><path d={FLAME_IN} fill="#ffd34d" /></g>
          <ellipse cx="150" cy="128" rx="4.5" ry="6" fill="#fff4c2" />
        </g>
      </g>

      {/* Anillo de chispas de la apertura. */}
      {opened && !reduce && (
        <g className="hs-sparks">
          {Array.from({ length: 18 }, (_, i) => <path key={i} d="M150 84V70" stroke={i % 2 ? "#ffd34d" : "#fff4c2"} strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${i * 20} 150 112)`} />)}
          {Array.from({ length: 12 }, (_, i) => <circle key={`d${i}`} cx="150" cy="62" r="2.6" fill="#ff8a1f" transform={`rotate(${i * 30 + 10} 150 112)`} />)}
        </g>
      )}
    </SceneFrame>
  );
}

const CSS = `
.hs-fade { transition: opacity 450ms ease-out; }
.hs-lid { transform-box: view-box; transform-origin: 150px 162px; transition: transform 380ms cubic-bezier(.34,1.56,.64,1); }
.hs-flame { transform-box: view-box; transform-origin: 150px 137px; transition: transform 520ms cubic-bezier(.34,1.56,.64,1); }
.hs-core { transform-box: view-box; transform-origin: 150px 136px; transition: transform 520ms cubic-bezier(.34,1.56,.64,1); }
/* Reavivada de cada golpe: dos nombres iguales que se alternan para que la animación se reinicie sin remontar. */
.hs-flare-a, .hs-flare-b { transform-box: view-box; transform-origin: 150px 137px; }
.hs-flare-a { animation: hs-flare-a 620ms cubic-bezier(.3,.7,.4,1) both; }
.hs-flare-b { animation: hs-flare-b 620ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes hs-flare-a { 0% { transform: none; } 25% { transform: scale(1.22, 1.3) skewX(-6deg); } 55% { transform: scale(.95, .92) skewX(4deg); } 80% { transform: scale(1.04) skewX(-2deg); } 100% { transform: none; } }
@keyframes hs-flare-b { 0% { transform: none; } 25% { transform: scale(1.22, 1.3) skewX(6deg); } 55% { transform: scale(.95, .92) skewX(-4deg); } 80% { transform: scale(1.04) skewX(2deg); } 100% { transform: none; } }
.hs-tag-hang { transform-box: view-box; transform-origin: 212px 166px; transition: transform 500ms cubic-bezier(.34,1.56,.64,1); }
.hs-lid.is-open { animation: hs-lid 1s cubic-bezier(.3,.7,.4,1) 140ms both; }
@keyframes hs-lid { 0% { transform: none; } 20% { transform: translateY(-26px) rotate(-4deg); } 100% { transform: translate(-110px,-170px) rotate(-70deg); opacity: 0; } }
.hs-flame.is-open { animation: hs-burst 620ms cubic-bezier(.2,.8,.3,1) both; }
@keyframes hs-burst { 0% { transform: scale(1.62); } 35% { transform: scale(2.3, 2.1); opacity: 1; } 100% { transform: scale(.2, 2.6); opacity: 0; } }
.hs-sparks { transform-box: view-box; transform-origin: 150px 112px; opacity: 0; animation: hs-sparks 900ms cubic-bezier(.16,1,.3,1) 120ms both; }
@keyframes hs-sparks { 0% { opacity: 1; transform: scale(.3) rotate(0); } 60% { opacity: 1; } 100% { opacity: 0; transform: scale(2.1) rotate(25deg); } }
.hs-rays { transform-box: view-box; transform-origin: 150px 156px; animation: hs-rays 1.3s cubic-bezier(.16,1,.3,1) 220ms both; }
@keyframes hs-rays { from { opacity: 0; transform: scale(.4, .2); } to { opacity: 1; transform: none; } }
.hs-ember { transform-box: fill-box; transform-origin: 50% 50%; animation: hs-rays 1s ease-out 300ms both; }
.hs-tag { padding: 1px 7px 1px 10px; border-radius: 3px 9px 9px 3px; color: #5e1508; font: 800 14px/1.3 var(--font-display, sans-serif); box-shadow: inset 4px 0 0 rgb(94 21 8 / .25); opacity: 0; animation: hs-tag 1.3s cubic-bezier(.2,.7,.4,1) both; }
@keyframes hs-tag {
  0% { opacity: 0; transform: translate(-50%,-50%) scale(.3) rotate(0); }
  12% { opacity: 1; }
  55% { opacity: 1; transform: translate(calc(-50% + var(--dx) * .7), calc(-50% + var(--dy) * .7 - 24px)) scale(1.1) rotate(calc(var(--rot) * .6)); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 40px)) scale(1) rotate(var(--rot)); }
}
@media (prefers-reduced-motion: reduce) {
  .hs-lid, .hs-flame, .hs-core, .hs-tag-hang { transition: opacity 200ms; }
  .hs-flare-a, .hs-flare-b, .hs-rays, .hs-ember { animation: none; }
  .hs-lid.is-open, .hs-flame.is-open { animation: none; opacity: 0; }
}
`;
