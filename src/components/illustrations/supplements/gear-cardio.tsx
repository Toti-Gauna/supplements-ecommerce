import { DISPLAY_SVG, Rim, fitSize, tone } from "./defs";
import { Contact, luma, printOn } from "./gear-kit";
import type { ContainerProps, PackStyle } from "./types";

/** Vueltas del cable en el piso: centro, radios. */
const COILS: [number, number, number, number][] = [[200, 304, 104, 22], [196, 306, 96, 20], [204, 302, 110, 24], [198, 305, 88, 18]];

/** Cable con borde oscuro y brillo arriba. */
function Cable({ d, tint }: { d: string; tint: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={tone(tint, -0.55)} strokeWidth="5.6" />
      <path d={d} stroke={tint} strokeWidth="3.6" />
      <path d={d} stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" transform="translate(0 -1.2)" />
    </g>
  );
}

/** Mango de la soga: rulemán de acero arriba, cuello y perilla del color elegido, grip de la marca con la marca impresa. */
function Handle({ pack, tint, x, r }: { pack: PackStyle; tint: string; x: number; r: number }) {
  const neck = `M${x - 8} 186H${x + 8}L${x + 12} 212H${x - 12}Z`;
  const grip = `M${x - 12} 210H${x + 12}Q${x + 14} 258 ${x + 12} 300H${x - 12}Q${x - 14} 258 ${x - 12} 210Z`;
  const knob = `M${x - 13} 298H${x + 13}Q${x + 15} 326 ${x} 326Q${x - 15} 326 ${x - 13} 298Z`;
  return (
    <g transform={`rotate(${r} ${x} 326)`}>
      <rect x={x - 7} y={172} width="14" height="16" rx="3" fill="#c9ced6" />
      <rect x={x - 7} y={172} width="14" height="16" rx="3" fill="url(#sp-cyl)" />
      <path d={neck} fill={tint} />
      <path d={grip} fill={pack.body} />
      <g stroke={tone(pack.body, luma(pack.body) < 0.5 ? 0.25 : -0.2)} strokeOpacity=".7">{Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${x - 12} ${216 + i * 6.6}h24`} />)}</g>
      <text transform={`translate(${x + 4.5} 292) rotate(-90)`} fill={pack.accent} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 74, 13)}>{pack.mark}</text>
      <path d={knob} fill={tint} />
      <path d={`${neck}${grip}${knob}`} fill="url(#sp-cyl)" opacity=".85" />
      <path d={`M${x - 12} 211h24M${x - 13} 299h26`} stroke={tone(tint, -0.5)} strokeWidth="2" />
    </g>
  );
}

/** Soga de saltar: cable enrollado prolijo en el piso y los dos mangos parados con el cable saliendo arriba. */
export function Rope({ pack, tint }: ContainerProps) {
  const back = COILS.map(([cx, cy, rx, ry]) => `M${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`).join("");
  const front = COILS.map(([cx, cy, rx, ry]) => `M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`).join("");
  return (
    <g>
      <Contact cx={200} rx={116} y={330} />
      <Cable d={back} tint={tint} />
      <Cable d="M170 176C160 112 100 132 98 196C96 246 102 280 110 300" tint={tint} />
      <Cable d="M232 178C244 116 302 128 304 192C306 244 300 282 290 302" tint={tint} />
      <Handle pack={pack} tint={tint} x={172} r={-6} />
      <Handle pack={pack} tint={tint} x={228} r={7} />
      <Cable d={front} tint={tint} />
    </g>
  );
}

/** Anillo elíptico (contorno exterior y agujero) para pintar con evenodd. */
const ring = (cx: number, cy: number, R: number, r: number, q: number) =>
  `M${cx - R} ${cy}a${R} ${R * q} 0 1 0 ${2 * R} 0a${R} ${R * q} 0 1 0 ${-2 * R} 0ZM${cx - r} ${cy}a${r} ${r * q} 0 1 1 ${2 * r} 0a${r} ${r * q} 0 1 1 ${-2 * r} 0Z`;

/** Banda en el piso: anillo plano de goma (cara de arriba, canto y la pared de adentro a la vista por el agujero). */
function FlatBand({ cx, cy, R, r, t, color }: { cx: number; cy: number; R: number; r: number; t: number; color: string }) {
  const q = 0.34;
  return (
    <g>
      <path d={ring(cx, cy + t, R, r, q)} fill={tone(color, -0.45)} fillRule="evenodd" />
      <path d={ring(cx, cy, R, r, q)} fill={color} fillRule="evenodd" />
      <path d={ring(cx, cy, R, r, q)} fill="url(#sp-v)" fillRule="evenodd" opacity=".6" />
      <ellipse cx={cx - R * 0.32} cy={cy - R * q * 0.86} rx={R * 0.28} ry="1.6" fill="#fff" opacity=".3" />
    </g>
  );
}

/** Bandas elásticas: tres loops planos apilados y la principal (color elegido) de pie, apoyada atrás, con la marca. */
export function Bands({ pack, tint }: ContainerProps) {
  const ink = printOn(tint);
  const loop = "M200 112C252 112 286 168 286 226C286 290 252 326 200 326C148 326 114 290 114 226C114 168 148 112 200 112ZM200 130C160 130 134 176 134 226C134 278 160 308 200 308C240 308 266 278 266 226C266 176 240 130 200 130Z";
  return (
    <g>
      <Contact cx={200} rx={116} />
      <path d={loop} fill={tone(tint, -0.45)} transform="translate(8 -6)" fillRule="evenodd" />
      <path d={loop} fill={tint} fillRule="evenodd" />
      <path d={loop} fill="url(#sp-cyl)" fillRule="evenodd" opacity=".7" />
      <path d="M150 140C170 122 186 118 200 118" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
      <text x="200" y="125.5" textAnchor="middle" fill={ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 56, 9.5)}>{pack.mark}</text>
      <FlatBand cx={198} cy={312} R={112} r={100} t={6} color="#5d636d" />
      <FlatBand cx={204} cy={300} R={106} r={86} t={7} color={pack.accent} />
      <FlatBand cx={198} cy={287} R={100} r={86} t={8} color={tone(pack.body, 0.05)} />
      <Rim x={287} y1={180} y2={262} />
    </g>
  );
}
