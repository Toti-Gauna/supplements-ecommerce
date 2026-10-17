import type { SeasonalTheme } from "@/demo/types";

/**
 * Textos de la campaña según el tipo de fecha. Las comerciales hablan de "drop" (y pueden hablar de regalar); los
 * días del deporte hablan de entrenar y equiparse, nunca de regalar.
 */
export interface CampaignCopy {
  /** Rótulo del escenario: "Drop", "Día del deporte". */
  kind: string;
  /** Botón que lleva a los productos de la campaña. */
  cta: string;
  /** Rótulo del descuento en el marcador. */
  discount: string;
  /** Lo que viene, en la sala de espera. */
  coming: string;
  /** Texto del aviso simulado. */
  notify: string;
}

const COMMERCIAL: CampaignCopy = { kind: "Drop", cta: "Ver el drop", discount: "Descuento del drop", coming: "Lo que entra al drop", notify: "Avisame cuando abra" };
const SPORT: CampaignCopy = { kind: "Día del deporte", cta: "Ver el equipo del día", discount: "Para entrenar", coming: "Lo que vas a necesitar", notify: "Avisame cuando arranque" };

export function campaignCopy(theme: Pick<SeasonalTheme, "sport">): CampaignCopy {
  return theme.sport ? SPORT : COMMERCIAL;
}
