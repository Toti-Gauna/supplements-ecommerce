import type { ReactNode } from "react";
import { tone } from "../supplements/defs";
import { brand } from "@/config/brand";

/**
 * Envases de la tienda para los key visuals, sin `<text>`: el rótulo lleva el dibujo de la marca, barras donde iría
 * la letra y la franja del sabor. Mismo lienzo que la librería (400 × 400, piso en y = 330) para apoyarlos igual.
 */
export interface PackColors { body: string; lid: string; band: string; ink: string; accent: string; pattern: "bolt" | "stripes" | "wave" | "grid" }

/** Marca propia (sale de `brand`) y las marcas de muestra con las que se dibuja el catálogo. */
export const PACK: Record<"house" | "krono" | "forja" | "pulso" | "doce", PackColors> = {
  house: { body: brand.colors.surface, lid: tone(brand.colors.surface, -0.3), band: brand.colors.surface, ink: brand.signature.onNight, accent: brand.signature.volt, pattern: "bolt" },
  krono: { body: "#f1f2ee", lid: "#c9ccd2", band: "#ffffff", ink: "#111318", accent: "#ff4d2e", pattern: "stripes" },
  forja: { body: "#24130d", lid: "#120905", band: "#24130d", ink: "#fff1e6", accent: "#ff7a1a", pattern: "stripes" },
  pulso: { body: "#22262b", lid: "#121417", band: "#22262b", ink: "#f2fbfa", accent: "#22d3c5", pattern: "grid" },
  doce: { body: "#1d0e10", lid: "#3a1418", band: "#f3e9d8", ink: "#1d0e10", accent: "#d9a441", pattern: "wave" },
};

export interface PackProps { u: string; p: PackColors; tint: string }

const Shade = ({ u, d, o = 0.85 }: { u: string; d: string; o?: number }) => <path d={d} fill={`url(#${u}-cyl)`} opacity={o} />;

function Glyph({ x, y, w, h, p }: { x: number; y: number; w: number; h: number; p: PackColors }) {
  const a = p.accent;
  switch (p.pattern) {
    case "bolt": return <path d={`M${x + w * 0.8} ${y}h${w * 0.18}l-${w * 0.1} ${h * 0.42}h${w * 0.09}L${x + w * 0.68} ${y + h}l${w * 0.07}-${h * 0.46}h-${w * 0.09}z`} fill={a} opacity=".92" />;
    case "stripes": return <g fill={a}>{[0, 1, 2].map((i) => <path key={i} d={`M${x + w * 0.7 + i * w * 0.08} ${y + h}l${w * 0.16} -${h}h${w * 0.045}l-${w * 0.16} ${h}z`} opacity={1 - i * 0.25} />)}</g>;
    case "wave": return <path d={`M${x} ${y + h * 0.62}h${w * 0.22}l${w * 0.05}-${h * 0.22}l${w * 0.07} ${h * 0.4}l${w * 0.06}-${h * 0.3}l${w * 0.04} ${h * 0.12}H${x + w}`} fill="none" stroke={a} strokeWidth={Math.max(1.6, h * 0.025)} strokeLinejoin="round" />;
    case "grid": return <g fill={a} opacity=".75">{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={x + w * 0.72 + (i % 4) * w * 0.065} cy={y + h * 0.2 + Math.floor(i / 4) * h * 0.16} r={Math.max(1, w * 0.012)} />)}</g>;
  }
}

