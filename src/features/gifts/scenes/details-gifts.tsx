import { DISPLAY_SVG, MONO_SVG } from "@/components/illustrations/supplements/defs";
import type { BagDecor, DetailProps } from "./bag-colors";
import { SPARKLE } from "./kit";

/** Detalles de las fechas para regalar: Navidad, Año Nuevo, San Valentín, Día de la Madre, del Padre y del Amigo. */

const RED = "#d62839", RED_DARK = "#8e1422", WHITE = "#f4f5f0";
const HEART = "M0 14C-16 2-21-6-21-13C-21-19-16-23-10.5-23C-5.5-23-2-20 0-16C2-20 5.5-23 10.5-23C16-23 21-19 21-13C21-6 16 2 0 14Z";
/** Hilo de bordado: puntadas cortas, redondeadas. */
const stitch = (color: string, width = 1.4) => ({ stroke: color, strokeWidth: width, strokeDasharray: "2.2 1.6", strokeLinecap: "round" as const });

/** Navidad: cinta roja que cruza la bolsa con un moño, y gorrito arriba. */
export const NAVIDAD: BagDecor = {
  Body: () => (
    <g>
      <rect x="142" y="104" width="16" height="126" fill={RED} /><rect x="100" y="160" width="100" height="15" fill={RED} />
      <path d="M144 104V230M156 104V230M100 162H200M100 173H200" stroke={RED_DARK} strokeWidth="1" opacity=".7" />
      <path d="M150 167C134 148 112 152 116 166C120 180 138 176 150 167ZM150 167C166 148 188 152 184 166C180 180 162 176 150 167Z" fill={RED} stroke={RED_DARK} strokeWidth="1.2" />
      <path d="M146 170L134 198L142 194L145 202L150 172ZM154 170L166 198L158 194L155 202L150 172Z" fill={RED_DARK} />
      <path d="M122 162Q130 156 140 162M178 162Q170 156 160 162" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" fill="none" />
      <circle cx="150" cy="167" r="6" fill={RED} stroke={RED_DARK} strokeWidth="1.2" />
    </g>
  ),
  Top: () => (
    <g>
      <path d="M114 84Q118 52 166 46Q196 46 210 68L201 74Q190 62 177 63Q185 72 186 84Z" fill={RED} />
      <path d="M177 63Q185 72 186 84L174 84Q172 70 166 60Z" fill={RED_DARK} opacity=".6" />
      <rect x="108" y="77" width="84" height="12" rx="6" fill={WHITE} /><rect x="108" y="84" width="84" height="5" rx="2.5" fill="#000" opacity=".1" />
      <circle cx="210" cy="74" r="7.5" fill={WHITE} /><circle cx="208" cy="72" r="3" fill="#fff" />
    </g>
  ),
};

/** Año Nuevo: "versión 2027" con la barra de actualización completa y destellos. */
export const ANO_NUEVO: BagDecor = {
  Body: ({ c }) => (
    <g>
      <text x="150" y="138" textAnchor="middle" fill={c.accent} style={{ fontFamily: MONO_SVG, fontWeight: 700, letterSpacing: "0.3em" }} fontSize="6.5">VERSIÓN</text>
      <text x="150" y="164" textAnchor="middle" fill={c.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "112%" }} fontSize="15">2027</text>
      <rect x="127" y="174" width="46" height="5" rx="2.5" fill="#fff" opacity=".14" /><rect x="127" y="174" width="46" height="5" rx="2.5" fill={c.accent} />
      <text x="150" y="190" textAnchor="middle" fill={c.ink} opacity=".75" style={{ fontFamily: MONO_SVG, fontWeight: 600, letterSpacing: "0.08em" }} fontSize="5">ACTUALIZADO</text>
      {[[132, 124, 0.45], [170, 128, 0.6], [134, 206, 0.5], [168, 210, 0.4]].map(([x, y, s]) => (
        <path key={`${x}-${y}`} d={SPARKLE} fill={c.accent} transform={`translate(${x} ${y}) scale(${s})`} />
      ))}
    </g>
  ),
};

