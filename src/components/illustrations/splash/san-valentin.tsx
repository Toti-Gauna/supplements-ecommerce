import { PropDefs, Tub } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const PINK = "#ffd1dc";
const ROSE = "#ff5c8a";
const FLOOR = 520;
/** Marcador de la pared, arriba del soporte: ahí va el nombre y el descuento (san-valentin.css). */
export const SV_LED = { x: 300, y: 76, w: 200, h: 76 };
/** Altura del mango de las mancuernas apoyadas y el punto donde se tocan las cabezas. */
const HY = 300;
export const SV_MEET = { x: 400, y: HY };
/** Mango de cada mancuerna, ya apoyada en su cuna (centro x), y la viga del soporte. */
const CRADLES = [265, 535];
const BEAM = HY + 58;

/** Una mancuerna de cabezas hexagonales vista de frente, apoyada con el mango en `cx`. */
function Dumbbell({ cx }: { cx: number }) {
  const head = (x: number) => (
    <g>
      <path d={`M${x - 30} ${HY - 52}l8-10h44l8 10v104l-8 10h-44l-8-10z`} fill="#22141a" />
      <path d={`M${x - 30} ${HY - 22}h60M${x - 30} ${HY + 22}h60`} stroke="#000" strokeOpacity=".5" strokeWidth="3" />
      <path d={`M${x - 22} ${HY - 60}h44`} stroke="#fff" strokeOpacity=".25" strokeWidth="2" />
      <path d={`M${x + 29} ${HY - 50}v100`} stroke={PINK} strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
      <rect x={x - 30} y={HY - 7} width="60" height="14" fill={ROSE} opacity=".85" />
    </g>
  );
  return (
    <g>
      <rect x={cx - 80} y={HY - 10} width="160" height="20" rx="4" fill={ids.url("steel")} />
      <path d={`M${cx - 50} ${HY - 4}h100M${cx - 50} ${HY + 4}h100`} stroke="#000" strokeOpacity=".5" strokeWidth="2" strokeDasharray="2 3" />
      <rect x={cx - 80} y={HY - 10} width="160" height="3" fill="#fff" opacity=".35" />
      {head(cx - 105)}
      {head(cx + 105)}
    </g>
  );
}

/** Frente de una cuna: chapa con la muesca en U donde calza el mango. */
const cradle = (x: number) => `M${x - 55} ${HY - 4}h20q0 26 35 26t35-26h20v${BEAM - HY + 4}h-110z`;

/** 1 · La pared bordó con los parantes, la viga del soporte doble, el marcador y los dos potes. */
function Wall() {
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#12030a"], [0.6, "#3a0a1c"], [1, "#521028"]]} />
        <VGrad id="floor" stops={[[0, "#1e0710"], [1, "#040102"]]} />
      </defs>
      <PropDefs ids={ids} volt={PINK} plasma={ROSE} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={400} cy={300} rx={360} ry={230} color="#a8274a" o={0.55} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <path d={[-2, -1, 0, 1, 2].map((i) => `M${400 + i * 130} ${FLOOR}L${400 + i * 420} ${SH}`).join("")} stroke="#fff" strokeOpacity=".05" strokeWidth="2" />
      {[96, 704].map((x) => (
        <g key={x}>
          <rect x={x - 12} y="40" width="24" height={FLOOR - 40} fill={ids.url("steel")} />
          <path d={`M${x} 60V${FLOOR}`} stroke="#05060a" strokeWidth="8" strokeDasharray="9 13" />
        </g>
      ))}
      <rect x="84" y={BEAM} width="632" height="24" rx="3" fill={ids.url("steel")} />
      <rect x="84" y={BEAM} width="632" height="2" fill="#fff" opacity=".3" />
      {CRADLES.map((x) => <path key={x} d={cradle(x)} fill="#1c2026" transform="translate(0 -6)" />)}
      <rect x="376" y={BEAM + 8} width="48" height="8" rx="4" fill="#3a1220" />
      <ellipse cx="400" cy={FLOOR + 4} rx="300" ry="14" fill="#000" opacity=".55" />
      <Tub ids={ids} x={340} y={FLOOR} s={0.5} tint={ROSE} accent={PINK} />
      <Tub ids={ids} x={466} y={FLOOR} s={0.5} tint="#8b72ff" accent={PINK} lit={0.8} />
      <LedBox {...SV_LED} color={PINK} />
      <Dust seed={41} n={44} x={0} y={0} w={SW} h={FLOOR} rMax={2} o={0.28} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 y 3 · Cada mancuerna en su cuna; el CSS las trae deslizando desde los costados. */
function Left() {
  return <Layer><PropDefs ids={ids} /><Dumbbell cx={CRADLES[0]!} /></Layer>;
}
function Right() {
  return <Layer><PropDefs ids={ids} /><Dumbbell cx={CRADLES[1]!} /></Layer>;
}

/** 4 · El frente de las cunas, por delante del mango (las mancuernas quedan encastradas). */
function Lips() {
  return (
    <Layer>
      {CRADLES.map((x) => (
        <g key={x}>
          <path d={cradle(x)} fill="#3a414b" />
          <path d={`M${x - 55} ${HY - 4}h20q0 26 35 26t35-26h20`} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
          <circle cx={x - 40} cy={BEAM - 14} r="4" fill="#1c2026" />
          <circle cx={x + 40} cy={BEAM - 14} r="4" fill="#1c2026" />
        </g>
      ))}
    </Layer>
  );
}

/** 5 · El encastre: luz rosa donde se tocan las cabezas y la traba del soporte prendida. */
function Click() {
  return (
    <Layer>
      <Glow id="meet" cx={SV_MEET.x} cy={HY} rx={160} ry={120} color={ROSE} o={0.5} />
      <path d={`M${SV_MEET.x} ${HY - 74}v-24M${SV_MEET.x - 34} ${HY - 66}l-14-18M${SV_MEET.x + 34} ${HY - 66}l14-18`} stroke={PINK} strokeWidth="3" strokeLinecap="round" />
      <rect x="376" y={BEAM + 8} width="48" height="8" rx="4" fill={ROSE} />
      <rect x="368" y={BEAM + 2} width="64" height="20" rx="10" fill={ROSE} opacity=".3" />
      <Dust seed={43} n={36} x={320} y={200} w={160} h={170} color={PINK} rMax={2.2} o={0.8} />
    </Layer>
  );
}

export const sanValentinLayers = [Wall, Left, Right, Lips, Click];
