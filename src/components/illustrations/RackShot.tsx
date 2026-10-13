import type { ArtKey } from "@/demo/types";
import { cn } from "@/lib/cn";
import { CONTAINERS, FRAME_SCALE, defaultPack, type PackStyle } from "./supplements";

export interface RackItem {
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
}

interface RackShotProps {
  /** Uno (hero, tarjeta) o hasta tres envases (estante de una categoría), de izquierda a derecha. */
  items: RackItem[];
  /** Texto alternativo; se le suma "(imagen ilustrativa)". Vacío: decorativo. */
  label: string;
  /** Parantes del rack a los costados (hero); en la tarjeta y el estante va solo el estante. */
  uprights?: boolean;
  /** Reflector con la luz que se prende (solo el hero; CSS, quieto con "reducir movimiento"). */
  lightUp?: boolean;
  className?: string;
}

/** Agujeros del parante, cada 22 unidades, como un rack de sentadillas. */
function Upright({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="0" width="22" height="400" fill="url(#rk-steel)" />
      <rect x={x} y="0" width="1.5" height="400" fill="#fff" opacity=".14" />
      {Array.from({ length: 17 }, (_, i) => <rect key={i} x={x + 7} y={14 + i * 22} width="8" height="10" rx="1" className="rk-hole" />)}
    </g>
  );
}

/** Dónde va cada envase según cuántos hay en el estante. */
const SLOTS: Record<number, { x: number; s: number }[]> = {
  1: [{ x: 200, s: 1 }],
  2: [{ x: 140, s: 0.7 }, { x: 260, s: 0.7 }],
  3: [{ x: 92, s: 0.56 }, { x: 200, s: 0.6 }, { x: 308, s: 0.56 }],
};

/**
 * Envases de la librería SVG de la demo apoyados en el estante de un rack, bajo un reflector: el hero del inicio, la
 * "ficha de rack" y los estantes de categorías. Los degradés (`rk-*`) están una vez por página en `GlobalArtDefs`; los
 * colores del estante salen de `app/rack.css` (acero de noche, mesa de laboratorio de día).
 */
export function RackShot({ items, label, uprights = false, lightUp = false, className }: RackShotProps) {
  const list = items.slice(0, 3);
  const slots = SLOTS[list.length] ?? SLOTS[1]!;
  const base = uprights ? 0.86 : 0.84;
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMax slice" role={label ? "img" : undefined} aria-label={label ? `${label} (imagen ilustrativa)` : undefined}
      aria-hidden={label ? undefined : true} className={cn("rack-shot block h-full w-full", className)}>
      <g aria-hidden="true">
        {uprights && <><Upright x={34} /><Upright x={344} /></>}
        <g className={lightUp ? "rk-spot" : undefined}>
          <path d="M176 10h48l150 330H26Z" fill="url(#rk-cone)" />
          <rect x="178" y="9" width="44" height="2" fill="#fff" opacity=".9" />
          <ellipse cx="200" cy="338" rx="150" ry="22" fill="url(#rk-pool)" />
        </g>
        <ellipse cx="200" cy="336" rx="150" ry="9" fill="#000" opacity=".4" />
        <rect x="170" y="-2" width="60" height="12" fill="url(#rk-steel)" />
      </g>
      {list.map((it, i) => {
        const Container = CONTAINERS[it.art] ?? CONTAINERS.tub;
        const { x, s } = slots[i]!;
        return <g key={i} transform={`translate(${x} 336) scale(${(FRAME_SCALE[it.art] ?? 1) * base * s}) translate(-200 -330)`}><Container pack={it.pack ?? defaultPack(it.art)} tint={it.tint ?? "#8b72ff"} /></g>;
      })}
      <g aria-hidden="true">
        <rect x="14" y="336" width="372" height="16" fill="url(#rk-shelf)" />
        <rect x="14" y="336" width="372" height="1.5" fill="#fff" opacity=".35" />
        <rect x="14" y="352" width="372" height="48" className="rk-base" />
        <rect x="14" y="352" width="372" height="2" className="rk-glow" />
        <circle cx="30" cy="344" r="3" className="rk-hole" /><circle cx="370" cy="344" r="3" className="rk-hole" />
      </g>
    </svg>
  );
}

/** Degradés del rack, una vez por página (van en `GlobalArtDefs`). */
export function RackDefs() {
  return (
    <defs>
      <linearGradient id="rk-steel" x1="0" x2="1"><stop offset="0" stopColor="#2b3035" /><stop offset=".5" stopColor="#4a5056" /><stop offset="1" stopColor="#1d2125" /></linearGradient>
      <linearGradient id="rk-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f0ea" stopOpacity=".3" /><stop offset="1" stopColor="#f2f0ea" stopOpacity=".02" /></linearGradient>
      <radialGradient id="rk-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#f2f0ea" stopOpacity=".2" /><stop offset="1" stopColor="#f2f0ea" stopOpacity="0" /></radialGradient>
      <linearGradient id="rk-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a6168" /><stop offset=".25" stopColor="#30353a" /><stop offset="1" stopColor="#15171a" /></linearGradient>
    </defs>
  );
}
