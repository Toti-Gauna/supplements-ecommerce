import type { SeasonId } from "@/demo/types";
import { cn } from "@/lib/cn";

/**
 * Key visual de cada campaña (R3a): una escena 4:5 (lienzo 800 × 1000) con luz, siluetas sin cara y producto, que se
 * puede recortar como post sin texto de la interfaz encima. Provisorio: lo reemplaza el arte de cada fecha (misma API).
 */
export function CampaignArt({ id, className }: { id: SeasonId; className?: string }) {
  return (
    <svg viewBox="0 0 800 1000" role="img" aria-label="" aria-hidden="true" focusable="false" data-campaign={id} className={cn("block", className)}>
      <rect width="800" height="1000" fill="currentColor" opacity=".08" />
    </svg>
  );
}
