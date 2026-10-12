import { LOGO_BOLT, LOGO_STROKE_PATH } from "@/components/atoms/Logo";
import { DISPLAY_SVG, MONO_SVG } from "@/components/illustrations/supplements/defs";
import type { BagDecor, BagColors } from "./bag-colors";

/** Detalles de VOLTA (sin fecha) y de las fechas de ofertas y de gimnasio. */

const mono = (weight = 700, spacing = "0.22em") => ({ fontFamily: MONO_SVG, fontWeight: weight, letterSpacing: spacing });
const display = { fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" };

/** El símbolo del logo de la marca, centrado en (x, y). */
function Mark({ x, y, s, ink, bolt }: { x: number; y: number; s: number; ink: string; bolt: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-32 -34)`}>
      {LOGO_STROKE_PATH && <path d={LOGO_STROKE_PATH} fill={ink} />}<path d={LOGO_BOLT} fill={bolt} />
    </g>
  );
}

/** Etiqueta que cuelga de la cadena derecha. */
function Tag({ c, lines, strike }: { c: BagColors; lines: [string, string]; strike?: boolean }) {
  return (
    <g>
      <path d="M190 86Q204 92 210 106" stroke="#d9dde3" strokeWidth="1.1" fill="none" />
      <g transform="translate(214 128) rotate(14)">
        <path d="M-15-14L-6-23H15V22H-15Z" fill={c.accent} /><circle cx="-7" cy="-15" r="2.4" fill={c.inside} />
        <text x="0" y="0" textAnchor="middle" fill={c.inside} style={mono(800, "0.08em")} fontSize="6.4">{lines[0]}</text>
        {strike && <path d="M-11-2.4H11" stroke={c.inside} strokeWidth="1.2" />}
        <text x="0" y="11" textAnchor="middle" fill={c.inside} style={mono(800, "0.04em")} fontSize="6">{lines[1]}</text>
      </g>
    </g>
  );
}

/** La marca, sin fecha: el símbolo del logo y el pulso. */
export const BRAND_BAG: BagDecor = {
  Body: ({ c }) => (
    <g>
      <Mark x={150} y={152} s={0.78} ink={c.ink} bolt={c.accent} />
      <path d="M126 196h11l4-8 5 15 4-11 3 5h21" stroke={c.accent} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <text x="150" y="214" textAnchor="middle" fill={c.ink} opacity=".7" style={mono()} fontSize="5.6">HEAVY BAG</text>
    </g>
  ),
};

/** Halloween: calabaza musculosa pintada, sacando bíceps. */
export const HALLOWEEN: BagDecor = {
  Body: () => (
    <g stroke="#1a1124" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M137 178H120Q112 178 113 170L115 154M163 178H180Q188 178 187 170L185 154" stroke="#f07a12" strokeWidth="8" strokeLinecap="round" fill="none" />
      <ellipse cx="123" cy="173" rx="7" ry="5" fill="#ff8a1f" /><ellipse cx="177" cy="173" rx="7" ry="5" fill="#ff8a1f" />
      <circle cx="115" cy="150" r="5.5" fill="#ff8a1f" /><circle cx="185" cy="150" r="5.5" fill="#ff8a1f" />
      <ellipse cx="139" cy="174" rx="11" ry="15" fill="#e06d0c" /><ellipse cx="161" cy="174" rx="11" ry="15" fill="#e06d0c" />
      <ellipse cx="150" cy="174" rx="13" ry="16.5" fill="#ff8a1f" />
      <path d="M147 158l1-7h5l-1 7Z" fill="#5c8a2a" />
      <path d="M140 167l6 4h-7ZM160 167l-6 4h7ZM140 180l4 4 3-3 3 3 3-3 3 3 4-4-3 6h-14Z" fill="#1a0f08" stroke="none" />
      <path d="M138 164l8 3M162 164l-8 3" stroke="#1a0f08" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
};

/** Black Friday: "BLACK" en esténcil y la etiqueta de precio... que no dice el precio. */
export const BLACK_FRIDAY: BagDecor = {
  Body: ({ c }) => (
    <g>
      <text x="150" y="152" textAnchor="middle" fill={c.accent} style={display} fontSize="10">BLACK</text>
      <text x="150" y="164" textAnchor="middle" fill={c.ink} opacity=".8" style={mono(700, "0.42em")} fontSize="6.2">FRIDAY</text>
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${123 + i * 8} 214l6-12h4l-6 12Z`} fill={c.accent} opacity=".85" />)}
    </g>
  ),
  Top: ({ c }) => <Tag c={c} lines={["PRECIO", "SECRETO"]} strike />,
};

