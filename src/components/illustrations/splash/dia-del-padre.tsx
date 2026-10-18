import { Barbell, PropDefs } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const GOLD = "#ffcf5c";
const SKIN = "#0a0e15";
const FLOOR = 540;
/** Marcador de la pared: ahí va el nombre y el descuento (dia-del-padre.css). */
export const DP_LED = { x: 40, y: 62, w: 184, h: 74 };
/**
 * El levantador de frente, en el bloqueo (el último cuadro): la barra a la altura del muslo, cadera y hombros
 * arriba. El CSS lo arma desde el arranque con la barra en el piso: la barra y los brazos bajan `RISE`, el torso se
 * achata sobre la cadera y los muslos sobre las rodillas (vistos de frente, inclinados hacia la cámara).
 */
export const DP = { bar: 395, hip: 356, knee: 443, shoulder: 259, rise: 85 };
const X = 400;

/** Un miembro afinado de (x1, y1) a (x2, y2), con anchos w1 y w2 y una panza hacia afuera. */
function limb(x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, belly = 4) {
  const my = (y1 + y2) / 2, mx = (x1 + x2) / 2;
  return `M${x1 - w1 / 2} ${y1}Q${mx - (w1 + w2) / 4 - belly} ${my} ${x2 - w2 / 2} ${y2}H${x2 + w2 / 2}Q${mx + (w1 + w2) / 4 + belly} ${my} ${x1 + w1 / 2} ${y1}Z`;
}
const both = (f: (s: number) => string) => f(-1) + f(1);

/** Silueta con filo de luz dorado: los trazos van debajo y asoman alrededor de los rellenos (pieza por pieza, así las que se pisan no se restan). */
function Body({ d }: { d: string }) {
  const parts = d.split(/(?=M)/);
  return (
    <g strokeLinejoin="round">
      {parts.map((p, i) => <path key={`s${i}`} d={p} fill="none" stroke={GOLD} strokeOpacity=".85" strokeWidth="4" />)}
      {parts.map((p, i) => <path key={`f${i}`} d={p} fill={SKIN} />)}
    </g>
  );
}

