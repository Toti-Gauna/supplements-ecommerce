"use client";
import { ArrowRight, Check, Plus, Ticket } from "lucide-react";
import { memo } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { LedPrice } from "@/components/atoms/Led";
import { productHref } from "@/demo/engine/catalog";
import type { HeroPick } from "@/demo/engine/home";
import { rackFacts } from "@/demo/engine/rack";
import { formatARS } from "@/lib/money";
import { HeroMedia } from "./HeroMedia";

export interface HeroCampaign {
  name: string;
  /** "20% OFF" o "$5.000 OFF", y su condición si pide un mínimo. */
  offer?: { label: string; code: string; condition: string | null };
}

interface Props {
  pick: HeroPick;
  campaign?: HeroCampaign;
  /** Vista previa del panel: el titular no es un encabezado de la página. */
  preview?: boolean;
  deferred?: boolean;
  /** "mañana" y "mar 6 oct" (calendario y cupo del cadete). */
  cadete: { when: string; date: string };
  onAdd?: () => void;
  onCoupon?: (code: string) => void;
  applied?: string | null;
}

/**
 * Banner del carrusel del inicio (lo usan la tienda y la vista previa del panel): la imagen a sangre y, encima, sobre
 * un degradé de noche, el rótulo, el titular de póster, la bajada, el precio total (el precio por servicio, chico) y
 * la compra. La imagen es oscura en los dos modos, como una foto de campaña; el texto usa los tokens de banda noche.
 */
export const HeroSlide = memo(function HeroSlide({ pick, campaign, preview = false, deferred = false, cadete, onAdd, onCoupon, applied }: Props) {
  const p = pick.product;
  const facts = rackFacts(p);
  const code = campaign?.offer?.code;
  const words = pick.headline.trim().split(/\s+/);
  const Heading = preview ? "p" : "h2";
  return (
    <div className="led-dark relative isolate h-[30rem] overflow-hidden bg-night text-on-night sm:h-[32rem] lg:h-[36rem]">
      <HeroMedia pick={pick} deferred={deferred} />
      <div aria-hidden="true" className="hero-shade pointer-events-none absolute inset-0" />
      <div className="absolute right-4 top-3 z-10 flex flex-col items-end gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-night-muted sm:right-6">
        <p className="plate-night"><span className="text-on-night">Cadete · Llega {cadete.when}</span> · {cadete.date}</p>
        {!pick.image && <p className="pr-0.5">Imagen ilustrativa</p>}
      </div>
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-5 sm:px-6 sm:pb-7 lg:justify-center lg:pb-0">
        <div className="max-w-xl lg:max-w-[34rem]">
          <p className="eyebrow flex items-center gap-2 text-night-muted [text-shadow:0_1px_10px_var(--color-night),0_0_2px_var(--color-night)]">
            <span aria-hidden="true" className="size-2 shrink-0 bg-(--season-accent) shadow-[0_0_10px_var(--season-glow)]" />
            <span className="truncate">{campaign ? `Campaña · ${campaign.name}` : p.brand}</span>
          </p>
          <Heading className="rk-slam font-display mt-2 text-[clamp(2.4rem,9vw,2.9rem)] font-black leading-[0.86] [overflow-wrap:anywhere] sm:text-6xl lg:mt-3 lg:text-[5.4rem]">
            <span>{words.slice(0, -1).join(" ")}</span>{words.length > 1 ? " " : ""}
            <span className="text-volt">{words.at(-1)}</span>
          </Heading>
          <p className="mt-2 line-clamp-1 max-w-[46ch] text-sm text-night-muted sm:line-clamp-2 sm:text-base lg:mt-3 lg:text-lg">
            <span className="font-bold text-on-night">{p.name}</span>{pick.pitch ? ` · ${pick.pitch}` : ""}
          </p>
          <div className="mt-3 flex items-end gap-x-4 sm:gap-x-6 lg:mt-5">
            <div className="min-w-0">
              <LedPrice amount={facts.price} motion="none" tone="volt" className="h-9 sm:h-11 lg:h-12" signClassName="text-3xl lg:text-4xl" />
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-night-muted">
                {facts.perServing ? <>{facts.from ? "Desde " : ""}{formatARS(facts.perServing)} por servicio</> : null}
                <span className={facts.perServing ? "hidden sm:inline" : undefined}>{facts.perServing ? " · " : ""}{facts.lead.size || facts.lead.label}</span>
              </p>
            </div>
            {campaign?.offer && (
              <p className="min-w-0 border-l-2 border-(--season-accent) pl-3">
                <strong className="font-display block text-2xl leading-none lg:text-3xl">{campaign.offer.label}</strong>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.1em]">con <span className="font-bold text-on-night">{campaign.offer.code}</span></span>
                {campaign.offer.condition && <span className="block text-xs text-night-muted">{campaign.offer.condition}</span>}
              </p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:mt-6">
            <Button variant="light" onClick={onAdd} disabled={facts.state === "out"} aria-label={`Agregar ${p.name} al carrito`}>
              <Plus size={18} aria-hidden="true" />Agregar
            </Button>
            <ButtonLink variant="dark" href={productHref(p.slug)}>Ver producto <ArrowRight size={18} aria-hidden="true" /></ButtonLink>
            {code && <Button variant="dark" className="col-span-2" onClick={() => onCoupon?.(code)} disabled={applied === code}>
              {applied === code ? <><Check size={18} aria-hidden="true" />Cupón en tu carrito</> : <><Ticket size={18} aria-hidden="true" />Usar {code}</>}
            </Button>}
          </div>
        </div>
      </div>
    </div>
  );
}, (a, b) => {
  // La rehidratación puede reconstruir la selección sin cambiar los datos de la escena.
  const x = a.pick, y = b.pick;
  return x.key === y.key && x.kind === y.kind && x.product === y.product && x.headline === y.headline
    && x.pitch === y.pitch && x.image === y.image && a.campaign === b.campaign && a.preview === b.preview
    && a.deferred === b.deferred && a.cadete === b.cadete && a.onAdd === b.onAdd
    && a.onCoupon === b.onCoupon && a.applied === b.applied;
});
