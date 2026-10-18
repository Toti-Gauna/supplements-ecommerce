import { PropDefs, Shaker } from "../campaigns/props";
import { Beam, Dust } from "../campaigns/stage";
import { Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const GOLD = "#ffd34d";
const BRASS = "#d4a23a";
const RED = "#c81e2c";
const TABLE = 440;
/** Reloj de rounds colgado sobre el ring: ahí va el nombre y el descuento (dia-del-boxeador.css). */
export const BX_LED = { x: 470, y: 58, w: 206, h: 76 };
/** La campana (vibra sobre su centro) y el eje del martillo (gira desde ahí): 300,336 y 506,444 de 800 × 600. */
export const BX_BELL = { cx: 300, cy: 336, r: 72 };
const PIVOT = { x: 506, y: 444 };
const HEAD = { x: 394, y: 320, r: 19 };
const B = BX_BELL;

/** Un guante colgado de los cordones (silueta, con el puño y la tira del abrojo). */
function Glove({ x, y, flip = 1 }: { x: number; y: number; flip?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <path d="M0 0V26" stroke="#e6eae0" strokeWidth="2" />
      <path d="M-24 34Q-30 26 -18 22H18Q28 24 26 40L30 92Q30 120 4 122H-18Q-34 118 -32 92Z" fill={RED} />
      <path d="M-30 50Q-46 54 -42 76Q-38 90 -30 84Z" fill="#a3141f" />
      <rect x="-24" y="24" width="48" height="16" rx="4" fill="#f2f0ea" />
      <path d="M-24 34Q-30 26 -18 22H18Q28 24 26 40L30 92Q30 120 4 122H-18Q-34 118 -32 92Z" fill={ids.url("cyl")} opacity=".7" />
    </g>
  );
}

/** 1 · El estadio: luz cenital, el ring con las cuerdas y el rincón, la mesa del cronometrista y el reloj de rounds. */
function Arena() {
  const rope = (y0: number, y1: number, y2: number) => `M40 ${y0}L640 ${y1}L770 ${y2}`;
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#080203"], [0.6, "#1a0608"], [1, "#3a0a0e"]]} />
        <VGrad id="apron" stops={[[0, "#2a0a0e"], [1, "#0c0304"]]} />
        <VGrad id="table" stops={[[0, "#3a2416"], [0.12, "#22150c"], [1, "#070403"]]} />
        <VGrad id="post" x2={1} y2={0} stops={[[0, "#1a1e25"], [0.4, "#8b95a3"], [1, "#12151a"]]} />
      </defs>
      <PropDefs ids={ids} volt={GOLD} plasma={RED} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <Dust seed={23} n={60} x={0} y={120} w={SW} h={120} color="#ffd9b0" rMax={1.6} o={0.25} />
      <Beam ids={ids} k="b" x0={400} x1={420} y1={350} w={300} color="#ffe2c4" o={0.22} lamp={false} />
      <Glow id="ring" cx={420} cy={330} rx={360} ry={120} color="#6e1218" o={0.55} />
      <path d="M0 330L640 318L800 300V360H0Z" fill="#d9d4cc" opacity=".16" />
      <rect y="352" width={SW} height={TABLE - 352} fill="url(#apron)" />
      <path d="M0 352H800" stroke="#fff" strokeOpacity=".12" strokeWidth="2" />
      <rect x="632" y="196" width="18" height="160" fill="url(#post)" />
      <g fill="none" strokeLinecap="round">
        {[[226, 214, 202], [266, 252, 236], [306, 290, 270]].map(([a, b, c], i) => (
          <g key={a}>
            <path d={rope(a!, b!, c!)} stroke={i === 1 ? "#f2f0ea" : RED} strokeWidth="9" />
            <path d={rope(a! - 2, b! - 2, c! - 2)} stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
          </g>
        ))}
      </g>
      <rect x="622" y="204" width="38" height="112" rx="8" fill={RED} />
      <rect x="622" y="204" width="38" height="112" rx="8" fill={ids.url("cyl")} />
      <Glove x={150} y={228} />
      <Glove x={208} y={226} flip={-1} />
      {/* El reloj de rounds, colgado de sus cadenas. */}
      <path d={`M${BX_LED.x + 30} 0V${BX_LED.y - 10}M${BX_LED.x + BX_LED.w - 30} 0V${BX_LED.y - 10}`} stroke="#4a515c" strokeWidth="3" strokeDasharray="6 3" />
      <LedBox {...BX_LED} color={GOLD} />
      {/* La mesa del cronometrista con la tabla de la campana y el soporte del martillo. */}
      <rect y={TABLE} width={SW} height={SH - TABLE} fill="url(#table)" />
      <rect y={TABLE} width={SW} height="3" fill="#fff" opacity=".18" />
      <rect x={B.cx - 92} y={B.cy - 96} width="184" height={TABLE - B.cy + 96} rx="10" fill="#4a2a14" />
      <rect x={B.cx - 92} y={B.cy - 96} width="184" height={TABLE - B.cy + 96} rx="10" fill={ids.url("cyl")} opacity=".5" />
      <path d={`M${B.cx - 70} ${B.cy - 90}q-8 90 4 186M${B.cx + 74} ${B.cy - 90}q10 80 -2 186M${B.cx - 40} ${TABLE - 4}q-6-30 6-50`} stroke="#2a160a" strokeOpacity=".5" strokeWidth="2" fill="none" />
      <rect x={B.cx - 92} y={B.cy - 96} width="184" height="3" rx="1.5" fill="#fff" opacity=".2" />
      {/* Las vendas enrolladas sobre la mesa, con la punta suelta. */}
      <path d={`M150 ${TABLE + 34}q60 10 120 -4`} stroke="#b8232f" strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="132" cy={TABLE + 24} r="24" fill="#b8232f" />
      <circle cx="132" cy={TABLE + 24} r="24" fill={ids.url("sphere")} opacity=".7" />
      {[17, 11, 5].map((r) => <circle key={r} cx="132" cy={TABLE + 24} r={r} fill="none" stroke="#5a0d14" strokeWidth="2" />)}
      <path d={`M${PIVOT.x - 26} ${TABLE}l10 -18h32l10 18z`} fill="#2a2f37" />
      <circle cx={PIVOT.x} cy={PIVOT.y - 8} r="9" fill="#5d6571" stroke="#0b0d10" strokeWidth="2" />
      <Shaker ids={ids} x={672} y={TABLE + 6} s={0.48} accent={GOLD} tint={RED} />
      <Vignette o={0.72} />
    </Layer>
  );
}

