import { CONTAINERS, FRAME_SCALE, type PackStyle } from "@/components/illustrations/supplements";
import type { ArtKey } from "@/demo/types";
import { cn } from "@/lib/cn";
import s from "./box.module.css";

interface RackShotProps {
  art: ArtKey;
  pack: PackStyle;
  tint?: string;
  /** Nombre del producto para el texto alternativo. */
  label: string;
  /** Parantes del rack a los costados (hero y ficha); en la tarjeta va solo el estante. */
  uprights?: boolean;
  /** Prende el reflector con parpadeo (solo el hero, antes de hidratar: CSS). */
  lightUp?: boolean;
  className?: string;
}

/** Agujeros del parante, cada 22 unidades, como un rack de sentadillas. */
function Upright({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="0" width="22" height="400" fill="url(#bxA-steel)" />
      <rect x={x} y="0" width="1.5" height="400" fill="#fff" opacity=".14" />
      {Array.from({ length: 17 }, (_, i) => <rect key={i} x={x + 7} y={14 + i * 22} width="8" height="10" rx="1" fill="#07080a" />)}
    </g>
  );
}

/**
 * El envase SVG de la demo (misma librería que `ProductArt`) apoyado en el estante de un rack, bajo un reflector.
 * Los degradés de los envases son los globales de la página (`GlobalArtDefs`).
 */
export function RackShot({ art, pack, tint = "#8b72ff", label, uprights = true, lightUp = false, className }: RackShotProps) {
  const Container = CONTAINERS[art] ?? CONTAINERS.tub;
  const scale = (FRAME_SCALE[art] ?? 1) * (uprights ? 0.86 : 0.84);
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMax slice" role="img" aria-label={`${label} (imagen ilustrativa)`} className={cn("block h-full w-full", className)}>
      <defs>
        <linearGradient id="bxA-steel" x1="0" x2="1">
          <stop offset="0" stopColor="#2b3035" /><stop offset=".5" stopColor="#4a5056" /><stop offset="1" stopColor="#1d2125" />
        </linearGradient>
        <linearGradient id="bxA-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f0ea" stopOpacity=".3" /><stop offset="1" stopColor="#f2f0ea" stopOpacity=".02" />
        </linearGradient>
        <radialGradient id="bxA-pool" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#f2f0ea" stopOpacity=".2" /><stop offset="1" stopColor="#f2f0ea" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bxA-shelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a6168" /><stop offset=".25" stopColor="#30353a" /><stop offset="1" stopColor="#15171a" />
        </linearGradient>
      </defs>
      <g aria-hidden="true">
        {uprights && <><Upright x={34} /><Upright x={344} /></>}
        <g className={lightUp ? s.spot : undefined}>
          <path d="M176 10h48l150 330H26Z" fill="url(#bxA-cone)" />
          <rect x="178" y="9" width="44" height="2" fill="#fff" opacity=".9" />
          <ellipse cx="200" cy="338" rx="150" ry="22" fill="url(#bxA-pool)" />
        </g>
        <ellipse cx="200" cy="336" rx="96" ry="9" fill="#000" opacity=".55" />
        {/* Reflector: la carcasa siempre; la luz se prende. */}
        <rect x="170" y="-2" width="60" height="12" fill="url(#bxA-steel)" />
      </g>
      <g transform={`translate(200 336) scale(${scale}) translate(-200 -330)`}><Container pack={pack} tint={tint} /></g>
      <g aria-hidden="true">
        <rect x="14" y="336" width="372" height="16" fill="url(#bxA-shelf)" />
        <rect x="14" y="336" width="372" height="1.5" fill="#fff" opacity=".35" />
        <rect x="14" y="352" width="372" height="48" fill="#0d0e10" />
        <rect x="14" y="352" width="372" height="2" fill="#c8ff2e" className={s.glow} />
        <circle cx="30" cy="344" r="3" fill="#15171a" /><circle cx="370" cy="344" r="3" fill="#15171a" />
      </g>
    </svg>
  );
}
