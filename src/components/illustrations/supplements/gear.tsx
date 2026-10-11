import { DISPLAY_SVG, MONO_SVG, Rim, Shade, fitSize, tone } from "./defs";
import type { ContainerProps } from "./types";

/** Shaker translúcido con el batido del color del sabor, marcas de medida y tapa con pico. */
export function Shaker({ pack, tint }: ContainerProps) {
  const cup = "M144 150H256L246 316Q245 328 233 328H167Q155 328 154 316Z";
  const liquid = "M149 236H251L246 316Q245 328 233 328H167Q155 328 154 316Z";
  return (
    <g>
      <path d={cup} fill={pack.body} opacity=".55" />
      <path d={liquid} fill={tint} />
      <path d="M149 236q25 -7 51 0t51 0" fill={tone(tint, 0.3)} opacity=".8" />
      <g fill="#fff" opacity=".18">{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={170 + i * 16} cy={262 + (i % 2) * 18} r={2 + (i % 3)} />)}</g>
      <g stroke={pack.ink} strokeOpacity=".55" strokeWidth="1.5">
        {[170, 196, 222, 248, 274, 300].map((y, i) => <path key={y} d={`M${158 + i * 0.4} ${y}h${i % 2 ? 8 : 14}`} />)}
      </g>
      <text x="176" y="206" fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 70, 15)}>{pack.mark}</text>
      <text x="177" y="220" fill={pack.ink} opacity=".7" style={{ fontFamily: MONO_SVG, fontWeight: 700, letterSpacing: "0.1em" }} fontSize="7">{pack.sub ?? "700 ML"}</text>
      <path d={cup} fill="url(#sp-glass)" />
      <Shade d={cup} opacity={0.45} />
      <path d="M138 128h124v24H138z" fill={pack.lid ?? tone(pack.body, -0.4)} />
      <path d="M150 112q0-8 8-8h84q8 0 8 8v16H150z" fill={pack.lid ?? tone(pack.body, -0.4)} />
      <path d="M150 112q0-8 8-8h84q8 0 8 8v16H150z" fill="url(#sp-v)" />
      <rect x="214" y="88" width="26" height="20" rx="5" fill={pack.accent} />
      <path d="M160 104q-16 -22 4 -26h18" fill="none" stroke={tone(pack.body, -0.5)} strokeWidth="6" strokeLinecap="round" />
      <Shade d="M138 128h124v24H138z" />
      <Rim x={255} y1={156} y2={318} />
    </g>
  );
}

/** Bloque de magnesio (tiza) con polvo. */
export function Chalk({ pack, tint }: ContainerProps) {
  return (
    <g>
      <g fill="url(#sp-puff)">
        {[[118, 210, 34], [286, 192, 28], [304, 248, 22], [104, 264, 24], [160, 176, 20], [252, 160, 18]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      <path d="M126 236l20-28 118-6 22 30-8 92-140 4z" fill="#eef0ec" />
      <path d="M146 208l118-6 22 30-124 6z" fill="#fff" />
      <path d="M286 232l-8 92-12 2 4-88z" fill="#c9cdc6" />
      <path d="M160 262l14 22-6 18M232 252l-10 30 16 22" fill="none" stroke="#b5bab2" strokeWidth="2" />
      <rect x="140" y="274" width="128" height="34" fill={pack.band} transform="rotate(-1 204 290)" />
      <rect x="140" y="300" width="128" height="8" fill={tint} transform="rotate(-1 204 290)" />
      <text x="150" y="294" fill={pack.ink} transform="rotate(-1 204 290)" style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.line, 104, 15)}>{pack.line}</text>
      <path d="M126 236l20-28 118-6 22 30-8 92-140 4z" fill="url(#sp-v)" opacity=".6" />
    </g>
  );
}

/** Scoop con el polvo colmado (vista de detalle). Lienzo propio, centrado en (0, 0). */
export function Scoop({ tint, body = "#e9edf2" }: { tint: string; body?: string }) {
  return (
    <g>
      <path d="M40 6h120q10 0 10 10v6q0 8 -10 8H40z" fill={tone(body, -0.1)} />
      <path d="M-58 -6h104v36q0 34 -52 34t-52-34z" fill={body} />
      <path d="M-58 -6h104v36q0 34 -52 34t-52-34z" fill="url(#sp-cyl)" />
      <path d="M-62 -4q8 -38 56 -40q50 2 56 40z" fill={tint} />
      <path d="M-62 -4q8 -38 56 -40q50 2 56 40z" fill="url(#sp-heap)" />
      <g fill={tone(tint, -0.25)}>{[[-30, -18], [-8, -28], [14, -16], [28, -6], [-44, -6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" />)}</g>
      <ellipse cx="-6" cy="-5" rx="58" ry="5" fill="#000" opacity=".15" />
    </g>
  );
}
