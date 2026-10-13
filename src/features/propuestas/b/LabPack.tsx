import { CONTAINERS, FRAME_SCALE, defaultPack } from "@/components/illustrations/supplements";
import type { ArtKey, PackStyle } from "@/demo/types";
import { AthleteDiagram } from "./AthleteDiagram";

/** Borde del envase en su lienzo de 400 (tapa incluida), para trazar las cotas. Piso en y = 330. */
const BOUNDS: Partial<Record<ArtKey, { top: number; left: number; right: number }>> = {
  tub: { top: 116, left: 106, right: 294 },
  "tub-tall": { top: 66, left: 112, right: 288 },
  jar: { top: 166, left: 137, right: 263 },
  pouch: { top: 100, left: 112, right: 290 },
};

export interface LabPackProps {
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
  label: string;
  /** Medidas reales del envase (del catálogo): se dibujan como cotas de plano. */
  dims?: { heightCm: number; widthCm: number };
  /** Diagrama biomecánico de sentadilla detrás del producto (hero). */
  figure?: boolean;
  /** Tamaño del envase en el banco (1 = llena el alto). */
  size?: number;
  className?: string;
}

const W = 600;
const H = 520;
const FLOOR = 440;

/**
 * El envase SVG de la librería sobre el banco de pruebas: piso con regla, cotas con las medidas del catálogo y, en el
 * hero, una sentadilla dibujada como diagrama de laboratorio. Fondo transparente: la placa la pone quien lo usa.
 */
export function LabPack({ art, pack, tint = "#8b72ff", label, dims, figure = false, size = 1, className }: LabPackProps) {
  const Container = CONTAINERS[art] ?? CONTAINERS.tub;
  const s = (FRAME_SCALE[art] ?? 1) * 1.22 * size;
  const cx = figure ? 395 : 300;
  const b = BOUNDS[art];
  const top = b ? FLOOR + (b.top - 330) * s : 0;
  const left = b ? cx + (b.left - 200) * s : 0;
  const right = b ? cx + (b.right - 200) * s : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} (imagen ilustrativa)`} className={className}>
      {figure && <AthleteDiagram floor={FLOOR} />}
      <Ruler />
      <ellipse cx={cx} cy={FLOOR} rx={(right - left) / 1.7 || 110} ry="9" fill="#131518" opacity=".14" />
      <g transform={`translate(${cx} ${FLOOR}) scale(${s}) translate(-200 -330)`}><Container pack={pack ?? defaultPack(art)} tint={tint} /></g>
      {b && dims && <Dimensions top={top} left={left} right={right} dims={dims} />}
    </svg>
  );
}

function Ruler() {
  return (
    <g aria-hidden="true">
      <path d={`M16 ${FLOOR}H${W - 16}`} stroke="#131518" strokeWidth="1.5" />
      {Array.from({ length: 71 }, (_, i) => {
        const x = 20 + i * 8;
        const major = i % 5 === 0;
        return <path key={i} d={`M${x} ${FLOOR + 1}v${major ? 10 : 5}`} stroke="#4a5058" strokeWidth={major ? 1.2 : 0.8} />;
      })}
    </g>
  );
}

const TICK = "#131518";

function Dimensions({ top, left, right, dims }: { top: number; left: number; right: number; dims: { heightCm: number; widthCm: number } }) {
  const x = right + 30;
  const y = FLOOR + 42;
  return (
    <g aria-hidden="true" fontFamily="var(--mono)" fontSize="17" fontWeight="600" fill={TICK}>
      <path d={`M${right + 6} ${top}H${x + 8}M${right + 6} ${FLOOR}H${x + 8}`} stroke={TICK} strokeWidth=".8" strokeDasharray="3 3" />
      <path d={`M${x} ${top}V${FLOOR}M${x - 5} ${top + 9}L${x} ${top}L${x + 5} ${top + 9}M${x - 5} ${FLOOR - 9}L${x} ${FLOOR}L${x + 5} ${FLOOR - 9}`} stroke={TICK} strokeWidth="1.2" fill="none" />
      <rect x={x - 14} y={(top + FLOOR) / 2 - 36} width="28" height="72" fill="var(--plate, #f3f3ef)" />
      <text transform={`translate(${x + 6} ${(top + FLOOR) / 2}) rotate(-90)`} textAnchor="middle">{dims.heightCm} cm</text>
      <path d={`M${left} ${FLOOR + 14}V${y + 8}M${right} ${FLOOR + 14}V${y + 8}`} stroke={TICK} strokeWidth=".8" strokeDasharray="3 3" />
      <path d={`M${left} ${y}H${right}M${left + 9} ${y - 5}L${left} ${y}L${left + 9} ${y + 5}M${right - 9} ${y - 5}L${right} ${y}L${right - 9} ${y + 5}`} stroke={TICK} strokeWidth="1.2" fill="none" />
      <rect x={(left + right) / 2 - 48} y={y - 12} width="96" height="24" fill="var(--plate, #f3f3ef)" />
      <text x={(left + right) / 2} y={y + 6} textAnchor="middle">Ø {dims.widthCm} cm</text>
    </g>
  );
}
