import { PropDefs, Tub } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const GOLD = "#ffd34d";
const ION = "#2ee6d6";
const MERCURY = "#ff4a2a";
const HORIZON = 300;
/** Cartel de la rambla: ahí va el nombre y el descuento (operacion-verano.css). */
export const OV_LED = { x: 548, y: 74, w: 184, h: 72 };
/** Tubo del termómetro y vidrio de la botella: el CSS recorta el mercurio y el líquido con estos rectángulos. */
export const OV_TUBE = { x: 204, y: 126, w: 12, h: 252 };
export const OV_BOTTLE = { x: 474, y: 244, w: 92, h: 220 };
const T = OV_TUBE, B = OV_BOTTLE;
/** Contorno de la botella (cuerpo, hombros y cuello). */
const BOTTLE = `M${B.x - 6} ${B.y + 6}Q${B.x - 6} ${B.y - 8} ${B.x + 16} ${B.y - 14}L${B.x + 24} ${B.y - 30}H${B.x + B.w - 24}L${B.x + B.w - 16} ${B.y - 14}Q${B.x + B.w + 6} ${B.y - 8} ${B.x + B.w + 6} ${B.y + 6}V${B.y + B.h - 8}Q${B.x + B.w + 6} ${B.y + B.h + 6} ${B.x + B.w - 10} ${B.y + B.h + 6}H${B.x + 10}Q${B.x - 6} ${B.y + B.h + 6} ${B.x - 6} ${B.y + B.h - 8}Z`;

