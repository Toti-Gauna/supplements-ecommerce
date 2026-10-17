import { tone } from "../supplements/defs";

/** Equipamiento de las escenas (acero, discos, banco, pesa rusa, guantes, medalla). Coordenadas de la escena. */

/** Barra olímpica de frente (horizontal) con los discos de canto; `plates` por lado: [ancho, alto, color]. */
export function Barbell({ u, x, y, w = 560, plates = [[22, 180, "#1f4fb8"], [16, 150, "#e3b22a"]], steel = "#9aa3ad" }: { u: string; x: number; y: number; w?: number; plates?: [number, number, string][]; steel?: string }) {
  const inner = w * 0.3;
  const side = (dir: 1 | -1) => {
    let off = inner + 10;
    return plates.map(([pw, ph, c], i) => {
      const px = x + dir * off - (dir === 1 ? 0 : pw);
      off += pw + 3;
      return (
        <g key={i}>
          <rect x={px} y={y - ph / 2} width={pw} height={ph} rx={pw * 0.25} fill={c} />
          <rect x={px} y={y - ph / 2} width={pw} height={ph} rx={pw * 0.25} fill={`url(#${u}-v)`} opacity=".7" />
          <rect x={px + pw * 0.3} y={y - ph / 2 + 6} width={pw * 0.22} height={ph - 12} rx="2" fill="#fff" opacity=".18" />
        </g>
      );
    });
  };
  return (
    <g>
      <rect x={x - w / 2} y={y - 6} width={w} height="12" rx="3" fill={tone(steel, -0.45)} />
      <rect x={x - w / 2} y={y - 6} width={w} height="12" rx="3" fill={`url(#${u}-v)`} />
      <rect x={x - inner} y={y - 7} width={inner * 2} height="14" rx="2" fill={steel} />
      <rect x={x - inner} y={y - 7} width={inner * 2} height="14" rx="2" fill={`url(#${u}-v)`} />
      <path d={Array.from({ length: Math.floor(inner / 9) }, (_, i) => `M${x - inner + 12 + i * 9} ${y - 6}v12`).join("")} stroke="#000" strokeOpacity=".3" strokeWidth="1" />
      <rect x={x - inner - 8} y={y - 10} width="12" height="20" rx="2" fill={tone(steel, -0.25)} />
      <rect x={x + inner - 4} y={y - 10} width="12" height="20" rx="2" fill={tone(steel, -0.25)} />
      {side(1)}{side(-1)}
      <rect x={x - w / 2} y={y - 5} width={w} height="2" fill="#fff" opacity=".35" />
    </g>
  );
}

/** Disco visto de costado (de frente al que mira), color reglamentario con el aro de acero. */
export function Plate({ u, cx, cy, r, color = "#1f4fb8", o = 1 }: { u: string; cx: number; cy: number; r: number; color?: string; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${u}-cyl)`} opacity=".55" />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="#000" strokeOpacity=".25" strokeWidth={r * 0.03} />
      <circle cx={cx} cy={cy} r={r * 0.26} fill="#c9ced6" />
      <circle cx={cx} cy={cy} r={r * 0.14} fill="#0b0e13" />
      <path d={`M${cx - r * 0.86} ${cy}A${r * 0.86} ${r * 0.86} 0 0 1 ${cx} ${cy - r * 0.86}`} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth={r * 0.04} />
    </g>
  );
}

/** Banco plano de acero con tapizado negro, de costado. */
export function Bench({ u, x, y, w = 300 }: { u: string; x: number; y: number; w?: number }) {
  return (
    <g>
      <path d={`M${x + 30} ${y + 24}v${64}M${x + w - 30} ${y + 24}v${64}M${x + 10} ${y + 90}h${w - 20}`} stroke="#2e343b" strokeWidth="10" strokeLinecap="round" />
      <path d={`M${x + 30} ${y + 24}v${64}M${x + w - 30} ${y + 24}v${64}`} stroke={`url(#${u}-v)`} strokeWidth="10" />
      <rect x={x} y={y} width={w} height="26" rx="6" fill="#111317" />
      <rect x={x} y={y} width={w} height="26" rx="6" fill={`url(#${u}-v)`} opacity=".9" />
      <rect x={x + 6} y={y + 3} width={w - 12} height="3" rx="1.5" fill="#fff" opacity=".2" />
    </g>
  );
}

