import type { GameItemKind } from "@/demo/fixtures/game";
import { cn } from "@/lib/cn";
import { ART, SHAKER_ART, SPRITES, liquidPath, type Layer } from "./sprites";

/** Capas de `sprites.ts` en SVG: el mismo dibujo que el canvas (leyenda, tarjeta y escena del juego). */
export function Layers({ layers }: { layers: Layer[] }) {
  return (
    <>
      {layers.map((l, i) => (
        <path key={i} d={l.d} fill={l.fill ?? "none"} fillRule={l.evenodd ? "evenodd" : undefined} stroke={l.stroke} strokeWidth={l.width}
          strokeLinecap={l.stroke ? "round" : undefined} strokeLinejoin={l.stroke ? "round" : undefined} opacity={l.alpha} />
      ))}
    </>
  );
}

/** Un objeto del juego suelto (lienzo de radio 24). Decorativo: el texto de al lado dice qué es. */
export function GameGlyph({ kind, className }: { kind: GameItemKind; className?: string }) {
  return (
    <svg viewBox="-24 -24 48 48" aria-hidden="true" className={cn("h-10 w-10 shrink-0", className)}>
      <Layers layers={SPRITES[kind]} />
    </svg>
  );
}

/** El shaker del jugador con el batido a `level` (0 a 1). Origen en la boca, como en el canvas. */
export function ShakerArt({ level = 0.5 }: { level?: number }) {
  const liquid = liquidPath(level);
  return (
    <g>
      <path d={SHAKER_ART.cup} fill="#dfe6ee" opacity=".12" />
      <path d={liquid} fill={ART.plasma} />
      <path d={liquid.split("L")[0]} stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" />
      <path d={SHAKER_ART.ticks} stroke="#eef1f5" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" />
      <path d={SHAKER_ART.mark} fill="#fff" opacity=".7" transform="translate(4 44)" />
      <path d={SHAKER_ART.cup} fill="none" stroke="#eef1f5" strokeOpacity=".6" strokeWidth="2" />
      <path d={SHAKER_ART.shine} stroke="#fff" strokeOpacity=".28" strokeWidth="4" strokeLinecap="round" />
      <path d={SHAKER_ART.rim} stroke={ART.volt} strokeWidth="2.6" strokeLinecap="round" />
      <path d={SHAKER_ART.ring} fill="#1a1f28" />
      <path d="M-36-6.5h72" stroke={ART.volt} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}
