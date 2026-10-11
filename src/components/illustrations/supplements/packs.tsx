import { DISPLAY_SVG, Label, MONO_SVG, Rim, Shade, fitSize, tone } from "./defs";
import type { ContainerProps } from "./types";

/** Doypack con cierre zip (creatina, proteína vegana). Panza suave y fuelle abajo. */
export function Pouch({ pack, tint }: ContainerProps) {
  const body = "M118 122H282C288 190 290 262 280 328H120C110 262 112 190 118 122Z";
  return (
    <g>
      <path d={body} fill={pack.body} />
      <rect x="116" y="100" width="168" height="24" fill={tone(pack.body, -0.12)} />
      <g stroke="#000" strokeOpacity=".2">{Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${120 + i * 8.2} 104v16`} />)}</g>
      <path d="M116 112h6M278 112h6" stroke="#000" strokeOpacity=".5" strokeWidth="2" />
      <path d="M120 136H280" stroke="#000" strokeOpacity=".28" strokeWidth="2" />
      <path d="M120 139H280" stroke="#fff" strokeOpacity=".14" strokeWidth="1.2" />
      <Label x={126} y={160} w={148} h={140} pack={pack} tint={tint} shade={false} />
      <Shade d={body} opacity={0.8} />
      <path d="M126 312q74 14 148 0" fill="none" stroke="#000" strokeOpacity=".3" strokeWidth="2" />
      <Rim x={283} y1={140} y2={318} />
    </g>
  );
}

/** Tres sticks en abanico (electrolitos, pre en sobres). */
export function Sachet({ pack, tint }: ContainerProps) {
  const stick = (r: number, dx: number, k: number) => (
    <g transform={`translate(${dx} 0) rotate(${r} 200 330)`} key={r}>
      <rect x="172" y="132" width="56" height="196" rx="4" fill={k === 1 ? pack.body : tone(pack.body, -0.15 * k)} />
      <path d="M172 140l7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="2" />
      <rect x="172" y="282" width="56" height="20" fill={tint} />
      <text transform="translate(206 268) rotate(-90)" fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.line, 120, 20)}>{pack.line}</text>
      <text transform="translate(220 268) rotate(-90)" fill={pack.ink} opacity=".75" style={{ fontFamily: MONO_SVG, fontWeight: 700 }} fontSize="7">{pack.mark}</text>
      <rect x="172" y="132" width="56" height="196" rx="4" fill="url(#sp-cyl)" opacity=".7" />
    </g>
  );
  return <g>{[stick(-16, -18, 2), stick(14, 18, 2), stick(0, 0, 1)]}</g>;
}

/** Dos geles con lengüeta para cortar. */
export function Gel({ pack, tint }: ContainerProps) {
  const gel = (x: number, r: number, k: number) => (
    <g transform={`rotate(${r} ${x + 50} 330)`} key={x}>
      <path d={`M${x} 160h100l-4 168h-92z`} fill={k ? tone(pack.body, -0.35) : pack.body} />
      <path d={`M${x + 18} 160l6-34h52l6 34z`} fill={tone(pack.body, -0.3)} />
      <path d={`M${x + 30} 140h40`} stroke="#000" strokeOpacity=".35" strokeDasharray="3 3" strokeWidth="1.5" />
      <Label x={x + 6} y={186} w={88} h={118} pack={pack} tint={tint} shade={false} />
      <path d={`M${x} 160h100l-4 168h-92z`} fill="url(#sp-cyl)" opacity=".7" />
    </g>
  );
  return <g>{gel(168, 12, 1)}{gel(104, -7, 0)}</g>;
}

/** Barra proteica con envoltorio de bordes dentados, apoyada en diagonal, y otra detrás. */
export function Bar({ pack, tint }: ContainerProps) {
  const right = Array.from({ length: 8 }, (_, i) => `L${i % 2 ? 326 : 320} ${238 + (i + 1) * 7.75}`).join("");
  const left = Array.from({ length: 8 }, (_, i) => `L${i % 2 ? 74 : 80} ${300 - (i + 1) * 7.75}`).join("");
  const wrap = (dy: number, r: number, k: number) => (
    <g transform={`rotate(${r} 200 ${270 + dy}) translate(0 ${dy})`} key={r}>
      <path d={`M80 238H320${right}H80${left}Z`} fill={k ? tone(pack.body, -0.25) : pack.body} />
      <Label x={112} y={240} w={176} h={58} pack={{ ...pack, sub: undefined }} tint={tint} shade={false} />
      <path d="M80 238H320V300H80Z" fill="url(#sp-v)" />
    </g>
  );
  return <g>{wrap(-46, 8, 1)}{wrap(0, -9, 0)}</g>;
}

/** Caja abierta (barras o alfajores x 6/12) con una barra asomando. */
export function Box({ pack, tint }: ContainerProps) {
  return (
    <g>
      <path d="M150 178l112-12-6 30-112 12z" fill={tone(pack.body, -0.3)} />
      <rect x="168" y="150" width="70" height="44" rx="4" fill={tint} transform="rotate(-8 203 172)" />
      <rect x="168" y="150" width="70" height="12" fill="#fff" opacity=".2" transform="rotate(-8 203 172)" />
      <path d="M112 200H272V328H112Z" fill={pack.body} />
      <path d="M272 200L298 184V306L272 328Z" fill={tone(pack.body, -0.35)} />
      <path d="M112 200L138 184H298L272 200Z" fill={tone(pack.body, 0.12)} />
      <Label x={112} y={214} w={160} h={100} pack={pack} tint={tint} shade={false} />
      <path d="M112 200H272V328H112Z" fill="url(#sp-v)" opacity=".7" />
      <Rim x={297} y1={190} y2={302} />
      <Shade d="M112 200H272V328H112Z" opacity={0.25} />
    </g>
  );
}
