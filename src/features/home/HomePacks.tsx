"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { IllustrativeNote } from "@/components/molecules/ProductCard";
import { useRail } from "@/lib/useRail";
import { useDemoData } from "@/stores/admin";
import { PackCard } from "../packs/PackCard";
import { RAIL_ARROW } from "./ProductRail";

/**
 * Packs del inicio: un riel con los destacados (los que el local marca en el panel), con las mismas flechas y el mismo
 * deslizado que los rieles de productos. Si no hay ninguno destacado, el bloque no aparece.
 */
export function HomePacks() {
  const all = useDemoData((d) => d.packs);
  const featured = (all ?? []).filter((p) => p.featured && p.active !== false);
  const { ref, atStart, atEnd, page } = useRail<HTMLUListElement>(featured.map((p) => p.id).join());
  if (featured.length === 0) return null;
  return (
    <section aria-labelledby="packs-home-title">
      <Reveal className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-volt-ink">Todo junto, con descuento</p>
          <h2 id="packs-home-title" className="font-display mt-2 text-3xl sm:text-5xl">Packs para tu objetivo o tu deporte</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/packs/" className="mr-2 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline">Ver todos los packs <ArrowUpRight size={16} aria-hidden="true" /></Link>
          {featured.length > 3 && (
            <>
              <button type="button" aria-label="Packs anteriores" aria-disabled={atStart || undefined} onClick={() => !atStart && page(-1)} className={RAIL_ARROW}><ArrowLeft size={18} aria-hidden="true" /></button>
              <button type="button" aria-label="Más packs" aria-disabled={atEnd || undefined} onClick={() => !atEnd && page(1)} className={RAIL_ARROW}><ArrowRight size={18} aria-hidden="true" /></button>
            </>
          )}
        </div>
      </Reveal>
      <Reveal y={16} delay={0.08}>
        <ul ref={ref} className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-2 sm:-mx-6 sm:gap-5 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0">
          {featured.map((p) => (
            <li key={p.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[calc(33.333%-14px)]"><PackCard pack={p} /></li>
          ))}
        </ul>
        <IllustrativeNote className="mt-2" />
      </Reveal>
    </section>
  );
}
