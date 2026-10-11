import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle } from "./kit";
import type { GiftSceneProps } from "./types";

/** Corte zigzag de la tapa (arco que baja en el centro, como se ve un corte redondo de frente). */
const CUT = Array.from({ length: 13 }, (_, i) => { const x = 96 + i * 9; return `${x},${(128 + 14 * Math.sin((Math.PI * (x - 96)) / 108) + (i % 2 ? 4 : -4)).toFixed(1)}`; }).join(" ");
const EYE_L = "M106 184Q108 160 120 155Q132 160 134 184Q120 188 106 184Z";
const EYE_R = "M166 184Q168 160 180 155Q192 160 194 184Q180 188 166 184Z";
const NOSE = "M143 199L150 188L157 199Q150 201 143 199Z";
const MOUTH = "M98 205Q150 223 202 205Q196 241 150 243Q104 241 98 205Z";
/** Grietas (una por golpe), con el punto del impacto para las astillas. */
const CRACKS = [
  { d: "M80 150L90 162L85 173L96 186L91 197", x: 86, y: 160 },
  { d: "M224 196L212 206L219 217L205 231", x: 216, y: 206 },
  { d: "M208 146L198 158L206 167L199 180", x: 204, y: 156 },
  { d: "M82 212L94 221L87 232L100 241", x: 88, y: 222 },
];
const BAT = "M0-2C-4-9-11-11-19-8C-16-5-16-1-18 3C-13 0-9 2-7 6C-4 2-2 2 0 4C2 2 4 2 7 6C9 2 13 0 18 3C16-1 16-5 19-8C11-11 4-9 0-2Z";
const BATS = [[-150, -110, 1.9, -20], [140, -130, 2.1, 18], [-170, -20, 1.6, -8], [165, -40, 1.8, 10], [-60, -170, 1.5, -14], [70, -180, 1.7, 12]];
const CANDIES = [[62, 250, "#8f5bd6", -20], [88, 264, "#7ad151", 15], [118, 270, "#ff5fa2", -8], [186, 270, "#ffd34d", 12], [214, 262, "#8f5bd6", -15], [240, 249, "#7ad151", 22]] as const;