/** CyberMonday: circuito, la marca con glitch y la etiqueta de 72 h. */
export const CYBER_MONDAY: BagDecor = {
  Body: ({ c }) => (
    <g>
      <path d="M124 124H138V136H146M176 120H164V140M124 204H136V192H150M176 210H160V196" stroke="#2ee6d6" strokeWidth="1.3" fill="none" />
      {[[146, 136], [164, 140], [150, 192], [160, 196], [124, 124], [176, 120]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#2ee6d6" />)}
      <g opacity=".85"><Mark x={147.5} y={164} s={0.6} ink="#ff3df2" bolt="#ff3df2" /></g>
      <g opacity=".85"><Mark x={152.5} y={164} s={0.6} ink="#2ee6d6" bolt="#2ee6d6" /></g>
      <Mark x={150} y={164} s={0.6} ink={c.ink} bolt={c.accent} />
      <rect x="128" y="154" width="30" height="3" fill={c.accent} opacity=".7" /><rect x="146" y="171" width="26" height="2.4" fill="#ff3df2" opacity=".7" />
      <text x="150" y="220" textAnchor="middle" fill={c.ink} opacity=".75" style={mono()} fontSize="5.6">MONDAY</text>
    </g>
  ),
  Top: ({ c }) => <Tag c={c} lines={["72 H", "CYBER"]} />,
};

/** Hot Sale: llamas pintadas que suben desde la base. */
export const HOT_SALE: BagDecor = {
  Body: ({ c, uid }) => (
    <g>
      <defs>
        <linearGradient id={`${uid}-flame`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#c2181f" /><stop offset=".55" stopColor="#ff6a1a" /><stop offset="1" stopColor="#ffd34d" /></linearGradient>
      </defs>
      <path d="M104 230C98 212 108 200 114 192C114 202 120 204 122 200C120 186 128 176 136 168C134 184 144 190 148 200C150 192 150 186 148 180C160 192 164 210 158 230ZM142 230C138 214 148 204 154 196C154 206 160 206 162 202C162 190 170 182 178 176C176 192 186 198 190 208C192 202 192 196 190 190C200 202 202 218 196 230Z" fill={`url(#${uid}-flame)`} />
      <path d="M116 230C114 220 120 212 124 208C126 216 132 216 134 212C138 220 136 226 134 230ZM156 230C154 222 160 216 164 212C166 218 170 218 172 214C176 222 174 228 172 230Z" fill="#ffd34d" opacity=".9" />
      <text x="150" y="146" textAnchor="middle" fill={c.accent} style={display} fontSize="16">HOT</text>
      <text x="150" y="158" textAnchor="middle" fill={c.ink} opacity=".8" style={mono(700, "0.4em")} fontSize="6.2">SALE</text>
    </g>
  ),
};

/** Vuelta al gym: cinta de embalar con "Día 1" escrito a mano y la toalla colgada arriba. */
export const VUELTA_AL_GYM: BagDecor = {
  Body: ({ c }) => (
    <g>
      <g transform="rotate(-10 150 164)">
        <path d="M118 153l3 2-2 2 2 2-3 2 2 2-2 2 2 2-2 2H182l-2-2 3-2-2-2 2-2-3-2 2-2-2-2 3-2Z" fill="#c9ccd1" />
        <path d="M122 157H178M122 169H178" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" />
        <text x="150" y="169" textAnchor="middle" fill="#16181d" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }} fontSize="16">Día 1</text>
      </g>
      <text x="150" y="200" textAnchor="middle" fill={c.ink} opacity=".75" style={mono()} fontSize="5.6">LUNES</text>
    </g>
  ),
  Top: ({ c }) => (
    <g>
      <path d="M130 79C120 75 105 77 99 84C94 89 91 97 91 107V150H110V100C110 92 117 87 130 87Z" fill="#eef1f5" />
      <path d="M130 79C120 75 105 77 99 84" stroke="#fff" strokeWidth="1.4" fill="none" />
      <path d="M104 86C99 92 97 99 97 108V150" stroke="#000" strokeOpacity=".14" strokeWidth="3" fill="none" />
      <path d="M91 134H110M91 140H110" stroke={c.accent} strokeWidth="3" />
      <path d="M91 150l2.4 4 2.4-4 2.4 4 2.4-4 2.4 4 2.4-4 2.4 4 2.4-4" stroke="#eef1f5" strokeWidth="1.3" fill="none" />
    </g>
  ),
};

/** Operación verano: sol pintado, olas y anteojos de sol apoyados arriba. */
export const OPERACION_VERANO: BagDecor = {
  Body: ({ c }) => (
    <g>
      <g stroke="#ffd34d" strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0-17V-22" transform={`translate(150 150) rotate(${i * 30})`} />)}
      </g>
      <circle cx="150" cy="150" r="13" fill="#ffd34d" />
      <path d="M126 184q6-5 12 0t12 0 12 0 12 0M126 194q6-5 12 0t12 0 12 0 12 0" stroke="#2ee6d6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x="150" y="214" textAnchor="middle" fill={c.ink} opacity=".8" style={mono()} fontSize="5.8">OP. VERANO</text>
    </g>
  ),
  Top: ({ c }) => (
    <g transform="translate(0 -4)">
      <path d="M121 84L108 80M179 84L192 80" stroke={c.accent} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M121 79H148Q148 95 134 95Q121 95 121 79ZM152 79H179Q179 95 166 95Q152 95 152 79Z" fill="#101318" stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
      <path d="M147 81Q150 77 153 81" stroke={c.accent} strokeWidth="2" fill="none" />
      <path d="M127 83l7 8M158 83l7 8" stroke="#2ee6d6" strokeOpacity=".75" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
};
