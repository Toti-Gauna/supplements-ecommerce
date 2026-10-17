"use client";
import { useMemo } from "react";
import { shopNow } from "@/demo/clock";
import { campaignAgenda } from "@/demo/engine/campaign-window";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { useEffectivePreview } from "@/stores/themePreview";

/**
 * El calendario de campañas visto desde la tienda, solo en modo automático y sin vista previa (con el modo "off" o
 * con una temática fija o probada no hay "próxima campaña" ni sala de espera). Antes de hidratar, nada.
 */
export function useCampaignAgenda() {
  const hydrated = useHydrated();
  const preview = useEffectivePreview();
  const themes = useDemoData((d) => d.themes);
  const mode = useDemoData((d) => d.themeSettings.mode);
  return useMemo(() => {
    if (!hydrated || preview !== null || mode !== "auto") return null;
    const agenda = campaignAgenda(themes, shopNow());
    const waiting = agenda.next?.window.state === "waiting" ? agenda.next : null;
    return { ...agenda, waiting };
  }, [hydrated, preview, mode, themes]);
}
