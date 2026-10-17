import type { Metadata } from "next";
import { CampaignPage } from "@/features/campaigns/CampaignPage";

export const metadata: Metadata = { title: "Campañas", description: "Las campañas del año: drops, salas de espera y días del deporte." };

/** Página de una campaña (`?id=`) o el calendario. Estática: la campaña se lee de la URL en el navegador. */
export default function CampaignRoute() {
  return <CampaignPage />;
}
