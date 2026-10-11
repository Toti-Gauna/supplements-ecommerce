import type { CollarCharm, CollarDesign } from "@/demo/fixtures/collar";

/** Formas de los adornos, centradas en 0,0 y de unos 24 de ancho (se escalan con `transform`). */
const SHAPES: Record<Exclude<CollarDesign, "none">, string> = {
  paws: "M0 10c-6 0-9-3-9-6.5S-5-3 0-3s9 3.5 9 6.5S6 10 0 10zm-10-9c-2.3 0-4-2.2-4-4.8S-12.3-8.6-10-8.6s4 2.2 4 4.8S-7.7 1-10 1zm6.5-6c-2.3 0-4-2.3-4-5s1.7-5 4-5 4 2.3 4 5-1.7 5-4 5zm7 0c-2.3 0-4-2.3-4-5s1.7-5 4-5 4 2.3 4 5-1.7 5-4 5zm6.5 6c-2.3 0-4-2.2-4-4.8s1.7-4.8 4-4.8 4 2.2 4 4.8S12.3 1 10 1z",
  hearts: "M0 11C-13 2-12-9-5.5-10c3.4-.5 4.9 1.7 5.5 3.3.6-1.6 2.1-3.8 5.5-3.3C12-9 13 2 0 11z",
  stars: "M0-12l3.5 7.6 8.3.9-6.2 5.6 1.7 8.2L0 6.1l-7.3 4.2 1.7-8.2-6.2-5.6 8.3-.9z",
  bones: "M-12-4a4.5 4.5 0 1 1 4.5-4.5h15A4.5 4.5 0 1 1 12-4v8a4.5 4.5 0 1 1-4.5 4.5h-15A4.5 4.5 0 1 1-12 4z",
};

/** Un adorno (patita, corazón, estrella o huesito) del color de las letras, con el mismo borde que ellas. */
export function Motif({ kind, x, y, scale = 1, rotate = 0, fill, ink }: { kind: Exclude<CollarDesign, "none">; x: number; y: number; scale?: number; rotate?: number; fill: string; ink: string }) {
  return <path d={SHAPES[kind]} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} fill={fill} stroke={ink} strokeWidth={2 / scale} strokeLinejoin="round" />;
}

/** Dije de metal que cuelga a un costado del nombre. */
export function Charm({ kind, x, y, metal }: { kind: CollarCharm; x: number; y: number; metal: string }) {
  if (kind === "none") return null;
  return (
    <g className="collar-swing" style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", animationDelay: "-0.6s" }}>
      <line x1={x} y1={y + 4} x2={x} y2={y + 12} stroke="#b9b4a8" strokeWidth="2" />
      <circle cx={x} cy={y + 15} r="4" fill="none" stroke="#b9b4a8" strokeWidth="2" />
      <g transform={`translate(${x} ${y + 36})`}>
        {kind === "paw" && (
          <g fill={metal} stroke="#7a5a26" strokeWidth="1">
            <ellipse cx="0" cy="6" rx="10" ry="8.5" />
            <ellipse cx="-11" cy="-5" rx="4.2" ry="5.4" /><ellipse cx="-4" cy="-11" rx="4.2" ry="5.4" />
            <ellipse cx="4" cy="-11" rx="4.2" ry="5.4" /><ellipse cx="11" cy="-5" rx="4.2" ry="5.4" />
          </g>
        )}
        {kind === "bone" && <path d="M-14 -5a5 5 0 1 1 5-5h18a5 5 0 1 1 5 5v10a5 5 0 1 1-5 5h-18a5 5 0 1 1-5-5z" fill={metal} stroke="#7a5a26" strokeWidth="1" />}
        {kind === "heart" && <path d="M0 14C-16 3-15-10-7-11c4-.5 6 2 7 4 1-2 3-4.5 7-4 8 1 9 14-7 25z" fill={metal} stroke="#7a5a26" strokeWidth="1" />}
        {kind === "phone" && (
          <g>
            <circle r="15" fill={metal} stroke="#7a5a26" strokeWidth="1" />
            <path d="M-5 -6c0 8 3 11 11 11l2-3-3-2-2 1c-2-1-3-2-4-4l1-2-2-3z" fill="#4a3a1a" />
          </g>
        )}
      </g>
    </g>
  );
}
