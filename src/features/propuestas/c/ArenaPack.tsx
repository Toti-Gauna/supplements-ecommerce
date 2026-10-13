import { CONTAINERS, FRAME_SCALE, defaultPack } from "@/components/illustrations/supplements";
import type { Product } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Degradés de la escena ARENA, una sola vez por página (mismo criterio que `GlobalArtDefs`). */
export function ArenaDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <radialGradient id="ar-pool" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".06" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ar-back" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#8b72ff" stopOpacity=".55" />
          <stop offset=".6" stopColor="#8b72ff" stopOpacity=".12" />
          <stop offset="1" stopColor="#8b72ff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

interface ArenaPackProps {
  product: Pick<Product, "art" | "pack" | "name">;
  tint?: string;
  className?: string;
  /** Contraluz plasma detrás del envase. */
  backlight?: boolean;
}

const at = (s: number) => `translate(200 330) scale(${s}) translate(-200 -330)`;

/**
 * El envase SVG de la librería, sin pedestal: parado en el piso del escenario con su charco de luz, contraluz plasma y
 * filo de luz a los costados (plasma a la izquierda, voltio a la derecha). Ocupa el tamaño que le da `className`.
 */
export function ArenaPack({ product, tint = "#8b72ff", className, backlight = true }: ArenaPackProps) {
  const Container = CONTAINERS[product.art] ?? CONTAINERS.tub;
  const s = FRAME_SCALE[product.art] ?? 1;
  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 400 400" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        {backlight && <ellipse cx="200" cy="190" rx="190" ry="170" fill="url(#ar-back)" />}
        <ellipse cx="200" cy="334" rx="190" ry="26" fill="url(#ar-pool)" />
        <ellipse cx="200" cy="332" rx="120" ry="9" fill="#000" opacity=".7" />
      </svg>
      {/* Filo de luz: plasma a la izquierda y voltio a la derecha, siguiendo la silueta del envase. */}
      <svg viewBox="0 0 400 400" role="img" aria-label={`${product.name} (imagen ilustrativa)`} className="relative block h-full w-full overflow-visible [filter:drop-shadow(-5px_0_9px_rgb(139_114_255/0.65))_drop-shadow(5px_-2px_10px_rgb(200_255_46/0.28))]">
        <g transform={at(s)}>
          <Container pack={product.pack ?? defaultPack(product.art)} tint={tint} />
        </g>
      </svg>
    </div>
  );
}
