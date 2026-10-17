import type { ComponentType } from "react";
import { AnoNuevo } from "./ano-nuevo";
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
 * Las fechas con `Fallback` esperan el arte de la parte B del lote.
 */
export const CAMPAIGN_ART: Record<SeasonId, ComponentType> = {
  "black-friday": BlackFriday,
  "hot-sale": HotSale,
  "vuelta-al-gym": VueltaAlGym,
  navidad: Navidad,
  "cyber-monday": CyberMonday,
  "ano-nuevo": AnoNuevo,
  "san-valentin": SanValentin,
  "dia-de-la-madre": DiaDeLaMadre,
  halloween: Halloween,
  "dia-del-padre": Fallback,
  "dia-del-amigo": Fallback,
  "operacion-verano": Fallback,
  "crossfit-open": Fallback,
  "dia-actividad-fisica": Fallback,
  "dia-del-futbolista": Fallback,
  "dia-del-running": Fallback,
  "dia-del-boxeador": Fallback,
};

export function CampaignArt({ id, className }: { id: SeasonId; className?: string }) {
  const Scene = CAMPAIGN_ART[id] ?? Fallback;
  return (
    <svg viewBox="0 0 800 1000" aria-hidden="true" focusable="false" data-campaign={id} className={cn("block", className)}>
      <Scene />
    </svg>
  );
}
