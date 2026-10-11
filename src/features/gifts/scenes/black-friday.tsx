import type { CSSProperties } from "react";
import { Debris, Glow, RevealBurst, SceneFrame, SceneStyle, rand } from "./kit";
import type { GiftSceneProps } from "./types";

/** Combinación: el dial gira una muesca distinta en cada golpe (alternando el sentido, como una caja fuerte real). */
const DIAL = [0, 72, -36, 108, 36, 144];
const LIGHTS = [118, 134, 150, 166, 182];
const TICKS = Array.from({ length: 30 }, (_, i) => i);
const RAYS = [-80, -58, -36, -14, 8, 30, 52, 74, 100, 180, 200, 240, 262];
/** Monedas y etiquetas que salen volando al abrir. */
const LOOT = Array.from({ length: 18 }, (_, i) => {
  const a = -Math.PI / 2 + (rand(i + 5) - 0.5) * Math.PI * 1.5, r = 70 + rand(i + 9) * 80;
  return { tag: i % 3 === 0, dx: Math.cos(a) * r, dy: Math.sin(a) * r - 20, rot: (rand(i + 13) - 0.5) * 600, delay: 260 + rand(i + 17) * 260, s: 0.8 + rand(i + 21) * 0.5 };
});
const BAR = "M0 12 L4 0 H26 L30 12 Z";
/** Pilas de monedas: x y cantidad. */
const STACKS: [number, number][] = [[104, 6], [124, 9], [144, 4]];

