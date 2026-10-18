import { PropDefs, Shaker, Tub } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const CYAN = "#3ff0e0";
const FLOOR = 524;
/** Marcador de la pared: ahí va el nombre y el descuento (cyber-monday.css). */
export const CM_LED = { x: 40, y: 64, w: 184, h: 74 };
/** Interior del rack (donde van las bahías); el CSS recorta las bahías apagadas con este rectángulo. */
export const CM_BAYS = { x: 274, y: 104, w: 252, n: 8, pitch: 48 };
const bayY = (j: number) => CM_BAYS.y + CM_BAYS.n * CM_BAYS.pitch - (j + 1) * CM_BAYS.pitch;

/** Las bahías del rack (todas en pocos trazos): frente de chapa, manijas, discos, LED de estado y barra de actividad. */
function Bays({ on }: { on: boolean }) {
  const { x, w, n, pitch } = CM_BAYS;
  const rows = Array.from({ length: n }, (_, j) => [bayY(j) + 3, pitch - 6] as const);
  const all = (f: (y: number, h: number, j: number) => string) => rows.map(([y, h], j) => f(y, h, j)).join("");
  const led = all((y, h) => `M${x + 30} ${y + h / 2}h0`);
  const bar = all((y, h) => `M${x + 200} ${y + h / 2}h32`);
  return (
    <g>
      <path d={all((y, h) => `M${x + 4} ${y}h${w - 8}v${h}h-${w - 8}z`)} fill={on ? "#0f2230" : "#0b1118"} />
      <path d={all((y) => `M${x + 4} ${y + 0.75}h${w - 8}`)} stroke="#fff" strokeOpacity={on ? 0.22 : 0.1} strokeWidth="1.5" />
      <path d={all((y, h) => `M${x + 12} ${y + 6}v${h - 12}M${x + w - 12} ${y + 6}v${h - 12}`)} stroke="#3a414b" strokeWidth="4" strokeLinecap="round" />
      <path d={all((y, h) => Array.from({ length: 6 }, (_, i) => `M${x + 46 + i * 24} ${y + 8}h16v${h - 16}h-16z`).join(""))} fill={on ? "#16303f" : "#0f161e"} stroke="#000" strokeOpacity=".5" />
      {on && <path d={all((y, h) => Array.from({ length: 6 }, (_, i) => `M${x + 54 + i * 24} ${y + h - 13}h0`).join(""))} stroke={CYAN} strokeWidth="4" strokeLinecap="round" opacity=".6" />}
      {on && <path d={led} stroke={CYAN} strokeWidth="26" strokeLinecap="round" opacity=".3" />}
      <path d={led} stroke={on ? CYAN : "#1a2630"} strokeWidth="10" strokeLinecap="round" />
      {on && <path d={bar} stroke={CYAN} strokeWidth="20" strokeLinecap="round" opacity=".18" />}
      <path d={bar} stroke={on ? CYAN : "#141d26"} strokeWidth="8" strokeLinecap="round" />
    </g>
  );
}

/** 1 · La sala de noche: el gabinete apagado, el marcador, el cajón con el pote y el shaker y el piso de goma. */
function Room() {
  const { x, y, w, n, pitch } = CM_BAYS;
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#010609"], [0.6, "#06212f"], [1, "#0b3246"]]} />
        <VGrad id="floor" stops={[[0, "#06141c"], [1, "#010304"]]} />
        <VGrad id="cab" x2={1} y2={0} stops={[[0, "#0b0e12"], [0.3, "#2a3039"], [0.55, "#151a20"], [1, "#07090c"]]} />
      </defs>
      <PropDefs ids={ids} volt={CYAN} plasma="#8b72ff" />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <DotGrid h={FLOOR} o={0.06} />
      <Glow id="halo" cx={400} cy={300} rx={330} ry={260} color="#0c3a58" o={0.8} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <path d={[-2, -1, 0, 1, 2].map((i) => `M${400 + i * 130} ${FLOOR}L${400 + i * 420} ${SH}`).join("")} stroke="#fff" strokeOpacity=".05" strokeWidth="2" />
      <ellipse cx="400" cy={FLOOR + 4} rx="190" ry="16" fill="#000" opacity=".6" />
      <rect x={x - 22} y={y - 34} width={w + 44} height={n * pitch + 60} rx="4" fill="url(#cab)" />
      <rect x={x - 22} y={y - 34} width={w + 44} height="2" fill="#fff" opacity=".25" />
      <path d={Array.from({ length: 12 }, (_, i) => `M${x + 20 + i * 18} ${y - 22}v12`).join("")} stroke="#000" strokeOpacity=".6" strokeWidth="5" />
      <rect x={x} y={y} width={w} height={n * pitch} fill="#05080b" />
      <path d={Array.from({ length: n * 3 }, (_, i) => `M${x + 4} ${y + 8 + i * 16}h3M${x + w - 7} ${y + 8 + i * 16}h3`).join("")} stroke="#3a414b" strokeWidth="4" />
      {[x - 6, x + w - 6].map((fx) => <rect key={fx} x={fx - 6} y={y + n * pitch + 26} width="24" height="10" fill="#0b0d11" />)}
      <path d="M620 524v-96h132v96z" fill="#121a22" />
      <path d="M620 428l18-14h132l-18 14z" fill="#1b2631" />
      <path d="M620 428h132" stroke={CYAN} strokeOpacity=".5" strokeWidth="2" />
      <Tub ids={ids} x={662} y={428} s={0.42} tint={CYAN} accent={CYAN} />
      <Shaker ids={ids} x={724} y={428} s={0.5} tint="#2ee6d6" accent={CYAN} />
      <path d={`M${x + w + 22} 300c40 0 60 40 60 120s10 104 40 104`} fill="none" stroke="#0b0d11" strokeWidth="8" />
      <LedBox {...CM_LED} color={CYAN} />
      <Dust seed={17} n={40} x={0} y={0} w={SW} h={FLOOR} rMax={2} o={0.25} color="#bff" />
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 · Las bahías prendidas (todas): las descubre de abajo hacia arriba la capa 3. */
function BaysOn() {
  return <Layer><Bays on /></Layer>;
}

/** 3 · Las mismas bahías apagadas: el CSS las sube de a una bahía, recortadas al interior del rack. */
function BaysOff() {
  return <Layer><Bays on={false} /></Layer>;
}

/** 4 · La luz cian que tira el rack prendido sobre la pared y el piso. */
function Spill() {
  return (
    <Layer>
      <Glow id="room" cx={400} cy={300} rx={300} ry={280} color={CYAN} o={0.22} />
      <Glow id="pool" cx={400} cy={FLOOR + 10} rx={260} ry={40} color={CYAN} o={0.35} />
    </Layer>
  );
}

/** 5 · El overclock: una línea de luz que barre el rack de arriba abajo cuando prendió todo. */
function Scan() {
  const { x, y, w } = CM_BAYS;
  return (
    <Layer>
      <defs><VGrad id="scan" stops={[[0, CYAN, 0], [0.8, CYAN, 0.35], [0.97, "#fff", 0.9], [1, "#fff", 0]]} /></defs>
      <rect x={x} y={y - 68} width={w} height="64" fill="url(#scan)" />
    </Layer>
  );
}

export const cyberMondayLayers = [Room, BaysOn, BaysOff, Spill, Scan];
