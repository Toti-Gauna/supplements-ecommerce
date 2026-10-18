import { PropDefs, Shaker } from "../campaigns/props";
import { Beam, Dust } from "../campaigns/stage";
import { Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const GOLD = "#ffd34d";
const CHALK = "#eef1f5";
const GROUND = 452;
/** Reloj de carrera del pórtico de llegada: ahí va el nombre y el descuento (dia-del-running.css). */
export const RU_LED = { x: 316, y: 62, w: 180, h: 64 };
/** Parantes del pórtico (la cinta gira desde cada uno) y el cronómetro colgado (la aguja gira desde su centro). */
const POSTS = [226, 590] as const;
const TAPE_Y = 320;
const CUT = 408;
export const RU_WATCH = { cx: 150, cy: 372, r: 56 };
const W = RU_WATCH;

/** 1 · El estadio de noche: torres de luz, tribuna, la pista con la llegada a cuadros y el pórtico con su reloj. */
function Stadium() {
  const lanes = [-3, -2, -1, 0, 1, 2, 3, 4].map((i) => `M${400 + i * 14 - 7} 268L${400 + i * 200 - 100} ${SH + 40}`).join("");
  const checks = Array.from({ length: 40 }, (_, i) => `M${i * 20} ${GROUND - 6}h10v6h-10zM${i * 20 + 10} ${GROUND}h10v6h-10z`).join("");
  return (
    <Layer>
      <defs>
        <VGrad id="sky" stops={[[0, "#03070f"], [0.6, "#0b1d3a"], [1, "#1f4fa8"]]} />
        <VGrad id="track" stops={[[0, "#3a1d22"], [0.3, "#2a1418"], [1, "#0a0507"]]} />
        <VGrad id="gantry" stops={[[0, "#2a2f37"], [0.5, "#14171c"], [1, "#0b0d10"]]} />
      </defs>
      <PropDefs ids={ids} volt={GOLD} plasma="#1f4fa8" />
      <rect width={SW} height={SH} fill="url(#sky)" />
      {[110, 690].map((x) => (
        <g key={x}>
          <Glow id={`tw${x}`} cx={x} cy={44} rx={150} ry={90} color="#cfe0ff" o={0.4} />
          <rect x={x - 34} y="30" width="68" height="28" rx="3" fill="#cfe0ff" opacity=".85" />
          <path d={`M${x - 34} 44h68M${x - 11} 30v28M${x + 11} 30v28`} stroke="#0b1d3a" strokeWidth="2" />
          <rect x={x - 3} y="58" width="6" height="180" fill="#0a1426" />
        </g>
      ))}
      <path d={`M0 268V214Q200 196 400 200T${SW} 214V268Z`} fill="#071226" />
      <Dust seed={31} n={70} x={0} y={206} w={SW} h={56} color="#cfe0ff" rMax={1.6} o={0.35} />
      <rect y="262" width={SW} height={SH - 262} fill="url(#track)" />
      <path d={lanes} stroke={CHALK} strokeOpacity=".35" strokeWidth="2.5" />
      <path d={checks} fill={CHALK} opacity=".8" />
      <Beam ids={ids} k="r" x0={408} x1={408} y1={GROUND + 20} w={240} color="#cfe0ff" o={0.16} lamp={false} />
      <Glow id="pool" cx={408} cy={GROUND + 8} rx={300} ry={40} color={GOLD} o={0.2} />
      {/* El pórtico: dos parantes y el travesaño con el reloj de carrera; a la izquierda cuelga el cronómetro. */}
      {POSTS.map((x) => <rect key={x} x={x - 10} y="120" width="20" height={GROUND - 120} fill={ids.url("steel")} />)}
      {POSTS.map((x) => <ellipse key={`s${x}`} cx={x} cy={GROUND} rx="26" ry="5" fill="#000" opacity=".5" />)}
      <rect x="110" y="42" width="590" height="104" rx="4" fill="url(#gantry)" stroke="#2d323b" strokeWidth="3" />
      <rect x="114" y="45" width="582" height="2" fill="#fff" opacity=".22" />
      <path d={Array.from({ length: 59 }, (_, i) => `M${112 + i * 10} ${i % 2 ? 132 : 138}h10v6h-10z`).join("")} fill={CHALK} opacity=".55" />
      <path d="M112 128H698" stroke={GOLD} strokeOpacity=".7" strokeWidth="2" />
      <LedBox {...RU_LED} color={GOLD} />
      <path d={`M${W.cx} 146V${W.cy - W.r - 22}`} stroke="#0a0b0d" strokeWidth="4" />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** Una mitad de la cinta de llegada, de su parante al corte (sg −1 izquierda, 1 derecha). */
function tape(sg: -1 | 1) {
  const from = sg < 0 ? POSTS[0] + 10 : POSTS[1] - 10;
  const to = CUT - sg * 3;
  return function Tape() {
    const d = `M${from} ${TAPE_Y - 5}Q${(from + to) / 2} ${TAPE_Y + 2} ${to} ${TAPE_Y + 2}V${TAPE_Y + 12}Q${(from + to) / 2} ${TAPE_Y + 12} ${from} ${TAPE_Y + 5}Z`;
    return (
      <Layer>
        <path d={d} fill={GOLD} />
        <path d={`M${from} ${TAPE_Y - 2}Q${(from + to) / 2} ${TAPE_Y + 5} ${to} ${TAPE_Y + 5}`} stroke="#fff" strokeOpacity=".6" strokeWidth="2" fill="none" />
        <path d={`M${from} ${TAPE_Y + 3}Q${(from + to) / 2} ${TAPE_Y + 10} ${to} ${TAPE_Y + 10}`} stroke="#b8860b" strokeOpacity=".7" strokeWidth="2" fill="none" />
        <rect x={(sg < 0 ? from : to) - 2} y={TAPE_Y - 8} width={Math.abs(to - from) + 4} height="24" fill={GOLD} opacity=".08" />
        <rect x={from - 6} y={TAPE_Y - 8} width="12" height="18" rx="2" fill="#4a515c" />
      </Layer>
    );
  };
}

/** 4 · El chasquido del corte: luz y chispas de polvo en el medio. */
function Snap() {
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 + 8) * Math.PI / 180;
    return `M${(CUT + 26 * Math.cos(a)).toFixed(1)} ${(TAPE_Y + 6 + 26 * Math.sin(a)).toFixed(1)}l${(22 * Math.cos(a)).toFixed(1)} ${(22 * Math.sin(a)).toFixed(1)}`;
  }).join("");
  return (
    <Layer>
      <Glow id="snap" cx={CUT} cy={TAPE_Y + 6} rx={120} ry={90} color={GOLD} o={0.7} />
      <path d={rays} stroke="#fff3c4" strokeWidth="3" strokeLinecap="round" />
      <Dust seed={41} n={30} x={CUT - 90} y={TAPE_Y - 60} w={180} h={130} color="#fff3c4" rMax={2} o={0.9} />
    </Layer>
  );
}

