import { Barbell, Kettlebell, PropDefs } from "../campaigns/props";
import { Beam, Dust } from "../campaigns/stage";
import { DotGrid, Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const EMBER = "#ff7a1a";
const RED = "#ff3b2e";
const VOLT = "#c8ff2e";
const FLOOR = 500;
/** Reloj de WOD colgado en la pared: la ventana de la izquierda (la de las rondas) lleva el descuento (crossfit-open.css). */
export const CF_LED = { x: 128, y: 84, w: 196, h: 92 };
/** Ventana de los dígitos grandes: el CSS escala cada número desde su centro. */
export const CF_DIGITS = { x: 350, y: 74, w: 326, h: 112 };
const DH = 84, DY = CF_DIGITS.y + 14, DX = 384;

/** Segmentos encendidos por dígito (a arriba, b/c derecha, d abajo, e/f izquierda, g medio). */
const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "8": "abcdefg" };
const SW7 = 46, ST = 10;
/** Un dígito de 7 segmentos en (x, 0), alto DH: un solo trazado con los segmentos encendidos (hexágonos chatos). */
function digit(ch: string, x: number) {
  const hl = SW7 - ST, vl = DH / 2 - ST, t = ST / 2;
  const h = (y: number) => `M${x + t} ${y}l${t} -${t}h${hl - ST}l${t} ${t}l-${t} ${t}h-${hl - ST}z`;
  const v = (sx: number, y: number) => `M${sx} ${y}l${t} ${t}v${vl - ST}l-${t} ${t}l-${t} -${t}v-${vl - ST}z`;
  const at: Record<string, string> = {
    a: h(t), g: h(DH / 2), d: h(DH - t), f: v(x + t, t + 2), b: v(x + SW7 - t, t + 2), e: v(x + t, DH / 2 + 2), c: v(x + SW7 - t, DH / 2 + 2),
  };
  return (SEG[ch] ?? "").split("").map((s) => at[s]).join("");
}

/** Minutos y segundos en dígitos de 7 segmentos, con los dos puntos (son trazos, no texto). */
function Clock({ mm, ss, color }: { mm: string; ss: string; color: string }) {
  const xs = [0, 62, 152, 214];
  const d = [...mm, ...ss].map((ch, i) => digit(ch, xs[i]!)).join("") + "M128 26h11v11h-11zM128 50h11v11h-11z";
  return (
    <g transform={`translate(${DX + 10} ${DY}) skewX(-8)`}>
      <path d={d} fill={color} stroke={color} strokeWidth="9" strokeOpacity=".18" strokeLinejoin="round" />
      <path d={d} fill="#fff" opacity=".3" />
    </g>
  );
}

