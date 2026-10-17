"use client";
import { Monitor, Smartphone } from "lucide-react";
import { themeOffer, themeProducts } from "@/demo/engine/themes";
import type { SeasonalTheme } from "@/demo/types";
import { brand } from "@/config/brand";
import { useDemoVersion } from "@/stores/admin";
import { CampaignDrop } from "./CampaignDrop";

/**
 * Vista previa doble en vivo (celular y escritorio) de la campaña que se está editando: cambia con cada tecla, con el
 * cupón elegido y con los productos marcados. Es del borrador: la tienda no cambia hasta guardar.
 */
export function CampaignPreview({ theme }: { theme: SeasonalTheme }) {
  useDemoVersion(); // el cupón y los productos se leen del motor: se vuelve a dibujar si cambian
  const offer = themeOffer(theme);
  const products = themeProducts(theme);
  const host = `${brand.name.toLowerCase()}.com.ar`;
  return (
    <section aria-labelledby="pv-title" className="flex min-w-0 flex-col gap-3">
      <h2 id="pv-title" className="flex flex-wrap items-center justify-between gap-x-2 text-sm font-bold">Vista previa en vivo <span className="font-normal text-muted">Borrador: la tienda cambia al guardar</span></h2>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <figure aria-label="Vista previa en el celular" data-preview="phone" className="mx-auto w-full max-w-[15rem]">
          <div className="rounded-[2rem] bg-night p-2 shadow-[var(--shadow-lift)] ring-1 ring-ink/30">
            <div className="relative aspect-[9/17] overflow-hidden rounded-[1.5rem]">
              <span aria-hidden="true" className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-night" />
              <div className="h-full pt-5"><CampaignDrop theme={theme} offer={offer} products={products} layout="phone" /></div>
            </div>
          </div>
          <figcaption className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-muted"><Smartphone size={14} aria-hidden="true" />Celular</figcaption>
        </figure>
        <figure aria-label="Vista previa en la computadora" data-preview="desktop" className="min-w-0">
          <div className="overflow-hidden rounded-sm bg-surface shadow-[var(--shadow-lift)] ring-1 ring-ink/15">
            <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-line bg-bg px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" /><span className="h-2.5 w-2.5 rounded-full bg-warning/70" /><span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-2 min-w-0 flex-1 truncate rounded-xs bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">{host}</span>
            </div>
            <div className="min-h-[20rem]"><CampaignDrop theme={theme} offer={offer} products={products} layout="desktop" /></div>
          </div>
          <figcaption className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-muted"><Monitor size={14} aria-hidden="true" />Computadora</figcaption>
        </figure>
      </div>
    </section>
  );
}
