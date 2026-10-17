import { DISPLAY_SVG, Rim, fitSize, tone } from "./defs";
import { Contact, inside, printOn, spiral } from "./gear-kit";
import type { ContainerProps } from "./types";

const FIST = "M160 258C144 236 134 196 138 158C142 116 174 92 214 92C256 94 284 124 288 166C292 208 280 244 256 258C242 266 224 266 212 258Z";
const THUMB = "M200 254C186 236 190 210 212 198C234 186 260 196 262 216C264 236 246 250 226 256Z";
const CUFF = "M152 328Q150 292 158 252H232Q240 292 238 328Q195 334 152 328Z";

/** Guante de boxeo de perfil (nudillos a la derecha): cuero brilloso del color elegido, pulgar y puño con abrojo. */
function Glove({ pack, tint, back }: ContainerProps & { back?: boolean }) {
  const leather = back ? tone(tint, -0.2) : tint;
  const seam = tone(leather, -0.4);
  return (
    <g>
      <path d={CUFF} fill={leather} />
      <path d={CUFF} fill="url(#sp-cyl)" opacity=".8" />
      <path d="M154 272H236V308H154Z" fill={pack.band} />
      <path d="M154 272H236V308H154Z" fill="url(#sp-cyl)" opacity=".6" />
      <path d="M154 273.5H236M154 306.5H236" stroke={pack.accent} strokeWidth="1.8" />
      {!back && <text x="195" y="296" textAnchor="middle" fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 68, 15)}>{pack.mark}</text>}
      <path d="M156 320Q195 326 234 320" fill="none" stroke={tone(leather, 0.3)} strokeWidth="2" opacity=".6" />
      <path d={FIST} fill={leather} />
      <path d={FIST} fill="url(#sp-heap)" />
      <path d="M162 240C150 214 146 180 150 156C156 120 182 104 214 104C248 106 270 128 274 160" fill="none" stroke={seam} strokeWidth="1.6" opacity=".75" />
      <path d="M212 258C230 246 268 240 280 214" fill="none" stroke={seam} strokeWidth="1.6" opacity=".6" />
      <path d={THUMB} fill={leather} />
      <path d={THUMB} fill="url(#sp-heap)" opacity=".85" />
      <path d={THUMB} fill="none" stroke={seam} strokeWidth="1.8" />
      <ellipse cx="186" cy="128" rx="32" ry="13" transform="rotate(-28 186 128)" fill="#fff" opacity=".3" />
      <ellipse cx="226" cy="206" rx="12" ry="4.5" transform="rotate(-20 226 206)" fill="#fff" opacity=".3" />
      <path d="M160 254H232" stroke={tone(leather, -0.55)} strokeWidth="4" />
      {!back && <path d="M286 150C292 196 282 240 256 258" fill="none" stroke="url(#sp-rim)" strokeWidth="2.2" />}
    </g>
  );
}

/** Guantes de boxeo: el par, uno atrás espejado (mirando al otro lado) y otro adelante. */
export function Gloves({ pack, tint }: ContainerProps) {
  return (
    <g>
      <Contact cx={204} rx={116} />
      <g transform="translate(356 10) scale(-0.94 0.94)">
        <Glove pack={pack} tint={tint} back />
        <path d={FIST} fill="#000" opacity=".16" />
      </g>
      <g transform="translate(28 0)">
        <Glove pack={pack} tint={tint} />
      </g>
    </g>
  );
}

