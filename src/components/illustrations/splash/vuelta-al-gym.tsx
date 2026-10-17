import { Barbell, Kettlebell, PropDefs, Rack, Tub } from "../campaigns/props";
import { Beam, Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const VOLT = "#c8ff2e";
const FLOOR = 500;
/** Reloj de intervalos de la pared: ahí va el nombre y el descuento (vuelta-al-gym.css). */
export const VG_LED = { x: 40, y: 28, w: 180, h: 64 };

/** 1 · El box después del verano, con la luz prendida: el rack con la barra cargada, la pesa rusa y el balde de tiza. */
function Gym() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#08061a"], [0.6, "#1b1240"], [1, "#2a1d5c"]]} />
        <VGrad id="floor" stops={[[0, "#120c2a"], [1, "#030208"]]} />
      </defs>
      <PropDefs ids={ids} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={400} cy={330} rx={340} ry={230} color="#5a3fe6" o={0.55} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <path d={[-2, -1, 0, 1, 2].map((i) => `M${400 + i * 130} ${FLOOR}L${400 + i * 420} ${SH}`).join("")} stroke="#fff" strokeOpacity=".06" strokeWidth="2" />
      <Beam ids={ids} k="v" x0={400} x1={400} y1={FLOOR + 20} w={230} color={VOLT} o={0.26} />
      <Rack ids={ids} x={400} y={FLOOR} w={340} top={122} neon={VOLT} />
      {[230, 570].map((hx) => <path key={hx} d={`M${hx} 246h${hx < 400 ? 16 : -16}v14`} stroke="#9aa4b2" strokeWidth="6" fill="none" />)}
      <Barbell ids={ids} x={400} y={250} len={640} />
      <Kettlebell ids={ids} x={128} y={FLOOR} r={44} />
      <g>
        <path d="M646 500l-8-70h88l-8 70z" fill="#d9dde3" />
        <path d="M646 500l-8-70h88l-8 70z" fill={ids.url("cyl")} opacity=".7" />
        <ellipse cx="682" cy="430" rx="44" ry="9" fill="#f2f0ea" />
        <path d="M640 446h84" stroke="#9aa4b2" strokeWidth="3" />
      </g>
      <Tub ids={ids} x={744} y={FLOOR} s={0.34} tint="#8b72ff" />
      <LedBox {...VG_LED} color={VOLT} />
      <Dust seed={3} n={40} x={220} y={120} w={360} h={360} rMax={2} o={0.35} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 3 · El box a oscuras (se apaga cuando se prende la luz del techo, antes del tirón). */
function Dark() {
  return (
    <Layer>
      <rect width={SW} height={SH} fill="#03020a" opacity=".78" />
    </Layer>
  );
}

/** 2 · La lona del verano que tapaba el rack (lona de playa a rayas gastadas), con pliegues, costura y arena en el ruedo. */
function Tarp() {
  const body = "M226 98Q400 112 574 98Q650 104 712 154Q748 196 742 330L760 502Q700 514 650 500Q590 516 530 502Q470 516 400 502Q330 516 270 502Q210 516 150 500Q100 514 40 502L58 330Q52 196 88 154Q150 104 226 98Z";
  const folds = "M226 100Q190 300 150 500M226 100Q260 300 270 502M400 108Q396 300 400 502M574 100Q540 300 530 502M574 100Q610 300 650 500M712 156Q720 330 742 500M88 156Q80 330 58 500";
  return (
    <Layer>
      <defs>
        <VGrad id="canvas" stops={[[0, "#eadbb6"], [0.5, "#cdb88c"], [1, "#9a845a"]]} />
        <VGrad id="shade" x2={1} y2={0} stops={[[0, "#000", 0.45], [0.12, "#000", 0.05], [0.5, "#fff", 0.08], [0.88, "#000", 0.12], [1, "#000", 0.5]]} />
      </defs>
      <clipPath id="cut"><path d={body} /></clipPath>
      <g transform="translate(0 12)">
      <path d={body} fill="url(#canvas)" />
      <g clipPath="url(#cut)" fill="#1f8fa6" opacity=".32">
        {[60, 196, 332, 468, 604].map((x) => <path key={x} d={`M${x + 40} 90L${x + 108} 90L${x + 128 + (x - 400) * 0.12} 520L${x + 20 + (x - 400) * 0.12} 520Z`} />)}
      </g>
      <path d={body} fill="url(#shade)" />
      <path d={folds} stroke="#4a3a1e" strokeOpacity=".22" strokeWidth="10" fill="none" />
      <path d={folds} transform="translate(7 0)" stroke="#fff" strokeOpacity=".14" strokeWidth="3" fill="none" />
      <path d="M226 98Q400 112 574 98" stroke="#fff" strokeOpacity=".45" strokeWidth="3" fill="none" />
      <path d="M58 466Q400 486 742 466" stroke="#6b5530" strokeOpacity=".3" strokeWidth="4" strokeDasharray="14 10" fill="none" />
      <Dust seed={9} n={50} x={60} y={430} w={680} h={70} color="#f2e6c4" rMax={2.4} o={0.7} />
      </g>
    </Layer>
  );
}

/** 4 · La nube de tiza que se levanta cuando sale la lona. */
function Chalk() {
  return (
    <Layer>
      <Glow id="puff" cx={430} cy={430} rx={300} ry={120} color="#f2f0ea" o={0.45} />
      <Glow id="puff2" cx={560} cy={300} rx={160} ry={140} color="#f2f0ea" o={0.3} />
      <Dust seed={21} n={90} x={200} y={250} w={460} h={260} rMax={2.6} o={0.8} />
    </Layer>
  );
}

export const vueltaAlGymLayers = [Gym, Tarp, Dark, Chalk];
