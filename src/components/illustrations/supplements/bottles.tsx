import { Label, Rim, Shade, tone } from "./defs";
import type { ContainerProps } from "./types";

/** Tapa chica con estrías (frascos y botellas). */
function Cap({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  const d = `M${x} ${y + 4}q0-4 4-4h${w - 8}q4 0 4 4v${h - 4}h-${w}z`;
  return (
    <g>
      <path d={d} fill={color} />
      <g stroke="#000" strokeOpacity=".2" strokeWidth="1.2">
        {Array.from({ length: Math.floor(w / 6) - 1 }, (_, i) => <path key={i} d={`M${x + (i + 1) * 6} ${y + 5}v${h - 8}`} />)}
      </g>
      <Shade d={d} />
    </g>
  );
}

/** Frasco de cápsulas (vitaminas, omega 3, cafeína). */
export function Caps({ pack, tint }: ContainerProps) {
  const body = "M146 206Q146 186 172 182V172H228V182Q254 186 254 206V316Q254 328 242 328H158Q146 328 146 316Z";
  return (
    <g>
      <path d={body} fill={pack.body} />
      <Label x={146} y={214} w={108} h={98} pack={pack} tint={tint} />
      <Shade d={body} opacity={0.85} />
      <Cap x={164} y={134} w={72} h={40} color={pack.lid ?? tone(pack.body, -0.3)} />
      <Rim x={253} y1={210} y2={322} />
    </g>
  );
}

/** Gomitas cerca de la ventana del frasco (posición, giro). */
const GUMMIES: [number, number, number][] = [[150, 214, -12], [176, 206, 18], [204, 214, -4], [232, 206, 24], [160, 236, 30], [190, 232, -20], [220, 236, 8], [246, 230, -26]];

/** Frasco ancho de gomitas: una ventana deja ver las gomitas del color del sabor. */
export function Gummies({ pack, tint }: ContainerProps) {
  const jar = "M128 204Q128 188 144 188H256Q272 188 272 204V312Q272 328 256 328H144Q128 328 128 312Z";
  return (
    <g>
      <path d={jar} fill={pack.body} />
      <rect x="134" y="194" width="132" height="58" rx="8" fill={tone(pack.body, -0.35)} />
      <g>
        {GUMMIES.map(([x, y, r], i) => (
          <g key={i} transform={`rotate(${r} ${x} ${y})`}>
            <rect x={x - 11} y={y - 10} width="22" height="22" rx="8" fill={i % 3 === 1 ? tone(tint, 0.25) : tint} />
            <circle cx={x - 6} cy={y - 10} r="5" fill={i % 3 === 1 ? tone(tint, 0.25) : tint} />
            <circle cx={x + 6} cy={y - 10} r="5" fill={i % 3 === 1 ? tone(tint, 0.25) : tint} />
            <ellipse cx={x - 4} cy={y - 3} rx="4" ry="3" fill="#fff" opacity=".45" />
          </g>
        ))}
      </g>
      <rect x="134" y="194" width="132" height="58" rx="8" fill="url(#sp-glass)" />
      <Label x={128} y={256} w={144} h={62} pack={pack} tint={tint} />
      <Shade d={jar} opacity={0.7} />
      <Cap x={132} y={156} w={136} h={34} color={pack.lid ?? tone(pack.body, -0.3)} />
      <Rim x={271} y1={198} y2={320} />
    </g>
  );
}

/** Botella (L-carnitina líquida, bebidas). */
export function Bottle({ pack, tint }: ContainerProps) {
  const body = "M160 182Q160 162 182 152V138H218V152Q240 162 240 182V314Q240 328 226 328H174Q160 328 160 314Z";
  return (
    <g>
      <path d={body} fill={pack.body} />
      <Label x={160} y={196} w={80} h={112} pack={pack} tint={tint} />
      <Shade d={body} opacity={0.85} />
      <Cap x={176} y={104} w={48} h={36} color={pack.lid ?? tone(pack.body, -0.3)} />
      <Rim x={239} y1={186} y2={322} />
    </g>
  );
}
