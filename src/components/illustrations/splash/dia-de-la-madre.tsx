import { BOLT, PropDefs, Shaker } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const PINK = "#ffd6e7";
const ROSE = "#ff7aa8";
const SHELF = 520;
/** Pantalla del monitor cardíaco: el CSS de la escena recorta el barrido con este mismo rectángulo. */
const SCR = { x: 52, y: 104, w: 330, h: 200 };
/** Marcador del monitor (donde un monitor muestra las pulsaciones): ahí va el nombre y el descuento. */
export const DM_LED = { x: 412, y: 134, w: 172, h: 76 };
/** Frasco de vidrio del colágeno: interior que se llena (de `top` a `bottom`) y su centro. */
export const DM_JAR = { cx: 692, w: 150, top: 300, bottom: 508 };
const BASE = 214;

/** El trazo del electro: línea de base con tres latidos (onda P, el pico QRS y la onda T). */
function ecg() {
  const beat = (x: number) => `L${x - 34} ${BASE}q7-13 14 0L${x - 6} ${BASE}l5 12l9-98l10 118l6-32L${x + 34} ${BASE}q12-22 26 0`;
  return `M${SCR.x} ${BASE}${[112, 212, 312].map(beat).join("")}L${SCR.x + SCR.w} ${BASE}`;
}

/** Mancuerna rosa apoyada en el estante: cabezas hexagonales de goma y el mango moleteado. */
function Dumbbell({ x }: { x: number }) {
  const head = (hx: number) => <path d={`M${hx - 14} ${SHELF}v-34l7-12h14l7 12v34z`} fill="#c2416f" />;
  return (
    <g>
      <ellipse cx={x} cy={SHELF + 2} rx="78" ry="8" fill="#000" opacity=".5" />
      <rect x={x - 50} y={SHELF - 30} width="100" height="10" rx="3" fill="#8b95a3" />
      <path d={`M${x - 30} ${SHELF - 28}h60`} stroke="#3a414b" strokeWidth="5" strokeDasharray="2 3" />
      {head(x - 56)}
      {head(x + 56)}
      <path d={`M${x - 70} ${SHELF - 34}l7-12h14M${x + 42} ${SHELF - 34}l7-12h14`} stroke="#fff" strokeOpacity=".3" strokeWidth="2" fill="none" />
    </g>
  );
}

/** 1 · La pared rosa noche, el monitor apagado (carcasa, pantalla, marcador), el estante y el interior del frasco. */
function Wall() {
  const { cx, w, top, bottom } = DM_JAR;
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#10040a"], [0.6, "#2e0f1f"], [1, "#43172d"]]} />
        <VGrad id="shell" stops={[[0, "#3a3f48"], [0.5, "#1c2026"], [1, "#101216"]]} />
        <VGrad id="screen" stops={[[0, "#12060c"], [1, "#1c0a14"]]} />
      </defs>
      <PropDefs ids={ids} volt={PINK} plasma={ROSE} />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={SHELF} o={0.06} />
      <Glow id="halo" cx={380} cy={300} rx={380} ry={250} color="#a9496d" o={0.45} />
      <rect x="34" y="86" width="572" height="236" rx="10" fill="url(#shell)" />
      <rect x="34" y="86" width="572" height="2" rx="1" fill="#fff" opacity=".3" />
      <circle cx="588" cy="300" r="5" fill={ROSE} />
      <circle cx="588" cy="300" r="12" fill={ROSE} opacity=".25" />
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} rx="3" fill="url(#screen)" />
      <LedBox {...DM_LED} color={PINK} />
      <path d="M430 252c-8-10-23-3-16 8l16 14l16-14c7-11-8-18-16-8z" fill={ROSE} />
      <path d="M462 256h18M462 268h44M516 256h52M516 268h30" stroke="#5d6571" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 322v8h400v-8" fill="none" stroke="#0d0f12" strokeWidth="6" />
      <rect y={SHELF} width={SW} height={SH - SHELF} fill="#0b0408" />
      <rect y={SHELF} width={SW} height="10" fill="#2b1420" />
      <rect y={SHELF} width={SW} height="2" fill="#fff" opacity=".18" />
      <Shaker ids={ids} x={96} y={SHELF} s={0.78} body="#2a1220" accent={PINK} tint={ROSE} />
      <Dumbbell x={236} />
      <Dumbbell x={444} />
      <rect x={cx - w / 2} y={top - 6} width={w} height={bottom - top + 10} rx="10" fill="#160810" />
      <Dust seed={5} n={40} x={0} y={0} w={SW} h={SHELF} rMax={2} o={0.3} />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 · El electro completo (el barrido de la capa 3 lo va descubriendo). */
function Trace() {
  const d = ecg();
  return (
    <Layer>
      <path d={d} fill="none" stroke={ROSE} strokeOpacity=".25" strokeWidth="10" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={PINK} strokeWidth="3" strokeLinejoin="round" />
    </Layer>
  );
}

