import { tone, type ArtIds } from "./stage";

/**
 * Utilería de los key visuals: los envases de la tienda (pote, frasco, shaker) y los fierros del box (discos, barra,
 * pesa rusa, rack), sin texto (un post no lleva tipografía adentro). Cada pieza se apoya en (x, y) por su base.
 */

/** Rayo de la marca (el trazo derecho de la "V"), en un cuadro de 0..40 × 0..100. */
export const BOLT = "M22 0H40L28 40H38L12 100L18 56H8Z";

/** Degradés compartidos por los envases y fierros de una escena. */
export function PropDefs({ ids, volt = "#c8ff2e", plasma = "#8b72ff" }: { ids: ArtIds; volt?: string; plasma?: string }) {
  return (
    <defs>
      <linearGradient id={ids.id("cyl")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity=".6" />
        <stop offset=".12" stopColor="#000" stopOpacity=".18" />
        <stop offset=".3" stopColor="#fff" stopOpacity=".22" />
        <stop offset=".4" stopColor="#fff" stopOpacity=".04" />
        <stop offset=".7" stopColor="#000" stopOpacity="0" />
        <stop offset=".9" stopColor="#000" stopOpacity=".3" />
        <stop offset="1" stopColor="#000" stopOpacity=".65" />
      </linearGradient>
      <linearGradient id={ids.id("rim")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset=".4" stopColor={volt} />
        <stop offset="1" stopColor={plasma} stopOpacity=".15" />
      </linearGradient>
      <linearGradient id={ids.id("steel")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1a1e25" />
        <stop offset=".35" stopColor="#4a515c" />
        <stop offset=".55" stopColor="#262b33" />
        <stop offset="1" stopColor="#0f1217" />
      </linearGradient>
      <radialGradient id={ids.id("sphere")} cx=".35" cy=".3" r=".75">
        <stop offset="0" stopColor="#fff" stopOpacity=".35" />
        <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".7" />
      </radialGradient>
      <radialGradient id={ids.id("shadow")} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#000" stopOpacity=".8" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

export interface PackColors {
  body?: string;
  band?: string;
  accent?: string;
  tint?: string;
}

interface TubProps extends PackColors {
  ids: ArtIds;
  x: number;
  y: number;
  s?: number;
  /** Pote alto (ganador) en vez del ancho (whey). */
  tall?: boolean;
  /** Brillo general (los que quedan fuera de la luz van más oscuros). */
  lit?: number;
}

/** Sombra de contacto en el piso. */
export function Contact({ ids, x, y, rx, o = 1 }: { ids: ArtIds; x: number; y: number; rx: number; o?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.16} fill={ids.url("shadow")} opacity={o} />;
}

/** Pote de la tienda: tapa estriada, cuerpo con volumen, rótulo con el rayo y la franja del sabor, filo de luz. */
export function Tub({ ids, x, y, s = 1, tall = false, body = "#12161d", band = "#171c25", accent = "#c8ff2e", tint = "#8b72ff", lit = 1 }: TubProps) {
  const w = tall ? 150 : 176, h = tall ? 230 : 176, lid = 38;
  const lx = -w / 2 - 5, lw = w + 10;
  const ridges = Math.floor(lw / 9);
  const bodyD = `M${-w / 2} ${-h}H${w / 2}V-16Q${w / 2} 0 ${w / 2 - 16} 0H${-w / 2 + 16}Q${-w / 2} 0 ${-w / 2} -16Z`;
  const ly = -h - lid, bh = h * 0.68, by = -h + h * 0.14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Contact ids={ids} x={0} y={2} rx={w * 0.62} />
      <path d={bodyD} fill={body} />
      <rect x={-w / 2} y={by} width={w} height={bh} fill={band} />
      <rect x={-w / 2} y={by + bh - h * 0.1} width={w} height={h * 0.1} fill={tint} />
      <rect x={-w / 2} y={by + bh - h * 0.1} width={w} height={h * 0.028} fill="#fff" opacity=".25" />
      <path d={BOLT} transform={`translate(${w * 0.22} ${by + bh * 0.1}) scale(${(bh * 0.72) / 100})`} fill={accent} />
      <rect x={-w / 2 + w * 0.09} y={by + bh * 0.14} width={w * 0.2} height={h * 0.028} rx="2" fill="#fff" opacity=".55" />
      <rect x={-w / 2 + w * 0.09} y={by + bh * 0.26} width={w * 0.36} height={h * 0.085} rx="2" fill="#fff" opacity=".88" />
      <rect x={-w / 2 + w * 0.09} y={by + bh * 0.44} width={w * 0.26} height={h * 0.024} rx="2" fill="#fff" opacity=".4" />
      <path d={bodyD} fill={ids.url("cyl")} opacity=".9" />
      <path d={`M${lx} ${ly + 6}q0-6 6-6h${lw - 12}q6 0 6 6v${lid - 6}h-${lw}z`} fill={tone(body, -0.3)} />
      <g stroke="#000" strokeOpacity=".3" strokeWidth="1.6">
        {Array.from({ length: ridges - 1 }, (_, i) => <path key={i} d={`M${lx + (i + 1) * (lw / ridges)} ${ly + 6}v${lid - 10}`} />)}
      </g>
      <path d={`M${lx + 6} ${ly + 2.5}h${lw - 12}`} stroke="#fff" strokeOpacity=".4" strokeWidth="1.6" />
      <rect x={lx} y={ly} width={lw} height={lid} fill={ids.url("cyl")} opacity=".85" />
      <rect x={lx} y={ly + lid - 4} width={lw} height="4" fill="#000" opacity=".4" />
      <path d={`M${w / 2 - 1} ${-h + 10}V-14`} stroke={ids.url("rim")} strokeWidth="8" opacity=".2" strokeLinecap="round" />
      <path d={`M${w / 2 - 1} ${-h + 10}V-14`} stroke={ids.url("rim")} strokeWidth="2.6" strokeLinecap="round" />
      {lit < 1 && <path d={`${bodyD}M${lx} ${ly}h${lw}v${lid}h-${lw}z`} fill="#000" opacity={1 - lit} />}
    </g>
  );
}

/** Frasco chico (creatina, pre-entreno): tapa ancha y rótulo corto. */
export function Jar({ ids, x, y, s = 1, body = "#12161d", band = "#171c25", accent = "#c8ff2e", tint = "#8b72ff", lit = 1 }: TubProps) {
  const w = 116, h = 124, lid = 32;
  const lx = -w / 2 - 5, lw = w + 10, ly = -h - lid;
  const bodyD = `M${-w / 2} ${-h}H${w / 2}V-12Q${w / 2} 0 ${w / 2 - 12} 0H${-w / 2 + 12}Q${-w / 2} 0 ${-w / 2} -12Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Contact ids={ids} x={0} y={2} rx={w * 0.62} />
      <path d={bodyD} fill={body} />
      <rect x={-w / 2} y={-h + 16} width={w} height={h - 36} fill={band} />
      <rect x={-w / 2} y={-32} width={w} height="12" fill={tint} />
      <path d={BOLT} transform={`translate(${w * 0.2} ${-h + 24}) scale(.62)`} fill={accent} />
      <rect x={-w / 2 + 10} y={-h + 30} width="30" height="4" rx="2" fill="#fff" opacity=".55" />
      <rect x={-w / 2 + 10} y={-h + 42} width="44" height="12" rx="2" fill="#fff" opacity=".88" />
      <path d={bodyD} fill={ids.url("cyl")} opacity=".9" />
      <path d={`M${lx} ${ly + 6}q0-6 6-6h${lw - 12}q6 0 6 6v${lid - 6}h-${lw}z`} fill={tone(body, -0.3)} />
      <g stroke="#000" strokeOpacity=".3" strokeWidth="1.6">{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${lx + (i + 1) * (lw / 13)} ${ly + 6}v${lid - 10}`} />)}</g>
      <rect x={lx} y={ly} width={lw} height={lid} fill={ids.url("cyl")} opacity=".85" />
      <path d={`M${w / 2 - 1} ${-h + 8}V-12`} stroke={ids.url("rim")} strokeWidth="2.4" strokeLinecap="round" />
      {lit < 1 && <path d={`${bodyD}M${lx} ${ly}h${lw}v${lid}h-${lw}z`} fill="#000" opacity={1 - lit} />}
    </g>
  );
}

