"use client";
import type { SeasonalTheme } from "@/demo/types";
import { offerPrice, themeProducts, type ThemeOffer } from "@/demo/engine/themes";
import { toCard } from "../catalog/mappers";
import { ProductRail } from "../home/ProductRail";
import { skinOf } from "./skins";

/** Riel "Ofertas de …" del inicio, con el precio con cupón calculado en el engine. */
export function ThemeOffersRail({ theme, offer }: { theme: SeasonalTheme; offer: ThemeOffer | null }) {
  const skin = skinOf(theme.id);
  const cards = themeProducts(theme).map((p) => {
    const card = toCard(p);
    return offer ? { ...card, deal: { price: offerPrice(card.fromPrice, offer), label: offer.label, bg: skin.accent, ink: skin.accentInk } } : card;
  });
  return <ProductRail id="ofertas-tematicas" eyebrow={`Temática ${theme.name}`} title="Ofertas" accent={`de ${theme.name}`} products={cards} />;
}
