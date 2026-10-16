import { DISPLAY_SVG, MONO_SVG, Rim, Shade, fitSize, tone } from "./defs";
import { Contact, Stitch, printOn } from "./gear-kit";
import type { ContainerProps } from "./types";

/** Botella deportiva de 1 L: cuerpo del color elegido con grip, medidas y la marca; tapa pico con asa. */
export function BottleSport({ pack, tint }: ContainerProps) {
  const body = "M152 160Q152 136 176 130H224Q248 136 248 160V214Q242 240 242 248Q242 256 248 282V314Q248 328 234 328H166Q152 328 152 314V282Q158 256 158 248Q158 240 152 214Z";
  const cap = pack.lid ?? tone(pack.body, -0.2);
  const ink = printOn(tint);
  return (
    <g>
      <Contact cx={200} rx={58} />
      <path d={body} fill={tint} />
      <g stroke={tone(tint, -0.4)} strokeWidth="1.4" opacity=".6">{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${159 + (i % 2)} ${224 + i * 6}h30`} />)}</g>
      <text transform="translate(222 276) rotate(-90)" fill={ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 128, 22)}>{pack.mark}</text>
      <g stroke={ink} strokeOpacity=".55" strokeWidth="1.3">{[156, 172, 188, 204].map((y, i) => <path key={y} d={`M160 ${y}h${i % 2 ? 7 : 12}`} />)}</g>
      <text x="175" y="160" fill={ink} opacity=".6" style={{ fontFamily: MONO_SVG, fontWeight: 700 }} fontSize="7">1 L</text>
      <text x="200" y="306" textAnchor="middle" fill={ink} opacity=".75" style={{ fontFamily: MONO_SVG, fontWeight: 700, letterSpacing: "0.1em" }} fontSize="7.5">{pack.sub ?? "1000 ML"}</text>
      <path d="M152 286h96" stroke={pack.accent} strokeWidth="3" />
      <Shade d={body} opacity={0.8} />
      <path d={body} fill="url(#sp-glass)" opacity=".7" />
      {/* Tapa: rosca, domo, pico y asa. */}
      <path d="M166 112h68v22h-68z" fill={cap} />
      <g stroke="#000" strokeOpacity=".25" strokeWidth="1.2">{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${172 + i * 6.2} 114v18`} />)}</g>
      <Shade d="M166 112h68v22h-68z" />
      <path d="M178 104C172 40 228 40 222 104" fill="none" stroke={tone(cap, -0.2)} strokeWidth="9" />
      <path d="M178 104C172 40 228 40 222 104" fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="2" transform="translate(-2 -1)" />
      <path d="M172 112Q172 92 200 90Q228 92 228 112Z" fill={cap} />
      <path d="M172 112Q172 92 200 90Q228 92 228 112Z" fill="url(#sp-heap)" />
      <path d="M191 96V78q0-6 9-6t9 6v18z" fill={pack.accent} />
      <path d="M191 96V78q0-6 9-6t9 6v18z" fill="url(#sp-cyl)" opacity=".8" />
      <path d="M166 133h68" stroke={pack.accent} strokeWidth="2" />
      <Rim x={247} y1={150} y2={316} />
    </g>
  );
}

/** Bolso de entrenamiento: duffle del color elegido, base y asas de la marca, cierre, bolsillo y marca en el lateral. */
export function GymBag({ pack, tint }: ContainerProps) {
  const body = "M98 328Q78 328 78 306V258Q78 196 140 188H294V328Z";
  const end = "M266 328V258Q266 196 296 188Q326 196 326 258V328Z";
  const trim = pack.lid ?? tone(pack.body, -0.1);
  const ink = printOn(tint);
  return (
    <g>
      <Contact cx={204} rx={130} />
      {/* Asa de atrás. */}
      <path d="M138 194C140 118 262 114 264 192" fill="none" stroke={tone(trim, -0.35)} strokeWidth="10" />
      <path d={body} fill={tint} />
      <path d={body} fill="url(#sp-v)" />
      <path d="M100 194Q160 180 290 184" fill="none" stroke={tone(tint, 0.25)} strokeWidth="6" opacity=".5" />
      <path d="M104 198Q170 186 290 190" fill="none" stroke="#1d2026" strokeWidth="3.4" />
      <path d="M104 198Q170 186 290 190" fill="none" stroke="#9aa0a8" strokeWidth="2" strokeDasharray="1.2 1.6" />
      <path d="M78 300H294V328H98Q78 328 78 306Z" fill={trim} />
      <path d="M80 300H294" stroke={pack.accent} strokeWidth="2" />
      <text x="185" y="244" textAnchor="middle" fill={ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, 100, 22)}>{pack.mark}</text>
      <rect x="140" y="256" width="90" height="38" rx="5" fill={tone(tint, -0.12)} />
      <path d="M146 263h78" stroke="#1d2026" strokeWidth="2.6" />
      <path d="M218 261v14" stroke="#c9ced6" strokeWidth="3" strokeLinecap="round" />
      <Stitch d="M143 291h84" color={tone(tint, -0.45)} w={1} />
      {/* Asas del frente cosidas hasta la base. */}
      {[120, 250].map((x) => <g key={x}><rect x={x - 7} y="194" width="14" height="108" fill={trim} /><Stitch d={`M${x - 4} 200V298M${x + 4} 200V298`} color={pack.accent} w={1} o={0.6} /></g>)}
      <path d="M120 198C120 114 250 112 250 196" fill="none" stroke={trim} strokeWidth="11" />
      <path d="M120 198C120 114 250 112 250 196" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="2" transform="translate(-2 -2)" />
      <rect x="164" y="124" width="42" height="18" rx="5" fill={pack.band} />
      <rect x="164" y="124" width="42" height="18" rx="5" fill="url(#sp-v)" />
      <Stitch d="M167 127.5h36M167 138.5h36" color={pack.accent} w={1} />
      <path d={body} fill="url(#sp-cyl)" opacity=".45" />
      <path d={end} fill={tone(tint, -0.08)} />
      <path d={end} fill="url(#sp-cyl)" opacity=".7" />
      <path d={end} fill="none" stroke={trim} strokeWidth="3" />
      <path d="M266 300H326V328H266Z" fill={trim} />
      <circle cx="296" cy="252" r="16" fill={pack.band} stroke={pack.accent} strokeWidth="1.4" />
      <text x="296" y="255" textAnchor="middle" fill={pack.ink} style={{ fontFamily: DISPLAY_SVG, fontWeight: 850 }} fontSize={fitSize(pack.mark, 24, 8, 0.75)}>{pack.mark}</text>
      <Rim x={325} y1={240} y2={320} />
    </g>
  );
}
