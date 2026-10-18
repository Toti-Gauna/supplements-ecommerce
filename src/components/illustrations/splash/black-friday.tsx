import { Beam, Dust } from "../campaigns/stage";
import { Jar, PropDefs, Rack, Tub } from "../campaigns/props";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const VOLT = "#c8ff2e";
/** Boca del local (lo que tapa la persiana). El CSS de la escena recorta la persiana con este mismo rectángulo. */
const O = { x: 140, y: 128, w: 520, h: 376 };
/** Vidrio del marcador colgado del rack: ahí va el nombre y el descuento (black-friday.css). */
export const BF_LED = { x: 292, y: 194, w: 216, h: 76 };

/** 1 · El local por dentro, con la luz prendida: el rack con el estante de potes y el marcador colgado. */
function Inside() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#08090b"], [0.7, "#1a1c22"], [1, "#0c0d10"]]} />
        <VGrad id="floor" stops={[[0, "#15171b"], [1, "#030304"]]} />
      </defs>
      <PropDefs ids={ids} />
      <rect width={SW} height={SH} fill="#050506" />
      <rect x={O.x} y={O.y} width={O.w} height={O.h} fill="url(#wall)" />
      <DotGrid x={O.x} y={O.y} w={O.w} h={O.h} o={0.07} />
      <rect x="0" y={O.y + O.h} width={SW} height={SH - O.y - O.h} fill="url(#floor)" />
      <Glow id="halo" cx={400} cy={360} rx={300} ry={190} color="#3a3d46" o={0.8} />
      <Beam ids={ids} k="v" x0={400} x1={400} y1={470} w={190} color={VOLT} o={0.3} lamp={false} />
      <Rack ids={ids} x={400} y={O.y + O.h} w={420} top={150} shelf={440} />
      <path d="M318 168V186M482 168V186" stroke="#4a515c" strokeWidth="3" strokeDasharray="4 3" />
      <LedBox {...BF_LED} color={VOLT} />
      <Jar ids={ids} x={286} y={440} s={0.62} tint="#2ee6d6" lit={0.6} />
      <Tub ids={ids} x={400} y={440} s={0.56} tint="#8b72ff" />
      <Tub ids={ids} x={516} y={440} s={0.45} tall tint="#ff6a3d" lit={0.6} />
      <Dust seed={11} n={46} x={230} y={150} w={340} h={330} rMax={2} o={0.4} />
      <Glow id="pool" cx={400} cy={530} rx={300} ry={36} color={VOLT} o={0.22} />
    </Layer>
  );
}

/** 2 · La oscuridad del local con la persiana cerrada (se apaga cuando se prende la luz). */
function Dark() {
  return (
    <Layer>
      <rect x={O.x} y={O.y} width={O.w} height={SH - O.y} fill="#020203" opacity=".9" />
      <rect x="0" y={O.y + O.h} width={SW} height={SH - O.y - O.h} fill="#020203" opacity=".8" />
    </Layer>
  );
}

/** 3 · La persiana: tablillas de chapa, el zócalo con las manijas y el candado con su LED. */
function Shutter() {
  const slats = Array.from({ length: Math.ceil(O.h / 18) }, (_, i) => O.y + i * 18);
  return (
    <Layer>
      <defs>
        <VGrad id="slat" stops={[[0, "#41464f"], [0.45, "#2a2e35"], [1, "#16181d"]]} />
        <VGrad id="sheen" x2={1} y2={0} stops={[[0, "#000", 0.35], [0.28, "#fff", 0.1], [0.5, "#fff", 0], [1, "#000", 0.4]]} />
      </defs>
      {slats.map((y) => <rect key={y} x={O.x} y={y} width={O.w} height="18" fill="url(#slat)" />)}
      <path d={slats.map((y) => `M${O.x} ${y + 1}h${O.w}`).join("")} stroke="#fff" strokeOpacity=".16" strokeWidth="1.5" />
      <path d={slats.map((y) => `M${O.x} ${y + 17}h${O.w}`).join("")} stroke="#000" strokeOpacity=".55" strokeWidth="1.5" />
      <rect x={O.x} y={O.y} width={O.w} height={O.h} fill="url(#sheen)" />
      <path d="M210 230l60 4M520 300l70-3M300 410l40 2" stroke="#fff" strokeOpacity=".06" strokeWidth="2" />
      <rect x={O.x} y={O.y + O.h - 24} width={O.w} height="24" fill="#0c0e11" />
      <rect x={O.x} y={O.y + O.h - 24} width={O.w} height="2" fill="#fff" opacity=".22" />
      {[290, 470].map((hx) => <rect key={hx} x={hx} y={O.y + O.h - 17} width="40" height="8" rx="3" fill="#5d6571" />)}
      <rect x="386" y={O.y + O.h - 19} width="28" height="15" rx="2" fill="#1c2026" stroke="#3a414b" />
      <circle cx="400" cy={O.y + O.h - 11.5} r="2.8" fill={VOLT} />
      <circle cx="400" cy={O.y + O.h - 11.5} r="7" fill={VOLT} opacity=".18" />
    </Layer>
  );
}

/** 4 · El frente del local: pared de hormigón, la caja del enrollador arriba y las guías de la persiana. */
function Front() {
  return (
    <Layer>
      <defs>
        <VGrad id="fw" stops={[[0, "#050608"], [0.3, "#0d0e12"], [0.7, "#121419"], [1, "#0a0b0d"]]} />
        <VGrad id="box" stops={[[0, "#3a3f48"], [0.5, "#1f2329"], [1, "#0e1013"]]} />
        <VGrad id="rail" x2={1} y2={0} stops={[[0, "#0d0f12"], [0.4, "#3a414b"], [1, "#121418"]]} />
      </defs>
      <path fillRule="evenodd" d={`M0 0H${SW}V${O.y + O.h}H0Z M${O.x} ${O.y}H${O.x + O.w}V${O.y + O.h}H${O.x}Z`} fill="url(#fw)" />
      <path d="M70 0V504M730 0V504M0 70H140M660 70H800" stroke="#000" strokeOpacity=".55" strokeWidth="2" />
      <path d="M72 0V504M732 0V504" stroke="#fff" strokeOpacity=".04" strokeWidth="1.5" />
      <rect x="120" y="88" width="560" height="44" rx="3" fill="url(#box)" />
      <rect x="120" y="88" width="560" height="2" fill="#fff" opacity=".28" />
      <rect x="120" y="128" width="560" height="4" fill="#000" opacity=".6" />
      {[O.x - 12, O.x + O.w - 4].map((rx) => <rect key={rx} x={rx} y={O.y} width="16" height={O.h} fill="url(#rail)" />)}
      <rect x="0" y={O.y + O.h} width={SW} height="3" fill="#fff" opacity=".1" />
      <rect x="704" y="282" width="34" height="50" rx="3" fill="#0e1014" stroke="#2d323b" strokeWidth="2" />
      <circle cx="721" cy="296" r="3" fill={VOLT} />
      <circle cx="721" cy="296" r="9" fill={VOLT} opacity=".2" />
      <path d="M712 312h18M712 320h18" stroke="#3a414b" strokeWidth="3" />
      <Vignette o={0.7} />
    </Layer>
  );
}

export const blackFridayLayers = [Inside, Dark, Shutter, Front];