/** San Valentín: un corazón grande bordado y dos chicos rellenos. */
export const SAN_VALENTIN: BagDecor = {
  Body: ({ c }) => (
    <g>
      <path d={HEART} transform="translate(150 166) scale(1.2)" fill={c.accent} fillOpacity=".16" {...stitch(c.accent, 1.5)} />
      <path d={HEART} transform="translate(150 164) scale(.78)" fill="none" {...stitch(c.accent, 1.8)} />
      <path d={HEART} transform="translate(167 128) scale(.36)" fill={c.accent} />
      <path d={HEART} transform="translate(133 208) scale(.42)" fill={c.accent} />
      <path d="M128 207l3-3M164 126l3-3" stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  ),
};

function Flower({ x, y, r, color, c }: { x: number; y: number; r: number; color: string; c: DetailProps["c"] }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.62} rx={r * 0.42} ry={r * 0.66} transform={`rotate(${a})`} fill={color} fillOpacity=".85" {...stitch(c.leatherLo, 0.9)} />
      ))}
      <circle r={r * 0.32} fill={c.accent} />
    </g>
  );
}

/** Día de la Madre: tres flores bordadas con sus tallos. */
export const DIA_DE_LA_MADRE: BagDecor = {
  Body: ({ c }) => (
    <g>
      <path d="M137 140Q140 180 150 214M164 160Q160 190 150 214M142 186Q146 200 150 214" fill="none" {...stitch("#8fd18f", 1.4)} />
      <path d="M142 176Q132 172 130 162Q140 164 142 176ZM158 190Q168 184 172 174Q162 178 158 190Z" fill="#8fd18f" fillOpacity=".8" />
      <Flower x={137} y={138} r={11} color="#ff9ec4" c={c} />
      <Flower x={164} y={158} r={12.5} color={c.accent} c={c} />
      <Flower x={142} y={186} r={8} color="#ff9ec4" c={c} />
    </g>
  ),
};

const GLOVE = "M-11-8C-15 0-14 11-6 15C0 18 8 17 12 10C15 4 14-3 11-8Z";
function Glove({ x, y, a }: { x: number; y: number; a: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <rect x="-9" y="-19" width="18" height="12" rx="2" fill={WHITE} /><path d="M-9-13H9" stroke="#2f6fd6" strokeWidth="2.4" />
      <path d={GLOVE} fill="#2f6fd6" /><path d="M-11-1C-17-1-17 8-11 8" stroke="#1d4c9e" strokeWidth="1.6" fill="none" />
      <ellipse cx="3" cy="-1" rx="5" ry="8" fill="#fff" opacity=".22" />
    </g>
  );
}

/** Día del Padre: cinta azul con "PAPÁ" y un par de guantes colgando de la argolla. */
export const DIA_DEL_PADRE: BagDecor = {
  Body: () => (
    <g>
      <rect x="100" y="158" width="100" height="18" fill="#2f6fd6" /><path d="M100 161H200M100 173H200" stroke="#fff" strokeOpacity=".7" strokeWidth=".9" strokeDasharray="2.4 2" />
      <text x="150" y="170.5" textAnchor="middle" fill="#fff" style={{ fontFamily: MONO_SVG, fontWeight: 800, letterSpacing: "0.32em" }} fontSize="8">PAPÁ</text>
    </g>
  ),
  Top: () => (
    <g>
      <path d="M147 42Q112 58 90 92M147 42Q104 62 76 100" stroke={WHITE} strokeWidth="1.3" fill="none" />
      <Glove x={90} y={110} a={12} /><Glove x={74} y={118} a={-10} />
    </g>
  ),
};

/** Día del Amigo: pulsera de la amistad tejida alrededor y el parche "x2" del compañero de gym. */
export const DIA_DEL_AMIGO: BagDecor = {
  Body: ({ c }) => (
    <g>
      <rect x="100" y="158" width="100" height="18" fill={c.accent} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${100 + i * 8} 158l4 9l-4 9h4l4-9l-4-9Z`} fill={["#8b72ff", "#2ee6d6", "#ff7aa8"][i % 3]} />
      ))}
      <circle cx="150" cy="130" r="14" fill={c.band} {...stitch(c.accent, 1.2)} />
      <text x="150" y="134.5" textAnchor="middle" fill={c.accent} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize="12">x2</text>
      <text x="150" y="200" textAnchor="middle" fill={c.ink} opacity=".8" style={{ fontFamily: MONO_SVG, fontWeight: 700, letterSpacing: "0.22em" }} fontSize="6">SPOT ME</text>
    </g>
  ),
};