/** 5 · El cronómetro colgado: caja cromada, esfera con las marcas y la subesfera; el botón y la aguja van aparte. */
function Watch() {
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 - 90) * Math.PI / 180, r0 = W.r - (i % 5 ? 7 : 13), r1 = W.r - 3;
    return `M${(W.cx + r0 * Math.cos(a)).toFixed(1)} ${(W.cy + r0 * Math.sin(a)).toFixed(1)}L${(W.cx + r1 * Math.cos(a)).toFixed(1)} ${(W.cy + r1 * Math.sin(a)).toFixed(1)}`;
  });
  return (
    <Layer>
      <defs><VGrad id="chrome" stops={[[0, "#eef1f5"], [0.45, "#8b95a3"], [0.55, "#4a515c"], [1, "#c9ced6"]]} /></defs>
      <Glow id="wglow" cx={W.cx} cy={W.cy} rx={110} ry={110} color={GOLD} o={0.18} />
      <rect x={W.cx - 9} y={W.cy - W.r - 22} width="18" height="14" rx="3" fill="url(#chrome)" />
      <path d={`M${W.cx + W.r * 0.62} ${W.cy - W.r * 0.84}l14 -14`} stroke="url(#chrome)" strokeWidth="9" strokeLinecap="round" />
      <circle cx={W.cx} cy={W.cy} r={W.r + 10} fill="url(#chrome)" />
      <circle cx={W.cx} cy={W.cy} r={W.r} fill="#f2f0ea" />
      <path d={ticks.filter((_, i) => i % 5).join("")} stroke="#545c68" strokeWidth="1.2" />
      <path d={ticks.filter((_, i) => !(i % 5)).join("")} stroke="#0b0d10" strokeWidth="2.6" />
      <circle cx={W.cx} cy={W.cy + 20} r="12" fill="none" stroke="#9aa4b2" strokeWidth="1.5" />
      <path d={`M${W.cx} ${W.cy + 20}l6 -8`} stroke="#0b0d10" strokeWidth="1.8" />
      <path d={`M${W.cx - W.r * 0.7} ${W.cy - W.r * 0.5}a${W.r} ${W.r} 0 0 1 ${W.r * 0.9} -${W.r * 0.36}`} stroke="#fff" strokeOpacity=".7" strokeWidth="6" fill="none" strokeLinecap="round" />
      <Shaker ids={ids} x={704} y={548} s={0.46} accent={GOLD} tint="#2ee6d6" />
    </Layer>
  );
}

/** 6 · La aguja del cronómetro, apuntando arriba (el CSS la hace girar hasta 9,58). */
function Hand() {
  return (
    <Layer>
      <path d={`M${W.cx - 2} ${W.cy + 14}L${W.cx} ${W.cy - W.r + 6}L${W.cx + 2} ${W.cy + 14}Z`} fill="#e0452b" />
      <circle cx={W.cx} cy={W.cy} r="5" fill="#0b0d10" />
      <circle cx={W.cx} cy={W.cy} r="2" fill={GOLD} />
    </Layer>
  );
}

/** 7 · El botón de la corona (el CSS lo aprieta al largar y al cortar). */
function Button() {
  return (
    <Layer>
      <rect x={W.cx - 13} y={W.cy - W.r - 34} width="26" height="13" rx="4" fill={GOLD} />
      <rect x={W.cx - 13} y={W.cy - W.r - 34} width="26" height="3" rx="1.5" fill="#fff" opacity=".6" />
    </Layer>
  );
}

export const diaDelRunningLayers = [Stadium, tape(-1), tape(1), Snap, Watch, Hand, Button];
