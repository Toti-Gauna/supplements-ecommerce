"use client";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { brand } from "@/config/brand";
import type { HeroPick } from "@/demo/engine/home";
import { cn } from "@/lib/cn";
import { useAddFlow } from "../cart/useAddFlow";
import { useThemeCoupon } from "../themes/useThemeCoupon";
import { HeroSlide } from "./HeroSlide";
import type { HeroCampaign } from "./HeroStage";
import { useHeroCarousel } from "./useHeroCarousel";
import { useHeroCadete } from "./useHeroCadete";

const CONTROL = "plate grid size-11 shrink-0 place-items-center rounded-sm border border-line text-ink hover:bg-accent disabled:opacity-50";

/** Placas de acero y marcas de carril; todas las escenas reservan la misma altura, sin saltos al deslizar. */
export function HeroCarousel({ picks, campaign, campaignId }: { picks: HeroPick[]; campaign?: HeroCampaign; campaignId?: string }) {
  const { track, index, setIndex, paused, setPaused, setHover, setFocus, reduce, auto, go, prepared, prepare } = useHeroCarousel(picks.length);
  const cadete = useHeroCadete();
  const { add, sheet } = useAddFlow(picks[index]?.product);
  const { apply, applied } = useThemeCoupon();
  if (!picks.length) return null;
  return (
    <section aria-roledescription="carrusel" aria-label={`Destacados de ${brand.name}`} className="relative -mx-4 -mt-6 border-b border-line sm:-mx-6 sm:-mt-10"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { setHover(true); prepare(); } }} onPointerLeave={() => setHover(false)}
      onTouchStart={(e) => { prepare(); if (!(e.target as Element).closest("[data-carousel-playback]")) setPaused(true); }} onFocusCapture={() => { setFocus(true); prepare(); }}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}>
      <h1 className="sr-only">{brand.name} · {brand.descriptor}</h1>
      {picks.length > 1 && <div className="plate border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div role="group" aria-label="Destacados" className="flex min-w-0 gap-1">
            {picks.map((p, i) => <button key={p.key} type="button" aria-label={`Ir a la diapositiva ${i + 1}: ${p.kind === "campaign" ? "Campaña" : p.product.name}`}
              aria-current={i === index ? "true" : undefined} onClick={() => { setPaused(true); go(i); }}
              className="grid min-h-11 min-w-8 place-items-center px-1 sm:min-w-12">
              <span aria-hidden="true" className={cn("lane h-1.5 w-6 border border-line sm:w-10", i === index ? "bg-primary" : "bg-muted/30")} />
            </button>)}
          </div>
          <div className="flex gap-1">
            <button type="button" data-carousel-playback aria-label={paused || reduce ? "Reproducir carrusel" : "Pausar carrusel"} disabled={reduce}
              title={reduce ? "Reproducción automática desactivada por reducir movimiento" : undefined} onClick={() => setPaused((value) => !value)} className={CONTROL}>
              {paused || reduce ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
            <button type="button" aria-label="Diapositiva anterior" onClick={() => { setPaused(true); go(index - 1); }} className={CONTROL}><ArrowLeft size={18} aria-hidden="true" /></button>
            <button type="button" aria-label="Diapositiva siguiente" onClick={() => { setPaused(true); go(index + 1); }} className={CONTROL}><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
      </div>}
      <div ref={track} data-hero-track aria-live={auto ? "off" : "polite"}
        onScroll={(e) => setIndex(Math.max(0, Math.min(picks.length - 1, Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))))}
        className="no-scrollbar flex items-stretch snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
        {picks.map((p, i) => <div key={p.key} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${picks.length}: ${p.headline}`}
          aria-hidden={i !== index} inert={i !== index} data-theme-banner={p.kind === "campaign" ? campaignId : undefined}
          onClickCapture={() => setPaused(true)}
          className="relative w-full min-w-0 shrink-0 snap-center">
          <HeroSlide pick={p} campaign={p.kind === "campaign" ? campaign : undefined} deferred={!prepared && i !== index}
            cadete={cadete} onAdd={add} onCoupon={apply} applied={applied} />
        </div>)}
      </div>
      {sheet}
    </section>
  );
}
