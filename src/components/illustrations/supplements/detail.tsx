import { tone } from "./defs";
import { Scoop } from "./gear";
import type { ContainerKind } from "./types";

/** Polvo suelto alrededor del scoop (posición y radio fijos: el HTML es siempre igual). */
const DUST: [number, number, number][] = [[96, 318, 3], [120, 330, 2], [210, 336, 2.5], [236, 326, 1.8], [80, 300, 1.6], [176, 342, 2], [150, 340, 1.4]];

function Capsules({ tint }: { tint: string }) {
  const caps: [number, number, number][] = [[110, 318, 20], [150, 330, -12], [196, 322, 64], [128, 296, -40], [176, 302, 8], [226, 334, -24], [92, 338, 46]];
  return (
    <g>
      {caps.map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <rect x={x - 22} y={y - 9} width="44" height="18" rx="9" fill="#f2f4f1" />
          <path d={`M${x} ${y - 9}h13a9 9 0 0 1 0 18h-13z`} fill={tint} />
          <rect x={x - 18} y={y - 6} width="30" height="4" rx="2" fill="#fff" opacity=".55" />
        </g>
      ))}
    </g>
  );
}

function GummyPile({ tint }: { tint: string }) {
  const g: [number, number, number][] = [[104, 320, -10], [140, 330, 16], [176, 318, -24], [122, 296, 30], [160, 300, 4], [208, 332, 12]];
  return (
    <g>
      {g.map(([x, y, r], i) => {
        const c = i % 2 ? tone(tint, 0.3) : tint;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(1.3)`}>
            <rect x="-12" y="-10" width="24" height="24" rx="9" fill={c} />
            <circle cx="-7" cy="-11" r="5.5" fill={c} />
            <circle cx="7" cy="-11" r="5.5" fill={c} />
            <ellipse cx="-5" cy="-3" rx="4.5" ry="3" fill="#fff" opacity=".5" />
          </g>
        );
      })}
    </g>
  );
}

function Drops({ tint }: { tint: string }) {
  return (
    <g>
      <path d="M60 330q50-30 90-6t100 2" fill="none" stroke={tint} strokeWidth="10" strokeLinecap="round" opacity=".85" />
      {([[96, 296, 9], [132, 282, 6], [176, 300, 7], [70, 312, 5], [214, 290, 4]] as [number, number, number][]).map(([x, y, r], i) => (
        <g key={i}><path d={`M${x} ${y - r * 2}q${r} ${r * 1.4} ${r} ${r * 2.2}a${r} ${r} 0 0 1 ${-r * 2} 0q0-${r * 0.8} ${r}-${r * 2.2}z`} fill={tint} /><circle cx={x - r * 0.35} cy={y + r * 0.1} r={r * 0.3} fill="#fff" opacity=".5" /></g>
      ))}
    </g>
  );
}

function Spoon({ tint }: { tint: string }) {
  return (
    <g transform="translate(70 300) rotate(-14)">
      <rect x="70" y="-6" width="130" height="12" rx="6" fill="#c9ced6" />
      <ellipse cx="34" cy="0" rx="46" ry="22" fill="#dfe3e8" />
      <path d="M-4 0q10-30 40-30t40 30q-20 12-40 12t-40-12z" fill={tint} />
      <path d="M-4 0q10-30 40-30t40 30q-20 12-40 12t-40-12z" fill="url(#sp-heap)" />
    </g>
  );
}

function ChalkDust() {
  return <g fill="#fff">{([[90, 300, 26, 0.12], [150, 318, 34, 0.1], [230, 300, 22, 0.14], [300, 320, 30, 0.08], [120, 260, 14, 0.16]] as [number, number, number, number][]).map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} opacity={o} />)}</g>;
}

/** Primer plano de la vista de detalle según el envase: scoop colmado, cápsulas, gomitas, gotas, cuchara o polvo. */
export function DetailProp({ kind, tint }: { kind: ContainerKind; tint: string }) {
  switch (kind) {
    case "caps": return <Capsules tint={tint} />;
    case "gummies": return <GummyPile tint={tint} />;
    case "bottle": case "gel": case "sachet": case "shaker": return <Drops tint={tint} />;
    case "spread": return <Spoon tint={tint} />;
    case "chalk": return <ChalkDust />;
    case "bar": case "box": return <Drops tint={tone(tint, -0.2)} />;
    default:
      return (
        <g>
          <g transform="translate(150 312) rotate(-8)"><Scoop tint={tint} /></g>
          <g fill={tint}>{DUST.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
        </g>
      );
  }
}