/** Black Friday: caja fuerte con dial dorado. Cada golpe gira el dial y prende una luz; al abrir, la puerta gira y sale el oro. */
export default function BlackFridayGift({ hits, total, opened, reduce }: GiftSceneProps) {
  const open = opened ? " is-open" : "";
  const lit = opened ? 5 : hits;
  return (
    <SceneFrame overlay={!reduce && (
      <>
        {hits > 0 && !opened && <Debris key={hits} seed={hits + 100} colors={["#f3dca6", "#d4b06a", "#fff4d6"]} shape="star" count={6} x={47} y={55} spread={0.55} size={7} />}
        {opened && (
          <>
            <RevealBurst colors={["#f3dca6", "#fff4d6", "#d4b06a"]} shapes={["star"]} y={55} />
            {LOOT.map((l, i) => (
              <span key={i} className={`bf-loot absolute ${l.tag ? "bf-tag" : "bf-coin"}`} style={{ left: "50%", top: "55%", "--dx": `${l.dx}px`, "--dy": `${l.dy}px`, "--rot": `${l.rot}deg`, "--s": l.s, animationDelay: `${l.delay}ms` } as CSSProperties}>
                {l.tag ? "%" : ""}
              </span>
            ))}
          </>
        )}
      </>
    )}>
      <SceneStyle id="black-friday" css={CSS} />
      <defs>
        <linearGradient id="bf-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34343b" /><stop offset=".12" stopColor="#2a2a30" /><stop offset="1" stopColor="#111114" /></linearGradient>
        <linearGradient id="bf-door" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c2c33" /><stop offset="1" stopColor="#141417" /></linearGradient>
        <linearGradient id="bf-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff4d6" /><stop offset=".4" stopColor="#f3dca6" /><stop offset="1" stopColor="#a8823c" /></linearGradient>
        <radialGradient id="bf-vault" cx=".5" cy=".55" r=".7"><stop offset="0" stopColor="#fff4d6" /><stop offset=".35" stopColor="#f3dca6" stopOpacity=".7" /><stop offset="1" stopColor="#3a2c12" stopOpacity="0" /></radialGradient>
        <linearGradient id="bf-ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff4d6" stopOpacity=".9" /><stop offset="1" stopColor="#f3dca6" stopOpacity="0" /></linearGradient>
        <filter id="bf-blur" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <Glow color="#f3dca6" hits={hits} total={total} opened={opened} />
      <ellipse cx="150" cy="257" rx="100" ry="8" fill="#000" opacity=".5" />

      {/* Rayos de oro que salen al abrir. */}
      <g className={`bf-rays${open}`}>
        {RAYS.map((a, i) => <path key={a} d="M150 163 L142 10 L158 10 Z" fill="url(#bf-ray)" opacity={i % 2 ? 0.5 : 0.85} transform={`rotate(${a} 150 163)`} />)}
      </g>

      {/* Cuerpo de la caja, patas y marco de la puerta. */}
      <rect x="82" y="246" width="22" height="10" rx="2" fill="#0b0b0d" /><rect x="196" y="246" width="22" height="10" rx="2" fill="#0b0b0d" />
      <rect x="64" y="78" width="172" height="170" rx="12" fill="url(#bf-body)" />
      <rect x="66" y="80" width="168" height="3" rx="1.5" fill="#fff" opacity=".12" />
      <rect x="78" y="92" width="144" height="142" rx="7" fill="#050506" />

      {/* Interior: fondo dorado, lingotes, pilas de monedas y una etiqueta. */}
      <g className={`bf-vault${open}`}>
        <rect x="82" y="96" width="136" height="134" rx="5" fill="#1a140a" />
        <rect x="82" y="96" width="136" height="134" rx="5" fill="url(#bf-vault)" />
        <rect x="86" y="168" width="128" height="4" fill="#5a4a2a" />
        {[[104, 156], [136, 156], [168, 156], [120, 144], [152, 144]].map(([x, y]) => <path key={`${x}${y}`} d={BAR} fill="url(#bf-gold)" stroke="#8a6a2e" strokeWidth=".8" transform={`translate(${x} ${y})`} />)}
        {STACKS.map(([x, n]) => Array.from({ length: n }, (_, k) => <ellipse key={`${x}-${k}`} cx={x} cy={224 - k * 4} rx="9" ry="3" fill="url(#bf-gold)" stroke="#8a6a2e" strokeWidth=".7" />))}
        <g transform="translate(184 206) rotate(-14)">
          <path d="M-14 -10 H8 L16 0 L8 10 H-14 Z" fill="#f3dca6" stroke="#8a6a2e" strokeWidth="1" /><circle cx="9" cy="0" r="2" fill="#1a140a" />
          <text x="-3" y="5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0b0b0d">%</text>
        </g>
      </g>

      {/* Bisagras (la puerta gira sobre ellas). */}
      {[106, 196].map((y) => <rect key={y} x="74" y={y} width="10" height="24" rx="3" fill="#3a3a42" stroke="#0b0b0d" />)}
      {/* Cara interna de la puerta: aparece abierta, en perspectiva, a la izquierda de la bisagra. */}
      <g className={`bf-door-back${open}`}>
        <path d="M82 96 L30 84 L30 244 L82 230 Z" fill="#202026" stroke="#0b0b0d" strokeWidth="1.5" />
        <path d="M74 110 L40 102 L40 226 L74 218 Z" fill="#17171b" stroke="#3a3a42" />
        {[118, 150, 182].map((y) => <rect key={y} x="26" y={y - 4} width="10" height="9" rx="2" fill="url(#bf-gold)" />)}
      </g>

      {/* Puerta: luz que se escapa por la junta, luces, dial, manija y placa. */}
      <rect x="82" y="96" width="136" height="134" rx="6" fill="none" stroke="#f3dca6" strokeWidth="4" filter="url(#bf-blur)" style={{ opacity: opened ? 0 : [0, 0.15, 0.32, 0.55, 0.8][hits] ?? 0.8, transition: "opacity 500ms" }} />
      <g className={`bf-door${open}`}>
        <rect x="82" y="96" width="136" height="134" rx="6" fill="url(#bf-door)" />
        <rect x="92" y="106" width="116" height="114" rx="4" fill="none" stroke="#3a3a42" strokeWidth="1.5" />
        {[[89, 103], [211, 103], [89, 223], [211, 223]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.4" fill="#3a3a42" stroke="#55555e" strokeWidth=".6" />)}
        <rect x="106" y="108" width="88" height="14" rx="7" fill="#0b0b0d" stroke="#3a3a42" />
        {LIGHTS.map((x, i) => (
          <g key={x}>
            <circle cx={x} cy="115" r="8" fill="#f3dca6" filter="url(#bf-blur)" style={{ opacity: i < lit ? 0.9 : 0, transition: "opacity 300ms" }} />
            <circle cx={x} cy="115" r="4" fill={i < lit ? "#fff4d6" : "#2a2116"} stroke={i < lit ? "#f3dca6" : "#3a3a42"} strokeWidth="1.2" style={{ transition: "fill 300ms" }} />
          </g>
        ))}
        <path d="M142 128 L146 134 L138 134 Z" fill="#f3dca6" />
        <circle cx="142" cy="166" r="31" fill="url(#bf-gold)" />
        <circle cx="142" cy="166" r="31" fill="none" stroke="#8a6a2e" strokeWidth="1" />
        <g className="bf-dial" style={{ transform: `rotate(${DIAL[opened ? 5 : hits] ?? 0}deg)` }}>
          <circle cx="142" cy="166" r="25" fill="#141417" />
          {TICKS.map((i) => <line key={i} x1="142" y1={i % 5 ? 144 : 142} x2="142" y2="147.5" stroke="#f3dca6" strokeWidth={i % 5 ? 0.9 : 1.6} transform={`rotate(${i * 12} 142 166)`} />)}
          <circle cx="142" cy="166" r="12" fill="url(#bf-gold)" stroke="#8a6a2e" />
          <rect x="140.5" y="155" width="3" height="9" rx="1.5" fill="#8a6a2e" />
        </g>
        <g className={`bf-handle${open}`} style={{ transform: opened ? undefined : `rotate(${[0, -10, 8, -14, 12][hits] ?? 0}deg)` }}>
          <rect x="192" y="160" width="9" height="40" rx="4.5" fill="url(#bf-gold)" stroke="#8a6a2e" />
          <circle cx="196.5" cy="166" r="8" fill="url(#bf-gold)" stroke="#8a6a2e" />
          <circle cx="196.5" cy="166" r="3" fill="#8a6a2e" />
        </g>
        <rect x="108" y="206" width="84" height="14" rx="3" fill="url(#bf-gold)" />
        <text x="150" y="216.2" textAnchor="middle" fontSize="8.4" fontWeight="800" letterSpacing="1.6" fill="#0b0b0d">BLACK FRIDAY</text>
      </g>
    </SceneFrame>
  );
}

const CSS = `
.bf-dial { transform-box: view-box; transform-origin: 142px 166px; transition: transform 520ms cubic-bezier(.34,1.56,.64,1); }
.bf-handle { transform-box: view-box; transform-origin: 196.5px 166px; transition: transform 380ms cubic-bezier(.34,1.56,.64,1); }
.bf-handle.is-open { animation: bf-handle 260ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes bf-handle { to { transform: rotate(-90deg); } }
.bf-door, .bf-door-back { transform-box: view-box; transform-origin: 82px 163px; }
.bf-door.is-open { animation: bf-door 360ms cubic-bezier(.5,0,.75,.4) 220ms both; }
@keyframes bf-door { to { transform: scaleX(0); } }
.bf-door-back { transform: scaleX(0); }
.bf-door-back.is-open { animation: bf-door-back 520ms cubic-bezier(.2,1.2,.4,1) 570ms both; }
@keyframes bf-door-back { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.bf-vault { opacity: 0; }
.bf-vault.is-open { animation: bf-fade 300ms ease-out 200ms both; }
@keyframes bf-fade { to { opacity: 1; } }
.bf-rays { transform-box: view-box; transform-origin: 150px 163px; opacity: 0; }
.bf-rays.is-open { animation: bf-rays 1.3s cubic-bezier(.16,1,.3,1) 320ms both; }
@keyframes bf-rays { 0% { opacity: 0; transform: scale(.3) rotate(-10deg); } 40% { opacity: 1; } 100% { opacity: .7; transform: scale(1) rotate(0); } }
.bf-loot { display: grid; place-items: center; opacity: 0; animation: bf-loot 1.2s cubic-bezier(.2,.7,.4,1) both; }
.bf-coin { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff4d6, #f3dca6 45%, #a8823c); box-shadow: inset 0 0 0 2px #c9a55a; }
.bf-tag { width: 26px; height: 17px; border-radius: 3px 8px 8px 3px; background: #f3dca6; color: #0b0b0d; font: 800 12px/1 system-ui, sans-serif; box-shadow: inset 0 0 0 1px #8a6a2e; }
@keyframes bf-loot { 0% { opacity: 1; transform: translate(-50%,-50%) scale(.3) rotate(0); } 45% { opacity: 1; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(var(--s)) rotate(calc(var(--rot) * .6)); } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx) * 1.25), calc(-50% + var(--dy) + 110px)) scale(var(--s)) rotate(var(--rot)); } }
@media (prefers-reduced-motion: reduce) {
  .bf-dial, .bf-handle { transition: none; }
  .bf-handle.is-open, .bf-door-back.is-open, .bf-vault.is-open { animation: none; transform: none; opacity: 1; }
  .bf-door.is-open { animation: none; opacity: 0; }
  .bf-rays.is-open { animation: none; opacity: .7; }
  .bf-loot { display: none; }
}
`;
