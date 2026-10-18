import { PropDefs, Shaker } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const LIME = "#e3ff8f";
const TEAL = "#2ee6d6";
const FLOOR = 500;
/** Marcador de la pared (va a lo ancho: el descuento es un monto, "−$ 5.000"): dia-del-amigo.css. */
export const DA_LED = { x: 540, y: 52, w: 222, h: 72 };
/** Donde chocan los shakers (el brindis) y el codo de cada brazo, sobre el que gira (fuera del cuadro, abajo). */
export const DA_CLINK = { x: 400, y: 198 };
export const DA_ELBOW = { left: [150, 640], right: [650, 640] } as const;
const HAND = { x: 313, y: 360, tilt: 12 };

/** 1 · El box con luz de tarde: pared verde agua, la banca y el rack al fondo, y el marcador. */
function Box() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#021411"], [0.6, "#0a3d38"], [1, "#0f5a52"]]} />
        <VGrad id="floor" stops={[[0, "#062420"], [1, "#010605"]]} />
      </defs>
      <PropDefs ids={ids} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={400} cy={250} rx={360} ry={240} color="#0f766e" o={0.7} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <path d={[-2, -1, 0, 1, 2].map((i) => `M${400 + i * 130} ${FLOOR}L${400 + i * 420} ${SH}`).join("")} stroke="#fff" strokeOpacity=".05" strokeWidth="2" />
      {[86, 264].map((x) => <rect key={x} x={x - 9} y="150" width="18" height={FLOOR - 150} fill="#0b1a19" />)}
      <rect x="70" y="150" width="212" height="14" fill="#0b1a19" />
      <rect x="60" y="250" width="232" height="10" rx="3" fill="#13302c" />
      <path d="M470 440h230l-14 22H484z" fill="#0b1a19" />
      <path d="M520 462v38M650 462v38M560 500h50" stroke="#0b1a19" strokeWidth="10" />
      <LedBox {...DA_LED} color={LIME} />
      <Dust seed={61} n={44} x={0} y={0} w={SW} h={FLOOR} rMax={2} o={0.3} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** Un brazo que entra desde abajo con el shaker en la mano (el derecho es el espejo del izquierdo). */
function Arm({ flip, tint }: { flip?: boolean; tint: string }) {
  const [ex, ey] = DA_ELBOW.left;
  const { x, y, tilt } = HAND;
  const arm = `M${ex - 40} ${ey}C${ex - 20} ${ey - 120} ${x - 70} ${y + 90} ${x - 34} ${y + 24}L${x + 26} ${y + 46}C${x - 10} ${y + 110} ${ex + 40} ${ey - 90} ${ex + 44} ${ey}Z`;
  const fist = `M${x - 58} ${y - 22}q0-12 12-12h78q14 0 14 14v40q0 16-16 16h-74q-14 0-14-14z`;
  return (
    <Layer>
      <PropDefs ids={ids} volt={LIME} plasma={TEAL} />
      <g transform={flip ? `translate(${SW} 0) scale(-1 1)` : undefined}>
        <path d={arm} fill="none" stroke={LIME} strokeOpacity=".7" strokeWidth="4" />
        <path d={arm} fill="#081110" />
        <g transform={`translate(${x} ${y}) rotate(${tilt}) translate(0 70)${flip ? " scale(-1 1)" : ""}`}>
          <Shaker ids={ids} x={0} y={0} s={1.25} body="#16302d" tint={tint} accent={LIME} />
        </g>
        <g transform={`rotate(${tilt} ${x} ${y})`}>
          <path d={fist} fill="none" stroke={LIME} strokeOpacity=".7" strokeWidth="4" />
          <path d={fist} fill="#0b1615" />
          <path d={`M${x - 32} ${y - 32}v30M${x - 8} ${y - 32}v32M${x + 16} ${y - 32}v30`} stroke="#000" strokeOpacity=".6" strokeWidth="3" />
        </g>
      </g>
    </Layer>
  );
}

function LeftArm() {
  return <Arm tint={TEAL} />;
}
function RightArm() {
  return <Arm flip tint="#8b72ff" />;
}

/** 4 · El brindis: luz donde chocan las tapas y gotas de batido que saltan. */
function Clink() {
  const { x, y } = DA_CLINK;
  return (
    <Layer>
      <Glow id="hit" cx={x} cy={y} rx={150} ry={120} color={LIME} o={0.5} />
      <path d={`M${x} ${y - 46}v-26M${x - 36} ${y - 34}l-18-18M${x + 36} ${y - 34}l18-18M${x - 50} ${y}h-22M${x + 50} ${y}h22`} stroke={LIME} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={x} cy={y} r="6" fill="#fff" />
    </Layer>
  );
}

/** 5 · Gotas de batido que saltan del choque. */
function Drops() {
  const { x, y } = DA_CLINK;
  return (
    <Layer>
      <Dust seed={67} n={34} x={x - 110} y={y - 120} w={220} h={110} color="#f2f0ea" rMax={3.4} o={0.85} />
      <Dust seed={68} n={20} x={x - 80} y={y - 90} w={160} h={70} color={TEAL} rMax={3} o={0.8} />
    </Layer>
  );
}

export const diaDelAmigoLayers = [Box, LeftArm, RightArm, Clink, Drops];
