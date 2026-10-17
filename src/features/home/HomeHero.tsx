"use client";
import { useMemo } from "react";
import { heroPicks } from "@/demo/engine/home";
import { useDemoVersion } from "@/stores/admin";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { HeroCarousel } from "./HeroCarousel";

/** La campaña vigente abre el mismo carril que los destacados editables de content.hero. */
export function HomeHero() {
  const data = useDemoVersion();
  const { theme, offer } = useCurrentTheme();
  const picks = useMemo(() => heroPicks(data.content.hero, theme), [data, theme]);
  return <HeroCarousel key={picks.map((p) => p.key).join("|")} picks={picks} campaignId={theme?.id}
    campaign={theme ? { name: theme.name, offer: offer ? { label: offer.label, code: offer.coupon.code, condition: offer.condition } : undefined } : undefined} />;
}
