"use client";
import type { SeasonalTheme } from "@/demo/types";
import { useCampaignWindow, type CampaignPhase } from "./useCampaignWindow";
import { WaitingRoom } from "./WaitingRoom";

/** La sala de espera con su propio reloj (real, o simulado con `phase` en la vista previa). */
export function WaitingLead({ theme, phase = null, variant = "slide" }: { theme: SeasonalTheme; phase?: CampaignPhase | null; variant?: "slide" | "page" }) {
  const { win, offset, refresh } = useCampaignWindow(theme, phase);
  return <WaitingRoom theme={theme} win={win} offset={offset} onDone={refresh} variant={variant} />;
}
