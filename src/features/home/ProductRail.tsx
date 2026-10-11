"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { ProductCard, type ProductCardData } from "@/components/molecules/ProductCard";
import { useRail } from "@/lib/useRail";

interface Props { id: string; eyebrow: string; title: string; accent?: string; products: ProductCardData[]; href?: string }

/**
 * Riel de productos deslizable (como en cualquier tienda), con flechas en escritorio que pasan de a tarjetas enteras
 * y se apagan en los extremos. Las tarjetas no aparecen de a una: dentro de un riel horizontal, la aparición al entrar
 * en pantalla dejaba huecos (tarjetas en blanco) al deslizar rápido y volver; el riel entero aparece una vez.
 */
export function ProductRail({ id, eyebrow, title, accent, products, href }: Props) {
  const { ref, atStart, atEnd, page } = useRail<HTMLUListElement>(products.map((p) => p.slug).join());
  if (products.length === 0) return null;
  const arrow = "hidden h-11 w-11 place-items-center rounded-full border border-ink/15 bg-surface transition-[background-color,color,opacity] hover:bg-ink hover:text-bg aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:bg-surface aria-disabled:hover:text-ink sm:grid";
  return (
    <section aria-labelledby={id}>
      <Reveal className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brass-ink">{eyebrow}</p>
          <h2 id={id} className="font-display mt-2 text-3xl sm:text-5xl">{title} {accent && <span className="italic text-primary">{accent}</span>}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href && <Link href={href} className="mr-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">Ver todo <ArrowUpRight size={16} aria-hidden="true" /></Link>}
          {products.length > 4 && (
            <>
              <button type="button" aria-label={`Anteriores de ${title}`} aria-disabled={atStart || undefined} onClick={() => !atStart && page(-1)} className={arrow}><ArrowLeft size={18} aria-hidden="true" /></button>
              <button type="button" aria-label={`Más de ${title}`} aria-disabled={atEnd || undefined} onClick={() => !atEnd && page(1)} className={arrow}><ArrowRight size={18} aria-hidden="true" /></button>
            </>
          )}
        </div>
      </Reveal>
      <Reveal y={16} delay={0.08}>
        <ul ref={ref} className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-2 sm:-mx-6 sm:gap-5 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0">
          {products.map((p) => (
            <li key={p.slug} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