/** Rótulo: fondo de la marca, dibujo, barras donde va la marca y la línea, franja del sabor y volumen. */
function Tag({ u, x, y, w, h, p, tint, shade = true }: PackProps & { x: number; y: number; w: number; h: number; shade?: boolean }) {
  const pad = w * 0.08, stripe = h * 0.13;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={p.band} />
      <svg x={x} y={y} width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`} overflow="hidden"><Glyph x={x} y={y} w={w} h={h - stripe} p={p} /></svg>
      <rect x={x + pad} y={y + h * 0.14} width={w * 0.3} height={h * 0.05} rx={h * 0.02} fill={p.ink} opacity=".7" />
      <rect x={x + pad} y={y + h * 0.27} width={w * 0.52} height={h * 0.2} rx={h * 0.03} fill={p.ink} />
      <rect x={x + pad} y={y + h * 0.56} width={w * 0.4} height={h * 0.05} rx={h * 0.02} fill={p.ink} opacity=".55" />
      <rect x={x} y={y + h - stripe} width={w} height={stripe} fill={tint} />
      <rect x={x} y={y + h - stripe} width={w} height={stripe * 0.3} fill="#fff" opacity=".22" />
      {shade && <Shade u={u} d={`M${x} ${y}h${w}v${h}h-${w}z`} o={0.75} />}
    </g>
  );
}

/** Tapa a rosca con estrías. */
function Lid({ u, x, y, w, h, color }: { u: string; x: number; y: number; w: number; h: number; color: string }) {
  const n = Math.floor(w / 7);
  const d = `M${x} ${y + 5}q0-5 5-5h${w - 10}q5 0 5 5v${h - 5}h-${w}z`;
  return (
    <g>
      <path d={d} fill={color} />
      <path d={Array.from({ length: n - 1 }, (_, i) => `M${(x + (i + 1) * (w / n)).toFixed(1)} ${y + 6}v${h - 9}`).join("")} stroke="#000" strokeOpacity=".22" strokeWidth="1.4" />
      <path d={`M${x + 4} ${y + 2.5}h${w - 8}`} stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <Shade u={u} d={d} o={1} />
      <rect x={x} y={y + h - 3} width={w} height="3" fill="#000" opacity=".35" />
    </g>
  );
}

const Rim = ({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) => (
  <g stroke={color} strokeLinecap="round"><path d={`M${x} ${y1}V${y2}`} strokeWidth="7" opacity=".16" /><path d={`M${x} ${y1}V${y2}`} strokeWidth="2.2" opacity=".9" /></g>
);

function Body({ u, d, p, children, rim, top }: PackProps & { d: string; children: ReactNode; rim: [number, number, number]; top?: number }) {
  return (
    <g>
      <path d={d} fill={p.body} />
      {top !== undefined && <rect x={rim[0] - 200} y={top} width="200" height="10" fill="#000" opacity=".25" />}
      {children}
      <Shade u={u} d={d} />
      <Rim x={rim[0]} y1={rim[1]} y2={rim[2]} color={p.accent} />
    </g>
  );
}

/** Pote ancho (whey de 2 lb). */
export function Tub(q: PackProps) {
  return <g><Body {...q} d="M112 154H288V312Q288 328 272 328H128Q112 328 112 312Z" rim={[287, 168, 320]} top={154}><Tag {...q} x={112} y={180} w={176} h={128} /></Body><Lid u={q.u} x={106} y={116} w={188} h={40} color={q.p.lid} /></g>;
}

/** Pote alto (5 lb, aislados). */
export function TubTall(q: PackProps) {
  return <g><Body {...q} d="M118 104H282V310Q282 328 264 328H136Q118 328 118 310Z" rim={[281, 118, 320]} top={104}><Tag {...q} x={118} y={138} w={164} h={164} /></Body><Lid u={q.u} x={112} y={66} w={176} h={40} color={q.p.lid} /></g>;
}

/** Frasco chico (creatina, pre-entreno, aminoácidos). */
export function Jar(q: PackProps) {
  return <g><Body {...q} d="M142 198H258V316Q258 328 246 328H154Q142 328 142 316Z" rim={[257, 206, 322]}><Tag {...q} x={142} y={214} w={116} h={98} /></Body><Lid u={q.u} x={137} y={166} w={126} h={34} color={q.p.lid} /></g>;
}

/** Frasco de cápsulas (termogénico, vitaminas). */
export function Caps(q: PackProps) {
  return <g><Body {...q} d="M146 206Q146 186 172 182V172H228V182Q254 186 254 206V316Q254 328 242 328H158Q146 328 146 316Z" rim={[253, 210, 322]}><Tag {...q} x={146} y={214} w={108} h={98} /></Body><Lid u={q.u} x={164} y={134} w={72} h={40} color={q.p.lid} /></g>;
}

/** Botella (L-carnitina líquida). */
export function Bottle(q: PackProps) {
  return <g><Body {...q} d="M160 182Q160 162 182 152V138H218V152Q240 162 240 182V314Q240 328 226 328H174Q160 328 160 314Z" rim={[239, 186, 322]}><Tag {...q} x={160} y={196} w={80} h={112} /></Body><Lid u={q.u} x={176} y={104} w={48} h={36} color={q.p.lid} /></g>;
}

/** Tres sticks en abanico (electrolitos). */
export function Sachet({ u, p, tint }: PackProps) {
  const stick = (r: number, dx: number, k: number) => (
    <g transform={`translate(${dx} 0) rotate(${r} 200 330)`} key={r}>
      <rect x="172" y="132" width="56" height="196" rx="4" fill={k ? tone(p.body, -0.15 * k) : p.body} />
      <path d="M172 140l7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="2" />
      <rect x="172" y="282" width="56" height="20" fill={tint} />
      <rect x="182" y="156" width="10" height="112" rx="3" fill={p.ink} />
      <rect x="204" y="156" width="5" height="70" rx="2" fill={p.ink} opacity=".6" />
      <svg x="172" y="236" width="56" height="40" viewBox="172 236 56 40"><Glyph x={168} y={236} w={56} h={40} p={p} /></svg>
      <Shade u={u} d="M172 132h56v196h-56z" o={0.7} />
    </g>
  );
  return <g>{[stick(-16, -18, 2), stick(14, 18, 2), stick(0, 0, 0)]}</g>;
}

/** Dos geles con lengüeta. */
export function Gel(q: PackProps) {
  const gel = (x: number, r: number, k: number) => (
    <g transform={`rotate(${r} ${x + 50} 330)`} key={x}>
      <path d={`M${x} 160h100l-4 168h-92z`} fill={k ? tone(q.p.body, -0.35) : q.p.body} />
      <path d={`M${x + 18} 160l6-34h52l6 34z`} fill={tone(q.p.body, -0.3)} />
      <path d={`M${x + 30} 140h40`} stroke="#000" strokeOpacity=".35" strokeDasharray="3 3" strokeWidth="1.5" />
      <Tag {...q} x={x + 6} y={186} w={88} h={118} shade={false} />
      <Shade u={q.u} d={`M${x} 160h100l-4 168h-92z`} o={0.7} />
    </g>
  );
  return <g>{gel(168, 12, 1)}{gel(104, -7, 0)}</g>;
}

/** Botella deportiva de 1 L con tapa pico y asa. */
export function BottleSport({ u, p, tint }: PackProps) {
  const body = "M152 160Q152 136 176 130H224Q248 136 248 160V214Q242 240 242 248Q242 256 248 282V314Q248 328 234 328H166Q152 328 152 314V282Q158 256 158 248Q158 240 152 214Z";
  const ink = p.ink;
  return (
    <g>
      <path d={body} fill={tint} />
      <path d={Array.from({ length: 8 }, (_, i) => `M${159 + (i % 2)} ${224 + i * 6}h30`).join("")} stroke={tone(tint, -0.4)} strokeWidth="1.4" opacity=".6" />
      <rect x="210" y="170" width="18" height="100" rx="5" fill={ink} opacity=".9" />
      <path d="M152 286h96" stroke={p.accent} strokeWidth="3" />
      <Shade u={u} d={body} o={0.8} />
      <path d="M166 112h68v22h-68z" fill={p.lid} />
      <path d="M178 104C172 40 228 40 222 104" fill="none" stroke={tone(p.lid, -0.2)} strokeWidth="9" />
      <path d="M172 112Q172 92 200 90Q228 92 228 112Z" fill={p.lid} />
      <path d="M191 96V78q0-6 9-6t9 6v18z" fill={p.accent} />
      <path d="M166 133h68" stroke={p.accent} strokeWidth="2" />
      <Rim x={247} y1={150} y2={316} color={p.accent} />
    </g>
  );
}

/** Shaker translúcido con el batido del sabor. */
export function Shaker({ u, p, tint }: PackProps) {
  const cup = "M144 150H256L246 316Q245 328 233 328H167Q155 328 154 316Z";
  return (
    <g>
      <path d={cup} fill={p.body} opacity=".55" />
      <path d="M149 236H251L246 316Q245 328 233 328H167Q155 328 154 316Z" fill={tint} />
      <path d="M149 236q25-7 51 0t51 0" fill={tone(tint, 0.3)} opacity=".8" />
      <path d={[170, 196, 222, 248, 274, 300].map((y, i) => `M${158 + i * 0.4} ${y}h${i % 2 ? 8 : 14}`).join("")} stroke={p.ink} strokeOpacity=".55" strokeWidth="1.5" />
      <rect x="176" y="190" width="54" height="16" rx="3" fill={p.ink} opacity=".9" />
      <Shade u={u} d={cup} o={0.45} />
      <path d="M138 128h124v24H138z" fill={p.lid} />
      <path d="M150 112q0-8 8-8h84q8 0 8 8v16H150z" fill={p.lid} />
      <rect x="214" y="88" width="26" height="20" rx="5" fill={p.accent} />
      <path d="M160 104q-16-22 4-26h18" fill="none" stroke={tone(p.body, -0.5)} strokeWidth="6" strokeLinecap="round" />
      <Shade u={u} d="M138 128h124v24H138z" o={1} />
      <Rim x={255} y1={156} y2={318} color={p.accent} />
    </g>
  );
}

/** Bloque de magnesio (tiza) con su polvo. */
export function Chalk({ u, p, tint }: PackProps) {
  return (
    <g>
      <path d="M126 236l20-28 118-6 22 30-8 92-140 4z" fill="#eef0ec" />
      <path d="M146 208l118-6 22 30-124 6z" fill="#fff" />
      <path d="M286 232l-8 92-12 2 4-88z" fill="#c9cdc6" />
      <g transform="rotate(-1 204 290)"><rect x="140" y="274" width="128" height="34" fill={p.band} /><rect x="140" y="300" width="128" height="8" fill={tint} /><rect x="150" y="283" width="60" height="12" rx="3" fill={p.ink} /><svg x="140" y="274" width="128" height="26" viewBox="140 274 128 26"><Glyph x={140} y={274} w={128} h={26} p={p} /></svg></g>
      <path d="M126 236l20-28 118-6 22 30-8 92-140 4z" fill={`url(#${u}-v)`} opacity=".6" />
    </g>
  );
}

export type PackKind = "tub" | "tub-tall" | "jar" | "caps" | "bottle" | "sachet" | "gel" | "bottle-sport" | "shaker" | "chalk";
const KINDS: Record<PackKind, (q: PackProps) => ReactNode> = { tub: Tub, "tub-tall": TubTall, jar: Jar, caps: Caps, bottle: Bottle, sachet: Sachet, gel: Gel, "bottle-sport": BottleSport, shaker: Shaker, chalk: Chalk };

/** Un envase apoyado en (x, y) de la escena, a escala `s` (1 = 400 px de lienzo). */
export function Pack({ kind, x, y, s = 0.5, ...q }: PackProps & { kind: PackKind; x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s}) translate(-200 -330)`}>{KINDS[kind](q)}</g>;
}