/** Halloween: una calabaza simpática que se ilumina por dentro y se agrieta; al abrir vuela la tapa y salen murciélagos. */
export default function HalloweenGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const hit = opened ? undefined : CRACKS[hits - 1];
  const light = opened ? 1 : [0.1, 0.32, 0.54, 0.76, 0.94][hits] ?? 0.94;
  const pumpkin = (
    <>
      <ellipse cx="98" cy="186" rx="48" ry="62" fill="url(#hw-l2)" /><ellipse cx="202" cy="186" rx="48" ry="62" fill="url(#hw-l2)" />
      <ellipse cx="122" cy="184" rx="50" ry="66" fill="url(#hw-l1)" stroke="#8f3f08" strokeOpacity=".3" /><ellipse cx="178" cy="184" rx="50" ry="66" fill="url(#hw-l1)" stroke="#8f3f08" strokeOpacity=".3" />
      <ellipse cx="150" cy="183" rx="44" ry="68" fill="url(#hw-c)" stroke="#8f3f08" strokeOpacity=".3" />
      <path d="M118 128Q112 150 116 170M182 128Q188 150 184 170" stroke="#fff" strokeOpacity=".12" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  );
  const hole = (d: string) => (
    <g key={d}>
      <path d={d} fill="#ffcf8a" />
      <g transform="translate(0 2.5)"><path d={d} fill="#2a0f05" /><path d={d} fill="url(#hw-fire)" className="hw-light" style={{ opacity: light }} /></g>
    </g>
  );
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hit && <Debris key={hits} seed={hits * 7} colors={["#ff8a1f", "#ffb45a", "#ffd34d"]} shape="shard" count={8} x={hit.x / 3} y={hit.y / 3} spread={0.7} size={8} />}
        {opened && <RevealBurst colors={["#ff8a1f", "#ffd34d", "#8f5bd6", "#7ad151"]} shapes={["dot", "star", "square"]} y={42} />}
      </>
    )}>
      <SceneStyle id="halloween" css={CSS} />
      <defs>
        <radialGradient id="hw-c" cx=".4" cy=".28" r=".8"><stop offset="0" stopColor="#ffb45a" /><stop offset=".5" stopColor="#ff8a1f" /><stop offset="1" stopColor="#c4560b" /></radialGradient>
        <radialGradient id="hw-l1" cx=".4" cy=".3" r=".8"><stop offset="0" stopColor="#ff9c3c" /><stop offset=".55" stopColor="#ec7414" /><stop offset="1" stopColor="#a8490a" /></radialGradient>
        <radialGradient id="hw-l2" cx=".4" cy=".3" r=".8"><stop offset="0" stopColor="#ee8a2c" /><stop offset=".55" stopColor="#d4630f" /><stop offset="1" stopColor="#8a3c08" /></radialGradient>
        <radialGradient id="hw-fire" cx=".5" cy=".7"><stop offset="0" stopColor="#fffbe0" /><stop offset=".45" stopColor="#ffd34d" /><stop offset="1" stopColor="#ff8a1f" /></radialGradient>
        <radialGradient id="hw-aura"><stop offset="0" stopColor="#ffd34d" stopOpacity=".55" /><stop offset="1" stopColor="#ffd34d" stopOpacity="0" /></radialGradient>
        <radialGradient id="hw-inner" cy=".7"><stop offset="0" stopColor="#fffbe0" /><stop offset=".5" stopColor="#ffd34d" /><stop offset="1" stopColor="#ff8a1f" /></radialGradient>
        <linearGradient id="hw-ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffd34d" stopOpacity=".9" /><stop offset="1" stopColor="#ffd34d" stopOpacity="0" /></linearGradient>
        <clipPath id="hw-top"><polygon points={`96,40 ${CUT} 204,40`} /></clipPath>
        <clipPath id="hw-body"><polygon points={`0,0 96,0 ${CUT} 204,0 300,0 300,300 0,300`} /></clipPath>
      </defs>
      <Glow color="#ff8a1f" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="254" rx="96" ry="10" fill="#000" opacity=".4" />

      {/* Luz bajo la tapa (se ve cuando se levanta) y, al abrir, la boca encendida con rayos. */}
      {!opened && <ellipse cx="150" cy="135" rx="46" ry="9" fill="url(#hw-inner)" className="hw-light" style={{ opacity: light }} />}
      {opened && (
        <>
          <g className="hw-rays">{[-50, -28, -10, 10, 28, 50].map((a, i) => <path key={a} d="M150 132L140 10L160 10Z" fill="url(#hw-ray)" opacity={i % 2 ? 0.5 : 0.85} transform={`rotate(${a} 150 132)`} />)}</g>
          <ellipse cx="150" cy="131" rx="57" ry="19" fill="#9a420a" /><ellipse cx="150" cy="133" rx="50" ry="14" fill="url(#hw-inner)" />
        </>
      )}

      {/* Cuerpo: la cara se enciende más con cada golpe y aparece una grieta. */}
      <g clipPath="url(#hw-body)">{pumpkin}</g>
      <ellipse cx="150" cy="198" rx="74" ry="56" fill="url(#hw-aura)" className="hw-light" style={{ opacity: light }} />
      {[EYE_L, EYE_R, NOSE, MOUTH].map(hole)}
      <path d="M128 211H140V219Q134 223 128 219ZM160 211H172V219Q166 223 160 219Z" fill="#f07a18" />
      {CRACKS.map((c, i) => {
        const on = hits > i || opened;
        const draw = { strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, opacity: on ? 1 : 0 } as CSSProperties;
        return (
          <g key={c.d} fill="none" strokeLinejoin="round" strokeLinecap="round">
            <path d={c.d} pathLength={1} stroke="#5a2405" strokeWidth="3.4" className="hw-crack" style={draw} />
            <path d={c.d} pathLength={1} stroke="#ffe27a" strokeWidth="1.2" className="hw-crack" style={{ ...draw, opacity: on ? light : 0 }} />
          </g>
        );
      })}
      {hits > 0 && !opened && <ellipse key={hits} cx="150" cy="200" rx="60" ry="44" fill="url(#hw-aura)" className="hw-flare" />}

      {/* Tapa con el cabito: sale volando al abrir. */}
      <g className={`hw-lid ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `translateY(${[0, 0, -1, -2, -4][hits] ?? 0}px) rotate(${[0, 0, -1, 1.5, -2.5][hits] ?? 0}deg)` }}>
        <g clipPath="url(#hw-top)">{pumpkin}</g>
        <polyline points={CUT} fill="none" stroke="#6b2a05" strokeWidth="2.4" strokeLinejoin="round" />
        <polyline points={CUT} fill="none" stroke="#ffd34d" strokeWidth="1" strokeLinejoin="round" className="hw-light" style={{ opacity: light * 0.8 }} />
        <path d="M141 124C140 110 142 98 149 89C153 85 160 85 163 89C158 96 156 108 159 124Z" fill="#5f6b2c" />
        <path d="M150 122C149 110 151 99 156 91" stroke="#3f4a1c" strokeWidth="2" fill="none" />
        <path d="M159 104C172 98 181 105 176 113C172 119 164 114 168 108" stroke="#7a8c3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M140 118C128 108 114 112 108 120C120 124 132 124 140 118Z" fill="#4f7a2a" /><path d="M139 118Q124 116 112 119" stroke="#2f5216" strokeWidth="1" fill="none" />
      </g>

      {/* Murciélagos y caramelos que salen de adentro. */}
      {opened && (
        <>
          {!reduce && BATS.map(([tx, ty, s, r], i) => (
            <g key={i} transform="translate(150 132)">
              <g className="hw-bat" style={{ "--tx": `${tx}px`, "--ty": `${ty}px`, "--s": s, "--r": `${r}deg`, animationDelay: `${120 + i * 70}ms` } as CSSProperties}>
                <g className="hw-flap"><path d={BAT} fill="#2b1838" stroke="#b48cf0" strokeOpacity=".8" strokeWidth="1.2" /><circle cx="-1.6" cy="-1" r=".9" fill="#ffd34d" /><circle cx="1.6" cy="-1" r=".9" fill="#ffd34d" /></g>
              </g>
            </g>
          ))}
          {CANDIES.map(([x, y, c, r], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <g className="hw-candy" style={{ "--sx": `${150 - x}px`, "--sy": `${130 - y}px`, animationDelay: `${200 + i * 60}ms` } as CSSProperties}>
                <g transform={`rotate(${r})`}><path d="M-7 0L-14-6V6ZM7 0L14-6V6Z" fill={c} opacity=".8" /><ellipse rx="8" ry="6" fill={c} /><path d="M-3-5Q0 0-3 5M3-5Q6 0 3 5" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" fill="none" /></g>
              </g>
            </g>
          ))}
        </>
      )}
    </SceneFrame>
  );
}

const CSS = `
.hw-light { transition: opacity 500ms ease-out; }
.hw-crack { transition: stroke-dashoffset 450ms cubic-bezier(.16,1,.3,1), opacity 200ms; }
.hw-lid { transform-box: view-box; transform-origin: 150px 122px; transition: transform 380ms cubic-bezier(.34,1.56,.64,1); }
.hw-flare { opacity: 0; animation: hw-flare 520ms ease-out both; }
@keyframes hw-flare { 0% { opacity: 1; } 100% { opacity: 0; } }
.hw-lid.is-open { animation: hw-lid 1s cubic-bezier(.3,.7,.4,1) both; }
@keyframes hw-lid { 0% { transform: none; } 22% { transform: translateY(-28px) rotate(-8deg); } 100% { transform: translate(90px,-200px) rotate(220deg); opacity: 0; } }
.hw-rays { transform-box: view-box; transform-origin: 150px 132px; animation: hw-rays 1.3s cubic-bezier(.16,1,.3,1) 150ms both; }
@keyframes hw-rays { from { opacity: 0; transform: scale(.4, .2); } to { opacity: 1; transform: none; } }
.hw-bat { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: hw-bat 1.3s cubic-bezier(.3,.6,.4,1) both; }
@keyframes hw-bat { 0% { opacity: 0; transform: translate(0,0) scale(.4) rotate(0); } 12% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(var(--s)) rotate(var(--r)); } }
.hw-flap { transform-box: fill-box; transform-origin: 50% 40%; animation: hw-flap 150ms ease-in-out 8 alternate; }
@keyframes hw-flap { to { transform: scale(1, .35); } }
.hw-candy { transform-box: fill-box; transform-origin: 50% 50%; animation: hw-candy 1.1s cubic-bezier(.3,.5,.5,1) both; }
@keyframes hw-candy {
  0% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(.4) rotate(0); }
  10% { opacity: 1; }
  45% { transform: translate(calc(var(--sx) * .45), calc(var(--sy) * .45 - 60px)) scale(1) rotate(160deg); }
  82% { transform: translate(0, 0) scale(1) rotate(330deg); }
  91% { transform: translate(0, -6px) scale(1) rotate(350deg); }
  100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .hw-crack, .hw-lid { transition: opacity 200ms; }
  .hw-flare { display: none; }
  .hw-lid.is-open { animation: none; opacity: 0; }
  .hw-rays, .hw-candy { animation: none; }
}
`;
