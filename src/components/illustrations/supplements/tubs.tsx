import { Label, Rim, Shade, tone } from "./defs";
import type { ContainerProps } from "./types";

/** Tapa a rosca con estrías verticales. */
function Lid({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  const ridges = Math.floor(w / 7);
  const d = `M${x} ${y + 5}q0-5 5-5h${w - 10}q5 0 5 5v${h - 5}h-${w}z`;
  return (
    <g>
      <path d={d} fill={color} />
      <g stroke="#000" strokeOpacity=".22" strokeWidth="1.4">
        {Array.from({ length: ridges - 1 }, (_, i) => <path key={i} d={`M${x + (i + 1) * (w / ridges)} ${y + 6}v${h - 9}`} />)}
      </g>
      <path d={`M${x + 4} ${y + 2.5}h${w - 8}`} stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <Shade d={d} />
      <rect x={x} y={y + h - 3} width={w} height="3" fill="#000" opacity=".35" />
    </g>
  );
}

/** Pote ancho (whey de 2 lb). */
export function Tub({ pack, tint }: ContainerProps) {
  const body = "M112 154H288V312Q288 328 272 328H128Q112 328 112 312Z";
  return (
    <g>
      <path d={body} fill={pack.body} />
      <rect x="112" y="154" width="176" height="10" fill="#000" opacity=".25" />
      <Label x={112} y={180} w={176} h={128} pack={pack} tint={tint} />
      <Shade d={body} opacity={0.85} />
      <Lid x={106} y={116} w={188} h={40} color={pack.lid ?? tone(pack.body, -0.25)} />
      <Rim x={287} y1={168} y2={320} />
    </g>
  );
}

/** Pote alto (5 lb, ganadores). */
export function TubTall({ pack, tint }: ContainerProps) {
  const body = "M118 104H282V310Q282 328 264 328H136Q118 328 118 310Z";
  return (
    <g>
      <path d={body} fill={pack.body} />
      <rect x="118" y="104" width="164" height="10" fill="#000" opacity=".25" />
      <Label x={118} y={138} w={164} h={164} pack={pack} tint={tint} />
      <Shade d={body} opacity={0.85} />
      <Lid x={112} y={66} w={176} h={40} color={pack.lid ?? tone(pack.body, -0.25)} />
      <Rim x={281} y1={118} y2={320} />
    </g>
  );
}

/** Frasco chico (creatina 300 g, pre-entreno). */
export function Jar({ pack, tint }: ContainerProps) {
  const body = "M142 198H258V316Q258 328 246 328H154Q142 328 142 316Z";
  return (
    <g>
      <path d={body} fill={pack.body} />
      <Label x={142} y={214} w={116} h={98} pack={pack} tint={tint} />
      <Shade d={body} opacity={0.85} />
      <Lid x={137} y={166} w={126} h={34} color={pack.lid ?? tone(pack.body, -0.25)} />
      <Rim x={257} y1={206} y2={322} />
    </g>
  );
}

/** Frasco de vidrio bajo (mantequilla de maní): se ve el contenido del color del sabor. */
export function Spread({ pack, tint }: ContainerProps) {
  const glass = "M128 204H272V306Q272 328 250 328H150Q128 328 128 306Z";
  return (
    <g>
      <path d={glass} fill={tint} />
      <path d="M128 222q36 10 72 2t72 4" fill="none" stroke="#000" strokeOpacity=".15" strokeWidth="3" />
      <Label x={128} y={238} w={144} h={64} pack={pack} tint={pack.accent} />
      <path d={glass} fill="url(#sp-glass)" />
      <Shade d={glass} opacity={0.6} />
      <Lid x={132} y={172} w={136} h={34} color={pack.lid ?? tone(pack.body, -0.1)} />
      <Rim x={271} y1={212} y2={318} />
    </g>
  );
}
