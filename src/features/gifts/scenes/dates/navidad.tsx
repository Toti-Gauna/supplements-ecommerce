import { BOLT } from "@/components/illustrations/campaigns/props";
import { Glow } from "@/components/illustrations/campaigns/b-stage";
import { tone } from "@/components/illustrations/supplements/defs";
import { Footing, GymBackdrop } from "../stage/backdrop";
import type { OpeningArtProps } from "../stage/types";

/** Discos del árbol, de arriba abajo: media anchura y altura del centro. Se sacan en ese orden. */
const PLATES = [
  { rx: 74, y: 330, c: "#2f8f5b" },
  { rx: 98, y: 410, c: "#1f6243" },
  { rx: 122, y: 490, c: "#2f8f5b" },
  { rx: 146, y: 570, c: "#1f6243" },
  { rx: 170, y: 650, c: "#2f8f5b" },
];
const THICK = 26;

/** Un disco de goma visto desde arriba en perspectiva: canto, cara y el aro de acero del centro. */
function Disc({ u, rx, y, c, gold }: { u: string; rx: number; y: number; c: string; gold: string }) {
  const ry = rx * 0.24;
  return (
    <g>
      <ellipse cx="400" cy={y + THICK} rx={rx} ry={ry} fill={tone(c, -0.55)} />
      <rect x={400 - rx} y={y} width={rx * 2} height={THICK} fill={tone(c, -0.35)} />
      <rect x={400 - rx} y={y} width={rx * 2} height={THICK} fill={`url(#${u}-cyl)`} opacity=".7" />
      <ellipse cx="400" cy={y} rx={rx} ry={ry} fill={c} />
      <ellipse cx="400" cy={y} rx={rx * 0.7} ry={ry * 0.7} fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="3" />
      <ellipse cx="400" cy={y} rx={rx} ry={ry} fill="none" stroke={gold} strokeOpacity=".55" strokeWidth="2" />
      <ellipse cx="400" cy={y} rx="22" ry="6" fill="#c9ced6" />
      <ellipse cx="400" cy={y} rx="12" ry="3.4" fill="#0b0e13" />
    </g>
  );
}

/**
 * Navidad: el árbol de discos del box. Cada toque saca un disco de arriba y lo deja en la pila del costado; el rayo
 * de la punta se va encendiendo y, con el último disco, aparece el regalo al pie del árbol.
 */
export default function Navidad({ u, c, t, opened }: OpeningArtProps) {
  const power = opened ? 1 : t / PLATES.length;
  return (
    <g>
      <GymBackdrop u={u} c={c} beam={400} spread={250} light="#fff3c4" seed={8} />
      {/* El poste del árbol con su base en cruz. */}
      <path d="M300 760L400 724L500 760M330 772L400 740L470 772" stroke="#2a3038" strokeWidth="14" strokeLinecap="round" fill="none" />
      <rect x="392" y="250" width="16" height="490" rx="4" fill="#9aa3ad" />
      <rect x="392" y="250" width="16" height="490" rx="4" fill={`url(#${u}-cyl)`} opacity=".8" />
      {/* La punta: el rayo de la marca, que se prende disco a disco. */}
      <Glow cx={400} cy={214} rx={150} ry={150} color={c.accent} o={0.25 + power * 0.6} />
      <path d={BOLT} transform="translate(378 160) scale(.9 .7)" fill={c.accent} opacity={0.35 + power * 0.65} />
      <Footing u={u} x={400} w={190} light="#fff3c4" />
      {/* La pila del costado, donde caen los discos que se sacan. */}
      {PLATES.map((p, i) => {
        const out = Math.min(1, Math.max(0, (opened ? PLATES.length : t) - i));
        const rest = 760 - THICK - (i + 1) * 18;
        return out > 0 ? (
          <g key={`s${i}`} transform={`translate(${290 * out} ${(rest - p.y) * out}) scale(${1 - 0.45 * out} 1)`} style={{ transformOrigin: `400px ${p.y}px` }}>
            <Disc u={u} rx={p.rx} y={p.y} c={p.c} gold={c.accent} />
          </g>
        ) : null;
      })}
      {/* Los discos que siguen en el árbol (el de abajo esconde el regalo). */}
      {PLATES.map((p, i) => ((opened ? PLATES.length : t) - i <= 0 ? <Disc key={i} u={u} rx={p.rx} y={p.y} c={p.c} gold={c.accent} /> : null)).reverse()}
    </g>
  );
}
