import type { ComponentType } from "react";
import { AnoNuevo } from "./ano-nuevo";
import { CAMPAIGN_ART_B } from "./b-index";
import { BlackFriday } from "./black-friday";
import { CyberMonday } from "./cyber-monday";
import { DiaDeLaMadre } from "./dia-de-la-madre";
import { Fallback } from "./fallback";
import { Halloween } from "./halloween";
import { HotSale } from "./hot-sale";
import { Navidad } from "./navidad";
import { SanValentin } from "./san-valentin";
import { VueltaAlGym } from "./vuelta-al-gym";
import type { SeasonId } from "@/demo/types";
import { cn } from "@/lib/cn";

/**
 * Key visual de cada campaña (R3a): una escena 4:5 (lienzo 800 × 1000) con luz de estudio, siluetas sin cara y los
 * productos de la fecha, que funciona recortada como post sin texto de la interfaz encima. Cada escena vive en su
 * archivo y dibuja adentro del `<svg>` común (`stage.tsx` trae el escenario; `props.tsx`, la utilería).
 * Las escenas de la parte B (Día del Padre, del Amigo, Operación verano y los días del deporte) traen su propio
 * `<svg>` con el mismo lienzo: se dibujan tal cual, con su `className`.
 */
export const CAMPAIGN_ART: Partial<Record<SeasonId, ComponentType>> = {
  "black-friday": BlackFriday,
  "hot-sale": HotSale,
  "vuelta-al-gym": VueltaAlGym,
  navidad: Navidad,
  "cyber-monday": CyberMonday,
  "ano-nuevo": AnoNuevo,
  "san-valentin": SanValentin,
  "dia-de-la-madre": DiaDeLaMadre,
  halloween: Halloween,
};

export function CampaignArt({ id, className }: { id: SeasonId; className?: string }) {
  const Full = CAMPAIGN_ART_B[id];
  if (Full) return <Full className={className} />;
  const Scene = CAMPAIGN_ART[id] ?? Fallback;
  return (
    <svg viewBox="0 0 800 1000" aria-hidden="true" focusable="false" data-campaign={id} className={cn("block", className)}>
      <Scene />
    </svg>
  );
}
