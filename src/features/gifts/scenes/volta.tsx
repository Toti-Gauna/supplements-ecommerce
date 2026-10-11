import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle } from "./kit";
import type { GiftSceneProps } from "./types";

/** Volta (sin temática): caja de kraft con cinta oliva. El moño se afloja, la tapa se levanta y sale la luz. */
export default function VoltaGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const light = opened ? 1 : [0, 0.25, 0.45, 0.7, 0.9][hits] ?? 0.9;
  const lid = opened ? "" : ["", "", "", "translateY(-4px)", "translateY(-10px) rotate(-3deg)"][hits] ?? "";
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits} colors={["#d2ad69", "#f3dca6", "#56663d"]} shape={hits % 2 ? "star" : "ribbon"} count={8} y={42} />}
        {opened && <RevealBurst colors={["#f3dca6", "#d2ad69", "#56663d", "#fff4d6"]} shapes={["star", "ribbon", "dot"]} y={44} />}
      </>
    )}>
      <SceneStyle id="volta" css={CSS} />
      <defs>
        <linearGradient id="vg-front" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d6b688" /><stop offset=".7" stopColor="#c9a77a" /><stop offset="1" stopColor="#a8865a" /></linearGradient>
        <linearGradient id="vg-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2c597" /><stop offset="1" stopColor="#c19c6b" /></linearGradient>
        <linearGradient id="vg-ribbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#56663d" /><stop offset=".5" stopColor="#3d4a2a" /><stop offset="1" stopColor="#2c3620" /></linearGradient>
        <linearGradient id="vg-ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff4d6" stopOpacity=".95" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></linearGradient>
      </defs>
      <Glow color="#d2ad69" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="258" rx="86" ry="10" fill="#000" opacity=".35" />

      {/* Rayos de luz que escapan por la tapa (crecen con cada golpe, estallan al abrir). */}
      <g className={`vg-rays ${opened ? "is-open" : ""}`} style={{ opacity: light }}>
        {[-58, -36, -16, 0, 16, 36, 58].map((a, i) => (
          <path key={a} d="M150 150 L138 20 L162 20 Z" fill="url(#vg-ray)" opacity={i % 2 ? 0.55 : 0.9} transform={`rotate(${a} 150 150)`} />
        ))}
      </g>

      {/* Cuerpo de la caja con su cinta. */}
      <rect x="80" y="152" width="140" height="102" rx="6" fill="url(#vg-front)" />
      <rect x="80" y="152" width="140" height="10" fill="#8f6f45" opacity=".35" />
      <rect x="80" y="152" width="140" height="6" fill="#fff4d6" style={{ opacity: light * 0.9, transition: "opacity 400ms" }} />
      <g className={`vg-band ${opened ? "is-open" : ""}`}>
        <rect x="141" y="152" width="18" height="102" fill="url(#vg-ribbon)" />
        <path d={hits >= 3 ? "M80 200 Q150 214 220 200 L220 216 Q150 230 80 216 Z" : "M80 196 H220 V212 H80 Z"} fill="url(#vg-ribbon)" style={{ transition: "d 400ms" }} />
      </g>
      <text x="100" y="244" fontFamily="var(--font-display, serif)" fontSize="11" fill="#6b5233" opacity=".55" letterSpacing="2">VOLTA</text>

      {/* Tapa: se levanta en los últimos golpes y sale volando al abrir. */}
      <g className={`vg-lid ${opened ? "is-open" : ""}`} style={{ transform: lid }}>
        <rect x="70" y="128" width="160" height="28" rx="6" fill="url(#vg-lid)" />
        <rect x="70" y="150" width="160" height="6" rx="3" fill="#8f6f45" opacity=".3" />
        <rect x="141" y="128" width="18" height="28" fill="url(#vg-ribbon)" />
      </g>

      {/* Moño: se afloja con cada golpe y sale despedido al abrir. */}
      <g className={`vg-bow ${opened ? "is-open" : ""}`} style={{ transform: opened ? undefined : `rotate(${[0, -6, 8, -12, 14][hits] ?? 0}deg)` }}>
        <path d="M150 128 C128 100 96 104 100 122 C104 138 132 134 150 128 Z" fill="url(#vg-ribbon)" style={{ transform: `scale(${1 + hits * 0.04})`, transformOrigin: "150px 128px", transition: "transform 400ms" }} />
        <path d="M150 128 C172 100 204 104 200 122 C196 138 168 134 150 128 Z" fill="url(#vg-ribbon)" style={{ transform: `scale(${1 + hits * 0.04})`, transformOrigin: "150px 128px", transition: "transform 400ms" }} />
        <path d="M146 130 L128 166 L138 162 L142 172 Z M154 130 L172 166 L162 162 L158 172 Z" fill="#2c3620" />
        <circle cx="150" cy="128" r="9" fill="#56663d" />
        <path d="M144 124 Q150 120 156 124" stroke="#7a8a5c" strokeWidth="2" fill="none" />
      </g>

      {/* Etiqueta de bronce que se balancea. */}
      <g className="vg-tag" style={{ transform: `rotate(${opened ? 0 : [0, 12, -16, 20, -24][hits] ?? 0}deg)` }}>
        <path d="M158 132 Q182 150 196 168" stroke="#8a6a2e" strokeWidth="1.5" fill="none" />
        <circle cx="200" cy="176" r="13" fill="#d2ad69" stroke="#8a6a2e" strokeWidth="1.5" />
        <text x="200" y="181" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="13" fontWeight="700" fill="#4a3a1c">V</text>
      </g>
    </SceneFrame>
  );
}

const CSS = `
.vg-lid, .vg-bow, .vg-tag { transform-box: fill-box; transition: transform 420ms cubic-bezier(.34,1.56,.64,1); }
.vg-lid { transform-origin: 20% 100%; }
.vg-bow { transform-origin: 50% 90%; }
.vg-tag { transform-origin: 0% 0%; }
.vg-rays { transform-box: view-box; transform-origin: 150px 150px; transition: opacity 400ms; }
.vg-rays.is-open { animation: vg-rays 1.4s cubic-bezier(.16,1,.3,1) both; }
@keyframes vg-rays { from { transform: scale(.6, .4); } to { transform: scale(1.15, 1.25) rotate(4deg); } }
.vg-lid.is-open { animation: vg-lid 900ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes vg-lid { 30% { transform: translate(10px,-40px) rotate(-8deg); } 100% { transform: translate(120px,-150px) rotate(40deg); opacity: 0; } }
.vg-bow.is-open { animation: vg-bow 800ms cubic-bezier(.3,.7,.4,1) both; }
@keyframes vg-bow { 25% { transform: translate(-6px,-36px) rotate(-30deg); } 100% { transform: translate(-110px,-170px) rotate(-200deg) scale(.7); opacity: 0; } }
.vg-band.is-open { animation: vg-band 600ms ease-in 200ms both; }
@keyframes vg-band { to { opacity: 0; transform: translateY(14px); } }
@media (prefers-reduced-motion: reduce) {
  .vg-lid, .vg-bow, .vg-tag { transition: none; }
  .vg-lid.is-open, .vg-bow.is-open, .vg-band.is-open { animation: none; opacity: 0; }
  .vg-rays.is-open { animation: none; }
}
`;
