"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { categoryHref, productsInCategory, visibleCategories } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { useRail } from "@/lib/useRail";
import { useDemoVersion } from "@/stores/admin";

/**
 * Accesos rápidos a categorías, como en cualquier tienda: círculo con la pieza más vendida de cada una, siempre en
 * una sola fila. En escritorio los círculos se reparten el ancho (`--cat`, entre 5,5 y 8,5 rem según cuántas haya);
 * si no entran, la fila se desliza con el dedo, con el teclado (Tab lleva a cada una) o con los controles laterales,
 * que aparecen solo hacia donde hay más.
 */
export function CategoryCircles() {
  useDemoVersion();
  const cats = visibleCategories();
  const { ref, atStart, atEnd, page } = useRail<HTMLUListElement>(cats.map((c) => c.slug).join());
  const side = "absolute top-[calc(0.5rem+var(--cat)/2)] z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-surface text-ink shadow-[var(--shadow-card)] transition-[opacity,visibility,background-color,color] duration-300 hover:bg-ink hover:text-bg sm:grid";
  return (
    <section aria-labelledby="cats-title">
      <div className="mb-5 flex items-end justify-between">
        <h2 id="cats-title" className="font-display text-3xl sm:text-4xl">Comprá por categoría</h2>
        <Link href="/categorias/" className="text-sm font-bold text-primary hover:underline">Ver todas</Link>
      </div>
      <div style={{ "--n": cats.length } as CSSProperties}
        className="relative [--cat:5.5rem] [container-type:inline-size] sm:[--cat:6.5rem] lg:[--cat:clamp(5.5rem,calc((100cqw_-_(var(--n)_-_1)_*_1rem)_/_var(--n)_-_1px),8.5rem)]">
        <ul ref={ref} id="cats-rail" className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:justify-between lg:scroll-px-0 lg:px-0">
          {cats.map((c) => {
            const top = [...productsInCategory(c.slug)].sort((a, b) => b.soldCount - a.soldCount)[0];
            return (
              <li key={c.slug} className="w-[var(--cat)] shrink-0 snap-start">
                <Link href={categoryHref(c.slug)} className="group flex flex-col items-center gap-2 text-center">
                  <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-accent shadow-[var(--shadow-card)] ring-1 ring-line transition-all duration-500 group-hover:shadow-[var(--shadow-lift)] group-hover:ring-2 group-hover:ring-primary">
                    {top && <ProductArt art={top.art} tint={top.variants[0]?.colorHex} label="" showBadge={false} className="h-full w-full scale-110 transition-transform duration-700 group-hover:scale-125 [&>svg]:h-full" />}
                  </span>
                  <span className="text-[13px] font-bold leading-tight">{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <button type="button" aria-label="Categorías anteriores" aria-controls="cats-rail" onClick={() => page(-1)}
          className={cn(side, "left-0 lg:-left-3", atStart && "invisible opacity-0")}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" aria-label="Más categorías" aria-controls="cats-rail" onClick={() => page(1)}
          className={cn(side, "right-0 lg:-right-3", atEnd && "invisible opacity-0")}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </section>
  );
}