/** 1 · La costa a la mañana: cielo, sol en el horizonte, mar, arena; el termómetro vacío, la botella vacía y el cartel. */
function Coast() {
  const ticks = Array.from({ length: 12 }, (_, i) => `M${T.x - 18} ${T.y + 8 + i * 20}h${i % 2 ? 7 : 12}`).join("");
  return (
    <Layer>
      <defs>
        <VGrad id="sky" stops={[[0, "#021821"], [0.55, "#053246"], [0.92, "#0b6f96"], [1, "#3f8fa8"]]} />
        <VGrad id="sea" stops={[[0, "#0b6f96"], [0.4, "#064a64"], [1, "#03202c"]]} />
        <VGrad id="sand" stops={[[0, "#5b4a33"], [0.4, "#3a2f20"], [1, "#120e09"]]} />
        <VGrad id="board" x2={1} y2={0} stops={[[0, "#9aa4b2"], [0.35, "#eef1f5"], [0.7, "#c9ced6"], [1, "#6a717c"]]} />
        <VGrad id="pole" x2={1} y2={0} stops={[[0, "#1a1e25"], [0.4, "#6a717c"], [1, "#12151a"]]} />
      </defs>
      <PropDefs ids={ids} volt={GOLD} plasma={ION} />
      <rect width={SW} height={SH} fill="url(#sky)" />
      <Glow id="sunhalo" cx={372} cy={HORIZON} rx={300} ry={170} color={GOLD} o={0.55} />
      <path d={`M322 ${HORIZON}a50 50 0 0 1 100 0z`} fill="#ffe9a3" />
      <path d={`M322 ${HORIZON}a50 50 0 0 1 100 0z`} fill={GOLD} opacity=".55" />
      <rect y={HORIZON} width={SW} height="60" fill="url(#sea)" />
      <path d={`M300 ${HORIZON + 6}h144M318 ${HORIZON + 16}h108M334 ${HORIZON + 28}h76M346 ${HORIZON + 42}h52`} stroke={GOLD} strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
      <path d={`M0 ${HORIZON + 22}h220M520 ${HORIZON + 18}h280M80 ${HORIZON + 40}h160M560 ${HORIZON + 44}h200`} stroke="#fff" strokeOpacity=".12" strokeWidth="2" />
      <path d={`M0 ${HORIZON + 58}Q200 ${HORIZON + 48} 400 ${HORIZON + 60}T${SW} ${HORIZON + 54}V${SH}H0Z`} fill="url(#sand)" />
      <path d={`M0 ${HORIZON + 58}Q200 ${HORIZON + 48} 400 ${HORIZON + 60}T${SW} ${HORIZON + 54}`} stroke="#eef1f5" strokeOpacity=".5" strokeWidth="3" fill="none" />
      <Glow id="sandglow" cx={372} cy={HORIZON + 90} rx={320} ry={60} color={GOLD} o={0.25} />
      {/* El cartel de la rambla en su poste. */}
      <rect x="634" y={OV_LED.y + OV_LED.h} width="12" height={HORIZON + 112 - OV_LED.y - OV_LED.h} fill="url(#pole)" />
      <LedBox {...OV_LED} color={GOLD} />
      {/* El termómetro de la playa: chapa esmaltada en su poste, escala, zona roja arriba, tubo vacío y el bulbo. */}
      <rect x={T.x} y={T.y + T.h + 24} width="12" height={HORIZON + 200 - T.y - T.h - 24} fill="url(#pole)" />
      <rect x={T.x - 40} y={T.y - 30} width="92" height={T.h + 92} rx="46" fill="url(#board)" />
      <rect x={T.x - 34} y={T.y - 24} width="80" height={T.h + 80} rx="40" fill="none" stroke="#0b0d10" strokeOpacity=".25" strokeWidth="2" />
      <path d={ticks} stroke="#2a2f37" strokeWidth="2.5" />
      <path d={`M${T.x + 22} ${T.y + 8}v60`} stroke={MERCURY} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${T.x + 22} ${T.y + 76}v80`} stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${T.x + 22} ${T.y + 164}v76`} stroke={ION} strokeWidth="6" strokeLinecap="round" />
      <rect x={T.x - 2} y={T.y - 4} width={T.w + 4} height={T.h + 8} rx="8" fill="#1b2027" />
      <rect x={T.x} y={T.y} width={T.w} height={T.h} rx="6" fill="#3a2a2a" />
      <circle cx={T.x + T.w / 2} cy={T.y + T.h + 18} r="20" fill="#1b2027" />
      <circle cx={T.x + T.w / 2} cy={T.y + T.h + 18} r="16" fill={MERCURY} />
      <circle cx={T.x + T.w / 2 - 5} cy={T.y + T.h + 12} r="5" fill="#fff" opacity=".5" />
      {/* La botella vacía (el vidrio de atrás) y un pote de electrolitos en la arena. */}
      <ellipse cx={B.x + B.w / 2} cy={B.y + B.h + 8} rx="70" ry="10" fill="#000" opacity=".45" />
      <path d={BOTTLE} fill="#0a1a22" opacity=".85" />
      <Tub ids={ids} x={672} y={HORIZON + 186} s={0.36} tint={ION} accent={GOLD} />
      <Dust seed={5} n={34} x={120} y={HORIZON + 80} w={600} h={180} color="#f2e6c4" rMax={1.8} o={0.35} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 · La columna de mercurio (el CSS la recorta al tubo y la sube). */
function Mercury() {
  return (
    <Layer>
      <rect x={T.x} y={T.y + 22} width={T.w} height={T.h} rx="6" fill={MERCURY} />
      <rect x={T.x + 2} y={T.y + 26} width="3" height={T.h - 8} rx="1.5" fill="#fff" opacity=".45" />
    </Layer>
  );
}

/** 3 · Los electrolitos: el líquido ion con su superficie y burbujas (el CSS lo recorta al vidrio y lo sube). */
function Drink() {
  const top = B.y + 26;
  return (
    <Layer>
      <defs><VGrad id="drink" stops={[[0, "#7ff5ea"], [0.15, ION], [1, "#0b6f6a"]]} /></defs>
      <rect x={B.x} y={top} width={B.w} height={B.h} fill="url(#drink)" />
      <ellipse cx={B.x + B.w / 2} cy={top} rx={B.w / 2} ry="6" fill="#c9fff9" opacity=".8" />
      <g fill="none" stroke="#e8fffc" strokeOpacity=".7" strokeWidth="1.6">
        {[[490, 300, 4], [530, 340, 3], [552, 290, 2.5], [506, 380, 3.5], [540, 410, 2], [498, 430, 2.5], [522, 268, 2]].map(([cx, cy, r]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} />)}
      </g>
    </Layer>
  );
}

/** 4 · Lo de adelante: el vidrio de la botella (brillos, marcas de medida, tapa con pico) y el brillo del tubo. */
function Glass() {
  const marks = Array.from({ length: 5 }, (_, i) => `M${B.x + 8} ${B.y + 40 + i * 38}h${i % 2 ? 10 : 18}`).join("");
  return (
    <Layer>
      <path d={BOTTLE} fill="none" stroke="#c9fff9" strokeOpacity=".55" strokeWidth="3" />
      <path d={`M${B.x + 10} ${B.y + 10}V${B.y + B.h - 14}`} stroke="#fff" strokeOpacity=".4" strokeWidth="6" strokeLinecap="round" />
      <path d={`M${B.x + B.w - 6} ${B.y + 20}V${B.y + B.h - 24}`} stroke="#fff" strokeOpacity=".15" strokeWidth="3" strokeLinecap="round" />
      <path d={marks} stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
      <rect x={B.x + 18} y={B.y - 50} width={B.w - 36} height="22" rx="4" fill="#12161d" />
      <rect x={B.x + 18} y={B.y - 50} width={B.w - 36} height="3" fill="#fff" opacity=".3" />
      <path d={`M${B.x + 36} ${B.y - 50}l4 -22h12l4 22z`} fill={GOLD} />
      <rect x={B.x + B.w / 2 - 18} y={B.y + 92} width="36" height="54" rx="4" fill="#0b0d10" opacity=".55" />
      <path d="M22 0H40L28 40H38L12 100L18 56H8Z" transform={`translate(${B.x + B.w / 2 - 9} ${B.y + 99}) scale(.4)`} fill={GOLD} />
      <rect x={T.x + 2} y={T.y + 4} width="3" height={T.h - 8} rx="1.5" fill="#fff" opacity=".3" />
    </Layer>
  );
}

/** 5 · El calor de la mañana: el sol que quema y el aire que tiembla sobre la arena. */
function Heat() {
  const wave = (x: number) => `M${x} ${HORIZON + 40}c-10 -18 10 -30 0 -48s10 -30 0 -46`;
  return (
    <Layer>
      <Glow id="burn" cx={372} cy={HORIZON - 10} rx={190} ry={110} color="#fff3c4" o={0.5} />
      <g fill="none" stroke={GOLD} strokeLinecap="round">
        {[110, 300, 420, 610, 720].map((x, i) => <path key={x} d={wave(x)} strokeWidth="2" strokeOpacity={i % 2 ? 0.12 : 0.2} />)}
      </g>
    </Layer>
  );
}

export const operacionVeranoLayers = [Coast, Mercury, Drink, Glass, Heat];
