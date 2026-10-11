"use client";
import { bestSellers, newArrivals } from "@/demo/engine/catalog";
import { recommendForCart } from "@/demo/engine/recommend";
import { useDemoVersion } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { BenefitsBar } from "../home/BenefitsBar";
import { CategoryCircles } from "../home/CategoryCircles";
import { ClubBand } from "../home/ClubBand";
import { HeroCarousel } from "../home/HeroCarousel";
import { LiveCustomizer } from "../home/LiveCustomizer";
import { ProductRail } from "../home/ProductRail";
import { ProductStories } from "../home/ProductStories";
import { Values } from "../home/Values";
import { ThemeBanner } from "../themes/ThemeBanner";
import { ThemeOffersRail } from "../themes/ThemeOffersRail";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { toCard } from "./mappers";
import type { ReactNode } from "react";

/** Sección de más abajo: el navegador no la dibuja hasta que se acerca a la pantalla (menos trabajo al cargar y al scrollear). */
function Later({ size, children }: { size: number; children: ReactNode }) {
  return <div className="cv-auto cv-bleed" style={{ containIntrinsicSize: `auto ${size}px` }}>{children}</div>;
}

/** Inicio de tienda: carrusel (con la temática vigente primero), ofertas de la temática, beneficios, categorías, recomendados, más vendidos, historias y novedades. */
export function HomeSections() {
  const data = useDemoVersion();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const { theme, offer } = useCurrentTheme();
  const slides = data.content.slides.filter((s) => s.active !== false);
  const best = bestSellers(8);
  // Recomendados: si hay carrito, complementos; si no, lo destacado que no está en "más vendidos".
  const recommended = recommendForCart(hydrated ? lines : [], 8);
  return (
    <div className="flex flex-col gap-12 sm:gap-20">
      <div className="flex flex-col gap-6">
        <HeroCarousel key={theme?.id ?? "base"} slides={slides} lead={theme ? { node: <ThemeBanner theme={theme} offer={offer} />, label: theme.headline } : undefined} />
        <BenefitsBar />
      </div>
      {theme && <ThemeOffersRail theme={theme} offer={offer} />}
      <CategoryCircles />
      <ProductRail id="recomendados" eyebrow="Elegidos para vos" title="Recomendados" products={recommended.map(toCard)} href="/categorias/" />
      <Later size={620}><LiveCustomizer eyebrow={data.content.homeCta.title} /></Later>
      <Later size={480}><ProductRail id="mas-vendidos" eyebrow="Los favoritos" title="Más vendidos" accent="del taller" products={best.map(toCard)} href="/categorias/" /></Later>
      <Later size={640}><ProductStories /></Later>
      <Later size={480}><ProductRail id="novedades" eyebrow="Recién salidos" title="Novedades" products={newArrivals(8).map(toCard)} /></Later>
      <Later size={420}><ClubBand /></Later>
      <Later size={320}><Values /></Later>
    </div>
  );
}
