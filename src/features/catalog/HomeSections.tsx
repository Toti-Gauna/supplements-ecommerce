"use client";
import type { ReactNode } from "react";
import { boxLeaderboard } from "@/demo/engine/home";
import { recommendForHome } from "@/demo/engine/recommend";
import { useDemoVersion } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { AttributeReviews } from "../home/AttributeReviews";
import { BoxLeaderboard } from "../home/BoxLeaderboard";
import { ClubBand } from "../home/ClubBand";
import { GoalPanels } from "../home/GoalPanels";
import { HomeCategories } from "../home/HomeCategories";
import { HomeHero } from "../home/HomeHero";
import { HomePacks } from "../home/HomePacks";
import { ProductRail } from "../home/ProductRail";
import { OwnerSpot } from "../owner/OwnerSpot";
import { HomeStackBlock } from "../stack/HomeStackBlock";
import { ThemeOffersRail } from "../themes/ThemeOffersRail";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { toCard } from "./mappers";

/** Sección de más abajo: el navegador no la dibuja hasta que se acerca a la pantalla (menos trabajo al cargar y al scrollear). */
function Later({ size, children }: { size: number; children: ReactNode }) {
  return <div className="cv-auto cv-bleed" style={{ containIntrinsicSize: `auto ${size}px` }}>{children}</div>;
}

/**
 * Inicio (L1, pedido de Ignacio): primero lo simple, el carrusel de imágenes, las categorías y lo recomendado (con las
 * ofertas de la fecha, si hay); recién después la experiencia de armar el stack (para qué lo querés y el estante en vivo),
 * la tabla del box, las reseñas y el club. Con el modo dueño (R4c), cada bloque editable lleva su placa al panel.
 */
export function HomeSections() {
  useDemoVersion();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const { theme, offer } = useCurrentTheme();
  const ranking = boxLeaderboard(5);
  // Recomendados: si hay carrito, complementos; si no, lo destacado que no está en la tabla del box.
  const recommended = recommendForHome(hydrated ? lines : [], 8, ranking.map((r) => r.product.slug));
  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <div>
        <HomeHero />
        <OwnerSpot id="carrusel" />
        {!theme && <OwnerSpot id="campana" />}
      </div>
      <Later size={420}><OwnerSpot id="categorias" /><HomeCategories n={1} /></Later>
      {theme && <div><OwnerSpot id="campana" ctx={{ campaignId: theme.id }} /><ThemeOffersRail theme={theme} offer={offer} /></div>}
      <Later size={620}><ProductRail id="recomendados" eyebrow="Elegidos para vos" title="Recomendados" products={recommended.map(toCard)} href="/categorias/" /></Later>
      <Later size={620}><OwnerSpot id="packs" /><HomePacks /></Later>
      <Later size={560}><GoalPanels n={2} /></Later>
      <Later size={560}><OwnerSpot id="textos" /><HomeStackBlock /></Later>
      <Later size={520}><BoxLeaderboard rows={ranking} n={3} /></Later>
      <Later size={520}><AttributeReviews n={4} /></Later>
      <Later size={420}><OwnerSpot id="club" /><ClubBand /></Later>
    </div>
  );
}