/** 1 · El box del Open: pared de ladrillo, el reloj apagado, el rig y en el piso la barra, la pesa rusa y la wall ball. */
function Box() {
  const H = CF_DIGITS;
  return (
    <Layer>
      <defs>
        <VGrad id="wall" stops={[[0, "#0a0605"], [0.55, "#1a0f0a"], [1, "#3a1d0e"]]} />
        <VGrad id="floor" stops={[[0, "#1a100a"], [1, "#040302"]]} />
        <VGrad id="house" stops={[[0, "#2a2f37"], [0.5, "#121418"], [1, "#07080a"]]} />
      </defs>
      <PropDefs ids={ids} volt={EMBER} plasma="#5a2a12" />
      <rect width={SW} height={SH} fill="url(#wall)" />
      <path d={Array.from({ length: 13 }, (_, i) => `M0 ${i * 38 + 12}H${SW}`).join("")} stroke="#000" strokeOpacity=".25" strokeWidth="2" />
      <DotGrid h={FLOOR} o={0.05} />
      <Glow id="warm" cx={400} cy={FLOOR - 30} rx={420} ry={200} color={EMBER} o={0.22} />
      <rect y={FLOOR} width={SW} height={SH - FLOOR} fill="url(#floor)" />
      <path d={[-3, -2, -1, 0, 1, 2, 3].map((i) => `M${400 + i * 120} ${FLOOR}L${400 + i * 380} ${SH}`).join("") + `M0 ${FLOOR + 40}H${SW}`} stroke="#000" strokeOpacity=".5" strokeWidth="2" />
      {/* El rig: dos parantes con agujeros y la barra de dominadas. */}
      {[112, 688].map((x) => <rect key={x} x={x - 10} y="236" width="20" height={FLOOR - 236} fill={ids.url("steel")} />)}
      {[112, 688].map((x) => <path key={`h${x}`} d={`M${x} 250V${FLOOR}`} stroke="#05060a" strokeWidth="7" strokeDasharray="8 12" />)}
      <rect x="96" y="236" width="608" height="14" rx="3" fill={ids.url("steel")} />
      <rect x="96" y="236" width="608" height="2" fill="#fff" opacity=".2" />
      <Beam ids={ids} k="c" x0={400} x1={400} y1={FLOOR + 10} w={220} color={EMBER} o={0.16} lamp={false} />
      <Barbell ids={ids} x={400} y={FLOOR - 76} len={540} plates={[[40, 152], [30, 152]]} plateColor="#2a1f19" />
      <Kettlebell ids={ids} x={196} y={FLOOR + 30} r={36} color="#1a1d22" />
      <circle cx="612" cy={FLOOR + 2} r="36" fill="#26201c" />
      <circle cx="612" cy={FLOOR + 2} r="36" fill={ids.url("sphere")} />
      <path d={`M576 ${FLOOR + 2}Q612 ${FLOOR - 14} 648 ${FLOOR + 2}M612 ${FLOOR - 34}Q596 ${FLOOR + 2} 612 ${FLOOR + 38}`} stroke={EMBER} strokeOpacity=".6" strokeWidth="3" fill="none" />
      {/* El reloj: caja negra atornillada a la pared, ventana de rondas y ventana de los dígitos con los segmentos fantasma. */}
      {[150, 650].map((x) => <rect key={x} x={x - 6} y="40" width="12" height="20" fill="#2d323b" />)}
      <rect x="100" y="54" width="600" height="152" rx="6" fill="url(#house)" stroke="#2d323b" strokeWidth="3" />
      <rect x="104" y="57" width="592" height="2" fill="#fff" opacity=".22" />
      <LedBox {...CF_LED} color={EMBER} />
      <rect x={H.x} y={H.y} width={H.w} height={H.h} rx="3" fill="#010102" stroke="#2d323b" strokeWidth="3" />
      <g opacity=".08"><Clock mm="88" ss="88" color={RED} /></g>
      <path d={`M${H.x} ${H.y}h${H.w * 0.5}l-${H.w * 0.16} ${H.h}H${H.x}z`} fill="#fff" opacity=".03" />
      <circle cx="680" cy="70" r="4" fill="#3a1a10" />
      <Dust seed={13} n={36} x={160} y={260} w={480} h={220} color="#f2e6dc" rMax={1.8} o={0.35} />
      <Vignette o={0.72} />
    </Layer>
  );
}

/** 2 a 4 · La cuenta regresiva: 3, 2 y 1 en rojo, cada uno con el resplandor del pitido. */
function count(n: number) {
  return function Count() {
    return (
      <Layer>
        <Glow id="beep" cx={CF_DIGITS.x + CF_DIGITS.w / 2} cy={CF_DIGITS.y + CF_DIGITS.h / 2} rx={190} ry={80} color={RED} o={0.35} />
        <Clock mm="00" ss={`0${n}`} color={RED} />
      </Layer>
    );
  };
}

/** 5 · ¡Ya! El reloj arranca de cero en voltio y la luz de la caja pasa a verde. */
function Go() {
  return (
    <Layer>
      <Glow id="go" cx={CF_DIGITS.x + CF_DIGITS.w / 2} cy={CF_DIGITS.y + CF_DIGITS.h / 2} rx={210} ry={90} color={VOLT} o={0.3} />
      <Clock mm="00" ss="00" color={VOLT} />
      <circle cx="680" cy="70" r="4" fill={VOLT} />
      <circle cx="680" cy="70" r="10" fill={VOLT} opacity=".25" />
    </Layer>
  );
}

/** 6 · El fogonazo del pitido: la luz del reloj baña la pared y el piso (el CSS lo prende en cada número). */
function Flash() {
  return (
    <Layer>
      <Glow id="flash" cx={400} cy={150} rx={420} ry={200} color={EMBER} o={0.4} />
      <Glow id="spill" cx={400} cy={FLOOR} rx={380} ry={60} color={EMBER} o={0.3} />
    </Layer>
  );
}

export const crossfitOpenLayers = [Box, count(3), count(2), count(1), Go, Flash];
