import { Led, ledWidth } from "../campaigns/led";
import { Barbell, PropDefs } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const VOLT = "#c8ff2e";
const FLOOR = 552;
/** Marcador debajo del tablero: ahí va el nombre y el descuento (ano-nuevo.css). */
export const AN_LED = { x: 300, y: 382, w: 200, h: 74 };
/** Placas del tablero de cuenta regresiva: cuatro de 120 × 170 con la bisagra al medio (y = 235). */
const P = { x: 136, y: 150, w: 120, h: 170, gap: 16 };
export const AN_HINGE = P.y + P.h / 2;
const px = (i: number) => P.x + i * (P.w + P.gap);

/** Una placa (o media placa: `half` arriba o abajo) con su dígito impreso. */
function Plate({ i, digit, half }: { i: number; digit: string; half?: "top" | "bottom" }) {
  const x = px(i), dh = 120, dw = ledWidth(digit, dh);
  const clipY = half === "bottom" ? AN_HINGE + 1 : P.y, clipH = half ? P.h / 2 - 1 : P.h;
  return (
    <svg x={x} y={clipY} width={P.w} height={clipH} viewBox={`${x} ${clipY} ${P.w} ${clipH}`} overflow="hidden">
      <rect x={x} y={P.y} width={P.w} height={P.h} rx="8" fill="url(#plate)" />
      <Led value={digit} x={x + (P.w - dw) / 2} y={P.y + (P.h - dh) / 2} h={dh} color="#e9ecf2" ghost={0} skew={0} />
      <rect x={x} y={AN_HINGE - 2} width={P.w} height="4" fill="#000" opacity=".85" />
      <rect x={x} y={AN_HINGE + 2} width={P.w} height="2" fill="#fff" opacity=".1" />
      <rect x={x} y={P.y} width={P.w} height={P.h / 2} fill="#fff" opacity=".04" />
    </svg>
  );
}

const plateDefs = <defs><VGrad id="plate" stops={[[0, "#262a33"], [0.5, "#16181e"], [0.51, "#0f1115"], [1, "#1b1e25"]]} /></defs>;

/** 1 · El box de noche: el rig con el tablero colgado (2026, con la mitad de arriba del 7 ya detrás), el marcador y la barra. */
function Board() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#05071a"], [0.6, "#141a46"], [1, "#22195a"]]} />
        <VGrad id="floor" stops={[[0, "#0b0d24"], [1, "#020208"]]} />
        <VGrad id="frame" stops={[[0, "#2a2f37"], [1, "#0e1013"]]} />
      </defs>
      {plateDefs}
      <PropDefs ids={ids} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={400} cy={260} rx={360} ry={240} color="#3a2a8f" o={0.7} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      {[60, 740].map((x) => <rect key={x} x={x - 12} y="56" width="24" height={FLOOR - 56} fill={ids.url("steel")} />)}
      <rect x="48" y="62" width="704" height="20" fill={ids.url("steel")} />
      <path d="M200 82v44M600 82v44" stroke="#5d6571" strokeWidth="4" strokeDasharray="6 4" />
      <rect x="112" y="126" width="576" height="218" rx="6" fill="url(#frame)" />
      <rect x="112" y="126" width="576" height="2" fill="#fff" opacity=".25" />
      <rect x="124" y="138" width="552" height="194" rx="3" fill="#050608" />
      {["2", "0", "2"].map((d, i) => <Plate key={i} i={i} digit={d} />)}
      <Plate i={3} digit="7" half="top" />
      <Plate i={3} digit="6" half="bottom" />
      <LedBox {...AN_LED} color={VOLT} />
      <Barbell ids={ids} x={400} y={FLOOR - 50} len={660} plates={[[34, 100], [26, 100]]} />
      <Dust seed={27} n={50} x={0} y={0} w={SW} h={FLOOR} rMax={2} o={0.3} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 · La mitad de arriba del 6, que cae sobre la bisagra (el CSS la achata hasta la bisagra). */
function OldTop() {
  return <Layer>{plateDefs}<Plate i={3} digit="6" half="top" /></Layer>;
}

/** 3 · La mitad de abajo del 7, en el dorso de la misma hoja: baja desde la bisagra y tapa al 6. */
function NewBottom() {
  return <Layer>{plateDefs}<Plate i={3} digit="7" half="bottom" /></Layer>;
}

/** 4 · El tablero apagado (antes de que se prenda la luz del box). */
function Dark() {
  return (
    <Layer>
      <rect width={SW} height={SH} fill="#03030c" opacity=".72" />
    </Layer>
  );
}

/** 5 · La luz voltio del tablero cuando cae la hoja: halo detrás de la placa nueva y filo en el marco. */
function Glow27() {
  return (
    <Layer>
      <Glow id="new" cx={px(3) + P.w / 2} cy={AN_HINGE} rx={200} ry={170} color={VOLT} o={0.2} />
      <path d="M112 128h576" stroke={VOLT} strokeWidth="3" />
      <path d="M112 128h576" stroke={VOLT} strokeWidth="12" opacity=".2" />
      <Dust seed={29} n={40} x={px(3) - 80} y={110} w={P.w + 160} h={260} color={VOLT} rMax={2.2} o={0.7} />
    </Layer>
  );
}

export const anoNuevoLayers = [Board, OldTop, NewBottom, Dark, Glow27];
