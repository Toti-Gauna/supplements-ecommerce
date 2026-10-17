"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { heroPicks } from "@/demo/engine/home";
import { useDemoVersion } from "@/stores/admin";
import { NextCampaignStrip } from "../campaigns/NextCampaignStrip";
import { useCampaignAgenda } from "../campaigns/useCampaignAgenda";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { HeroCarousel, type HeroLead } from "./HeroCarousel";

// El drop y la sala de espera se descargan solo si hay campaña (la tienda abre sin temática: el inicio no pesa más).
const Night = () => <div className="h-[30rem] bg-night sm:h-[32rem] lg:h-[36rem]" />;
const CampaignDrop = dynamic(() => import("../campaigns/CampaignDrop").then((m) => m.CampaignDrop), { ssr: false, loading: Night });
const WaitingLead = dynamic(() => import("../campaigns/WaitingLead").then((m) => m.WaitingLead), { ssr: false, loading: Night });

/**
 * Hero del inicio: con una campaña, su drop abre el carrusel (R3a); entre fechas, en modo automático, la franja de la
 * próxima campaña arriba y, la semana antes de una fecha fuerte, su sala de espera como primera diapositiva. Después,
 * los destacados editables de content.hero.
 */
export function HomeHero() {
  const data = useDemoVersion();
  const { theme, offer, previewing } = useCurrentTheme();
  const agenda = useCampaignAgenda();
  const waiting = agenda?.waiting ?? null;
  const picks = useMemo(() => heroPicks(data.content.hero, null), [data]);
  const lead: HeroLead | undefined = theme
    ? { key: `campaign-${theme.id}`, label: `Campaña · ${theme.name}`, headline: theme.headline, banner: theme.id,
      node: <CampaignDrop theme={theme} offer={offer} phase={previewing ? "live" : null} /> }
    : waiting
      ? { key: `waiting-${waiting.theme.id}`, label: `Sala de espera · ${waiting.theme.name}`, headline: `${waiting.theme.name}: sala de espera`, waiting: waiting.theme.id,
        node: <WaitingLead theme={waiting.theme} /> }
      : undefined;
  return (
    <div>
      {/* La franja va pegada al header: el carrusel sube lo mismo que bajó (su margen negativo). */}
      <NextCampaignStrip className="-mx-4 -mt-6 mb-6 sm:-mx-6 sm:-mt-10 sm:mb-10" />
      <HeroCarousel key={`${lead?.key ?? ""}|${picks.map((p) => p.key).join("|")}`} picks={picks} lead={lead} />
    </div>
  );
}
