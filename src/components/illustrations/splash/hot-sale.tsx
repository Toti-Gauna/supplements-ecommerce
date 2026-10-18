import { Barbell, PropDefs } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const GOLD = "#ffd34d";
const EMBER = "#ff5a1f";
const FLOOR = 480;
/** Manómetro de la pared (la aguja gira alrededor de su centro: hot-sale.css usa el mismo punto). */
export const HS_GAUGE = { cx: 184, cy: 156, r: 84 };
export const HS_LED = { x: 470, y: 102, w: 230, h: 104 };
const BAR = { x: 400, y: 380, len: 700, plates: [[42, 200], [34, 200], [26, 156]] as [number, number][] };

/** Centro, ancho y alto de cada disco (la misma cuenta que `Barbell`), para encender su canto. */
function plateBoxes(): [number, number, number][] {
  let off = (BAR.len / 2) * 0.56;
  return BAR.plates.map(([w, h], i) => {
    off += w / 2 + (i ? w / 2 + 3 : 14);
    return [off, w, h];
  });
}

/** Marcas del dial: 240° de arco, de −120° a +120° (0° es arriba). */
const tick = (deg: number, r0: number, r1: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  const p = (r: number) => `${(HS_GAUGE.cx + r * Math.cos(a)).toFixed(1)} ${(HS_GAUGE.cy + r * Math.sin(a)).toFixed(1)}`;
  return `M${p(r0)}L${p(r1)}`;
};
const arc = (from: number, to: number, r: number) => {
  const pt = (deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return `${(HS_GAUGE.cx + r * Math.cos(a)).toFixed(1)} ${(HS_GAUGE.cy + r * Math.sin(a)).toFixed(1)}`; };
  return `M${pt(from)}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${pt(to)}`;
};

/** 1 · El box caliente: pared de ladrillo en penumbra, el manómetro y el marcador; la plataforma de levantamiento. */
function Back() {
  const { cx, cy, r } = HS_GAUGE;
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#120403"], [0.65, "#2a0b06"], [1, "#3a1208"]]} />
        <VGrad id="floor" stops={[[0, "#1d0905"], [1, "#050202"]]} />
        <VGrad id="bezel" stops={[[0, "#6a717c"], [0.5, "#2a2f37"], [1, "#4a515c"]]} />
      </defs>
      <rect width={SW} height={SH} fill="url(#wall)" />
      <path d={Array.from({ length: 12 }, (_, i) => `M0 ${i * 40 + 20}H${SW}`).join("")} stroke="#000" strokeOpacity=".22" strokeWidth="2" />
      <DotGrid h={FLOOR} o={0.05} />
      <Glow id="heat" cx={400} cy={FLOOR - 40} rx={420} ry={210} color={EMBER} o={0.28} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <rect x="150" y={FLOOR} width="500" height="10" fill="#2b130b" />
      <rect x="150" y={FLOOR} width="500" height="2" fill="#fff" opacity=".12" />
      <circle cx={cx} cy={cy} r={r + 12} fill="url(#bezel)" />
      <circle cx={cx} cy={cy} r={r} fill="#0b0b0d" />
      <path d={arc(-120, 40, r - 12)} stroke="#3a414b" strokeWidth="6" fill="none" />
      <path d={arc(40, 120, r - 12)} stroke={EMBER} strokeWidth="6" fill="none" />
      <path d={Array.from({ length: 13 }, (_, i) => tick(-120 + i * 20, r - 26, r - 16)).join("")} stroke="#c9ced6" strokeWidth="2.5" />
      <path d={Array.from({ length: 12 }, (_, i) => tick(-110 + i * 20, r - 22, r - 16)).join("")} stroke="#6a717c" strokeWidth="1.5" />
      <path d={`M${cx - r * 0.6} ${cy - r * 0.55}a${r} ${r} 0 0 1 ${r * 0.9} -${r * 0.3}`} stroke="#fff" strokeOpacity=".12" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={`M${cx} ${cy + r + 12}V${FLOOR}`} stroke="#1a0b07" strokeWidth="8" />
      <LedBox {...HS_LED} color={GOLD} />
      <Vignette o={0.75} />
    </Layer>
  );
}

/** 2 · La barra fría (acero) con los discos, apoyada en la plataforma. */
function Cold() {
  return (
    <Layer>
      <PropDefs ids={ids} />
      <Barbell ids={ids} {...BAR} />
    </Layer>
  );
}

/** 3 · La misma barra al rojo: la maza incandescente y el canto de los discos encendido, con su resplandor. */
function Hot() {
  const half = BAR.len / 2;
  return (
    <Layer>
      <defs>
        <VGrad id="iron" x2={1} y2={0} stops={[[0, EMBER], [0.3, GOLD], [0.5, "#fff3c4"], [0.7, GOLD], [1, EMBER]]} />
        <VGrad id="hotplate" stops={[[0, "#8a1d06"], [0.18, EMBER], [0.5, GOLD], [0.82, EMBER], [1, "#8a1d06"]]} />
      </defs>
      <Glow id="aura" cx={400} cy={BAR.y} rx={420} ry={120} color={EMBER} o={0.55} />
      <rect x={BAR.x - half} y={BAR.y - 7} width={BAR.len} height="14" rx="4" fill="url(#iron)" />
      <rect x={BAR.x - half} y={BAR.y - 7} width={BAR.len} height="14" rx="4" fill={GOLD} opacity=".25" stroke={EMBER} strokeWidth="8" strokeOpacity=".25" />
      {[-1, 1].flatMap((sg) => plateBoxes().map(([c, w, h], i) => {
        const x = BAR.x + sg * c - w / 2, y = BAR.y - h / 2;
        return (
          <g key={`${sg}${i}`}>
            <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={w * 0.35} fill={EMBER} opacity=".22" />
            <rect x={x} y={y} width={w} height={h} rx={w * 0.3} fill="url(#hotplate)" />
            <rect x={x + w * 0.38} y={y + 10} width={w * 0.24} height={h - 20} rx={w * 0.12} fill="#fff3c4" opacity=".55" />
            <rect x={x} y={BAR.y - 3} width={w} height="6" fill="#7a1a06" opacity=".55" />
          </g>
        );
      }))}
      <Dust seed={7} n={44} x={120} y={BAR.y - 170} w={560} h={150} color={GOLD} rMax={2.2} o={0.75} />
    </Layer>
  );
}

/** 4 · La aguja del manómetro, apuntando arriba (el CSS la gira desde el frío hasta el rojo). */
function Needle() {
  const { cx, cy, r } = HS_GAUGE;
  return (
    <Layer>
      <path d={`M${cx - 5} ${cy + 14}L${cx} ${cy - r + 20}L${cx + 5} ${cy + 14}Z`} fill={EMBER} />
      <path d={`M${cx} ${cy + 10}L${cx} ${cy - r + 24}`} stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r="11" fill="#2a2f37" stroke="#6a717c" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3.5" fill="#0b0b0d" />
    </Layer>
  );
}

/** 5 · El aire que tiembla arriba de la barra caliente. */
function Haze() {
  const wave = (x: number) => `M${x} ${BAR.y - 30}c-14 -24 14 -40 0 -64s14 -40 0 -64s14 -40 0 -60`;
  return (
    <Layer>
      <g fill="none" stroke={GOLD} strokeLinecap="round">
        {[150, 260, 360, 450, 540, 650].map((x, i) => <path key={x} d={wave(x)} strokeWidth="2" strokeOpacity={i % 2 ? 0.08 : 0.13} />)}
      </g>
    </Layer>
  );
}

export const hotSaleLayers = [Back, Cold, Hot, Needle, Haze];
