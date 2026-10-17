"use client";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { dropDiscount } from "@/demo/engine/campaign-drop";
import { themeProducts, type ThemeOffer } from "@/demo/engine/themes";
import type { SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDayRange } from "@/lib/date";
import { seasonAccentVariables } from "../themes/palettes";
import { AccessTicket } from "./AccessTicket";
import { campaignCopy } from "./copy";
import { Countdown } from "./Countdown";
import { DropDiscount } from "./DropDiscount";
import { DropStage } from "./DropStage";
import { useCampaignWindow, type CampaignPhase } from "./useCampaignWindow";
import s from "./campaign.module.css";

interface CampaignDropProps {
  theme: SeasonalTheme;
  offer: ThemeOffer | null;
  /** Vista previa: simula estar en la campaña (cuenta regresiva desde su primer día). */
  phase: CampaignPhase | null;
  /** "slide": diapositiva del carrusel (misma altura que las otras); "page": hero de /campana/ (titular h1). */
  variant?: "slide" | "page";
}

/**
 * Hero "Drop" de una campaña (R3a, plan §6): el escenario con el key visual y el rack con los productos reales, el
 * titular de póster en itálica, el descuento como número de marcador, la cuenta regresiva al cierre y el cupón como
 * ticket de acceso. De noche en los dos modos; la fecha pone solo la luz (sus variables van en el propio escenario,
 * así /campana/ muestra cualquier fecha con su color sin cambiar la tienda).
 */
export function CampaignDrop({ theme, offer, phase, variant = "slide" }: CampaignDropProps) {
  const { win, offset, refresh } = useCampaignWindow(theme, phase);
  const copy = campaignCopy(theme);
  const page = variant === "page";
  const Heading = page ? "h1" : "h2";
  const words = theme.headline.trim().split(/\s+/);
  const discount = offer ? dropDiscount(offer.coupon) : null;
  return (
    <div data-campaign-drop={theme.id} style={seasonAccentVariables(theme.id) as CSSProperties}
      className={cn(s.stage, "led-dark relative isolate overflow-hidden bg-night text-on-night", page ? cn(s.cut, "min-h-[38rem] pb-[4vw] lg:min-h-[40rem]") : "h-[30rem] sm:h-[32rem] lg:h-[36rem]")}>
      <DropStage id={theme.id} products={themeProducts(theme)} />
      <div aria-hidden="true" className="hero-shade pointer-events-none absolute inset-0" />
      <div className={cn("relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-5 sm:px-6 sm:pb-7 lg:justify-center lg:pb-0", page && "min-h-[inherit] pt-48 sm:pt-56 lg:pt-10")}>
        <div className="max-w-xl lg:max-w-[38rem]">
          <p className={cn(s.mono, "flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-night-muted")}>
            <span className="bg-(--season-accent) px-1.5 py-0.5 text-(--season-accent-ink)">{copy.kind}</span>
            <span>{theme.name}</span>
            <span aria-hidden="true" className="max-sm:hidden">·</span>
            <span className="max-sm:hidden">{formatDayRange(theme.startsOn, theme.endsOn)}</span>
          </p>
          <Heading className={cn(s.display, s.squeeze, "mt-2 text-[clamp(2.3rem,9.6vw,3.3rem)] [overflow-wrap:anywhere] sm:text-6xl lg:mt-3 lg:text-[5.6rem]")}>
            {words.slice(0, -1).join(" ")}{words.length > 1 ? " " : ""}
            <span className="text-(--season-accent) [text-shadow:0_0_36px_var(--season-glow)]">{words.at(-1)}</span>
          </Heading>
          <p className={cn("mt-2 max-w-[46ch] text-sm text-night-muted sm:text-base lg:mt-3", page ? "lg:text-lg" : "line-clamp-2 max-sm:hidden")}>{theme.subtitle}</p>
          <div className={cn(s.rise, "mt-3 flex items-end gap-x-4 gap-y-3 sm:gap-x-6 lg:mt-5")}>
            <DropDiscount discount={discount} caption={copy.discount} />
            {win.state === "live" && win.target !== null ? (
              <Countdown target={win.target} offset={offset} label="Termina en" onDone={refresh} />
            ) : (
              <p className={cn(s.mono, "pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-night-muted")}>{formatDayRange(theme.startsOn, theme.endsOn)}</p>
            )}
          </div>
          <div className={cn(s.rise, "mt-3 flex flex-col gap-2 sm:flex-row sm:items-center lg:mt-5")}>
            {offer && <AccessTicket theme={theme} condition={offer.condition} />}
            <ButtonLink href={page ? "#ofertas-tematicas" : "/#ofertas-tematicas"} variant="dark" className={cn("shrink-0", !page && "max-sm:hidden")}>{copy.cta} <ArrowRight size={18} aria-hidden="true" /></ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
