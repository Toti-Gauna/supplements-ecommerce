"use client";
import { useAdmin } from "@/stores/admin";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { ThemeMode } from "../themes/ThemeMode";
import { CampaignCalendar } from "./CampaignCalendar";
import { CampaignResultsTable } from "./CampaignResultsTable";
import { NextCampaignCard } from "./NextCampaignCard";

/**
 * Panel → Campañas (R3, antes "Temáticas"): las fechas comerciales y los días del deporte en un calendario anual, cómo
 * elige la tienda cuál mostrar, la próxima campaña y los resultados de cada cupón. Cada campaña abre su editor.
 */
export function CampaignsAdmin() {
  const themes = useAdmin((s) => s.data.themes);
  const sport = themes.filter((t) => t.sport).length;
  return (
    <>
      <SubpageHeader title="Campañas"
        intro={`${themes.length - sport} fechas comerciales y ${sport} días del deporte, cada una con su key visual, titular, cupón, productos y piezas para Instagram. Tocá una campaña del calendario para editarla.`} />
      <NextCampaignCard className="mb-6" />
      <ThemeMode />
      <CampaignCalendar themes={themes} />
      <CampaignResultsTable />
    </>
  );
}
