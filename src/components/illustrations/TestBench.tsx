import { CONTAINERS, FRAME_SCALE, defaultPack, type PackStyle } from "./supplements";
import type { ArtKey } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Borde del envase en su lienzo de 400 (tapa incluida), para trazar las cotas. Piso del envase en y = 330. */
const BOUNDS: Partial<Record<ArtKey, { top: number; left: number; right: number }>> = {
  tub: { top: 116, left: 106, right: 294 },
  "tub-tall": { top: 66, left: 112, right: 288 },
  jar: { top: 166, left: 137, right: 263 },
  pouch: { top: 100, left: 112, right: 290 },
};

const W = 600;
const H = 520;
const FLOOR = 420;
const CX = 300;
const INK = "var(--color-ink)";

export interface TestBenchProps {
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
  /** Nombre del producto para el texto alternativo. */
  label: string;
  /** Medidas reales del envase (del panel): se dibujan como cotas de plano. */
  dims?: { heightCm: number; widthCm: number };
  className?: string;
}

/** Envase con cotas reales: ¿dibujamos las cotas de este envase? (las tienen los potes, frascos y doypacks). */
export const hasBenchDims = (art: ArtKey, dims?: { heightCm: number; widthCm: number }) => Boolean(BOUNDS[art] && dims && dims.heightCm > 0 && dims.widthCm > 0);

/**
 * El pote en el banco de pruebas del box: parantes de rack, reflector, estante con regla y las cotas del envase con
 * sus medidas reales. Todo en tokens: de noche es acero bajo el reflector; de día ("Tiza"), una mesa de laboratorio.
 * Fondo transparente: la grilla la pone la placa que lo contiene.
 */
export function TestBench({ art, pack, tint = "#8b72ff", label, dims, className }: TestBenchProps) {
  const Container = CONTAINERS[art] ?? CONTAINERS.tub;
  const s = (FRAME_SCALE[art] ?? 1) * 1.12;
  const b = BOUNDS[art];
  const box = b && { top: FLOOR + (b.top - 330) * s, left: CX + (b.left - 200) * s, right: CX + (b.right - 200) * s };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" role="img" aria-label={`${label} (imagen ilustrativa)`} className={cn("block h-full w-full", className)}>
      <defs>
        <linearGradient id="tb-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK} stopOpacity=".16" /><stop offset="1" stopColor={INK} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g aria-hidden="true">
        <Upright x={22} /><Upright x={W - 48} />
        <path d={`M270 6h60l210 ${FLOOR - 6}H60Z`} fill="url(#tb-cone)" />
        <rect x="262" y="0" width="76" height="10" fill={INK} opacity=".55" />
        <ellipse cx={CX} cy={FLOOR} rx="150" ry="10" fill="#000" opacity=".28" />
      </g>
      <g transform={`translate(${CX} ${FLOOR}) scale(${s}) translate(-200 -330)`}><Container pack={pack ?? defaultPack(art)} tint={tint} /></g>
      <Shelf />
      {box && dims && hasBenchDims(art, dims) && <Dimensions {...box} dims={dims} />}
    </svg>
  );
}

function Upright({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="0" width="26" height={FLOOR + 60} fill="var(--color-line)" />
      {Array.from({ length: 19 }, (_, i) => <rect key={i} x={x + 9} y={14 + i * 24} width="8" height="11" rx="1" fill="var(--color-bg)" />)}
    </g>
  );
}

/** Estante del rack con su regla (marca mayor cada 5) y el filo de voltio. */
function Shelf() {
  return (
    <g aria-hidden="true">
      <rect x="12" y={FLOOR} width={W - 24} height="22" fill="var(--color-line)" />
      <rect x="12" y={FLOOR} width={W - 24} height="2" fill="var(--color-volt-ink)" />
      {Array.from({ length: 71 }, (_, i) => {
        const major = i % 5 === 0;
        return <path key={i} d={`M${20 + i * 8} ${FLOOR + 3}v${major ? 10 : 5}`} stroke="var(--color-muted)" strokeWidth={major ? 1.4 : 0.9} />;
      })}
    </g>
  );
}

function Dimensions({ top, left, right, dims }: { top: number; left: number; right: number; dims: { heightCm: number; widthCm: number } }) {
  const x = right + 34;
  const y = FLOOR + 52;
  const mid = (top + FLOOR) / 2;
  return (
    <g aria-hidden="true" fontFamily="var(--font-mono)" fontSize="18" fontWeight="700" fill={INK}>
      <path d={`M${right + 6} ${top}H${x + 8}M${right + 6} ${FLOOR}H${x + 8}`} stroke={INK} strokeWidth=".9" strokeDasharray="3 3" />
      <path d={`M${x} ${top}V${FLOOR}M${x - 5} ${top + 9}L${x} ${top}L${x + 5} ${top + 9}M${x - 5} ${FLOOR - 9}L${x} ${FLOOR}L${x + 5} ${FLOOR - 9}`} stroke={INK} strokeWidth="1.4" fill="none" />
      <rect x={x - 15} y={mid - 40} width="30" height="80" fill="var(--color-surface)" />
      <text transform={`translate(${x + 6} ${mid}) rotate(-90)`} textAnchor="middle">{dims.heightCm} cm</text>
      <path d={`M${left} ${FLOOR + 24}V${y + 8}M${right} ${FLOOR + 24}V${y + 8}`} stroke={INK} strokeWidth=".9" strokeDasharray="3 3" />
      <path d={`M${left} ${y}H${right}M${left + 9} ${y - 5}L${left} ${y}L${left + 9} ${y + 5}M${right - 9} ${y - 5}L${right} ${y}L${right - 9} ${y + 5}`} stroke={INK} strokeWidth="1.4" fill="none" />
      <rect x={(left + right) / 2 - 52} y={y - 13} width="104" height="26" fill="var(--color-surface)" />
      <text x={(left + right) / 2} y={y + 6} textAnchor="middle">Ø {dims.widthCm} cm</text>
    </g>
  );
}
