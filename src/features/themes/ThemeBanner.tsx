"use client";
import { ArrowDown, Check, Ticket } from "lucide-react";
import { VoltaPup } from "@/components/illustrations/characters";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import type { SeasonalTheme } from "@/demo/types";
import type { ThemeOffer } from "@/demo/engine/themes";
import { AMBIENT } from "./ambient";
import { AmbientField } from "./AmbientField";
import { SeasonFx } from "./backdrop/SeasonFx";
import { skinOf } from "./skins";
import { useThemeCoupon } from "./useThemeCoupon";

/** Lugar de cada decoración alrededor de la protagonista (tamaño, posición, giro y retraso de entrada). */
const SPOTS = [
  "right-[3%] top-1/2 h-32 w-32 -translate-y-1/2 sm:right-[11%] sm:h-60 sm:w-60",
  "right-[34%] top-8 h-20 w-20 -rotate-12 max-lg:hidden",
  "right-3 top-4 h-10 w-10 rotate-12 sm:right-[5%] sm:top-8 sm:h-20 sm:w-20",
  "bottom-12 right-[30%] h-16 w-16 rotate-6 max-lg:hidden",
  "bottom-12 right-4 h-9 w-9 -rotate-6 sm:bottom-10 sm:right-[4%] sm:h-16 sm:w-16",
];

/**
 * Banner de temporada: titular, oferta con su código y decoraciones propias de la festividad.
 * Es la primera diapositiva del carrusel del inicio mientras la temática está puesta: el texto arranca después de la
 * franja de las flechas del carrusel (`--hero-safe`).
 */
export function ThemeBanner({ theme, offer }: { theme: SeasonalTheme; offer: ThemeOffer | null }) {
  const skin = skinOf(theme.id);
  const { apply, applied } = useThemeCoupon();
  const code = offer?.coupon.code;
  return (
    <section aria-labelledby="tematica-title" data-theme-banner={theme.id}
      className="relative flex min-h-[19rem] w-full flex-col justify-center overflow-hidden px-5 pb-12 pt-8 text-white sm:min-h-[26rem] sm:py-12 sm:pl-[var(--hero-safe,3rem)] sm:pr-12 lg:pr-16"
      style={{ background: `radial-gradient(120% 140% at 85% 50%, ${skin.to}, ${skin.from} 70%)` }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1.5px)] [background-size:18px_18px]" />
      <SeasonFx id={theme.id} />
      <AmbientField layers={AMBIENT[theme.id]} className="absolute inset-0" />
      {/* Con personajes, la protagonista y la decoración de abajo a la derecha dejan lugar al elenco. */}
      {skin.decor.map((kind, i) => (skin.cast && (i === 0 || i === 4) ? null : (
        <span key={`${kind}-${i}`} aria-hidden="true" className={`animate-fade-up pointer-events-none absolute ${SPOTS[i]}`} style={{ animationDelay: `${120 + i * 110}ms` }}>
          <Decor kind={kind} className="h-full w-full drop-shadow-[0_14px_20px_rgb(0_0_0/0.35)]" />
        </span>
      )))}
      {skin.cast && (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-14 right-[2%] flex items-end sm:bottom-10 sm:right-[7%]">
          {skin.cast.map((c, i) => (
            <span key={i} className={`animate-fade-up block ${c.pup ? "w-[21vw] max-w-36" : "w-[27vw] max-w-56"} ${i ? "-ml-5 sm:-ml-10" : ""}`} style={{ animationDelay: `${150 + i * 140}ms` }}>
              <span className="pup-idle block" style={{ animationDelay: `${-i * 1.3}s` }}>
                <VoltaPup who={c.who} pose={c.pose} outfit={c.outfit} pup={c.pup} flip={c.flip} animated className="pup-brief w-full drop-shadow-[0_14px_20px_rgb(0_0_0/0.35)]" />
              </span>
            </span>
          ))}
        </div>
      )}
      <div className="relative max-w-[62%] sm:max-w-md">
        <p className="eyebrow" style={{ color: skin.accent }}>Temática · {theme.name}</p>
        <h2 id="tematica-title" className="font-display mt-2 text-[1.75rem] leading-[1.04] sm:text-5xl lg:text-6xl">{theme.headline}</h2>
        <p className="mt-2 text-[14px] text-white/85 sm:mt-3 sm:text-lg">{theme.subtitle}</p>
        {offer && (
          <p className="mt-4 inline-flex flex-wrap items-baseline gap-x-2 rounded-2xl bg-black/20 px-3 py-2 text-sm backdrop-blur-sm">
            <strong className="text-xl font-extrabold" style={{ color: skin.accent }}>{offer.label}</strong>
            <span>con <span className="font-mono font-bold tracking-wider">{code}</span></span>
            {offer.condition && <span className="w-full text-xs text-white/75">{offer.condition}</span>}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {code && (
            <button type="button" onClick={() => apply(code)} disabled={applied === code}
              className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-[0_12px_30px_-14px_rgb(0_0_0/0.6)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-90" style={{ background: skin.accent, color: skin.accentInk }}>
              {applied === code ? <><Check size={16} aria-hidden="true" />Cupón en tu carrito</> : <><Ticket size={16} aria-hidden="true" />Usar {code}</>}
            </button>
          )}
          <a href="#ofertas-tematicas" className="max-sm:hidden inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-bold transition-colors hover:bg-white/10">
            Ver ofertas <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
