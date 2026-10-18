import { PropDefs, Tub } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const GOLD = "#f3c84c";
const FLOOR = 576;
/** Marcador de la pared: ahí va el nombre y el descuento (navidad.css). */
export const NV_LED = { x: 46, y: 50, w: 200, h: 84 };

/** Discos del árbol, de abajo hacia arriba: centro de la cara (y), radio, grosor y color de la goma. */
const DISCS: { y: number; rx: number; th: number; color: string }[] = [
  { y: 490, rx: 214, th: 30, color: "#145c36" },
  { y: 414, rx: 176, th: 28, color: "#1f8a4f" },
  { y: 344, rx: 140, th: 24, color: "#145c36" },
  { y: 280, rx: 106, th: 20, color: "#1f8a4f" },
  { y: 224, rx: 74, th: 16, color: "#b8232f" },
  { y: 176, rx: 44, th: 12, color: GOLD },
];
const RY = 0.2;

/** 1 · La pared verde noche con la luz dorada, el parante del árbol (vacío), el marcador y el pote de regalo. */
function Stand() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#03100a"], [0.6, "#0e3526"], [1, "#154a33"]]} />
        <VGrad id="floor" stops={[[0, "#0a2219"], [1, "#020806"]]} />
        <VGrad id="pole" x2={1} y2={0} stops={[[0, "#1a1e25"], [0.35, "#8b95a3"], [0.6, "#3a414b"], [1, "#0f1217"]]} />
      </defs>
      <PropDefs ids={ids} volt={GOLD} plasma="#2ee6d6" />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={400} cy={330} rx={330} ry={280} color={GOLD} o={0.3} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <ellipse cx="400" cy={FLOOR} rx="250" ry="22" fill="#000" opacity=".5" />
      <rect x="392" y="122" width="16" height={FLOOR - 122} fill="url(#pole)" />
      <rect x="386" y="114" width="28" height="10" rx="2" fill={GOLD} />
      <path d={`M340 ${FLOOR}l14-14h92l14 14z`} fill="#1c2129" />
      <Tub ids={ids} x={690} y={FLOOR} s={0.42} tint="#b8232f" accent={GOLD} />
      <path d="M690 466v94M651 512h78" stroke={GOLD} strokeWidth="6" />
      <path d="M690 468c-10-18-34-17-31-3c3 9 19 9 31 3zM690 468c10-18 34-17 31-3c-3 9-19 9-31 3z" fill={GOLD} />
      <circle cx="690" cy="467" r="5" fill="#c99a1e" />
      <LedBox {...NV_LED} color={GOLD} />
      <Dust seed={4} n={60} x={0} y={0} w={SW} h={FLOOR} rMax={2.2} o={0.35} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** Un disco de goma visto apenas desde arriba: canto, cara, maza de acero y el tramo del parante que asoma atrás. */
function disc({ y, rx, th, color }: (typeof DISCS)[number]) {
  const ry = rx * RY;
  return function Disc() {
    return (
      <Layer>
        <defs><VGrad id="band" x2={1} y2={0} stops={[[0, "#000", 0.7], [0.3, "#000", 0.35], [0.62, "#fff", 0.06], [1, "#000", 0.6]]} /></defs>
        <path d={`M${400 - rx} ${y}v${th}a${rx} ${ry} 0 0 0 ${rx * 2} 0v-${th}z`} fill={color} />
        <path d={`M${400 - rx} ${y}v${th}a${rx} ${ry} 0 0 0 ${rx * 2} 0v-${th}z`} fill="url(#band)" />
        <ellipse cx="400" cy={y} rx={rx} ry={ry} fill={color} />
        <ellipse cx="400" cy={y} rx={rx * 0.78} ry={ry * 0.78} fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="3" />
        <path d={`M${400 - rx * 0.9} ${y - ry * 0.3}a${rx} ${ry} 0 0 1 ${rx * 1.3} -${ry * 0.68}`} stroke="#fff" strokeOpacity=".28" strokeWidth="3" fill="none" />
        <path d={`M${400 + rx * 0.62} ${y - ry * 0.78}a${rx} ${ry} 0 0 1 ${rx * 0.38} ${ry * 0.78}v${th * 0.8}`} stroke={GOLD} strokeOpacity=".55" strokeWidth="2.5" fill="none" />
        <ellipse cx="400" cy={y} rx={Math.max(16, rx * 0.2)} ry={Math.max(4, ry * 0.2)} fill="#8b95a3" />
        <rect x="392" y={y - ry} width="16" height={ry} fill="#5d6571" />
        <rect x="395" y={y - ry} width="4" height={ry} fill="#c9ced6" opacity=".6" />
        <ellipse cx="400" cy={y} rx="8" ry="2.5" fill="#1a1e25" />
      </Layer>
    );
  };
}

export const navidadLayers = [Stand, ...DISCS.map(disc)];
