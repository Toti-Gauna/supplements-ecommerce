import { Kettlebell, PropDefs } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const ORANGE = "#ff8a1f";
const EMBER = "#ffd27a";
const FLOOR = 508;
/** Marcador de la pared del box: ahí va el nombre y el descuento (halloween.css). */
export const HW_LED = { x: 566, y: 56, w: 188, h: 76 };
/** La pesa rusa grande: centro, radio de la bola y su base. */
const KB = { x: 400, r: 124 };
const cy = FLOOR - KB.r * 0.92;

/** Contorno de la bola (la misma cuenta que `Kettlebell`) y las costillas de calabaza. */
const bodyD = (() => {
  const { x, r } = KB;
  return `M${x - r} ${cy}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r * 0.9} 0 0 1 -${r * 0.25} ${r * 0.78}H${x - r * 0.75}a${r} ${r * 0.9} 0 0 1 -${r * 0.25}-${r * 0.78}Z`;
})();
const ribs = [-0.78, -0.4, 0, 0.4, 0.78].map((k) => {
  const { x, r } = KB;
  const p = (dx: number, dy: number) => `${(x + k * r * dx).toFixed(1)} ${(cy + r * dy).toFixed(1)}`;
  return `M${p(0.22, -0.96)}C${p(1.2, -0.62)} ${p(1.2, 0.5)} ${p(0.4, 0.8)}`;
}).join("");
const handleD = `M${KB.x - KB.r * 0.55} ${cy - KB.r * 0.5}q0-${KB.r * 1.05} ${KB.r * 0.55}-${KB.r * 1.05}t${KB.r * 0.55} ${KB.r * 1.05}`;

/** 1 · El box de noche: pared violeta, la fila de pesas rusas en el estante, el balde de tiza y el marcador. */
function Box() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#07040c"], [0.6, "#1d1030"], [1, "#2c1844"]]} />
        <VGrad id="floor" stops={[[0, "#150c22"], [1, "#030206"]]} />
      </defs>
      <PropDefs ids={ids} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.05} />
      <Glow id="halo" cx={400} cy={360} rx={340} ry={220} color="#3d2255" o={0.7} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <path d={[-2, -1, 0, 1, 2].map((i) => `M${400 + i * 130} ${FLOOR}L${400 + i * 420} ${SH}`).join("")} stroke="#fff" strokeOpacity=".05" strokeWidth="2" />
      <rect x="24" y="300" width="190" height="10" fill="#1c2129" />
      <rect x="24" y="300" width="190" height="2" fill="#fff" opacity=".2" />
      {[60, 118, 172].map((x, i) => <Kettlebell key={x} ids={ids} x={x} y={300} r={20 + (i % 2) * 4} color="#1b1426" />)}
      <path d="M40 310v198M198 310v198" stroke="#14101c" strokeWidth="8" />
      <g>
        <path d="M640 508l-7-62h78l-7 62z" fill="#cfcbd6" />
        <path d="M640 508l-7-62h78l-7 62z" fill={ids.url("cyl")} opacity=".75" />
        <ellipse cx="672" cy="446" rx="39" ry="8" fill="#ece8f2" />
      </g>
      <LedBox {...HW_LED} color={ORANGE} />
      <Dust seed={13} n={44} x={0} y={0} w={SW} h={FLOOR} rMax={2} o={0.25} />
      <Vignette o={0.75} />
    </Layer>
  );
}

/** 2 · La pesa rusa fría: hierro con costillas de calabaza y el asa como cabo. */
function Cold() {
  const { x, r } = KB;
  return (
    <Layer>
      <PropDefs ids={ids} />
      <ellipse cx={x} cy={FLOOR + 3} rx={r * 1.15} ry={r * 0.16} fill="#000" opacity=".6" />
      <path d={handleD} fill="none" stroke="#1d1626" strokeWidth={r * 0.26} strokeLinecap="round" />
      <path d={handleD} fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth={r * 0.07} strokeLinecap="round" />
      <path d={bodyD} fill="#1d1626" />
      <path d={ribs} fill="none" stroke="#000" strokeOpacity=".45" strokeWidth="7" />
      <path d={ribs} fill="none" stroke="#fff" strokeOpacity=".07" strokeWidth="2" transform="translate(5 0)" />
      <circle cx={x} cy={cy} r={r} fill={ids.url("sphere")} />
      <rect x={x - r * 0.75} y={FLOOR - r * 0.14} width={r * 1.5} height={r * 0.14} fill="#000" opacity=".55" />
    </Layer>
  );
}

/** 3 · La misma pesa prendida desde adentro: la bola brilla entre las costillas, más fuerte en el centro. */
function Lit() {
  const { x, r } = KB;
  return (
    <Layer>
      <defs>
        <radialGradient id="core" cx=".5" cy=".55" r=".55">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset=".3" stopColor={EMBER} />
          <stop offset=".7" stopColor={ORANGE} />
          <stop offset="1" stopColor="#8a2a04" />
        </radialGradient>
      </defs>
      <path d={bodyD} fill="url(#core)" />
      <path d={ribs} fill="none" stroke="#7a2403" strokeOpacity=".7" strokeWidth="12" />
      <path d={ribs} fill="none" stroke="#fff4d6" strokeOpacity=".45" strokeWidth="2.5" transform="translate(7 0)" />
      <path d={bodyD} fill="none" stroke="#5a1d05" strokeWidth="5" />
      <path d={handleD} fill="none" stroke="#24150f" strokeWidth={r * 0.26} strokeLinecap="round" />
      <path d={handleD} fill="none" stroke={ORANGE} strokeOpacity=".6" strokeWidth={r * 0.05} strokeLinecap="round" transform={`translate(0 ${r * 0.08})`} />
      <rect x={x - r * 0.75} y={FLOOR - r * 0.14} width={r * 1.5} height={r * 0.14} fill="#3a1203" />
    </Layer>
  );
}

/** 4 · La luz naranja que tira la pesa sobre la pared y el piso. */
function Spill() {
  return (
    <Layer>
      <Glow id="room" cx={KB.x} cy={cy} rx={380} ry={260} color={ORANGE} o={0.42} />
      <Glow id="pool" cx={KB.x} cy={FLOOR + 8} rx={300} ry={44} color={EMBER} o={0.5} />
    </Layer>
  );
}

/** 5 · Humo de tiza que sube por el asa, iluminado desde abajo. */
function Smoke() {
  const wisp = (x: number, h: number) => `M${x} ${cy - 40}c-26-40 26-70 0-110s26-70 0-${h}`;
  return (
    <Layer>
      <Glow id="puffa" cx={360} cy={180} rx={120} ry={90} color="#f2e8ff" o={0.3} />
      <Glow id="puffb" cx={450} cy={130} rx={110} ry={80} color={EMBER} o={0.22} />
      <g fill="none" strokeLinecap="round">
        {[[352, 150], [404, 190], [452, 130]].map(([x, h]) => <path key={x} d={wisp(x!, h!)} stroke="#f2e8ff" strokeOpacity=".1" strokeWidth="18" />)}
        {[[352, 150], [404, 190], [452, 130]].map(([x, h]) => <path key={x} d={wisp(x!, h!)} stroke="#f2e8ff" strokeOpacity=".2" strokeWidth="5" />)}
      </g>
      <Dust seed={31} n={70} x={250} y={60} w={300} h={260} color="#f2e8ff" rMax={2.4} o={0.7} />
    </Layer>
  );
}

export const halloweenLayers = [Box, Cold, Lit, Spill, Smoke];