/** 1 · El box: pared azul noche, la plataforma, el marcador, las luces de jueces apagadas, las pantorrillas y los pies. */
function Platform() {
  const shins = both((s) => limb(X + s * 40, DP.knee - 6, 38, X + s * 42, FLOOR - 14, 24, 5));
  const feet = both((s) => `M${X + s * 42 - 18} ${FLOOR - 16}h36q14 0 16 16h-68q2-16 16-16z`);
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#05090f"], [0.6, "#13202e"], [1, "#1f3550"]]} />
        <VGrad id="plat" stops={[[0, "#3a2c18"], [1, "#120d07"]]} />
      </defs>
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={X} cy={330} rx={300} ry={260} color="#2e4c6e" o={0.8} />
      <Glow id="spot" cx={X} cy={220} rx={160} ry={200} color={GOLD} o={0.14} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="#06080c" />
      <path d={`M90 ${FLOOR}h620l40 60H50z`} fill="url(#plat)" />
      <path d={`M250 ${FLOOR}l-30 60M550 ${FLOOR}l30 60`} stroke="#000" strokeOpacity=".5" strokeWidth="3" />
      <path d={`M90 ${FLOOR}h620`} stroke={GOLD} strokeOpacity=".45" strokeWidth="2" />
      <rect x="566" y="66" width="196" height="64" rx="6" fill="#0b0e13" stroke="#2d323b" strokeWidth="3" />
      {[608, 664, 720].map((x) => <circle key={x} cx={x} cy="98" r="18" fill="#1c2129" stroke="#3a414b" strokeWidth="3" />)}
      <path d="M664 130v30" stroke="#1c2129" strokeWidth="8" />
      <LedBox {...DP_LED} color={GOLD} />
      <ellipse cx={X} cy={FLOOR + 6} rx="300" ry="12" fill="#000" opacity=".55" />
      <Body d={shins + feet} />
      <Dust seed={51} n={40} x={0} y={0} w={SW} h={FLOOR} rMax={2} o={0.25} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 · Los muslos (de la rodilla a la cadera). */
function Thighs() {
  return <Layer><Body d={both((s) => limb(X + s * 46, DP.hip - 6, 54, X + s * 40, DP.knee + 12, 40, 6))} /></Layer>;
}

/** 3 · El torso con el cinturón de levantamiento (de la cadera a los hombros). */
function Torso() {
  const { hip, shoulder } = DP;
  const d = `M${X - 58} ${hip + 4}C${X - 54} ${hip - 30} ${X - 56} ${hip - 60} ${X - 70} ${shoulder + 40}Q${X - 78} ${shoulder + 8} ${X - 44} ${shoulder}H${X + 44}Q${X + 78} ${shoulder + 8} ${X + 70} ${shoulder + 40}C${X + 56} ${hip - 60} ${X + 54} ${hip - 30} ${X + 58} ${hip + 4}Z`;
  return (
    <Layer>
      <Body d={d} />
      <path d={`M${X - 55} ${hip - 38}h110v24h-110z`} fill="#3a2a14" />
      <path d={`M${X - 55} ${hip - 38}h110`} stroke={GOLD} strokeOpacity=".5" strokeWidth="2" />
      <rect x={X - 14} y={hip - 34} width="28" height="16" rx="2" fill="none" stroke={GOLD} strokeWidth="3" />
      <path d={`M${X - 2} ${shoulder + 30}v40`} stroke="#000" strokeOpacity=".5" strokeWidth="3" />
    </Layer>
  );
}

/** 4 · La barra cargada (en el bloqueo; el CSS la arranca apoyada en la plataforma). */
function Bar() {
  return (
    <Layer>
      <PropDefs ids={ids} />
      <Barbell ids={ids} x={X} y={DP.bar} len={680} plates={[[34, 120], [30, 120], [24, 100]]} plateColor="#1d2a3b" />
      <path d={`M${X - 340} ${DP.bar - 7}h680`} stroke={GOLD} strokeOpacity=".35" strokeWidth="1.5" />
    </Layer>
  );
}

/** 5 · Cabeza, hombros y brazos con las manos agarrando la barra (se mueven con ella). */
function Arms() {
  const { shoulder, bar } = DP;
  const arms = both((s) => limb(X + s * 84, shoulder + 16, 36, X + s * 76, bar - 4, 22, 4) + `M${X + s * 84 - 21} ${shoulder + 16}a21 21 0 1 0 42 0a21 21 0 1 0-42 0`);
  const traps = `M${X - 100} ${shoulder + 30}Q${X - 100} ${shoulder - 8} ${X - 62} ${shoulder - 12}Q${X - 30} ${shoulder - 16} ${X - 14} ${shoulder - 26}H${X + 14}Q${X + 30} ${shoulder - 16} ${X + 62} ${shoulder - 12}Q${X + 100} ${shoulder - 8} ${X + 100} ${shoulder + 30}Z`;
  const head = `M${X - 12} ${shoulder - 14}v-12h24v12zM${X - 21} ${shoulder - 42}a21 25 0 1 0 42 0a21 25 0 1 0-42 0`;
  const hands = both((s) => `M${X + s * 76 - 14} ${bar - 6}q0-9 14-9t14 9v8q0 10-14 10t-14-10z`);
  return <Layer><Body d={arms + traps + head} /><Body d={hands} /></Layer>;
}

/** 6 · Las tres luces de los jueces, prendidas en blanco: levantamiento válido. */
function Judges() {
  return (
    <Layer>
      {[608, 664, 720].map((x) => (
        <g key={x}>
          <circle cx={x} cy="98" r="34" fill="#fff" opacity=".18" />
          <circle cx={x} cy="98" r="17" fill="#fff" />
          <circle cx={x - 5} cy="93" r="5" fill="#fff" opacity=".9" />
        </g>
      ))}
      <Glow id="lock" cx={X} cy={DP.bar} rx={340} ry={70} color={GOLD} o={0.25} />
    </Layer>
  );
}

/** 7 · La tiza que levantan los discos al despegarse de la plataforma. */
function Chalk() {
  return (
    <Layer>
      {[-1, 1].map((s) => <Glow key={s} id={`p${s}`} cx={X + s * 250} cy={FLOOR - 10} rx={130} ry={40} color="#f2f0ea" o={0.45} />)}
      <Dust seed={53} n={70} x={110} y={FLOOR - 70} w={580} h={70} rMax={2.4} o={0.8} />
    </Layer>
  );
}

export const diaDelPadreLayers = [Platform, Thighs, Torso, Bar, Arms, Judges, Chalk];
