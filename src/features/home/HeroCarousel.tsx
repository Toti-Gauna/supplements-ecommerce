"use client";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import type { HeroPick } from "@/demo/engine/home";
import { useAddFlow } from "../cart/useAddFlow";
import { HeroLanes } from "./HeroLanes";
import { HeroSlide } from "./HeroSlide";
import { useHeroAction } from "./useHeroAction";
import { useHeroCarousel } from "./useHeroCarousel";
import { useHeroCadete } from "./useHeroCadete";

/** Primera diapositiva propia (R3a): el drop de la campaña vigente o la sala de espera de la que viene. */
export interface HeroLead {
  key: string;
  /** Rótulo del carril ("Campaña · Black Friday"). */
  label: string;
  /** Lectura de la diapositiva (el titular). */
  headline: string;
  /** Marcas para la temática (`data-theme-banner`) o la sala de espera (`data-waiting-slide`). */
  banner?: string;
  waiting?: string;
  node: ReactNode;
}

/**
 * Carrusel de imágenes del inicio: banners a todo el ancho (imagen propia o escena ilustrada) que avanzan solos y,
 * debajo, la franja de carriles. Todas las diapositivas tienen la misma altura: deslizar no mueve la página. Con una
 * campaña, la primera es su drop (o la sala de espera) y dura el doble.
 */
export function HeroCarousel({ picks, lead }: { picks: HeroPick[]; lead?: HeroLead }) {
  const total = picks.length + (lead ? 1 : 0);
  const { track, index, setIndex, paused, setPaused, setHover, setFocus, reduce, hydrated, auto, go, lap, prepared, prepare } = useHeroCarousel(total);
  const cadete = useHeroCadete();
  const at = lead ? index - 1 : index;
  const { add, sheet } = useAddFlow(picks[at]?.product);
  const onAdd = useHeroAction(add);
  if (!total) return null;
  const stop = (i: number) => { setPaused(true); go(i); };
  const slides = [
    ...(lead ? [{ key: lead.key, headline: lead.headline, label: lead.label, banner: lead.banner, waiting: lead.waiting, node: lead.node }] : []),
    ...picks.map((p) => ({ key: p.key, headline: p.headline, label: p.product.name, banner: undefined, waiting: undefined, node: null as ReactNode, pick: p })),
  ];
  return (
    <section aria-roledescription="carrusel" aria-label={`Destacados de ${brand.name}`} className="relative -mx-4 -mt-6 border-b border-line sm:-mx-6 sm:-mt-10"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { setHover(true); prepare(); } }} onPointerLeave={() => setHover(false)}
      onTouchStart={(e) => { prepare(); if (!(e.target as Element).closest("[data-carousel-playback]")) setPaused(true); }} onFocusCapture={() => { setFocus(true); prepare(); }}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}>
      <h1 className="sr-only">{brand.name} · {brand.descriptor}</h1>
      <div ref={track} data-hero-track aria-live={auto ? "off" : "polite"}
        onScroll={(e) => setIndex(Math.max(0, Math.min(total - 1, Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))))}
        className="no-scrollbar flex items-stretch snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-night">
        {slides.map((sl, i) => <div key={sl.key} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${total}: ${sl.headline}`}
          aria-hidden={i !== index} inert={i !== index} data-theme-banner={sl.banner} data-waiting-slide={sl.waiting}
          onClickCapture={() => setPaused(true)} className="relative w-full min-w-0 shrink-0 snap-center">
          {"pick" in sl && sl.pick ? <HeroSlide pick={sl.pick} deferred={!prepared && i !== index} cadete={cadete} onAdd={onAdd} /> : sl.node}
        </div>)}
      </div>
      {total > 1 && <HeroLanes labels={slides.map((sl) => sl.label)} long={lead ? 0 : undefined}
        index={index} running={auto} reduce={reduce} paused={paused} ready={hydrated} onPick={stop} onStep={(d) => stop(index + d)}
        onToggle={() => setPaused((value) => !value)} onLap={lap} />}
      {sheet}
    </section>
  );
}