/** Shaker: vaso translúcido con marcas de medida, tapa y pico. */
export function Shaker({ ids, x, y, s = 1, body = "#1a1f28", accent = "#c8ff2e", tint = "#8b72ff" }: TubProps) {
  const d = "M-36 -150H36L40 -14Q40 0 26 0H-26Q-40 0 -40 -14Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Contact ids={ids} x={0} y={2} rx={46} />
      <path d={d} fill={body} opacity=".92" />
      <path d="M-38 -90H36L38 -14Q38 0 26 0H-26Q-38 0 -38 -14Z" fill={tint} opacity=".55" />
      <path d={BOLT} transform="translate(6 -116) scale(.42)" fill={accent} />
      <g stroke="#fff" strokeOpacity=".35" strokeWidth="1.6">{[-130, -112, -94, -76, -58, -40].map((yy) => <path key={yy} d={`M-33 ${yy}h${yy % 36 ? 8 : 14}`} />)}</g>
      <path d={d} fill={ids.url("cyl")} opacity=".7" />
      <path d="M-42 -150h84v-18q0-6-6-6h-72q-6 0-6 6z" fill={tone(body, -0.3)} />
      <path d="M-14 -174h28v-16q0-6-6-6h-16q-6 0-6 6z" fill={accent} />
      <path d="M-42 -150h84v-24h-84z" fill={ids.url("cyl")} opacity=".8" />
      <path d="M37 -140V-18" stroke={ids.url("rim")} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/** Disco de frente: goma con el aro de acero, el centro y la luz de borde. */
export function Plate({ ids, x, y, r, color = "#15181d", ring = "#9aa4b2" }: { ids: ArtIds; x: number; y: number; r: number; color?: string; ring?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r} fill={ids.url("sphere")} opacity=".6" />
      <circle cx={x} cy={y} r={r * 0.78} fill="none" stroke="#000" strokeOpacity=".35" strokeWidth={r * 0.05} />
      <circle cx={x} cy={y} r={r * 0.3} fill={ids.url("steel")} />
      <circle cx={x} cy={y} r={r * 0.3} fill="none" stroke={ring} strokeOpacity=".5" strokeWidth={r * 0.02} />
      <circle cx={x} cy={y} r={r * 0.12} fill="#05060a" />
    </g>
  );
}

