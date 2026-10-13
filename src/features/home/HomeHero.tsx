"use client";
import { ArrowDown, ArrowRight, Check, Plus, Ticket } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { productHref } from "@/demo/engine/catalog";
import { heroPicks } from "@/demo/engine/home";
import { rackFacts } from "@/demo/engine/rack";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { useAddFlow } from "../cart/useAddFlow";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { useThemeCoupon } from "../themes/useThemeCoupon";
import { HeroMarkers } from "./HeroMarkers";
import { HeroStage } from "./HeroStage";
import { useHeroCadete } from "./useHeroCadete";

/**
 * Hero del inicio (R1): la campaña vigente (si hay) o el producto estrella en el rack, con su marcador de datos. Los
 * destacados del panel (Contenido → Hero) se eligen como en un marcador; nada avanza solo, así la campaña no rota.
 */
export function HomeHero() {
  const features = useDemoData((d) => d.content.hero);
  const { theme, offer } = useCurrentTheme();
  const picks = heroPicks(features, theme);
  const [chosen, setChosen] = useState<string | null>(null);
  const pick = picks.find((p) => p.key === chosen) ?? picks[0];
  const { add, sheet } = useAddFlow(pick?.product);
  const { apply, applied } = useThemeCoupon();
  const cadete = useHeroCadete();
  if (!pick) return null;
  const facts = rackFacts(pick.product);
  const isCampaign = pick.kind === "campaign" && theme;
  const code = isCampaign ? offer?.coupon.code : undefined;
  return (
    <section aria-label={isCampaign ? `Campaña ${theme.name}` : "Destacado del box"} data-theme-banner={isCampaign ? theme.id : undefined}
      className="relative -mx-4 -mt-6 border-b border-line sm:-mx-6 sm:-mt-10">
      <HeroStage pick={pick} facts={facts} cadete={cadete} motion={chosen ? "flip" : "power"}
        campaign={isCampaign ? { name: theme.name, offer: offer ? { label: offer.label, code: offer.coupon.code, condition: offer.condition } : undefined } : undefined}
        markers={picks.length > 1 ? <HeroMarkers picks={picks} current={pick.key} onPick={setChosen} /> : undefined}
        actions={
          <>
            <Button size="lg" onClick={add} disabled={facts.state === "out"} aria-label={`Agregar ${pick.product.name} al carrito`}>
              <Plus size={18} aria-hidden="true" />Agregar · {formatARS(facts.price)}
            </Button>
            {code ? (
              <Button size="lg" variant="secondary" onClick={() => apply(code)} disabled={applied === code}>
                {applied === code ? <><Check size={18} aria-hidden="true" />Cupón en tu carrito</> : <><Ticket size={18} aria-hidden="true" />Usar {code}</>}
              </Button>
            ) : (
              <ButtonLink size="lg" variant="secondary" href={productHref(pick.product.slug)}>Ver ficha <ArrowRight size={18} aria-hidden="true" /></ButtonLink>
            )}
            {isCampaign && <ButtonLink size="lg" variant="ghost" href="#ofertas-tematicas" className="max-sm:hidden">Ver ofertas <ArrowDown size={18} aria-hidden="true" /></ButtonLink>}
          </>
        } />
      {sheet}
    </section>
  );
}
