import { cn } from "@/lib/cn";
import { CardsBlock } from "./CardsBlock";
import { HeroBlock } from "./HeroBlock";
import { ProductSheet } from "./ProductSheet";
import { SectionPlate } from "./parts";
import { TodayBlock } from "./TodayBlock";
import s from "./lab.module.css";

/**
 * Propuesta B · "Performance Lab": la tienda como hoja técnica de un laboratorio de rendimiento. Cuatro bloques a
 * ancho completo (inicio, tarjetas, ficha y "Hoy en tu tienda"), cada uno con su rótulo de maqueta.
 */
export function PerformanceLab() {
  return (
    <div className={cn(s.root, "min-h-dvh pb-20")}>
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-baseline justify-between gap-2 px-4 pt-6 sm:px-8">
        <p className={cn(s.tag, "text-(--ink)")}>Propuesta B · Performance Lab</p>
        <p className={cn(s.tag, "text-(--ink-2)")}>Maqueta R1 · no publicada</p>
      </div>
      <main id="contenido">
        <SectionPlate n={1} title="Inicio" note="Header, ticker y hero con su tira de datos" />
        <HeroBlock />
        <SectionPlate n={2} title="Tarjetas" note="Ficha de rack · precio por servicio primero" />
        <CardsBlock />
        <SectionPlate n={3} title="Ficha" note="Primer pantallazo · hoja técnica" />
        <ProductSheet />
        <SectionPlate n={4} title="Panel" note="Hoy en tu tienda" />
        <TodayBlock />
      </main>
    </div>
  );
}
