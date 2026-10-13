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
import { ProductRail } from "../home/ProductRail";
import { HomeStackBlock } from "../stack/HomeStackBlock";
import { ThemeOffersRail } from "../themes/ThemeOffersRail";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { toCard } from "./mappers";

/** Sección de más abajo: el navegador no la dibuja hasta que se acerca a la pantalla (menos trabajo al cargar y al scrollear). */
function Later({ size, children }: { size: number; children: ReactNode }) {
  return <div className="cv-auto cv-bleed" style={{ containIntrinsicSize: `auto ${size}px` }}>{children}</div>;
}

/**
 * Inicio (R1), pocos bloques y con propósito: el hero del rack (campaña o producto estrella, con su marcador), las
 * ofertas de la campaña, los objetivos, el stack en vivo, las categorías como estantes, la tabla del box, lo
 * recomendado para vos, las reseñas por atributo y el club. El h1 es el titular del hero.
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
      <HomeHero />
      {theme && <ThemeOffersRail theme={theme} offer={offer} />}
      <GoalPanels n={1} />
      <HomeStackBlock />
      <Later size={420}><HomeCategories n={2} /></Later>
      <Later size={520}><BoxLeaderboard rows={ranking} n={3} /></Later>
      <Later size={620}><ProductRail id="recomendados" eyebrow="Elegidos para vos" title="Recomendados" products={recommended.map(toCard)} href="/categorias/" /></Later>
      <Later size={520}><AttributeReviews n={4} /></Later>
      <Later size={420}><ClubBand /></Later>
    </div>
  );
}