/** 2 · La campana de bronce: domo con sus aros, el brillo y el bulón del centro. */
function Bell() {
  return (
    <Layer>
      <defs>
        <radialGradient id="brass" cx=".38" cy=".34" r=".7">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".25" stopColor={GOLD} />
          <stop offset=".7" stopColor={BRASS} />
          <stop offset="1" stopColor="#6b4a12" />
        </radialGradient>
      </defs>
      <circle cx={B.cx + 4} cy={B.cy + 6} r={B.r} fill="#000" opacity=".45" />
      <circle cx={B.cx} cy={B.cy} r={B.r} fill="url(#brass)" />
      {[0.82, 0.62, 0.4].map((k) => <circle key={k} cx={B.cx} cy={B.cy} r={B.r * k} fill="none" stroke="#6b4a12" strokeOpacity=".45" strokeWidth="2.5" />)}
      <path d={`M${B.cx - B.r * 0.7} ${B.cy - B.r * 0.35}a${B.r * 0.8} ${B.r * 0.8} 0 0 1 ${B.r * 0.75} -${B.r * 0.45}`} stroke="#fff" strokeOpacity=".7" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx={B.cx} cy={B.cy} r="12" fill="#3a2a10" />
      <circle cx={B.cx} cy={B.cy} r="6" fill="#c9ced6" />
    </Layer>
  );
}

/** 3 · El martillo: cabeza de cuero en la punta de un mango de madera que gira desde el soporte de la mesa. */
function Hammer() {
  return (
    <Layer>
      <defs>
        <VGrad id="head" stops={[[0, "#7a4a26"], [0.35, "#c08a52"], [0.6, "#5a3418"], [1, "#2a160a"]]} />
        <VGrad id="cap" stops={[[0, "#fff3c4"], [0.4, GOLD], [1, "#6b4a12"]]} />
      </defs>
      <path d={`M${HEAD.x} ${HEAD.y}L${PIVOT.x} ${PIVOT.y - 8}`} stroke="#5a3a1e" strokeWidth="11" strokeLinecap="round" />
      <path d={`M${HEAD.x - 2} ${HEAD.y + 2}L${PIVOT.x - 3} ${PIVOT.y - 6}`} stroke="#fff" strokeOpacity=".2" strokeWidth="3" strokeLinecap="round" />
      <g transform={`translate(${HEAD.x} ${HEAD.y}) rotate(-45)`}>
        <rect x={-HEAD.r * 1.6} y={-HEAD.r} width={HEAD.r * 3.2} height={HEAD.r * 2} rx="8" fill="url(#head)" />
        {[-1, 1].map((sg) => <rect key={sg} x={sg < 0 ? -HEAD.r * 1.6 : HEAD.r * 1.6 - 9} y={-HEAD.r - 1} width="9" height={HEAD.r * 2 + 2} rx="3" fill="url(#cap)" />)}
        <rect x={-HEAD.r * 1.6} y={-HEAD.r + 4} width={HEAD.r * 3.2} height="3" fill="#fff" opacity=".25" />
      </g>
    </Layer>
  );
}

/** 4 · El sonido: aros que salen de la campana con cada golpe. */
function Ring() {
  const arc = (r: number) => `M${B.cx - r * 0.86} ${B.cy - r * 0.5}A${r} ${r} 0 0 1 ${B.cx + r * 0.5} ${B.cy - r * 0.86}`;
  return (
    <Layer>
      <Glow id="ding" cx={B.cx} cy={B.cy} rx={150} ry={150} color={GOLD} o={0.35} />
      <g fill="none" stroke={GOLD} strokeLinecap="round">
        {[96, 124, 152].map((r, i) => <path key={r} d={arc(r)} strokeWidth={5 - i} strokeOpacity={0.8 - i * 0.2} />)}
      </g>
    </Layer>
  );
}

export const diaDelBoxeadorLayers = [Arena, Bell, Hammer, Ring];