/** Disco de canto (en la barra): bloque redondeado con el aro de acero marcado. */
export function PlateEdge({ ids, x, y, w, h, color = "#15181d" }: { ids: ArtIds; x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w * 0.3} fill={color} />
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w * 0.3} fill={ids.url("cyl")} opacity=".9" />
      <rect x={x - w / 2 + 2} y={y - h / 2 - 3} width={w - 4} height="6" fill="#000" opacity=".35" />
    </g>
  );
}

/** Barra olímpica horizontal, con sus topes y los discos de canto. */
export function Barbell({ ids, x, y, len = 560, plates = [[44, 180], [36, 180], [26, 140]], plateColor }: { ids: ArtIds; x: number; y: number; len?: number; plates?: [number, number][]; plateColor?: string }) {
  const half = len / 2;
  const sides = [-1, 1];
  return (
    <g>
      <rect x={x - half} y={y - 7} width={len} height="14" rx="4" fill={ids.url("steel")} />
      <rect x={x - half} y={y - 7} width={len} height="2" fill="#fff" opacity=".25" />
      {sides.map((sg) => {
        let off = half * 0.56;
        return (
          <g key={sg}>
            <rect x={x + sg * off - 10} y={y - 14} width="20" height="28" rx="3" fill={ids.url("steel")} />
            {plates.map(([w, h], i) => {
              off += w / 2 + (i ? w / 2 + 3 : 14);
              return <PlateEdge key={i} ids={ids} x={x + sg * off} y={y + h / 2} w={w} h={h} color={plateColor} />;
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Pesa rusa: asa gruesa y cuerpo esférico con base plana. Con `hot`, el metal se ve al rojo desde abajo. */
export function Kettlebell({ ids, x, y, r = 70, color = "#15181d", glow }: { ids: ArtIds; x: number; y: number; r?: number; color?: string; glow?: string }) {
  const cy = y - r * 0.92;
  return (
    <g>
      <Contact ids={ids} x={x} y={y + 2} rx={r * 1.1} />
      <path d={`M${x - r * 0.55} ${cy - r * 0.5}q0-${r * 1.05} ${r * 0.55}-${r * 1.05}t${r * 0.55} ${r * 1.05}`} fill="none" stroke={color} strokeWidth={r * 0.26} strokeLinecap="round" />
      <path d={`M${x - r * 0.55} ${cy - r * 0.5}q0-${r * 1.05} ${r * 0.55}-${r * 1.05}t${r * 0.55} ${r * 1.05}`} fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth={r * 0.08} strokeLinecap="round" />
      <path d={`M${x - r} ${cy}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r * 0.9} 0 0 1 -${r * 0.25} ${r * 0.78}H${x - r * 0.75}a${r} ${r * 0.9} 0 0 1 -${r * 0.25}-${r * 0.78}Z`} fill={glow ?? color} />
      {glow && <path d={`M${x - r} ${cy}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r * 0.9} 0 0 1 -${r * 0.25} ${r * 0.78}H${x - r * 0.75}a${r} ${r * 0.9} 0 0 1 -${r * 0.25}-${r * 0.78}Z`} fill={color} opacity=".22" />}
      <circle cx={x} cy={cy} r={r} fill={ids.url("sphere")} opacity={glow ? 0.55 : 1} />
      <rect x={x - r * 0.75} y={y - r * 0.14} width={r * 1.5} height={r * 0.14} fill="#000" opacity=".5" />
    </g>
  );
}

/** Rack de sentadillas: dos parantes agujereados, travesaño y ganchos; con `shelf`, un estante a esa altura. */
export function Rack({ ids, x, y, w = 300, top = 120, shelf, neon }: { ids: ArtIds; x: number; y: number; w?: number; top?: number; shelf?: number; neon?: string }) {
  const posts = [x - w / 2, x + w / 2];
  return (
    <g>
      {posts.map((px) => (
        <g key={px}>
          <rect x={px - 11} y={top} width="22" height={y - top} fill={ids.url("steel")} />
          <rect x={px - 11} y={top} width="2" height={y - top} fill="#fff" opacity=".18" />
          <path d={`M${px} ${top + 18}V${y}`} stroke="#05060a" strokeWidth="8" strokeDasharray="9 13" />
          <rect x={px - 22} y={y - 8} width="44" height="8" fill="#0b0d11" />
        </g>
      ))}
      <rect x={posts[0]! - 11} y={top} width={w + 22} height="18" fill={ids.url("steel")} />
      {shelf !== undefined && (
        <g>
          <rect x={posts[0]! - 4} y={shelf} width={w + 8} height="14" fill="#1c2129" />
          <rect x={posts[0]! - 4} y={shelf} width={w + 8} height="2" fill="#fff" opacity=".35" />
          <rect x={posts[0]! - 4} y={shelf + 14} width={w + 8} height="22" fill="#0b0d11" />
        </g>
      )}
      {neon && (
        <g fill="none" stroke={neon} strokeLinecap="round">
          {posts.map((px) => <path key={px} d={`M${px - 11} ${top + 2}V${y - 2}M${px + 11} ${top + 2}V${y - 2}`} strokeWidth="2" opacity=".9" />)}
          {posts.map((px) => <path key={`g${px}`} d={`M${px - 11} ${top + 2}V${y - 2}M${px + 11} ${top + 2}V${y - 2}`} strokeWidth="9" opacity=".18" />)}
          <path d={`M${posts[0]! - 11} ${top}H${posts[1]! + 11}`} strokeWidth="2" opacity=".9" />
        </g>
      )}
    </g>
  );
}
