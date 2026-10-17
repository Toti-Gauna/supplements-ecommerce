"use client";
import { Bell, BellRing } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/atoms/Button";
import { dayKeyOf, WAITING_DAYS, type CampaignWindow } from "@/demo/engine/campaign-window";
import { themeProducts } from "@/demo/engine/themes";
import type { SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/date";
import { useToasts } from "@/stores/toast";
import { seasonAccentVariables } from "../themes/palettes";
import { campaignCopy } from "./copy";
import { Countdown } from "./Countdown";
import { DropDiscount } from "./DropDiscount";
import { DropStage } from "./DropStage";
import s from "./campaign.module.css";

interface WaitingRoomProps {
  theme: SeasonalTheme;
  win: CampaignWindow;
  offset: number;
  onDone?: () => void;
  variant?: "slide" | "page";
}

/**
 * Sala de espera (R3a): la semana antes de una fecha fuerte (Black Friday, CyberMonday, Hot Sale) la tienda muestra la
 * cuenta regresiva al inicio, lo que entra (sin precios: el rack en penumbra y los nombres) y un "avisame" simulado
 * (en la demo no se envía nada). Fuera de esa semana, la misma pieza anuncia la próxima campaña.
 */
export function WaitingRoom({ theme, win, offset, onDone, variant = "slide" }: WaitingRoomProps) {
  const [asked, setAsked] = useState(false);
  const toast = useToasts((t) => t.push);
  const copy = campaignCopy(theme);
  const page = variant === "page";
  const Heading = page ? "h1" : "h2";
  const opens = formatDay(dayKeyOf(win.startsAt), "long");
  const products = themeProducts(theme);
  const waiting = win.state === "waiting";
  const notify = () => {
    setAsked(true);
    toast({ tone: "success", title: "Te avisamos cuando abra", description: "Aviso simulado: en la demo no se envía nada." });
  };
  return (
    <div data-waiting-room={theme.id} style={seasonAccentVariables(theme.id) as CSSProperties}
      className={cn(s.stage, "led-dark relative isolate overflow-hidden bg-night text-on-night", page ? cn(s.cut, "min-h-[38rem] pb-[4vw]") : "h-[30rem] sm:h-[32rem] lg:h-[36rem]")}>
      <DropStage id={theme.id} products={products} veiled />
      <div aria-hidden="true" className="hero-shade pointer-events-none absolute inset-0" />
      <div className={cn("relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-5 sm:px-6 sm:pb-7 lg:justify-center lg:pb-0", page && "min-h-[inherit] pt-44 sm:pt-52 lg:pt-10")}>
        <div className="max-w-xl lg:max-w-[38rem]">
          <p className={cn(s.mono, "flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-night-muted")}>
            <span className="bg-(--season-accent) px-1.5 py-0.5 text-(--season-accent-ink)">{waiting ? "Sala de espera" : "Próxima campaña"}</span>
            <span>{copy.kind}</span>
          </p>
          <Heading className={cn(s.display, s.squeeze, "mt-2 text-[clamp(2.8rem,12vw,3.6rem)] [overflow-wrap:anywhere] sm:text-7xl lg:text-[6.2rem]")}>
            {theme.name}
          </Heading>
          <p className={cn("mt-2 max-w-[46ch] text-sm text-night-muted sm:text-base", !page && "line-clamp-2")}>
            Abre el {opens} a las 00:00. Los precios se ven recién cuando abre.
            {!waiting && theme.waitingRoom && <> La sala de espera abre {WAITING_DAYS} días antes.</>}
          </p>
          <div className={cn(s.rise, "mt-3 flex flex-wrap items-end gap-x-6 gap-y-3 lg:mt-5")}>
            {win.target !== null && <Countdown target={win.target} offset={offset} label="Abre en" onDone={onDone} ledClassName="h-7! sm:h-9! lg:h-11!" />}
            <DropDiscount discount={null} caption="Descuento" hidden className={cn(!page && "max-sm:hidden")} />
          </div>
          <div className={cn(s.rise, "mt-3 lg:mt-5", !page && "max-sm:hidden")}>
            <p className={cn(s.mono, "text-[10px] font-bold uppercase tracking-[0.18em] text-night-muted")}>{copy.coming}</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {products.map((p) => <li key={p.slug} className={cn(s.mono, "border border-white/20 px-2 py-1 text-[11px] uppercase tracking-[0.08em]")}>{p.name}</li>)}
            </ul>
          </div>
          <div className="mt-4">
            {asked ? (
              <p role="status" className={cn(s.mono, "flex min-h-12 items-center gap-2 border border-(--season-accent) px-4 text-[13px] font-bold uppercase tracking-[0.08em]")}>
                <BellRing size={18} aria-hidden="true" className="text-(--season-accent)" />Listo: te avisamos (simulado)
              </p>
            ) : (
              <Button variant="light" onClick={notify} className={cn(s.rise, "max-sm:w-full")}><Bell size={18} aria-hidden="true" />{copy.notify}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