/** 3 · El barrido: la pantalla todavía vacía, con la línea de luz del cursor en el borde izquierdo. */
function Sweep() {
  return (
    <Layer>
      <defs><VGrad id="pen" x2={1} y2={0} stops={[[0, PINK, 0.9], [0.25, ROSE, 0.35], [1, ROSE, 0]]} /></defs>
      <rect x={SCR.x} y={SCR.y} width={SCR.w + 40} height={SCR.h} fill="#180812" />
      <rect x={SCR.x} y={SCR.y} width="22" height={SCR.h} fill="url(#pen)" />
      <circle cx={SCR.x + 2} cy={BASE} r="5" fill="#fff" />
      <circle cx={SCR.x + 2} cy={BASE} r="14" fill={PINK} opacity=".35" />
    </Layer>
  );
}

/** 4 · El colágeno en polvo adentro del frasco (el CSS lo carga desde el fondo con cada latido). */
function Powder() {
  const { cx, w, top, bottom } = DM_JAR;
  const x0 = cx - w / 2 + 6, x1 = cx + w / 2 - 6;
  return (
    <Layer>
      <defs><VGrad id="pw" stops={[[0, "#fff1f6"], [0.4, "#f6c9da"], [1, "#d98aa8"]]} /></defs>
      <path d={`M${x0} ${top + 14}Q${cx} ${top - 10} ${x1} ${top + 14}V${bottom - 8}q0 8-8 8H${x0 + 8}q-8 0-8-8z`} fill="url(#pw)" />
      <Dust seed={8} n={60} x={x0} y={top + 10} w={x1 - x0} h={bottom - top - 20} color="#a85677" rMax={1.6} o={0.45} />
    </Layer>
  );
}

/** 5 · El frente: el vidrio del frasco con su tapa y rótulo, y el vidrio y la grilla de la pantalla. */
function Front() {
  const { cx, w, top, bottom } = DM_JAR;
  const grid = Array.from({ length: 9 }, (_, i) => `M${SCR.x + (i + 1) * 31.2} ${SCR.y}v${SCR.h}`).join("") + Array.from({ length: 5 }, (_, i) => `M${SCR.x} ${SCR.y + (i + 1) * 31.3}h${SCR.w}`).join("");
  const body = `M${cx - w / 2} ${top - 6}H${cx + w / 2}V${bottom - 12}q0 16-16 16H${cx - w / 2 + 16}q-16 0-16-16z`;
  return (
    <Layer>
      <defs><VGrad id="glass" x2={1} y2={0} stops={[[0, "#fff", 0.16], [0.14, "#fff", 0.04], [0.3, "#fff", 0.2], [0.38, "#fff", 0.02], [0.86, "#fff", 0.02], [1, "#fff", 0.18]]} /></defs>
      <path d={grid} stroke={ROSE} strokeOpacity=".09" strokeWidth="1" />
      <path d={`M${SCR.x} ${SCR.y}h${SCR.w * 0.5}l-${SCR.w * 0.16} ${SCR.h}H${SCR.x}z`} fill="#fff" opacity=".035" />
      <path d={body} fill="url(#glass)" stroke="#fff" strokeOpacity=".28" strokeWidth="2" />
      <path d={`M${cx - w / 2 + 10} ${bottom - 30}h14M${cx - w / 2 + 10} ${bottom - 70}h22M${cx - w / 2 + 10} ${bottom - 110}h14M${cx - w / 2 + 10} ${bottom - 150}h22`} stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
      <rect x={cx - w / 2 - 6} y={top - 40} width={w + 12} height="36" rx="5" fill="#2a1220" />
      <path d={Array.from({ length: 13 }, (_, i) => `M${cx - w / 2 + 4 + i * 10} ${top - 34}v24`).join("")} stroke="#000" strokeOpacity=".35" strokeWidth="1.6" />
      <rect x={cx - w / 2 - 6} y={top - 40} width={w + 12} height="3" fill="#fff" opacity=".3" />
      <rect x={cx - w / 2} y={bottom - 104} width={w} height="58" fill="#1c0a14" opacity=".88" />
      <rect x={cx - w / 2} y={bottom - 54} width={w} height="8" fill={ROSE} />
      <path d={BOLT} transform={`translate(${cx + 30} ${bottom - 98}) scale(.42)`} fill={PINK} />
      <rect x={cx - w / 2 + 12} y={bottom - 94} width="44" height="12" rx="2" fill="#fff" opacity=".85" />
      <rect x={cx - w / 2 + 12} y={bottom - 76} width="30" height="4" rx="2" fill="#fff" opacity=".45" />
      <path d={`M${cx + w / 2 - 6} ${top + 4}V${bottom - 14}`} stroke={PINK} strokeOpacity=".7" strokeWidth="2.4" strokeLinecap="round" />
    </Layer>
  );
}

/** 6 · El latido en la sala: halo rosa detrás del monitor y del frasco (late con cada pico). */
function Pulse() {
  return (
    <Layer>
      <Glow id="beat" cx={214} cy={BASE} rx={260} ry={150} color={ROSE} o={0.32} />
      <Glow id="jar" cx={DM_JAR.cx} cy={430} rx={150} ry={120} color={PINK} o={0.3} />
    </Layer>
  );
}

export const diaDeLaMadreLayers = [Wall, Trace, Sweep, Powder, Front, Pulse];