/** Pesa rusa de hierro negro, con el asa; `r` es el radio de la bola. */
export function Kettlebell({ u, cx, cy, r = 46, color = "#15171b", band }: { u: string; cx: number; cy: number; r?: number; color?: string; band?: string }) {
  return (
    <g>
      <path d={`M${cx - r * 0.55} ${cy - r * 0.6}C${cx - r * 0.75} ${cy - r * 1.75} ${cx + r * 0.75} ${cy - r * 1.75} ${cx + r * 0.55} ${cy - r * 0.6}`} fill="none" stroke={color} strokeWidth={r * 0.3} strokeLinecap="round" />
      <path d={`M${cx - r * 0.55} ${cy - r * 0.6}C${cx - r * 0.75} ${cy - r * 1.75} ${cx + r * 0.75} ${cy - r * 1.75} ${cx + r * 0.55} ${cy - r * 0.6}`} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth={r * 0.06} transform="translate(-2 -2)" />
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${u}-cyl)`} opacity=".8" />
      {band && <path d={`M${cx - r * 0.98} ${cy - r * 0.1}A${r} ${r} 0 0 0 ${cx + r * 0.98} ${cy - r * 0.1}A${r * 0.96} ${r * 0.96} 0 0 1 ${cx - r * 0.98} ${cy - r * 0.1}Z`} fill={band} opacity=".9" />}
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.42} rx={r * 0.28} ry={r * 0.14} transform={`rotate(-30 ${cx - r * 0.3} ${cy - r * 0.42})`} fill="#fff" opacity=".22" />
    </g>
  );
}

/** Guante de boxeo en la mano de una silueta (coordenadas locales de `Figure`, en currentColor). */
export function GloveHand({ x, y, r = 9, color }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g fill={color ?? "currentColor"} stroke={color ?? "currentColor"}>
      <circle cx={x} cy={y} r={r} stroke="none" />
      <path d={`M${x - r * 0.9} ${y + r * 0.5}h${-r * 0.6}`} strokeWidth={r * 1.3} />
      <circle cx={x + r * 0.35} cy={y - r * 0.45} r={r * 0.3} fill="#fff" opacity=".18" stroke="none" />
    </g>
  );
}

const FIST = "M160 258C144 236 134 196 138 158C142 116 174 92 214 92C256 94 284 124 288 166C292 208 280 244 256 258C242 266 224 266 212 258Z";
const THUMB = "M200 254C186 236 190 210 212 198C234 186 260 196 262 216C264 236 246 250 226 256Z";
const CUFF = "M152 328Q150 292 158 252H232Q240 292 238 328Q195 334 152 328Z";

/** Guante de boxeo de producto (lienzo 400 × 400, piso en 330): cuero, pulgar y puño con la banda de la marca. */
export function Glove({ u, leather, band, accent, back }: { u: string; leather: string; band: string; accent: string; back?: boolean }) {
  const skin = back ? tone(leather, -0.2) : leather;
  return (
    <g>
      <path d={CUFF} fill={skin} /><path d={CUFF} fill={`url(#${u}-cyl)`} opacity=".8" />
      <path d="M154 272H236V308H154Z" fill={band} /><path d="M154 273.5H236M154 306.5H236" stroke={accent} strokeWidth="1.8" />
      <rect x="170" y="284" width="50" height="12" rx="3" fill={tone(band, -0.8)} opacity={back ? 0 : 0.85} />
      <path d={FIST} fill={skin} /><path d={FIST} fill={`url(#${u}-v)`} opacity=".8" />
      <path d="M162 240C150 214 146 180 150 156C156 120 182 104 214 104C248 106 270 128 274 160" fill="none" stroke={tone(skin, -0.4)} strokeWidth="1.6" opacity=".75" />
      <path d={THUMB} fill={skin} /><path d={THUMB} fill={`url(#${u}-v)`} opacity=".7" /><path d={THUMB} fill="none" stroke={tone(skin, -0.4)} strokeWidth="1.8" />
      <ellipse cx="186" cy="128" rx="32" ry="13" transform="rotate(-28 186 128)" fill="#fff" opacity=".3" />
      <path d="M160 254H232" stroke={tone(skin, -0.55)} strokeWidth="4" />
      {!back && <path d="M286 150C292 196 282 240 256 258" fill="none" stroke={accent} strokeWidth="2.4" opacity=".9" />}
    </g>
  );
}

/** Medalla colgada de su cinta: cinta en V del color de la campaña y el disco de oro con el aro. */
export function Medal({ u, x, y, r = 30, ribbon = "#b8234a", gold = "#ffcf5c", len = 120 }: { u: string; x: number; y: number; r?: number; ribbon?: string; gold?: string; len?: number }) {
  return (
    <g>
      <path d={`M${x - 18} ${y - len}L${x} ${y - r}L${x + 18} ${y - len}`} fill="none" stroke={ribbon} strokeWidth="14" strokeLinejoin="round" />
      <path d={`M${x - 18} ${y - len}L${x} ${y - r}L${x + 18} ${y - len}`} fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3" />
      <circle cx={x} cy={y} r={r} fill={tone(gold, -0.35)} />
      <circle cx={x} cy={y} r={r * 0.86} fill={gold} />
      <circle cx={x} cy={y} r={r * 0.86} fill={`url(#${u}-cyl)`} opacity=".5" />
      <circle cx={x} cy={y} r={r * 0.56} fill="none" stroke={tone(gold, -0.4)} strokeWidth={r * 0.08} />
      <path d={`M${x} ${y - r * 0.4}l${r * 0.12} ${r * 0.26}h${r * 0.28}l-${r * 0.22} ${r * 0.18}l${r * 0.09} ${r * 0.28}l-${r * 0.27}-${r * 0.17}l-${r * 0.27} ${r * 0.17}l${r * 0.09}-${r * 0.28}l-${r * 0.22}-${r * 0.18}h${r * 0.28}z`} fill={tone(gold, -0.4)} />
    </g>
  );
}

/** Toalla blanca colgada (sobre una cuerda o un hombro): paño con pliegues. */
export function Towel({ x, y, w = 70, h = 150, color = "#eceae2" }: { x: number; y: number; w?: number; h?: number; color?: string }) {
  return (
    <g>
      <path d={`M${x} ${y}h${w}q${w * 0.1} ${h * 0.5} -${w * 0.05} ${h}h-${w * 0.9}q-${w * 0.14} -${h * 0.5} -${w * 0.05} -${h}z`} fill={color} />
      <path d={`M${x + w * 0.3} ${y + 10}q-${w * 0.08} ${h * 0.5} ${w * 0.02} ${h - 16}M${x + w * 0.66} ${y + 10}q${w * 0.1} ${h * 0.45} ${w * 0.04} ${h - 16}`} fill="none" stroke="#000" strokeOpacity=".16" strokeWidth="4" />
      <rect x={x + 2} y={y + h * 0.78} width={w - 6} height="8" fill={tone(color, -0.55)} opacity=".5" />
    </g>
  );
}
