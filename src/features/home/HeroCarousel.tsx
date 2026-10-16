"use client";
import { brand } from "@/config/brand";
import type { HeroPick } from "@/demo/engine/home";
import { useAddFlow } from "../cart/useAddFlow";
import { useThemeCoupon } from "../themes/useThemeCoupon";
import { HeroLanes } from "./HeroLanes";
import { HeroSlide, type HeroCampaign } from "./HeroSlide";
import { useHeroAction } from "./useHeroAction";
import { useHeroCarousel } from "./useHeroCarousel";
import { useHeroCadete } from "./useHeroCadete";

/**
 * Carrusel de imágenes del inicio: banners a todo el ancho (imagen propia o escena ilustrada) que avanzan solos y,
 * debajo, la franja de carriles. Todas las diapositivas tienen la misma altura: deslizar no mueve la página.
 */
export function HeroCarousel({ picks, campaign, campaignId }: { picks: HeroPick[]; campaign?: HeroCampaign; campaignId?: string }) {
  const { track, index, setIndex, paused, setPaused, setHover, setFocus, reduce, hydrated, auto, go, lap, prepared, prepare } = useHeroCarousel(picks.length);
  const cadete = useHeroCadete();
  const { add, sheet } = useAddFlow(picks[index]?.product);
  const { apply, applied } = useThemeCoupon();
  const onAdd = useHeroAction(add);
  const onCoupon = useHeroAction(apply);
  if (!picks.length) return null;
  const stop = (i: number) => { setPaused(true); go(i); };
  return (
    <section aria-roledescription="carrusel" aria-label={`Destacados de ${brand.name}`} className="relative -mx-4 -mt-6 border-b border-line sm:-mx-6 sm:-mt-10"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { setHover(true); prepare(); } }} onPointerLeave={() => setHover(false)}
      onTouchStart={(e) => { prepare(); if (!(e.target as Element).closest("[data-carousel-playback]")) setPaused(true); }} onFocusCapture={() => { setFocus(true); prepare(); }}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}>
      <h1 className="sr-only">{brand.name} · {brand.descriptor}</h1>
      <div ref={track} data-hero-track aria-live={auto ? "off" : "polite"}
        onScroll={(e) => setIndex(Math.max(0, Math.min(picks.length - 1, Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))))}
        className="no-scrollbar flex items-stretch snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-night">
        {picks.map((p, i) => <div key={p.key} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${picks.length}: ${p.headline}`}
          aria-hidden={i !== index} inert={i !== index} data-theme-banner={p.kind === "campaign" ? campaignId : undefined}
          onClickCapture={() => setPaused(true)} className="relative w-full min-w-0 shrink-0 snap-center">
          <HeroSlide pick={p} campaign={p.kind === "campaign" ? campaign : undefined} deferred={!prepared && i !== index}
            cadete={cadete} onAdd={onAdd} onCoupon={onCoupon} applied={applied} />
        </div>)}
      </div>
      {picks.length > 1 && <HeroLanes labels={picks.map((p) => (p.kind === "campaign" ? `Campaña · ${campaign?.name ?? ""}` : p.product.name))}
        index={index} running={auto} reduce={reduce} paused={paused} ready={hydrated} onPick={stop} onStep={(d) => stop(index + d)}
        onToggle={() => setPaused((value) => !value)} onLap={lap} />}
      {sheet}
    </section>
  );
}