/** Vendas: un rollo parado con el abrojo y la marca, otro acostado mostrando la espiral y la punta con la presilla del pulgar. */
export function Wraps({ pack, tint }: ContainerProps) {
  const c = [234, 274], r = 54, b = [262, 258];
  const n = [0.5, 0.87];
  const hull = `M${c[0]! + r * n[0]!} ${c[1]! + r * n[1]!}L${b[0]! + r * n[0]!} ${b[1]! + r * n[1]!}A${r} ${r} 0 0 0 ${b[0]! - r * n[0]!} ${b[1]! - r * n[1]!}L${c[0]! - r * n[0]!} ${c[1]! - r * n[1]!}Z`;
  const up = { x: 104, w: 88, top: 190, base: 318, ry: 15 };
  const mid = up.x + up.w / 2;
  const side = `M${up.x} ${up.top}V${up.base}A${up.w / 2} ${up.ry} 0 0 0 ${up.x + up.w} ${up.base}V${up.top}Z`;
  const tab = pack.band === pack.body ? tone(pack.body, 0.06) : pack.band;
  const tail = "M222 326C190 333 150 333 116 327L114 318C150 323 186 323 216 318Z";
  return (
    <g>
      <Contact cx={200} rx={116} />
      {/* Rollo parado (atrás): tela con relieve, abrojo con la marca y la espiral arriba. */}
      <path d={side} fill={tone(tint, -0.08)} />
      <g stroke="#000" strokeOpacity=".09">{Array.from({ length: 19 }, (_, i) => <path key={i} d={`M${up.x} ${up.top + 8 + i * 6.6}h${up.w}`} />)}</g>
      <path d={`M${up.x} 236h${up.w}v40h-${up.w}z`} fill={tab} />
      <g fill={printOn(tab)} opacity=".14">{Array.from({ length: 34 }, (_, i) => <circle key={i} cx={up.x + 4 + (i % 17) * 5.1} cy={240 + Math.floor(i / 17) * 32} r=".9" />)}</g>
      <text x={mid} y="261" textAnchor="middle" fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 70, 14)}>{pack.mark}</text>
      <path d={`M${up.x} 238h${up.w}M${up.x} 274h${up.w}`} stroke={pack.accent} strokeWidth="1.8" />
      <path d={side} fill="url(#sp-cyl)" opacity=".8" />
      <ellipse cx={mid} cy={up.top} rx={up.w / 2} ry={up.ry} fill={tone(tint, 0.12)} />
      <path d={spiral(mid, up.top, up.w / 2 - 2, 6, up.ry / (up.w / 2), 4)} fill="none" stroke={tone(tint, -0.35)} strokeWidth="1.1" />
      <ellipse cx={mid} cy={up.top} rx="5" ry="2" fill={inside(tint)} />
      <Rim x={up.x + up.w} y1={up.top + 6} y2={256} />
      {/* Punta suelta en el piso con la presilla del pulgar. */}
      <path d={tail} fill={tone(tint, -0.05)} />
      <path d={tail} fill="url(#sp-v)" />
      <ellipse cx="96" cy="323" rx="22" ry="6.5" fill="none" stroke={tone(tint, -0.15)} strokeWidth="5" />
      <ellipse cx="96" cy="322" rx="22" ry="6.5" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1.2" />
      {/* Rollo acostado (adelante): costado y cara con la espiral. */}
      <path d={hull} fill={tone(tint, -0.3)} />
      <circle cx={b[0]} cy={b[1]} r={r} fill={tone(tint, -0.3)} />
      <path d={hull} fill="url(#sp-v)" opacity=".7" />
      <circle cx={c[0]} cy={c[1]} r={r} fill={tone(tint, 0.06)} />
      <path d={spiral(c[0]!, c[1]!, r - 2, 7, 1, 6)} fill="none" stroke={tone(tint, -0.32)} strokeWidth="1.3" />
      <circle cx={c[0]} cy={c[1]} r="6" fill={inside(tint)} />
      <circle cx={c[0]} cy={c[1]} r={r} fill="url(#sp-heap)" opacity=".7" />
      <path d={`M${b[0]! + r * n[0]! + 0.5} ${b[1]! + r * n[1]!}A${r} ${r} 0 0 0 ${b[0]! + r} ${b[1]! - 8}`} fill="none" stroke="url(#sp-rim)" strokeWidth="2" />
    </g>
  );
}
