"use client";
import { ArrowRight, Check, Plus, Ticket } from "lucide-react";
import { memo } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { productHref } from "@/demo/engine/catalog";
import type { HeroPick } from "@/demo/engine/home";
import { rackFacts } from "@/demo/engine/rack";
import { formatARS } from "@/lib/money";
import { HeroStage, type HeroCampaign } from "./HeroStage";

interface Props {
  pick: HeroPick;
  campaign?: HeroCampaign;
  preview?: boolean;
  deferred?: boolean;
  cadete: { when: string; date: string };
  onAdd?: () => void;
  onCoupon?: (code: string) => void;
  applied?: string | null;
}

/** La misma escena del editor, con compra nativa y el cupón de campaña cuando corresponde. */
export const HeroSlide = memo(function HeroSlide({ pick, campaign, preview = false, deferred = false, cadete, onAdd, onCoupon, applied }: Props) {
  const facts = rackFacts(pick.product);
  const code = campaign?.offer?.code;
  return <>
    <HeroStage pick={pick} facts={facts} cadete={cadete} campaign={campaign} deferred={deferred} headingLevel={preview ? "p" : "h2"} motion="none" actions={<>
      <Button size="lg" onClick={onAdd} disabled={facts.state === "out"} aria-label={`Agregar ${pick.product.name} al carrito`}>
        <Plus size={18} aria-hidden="true" />Agregar · {formatARS(facts.price)}
      </Button>
      <ButtonLink size="lg" variant="secondary" href={productHref(pick.product.slug)}>Ver ficha <ArrowRight size={18} aria-hidden="true" /></ButtonLink>
      {code && <Button size="lg" variant="secondary" onClick={() => onCoupon?.(code)} disabled={applied === code}>
        {applied === code ? <><Check size={18} aria-hidden="true" />Cupón en tu carrito</> : <><Ticket size={18} aria-hidden="true" />Usar {code}</>}
      </Button>}
    </>} />
  </>;
}, (a, b) => {
  // La rehidratación puede reconstruir la selección sin cambiar los datos de la escena.
  const x = a.pick, y = b.pick;
  return x.key === y.key && x.kind === y.kind && x.product === y.product && x.headline === y.headline
    && x.pitch === y.pitch && x.image === y.image && a.campaign === b.campaign && a.preview === b.preview
    && a.deferred === b.deferred && a.cadete === b.cadete && a.onAdd === b.onAdd
    && a.onCoupon === b.onCoupon && a.applied === b.applied;
});
