"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { visibleCategories } from "@/demo/engine/catalog";
import { useRail } from "@/lib/useRail";
import { useDemoVersion } from "@/stores/admin";
import { CategoryShelves } from "../catalog/CategoryShelves";
import { HomeBlockTitle } from "./HomeBlockTitle";

const ARROW = "hidden h-11 w-11 place-items-center border border-line bg-surface text-ink transition-[background-color,color,opacity] hover:bg-ink hover:text-bg aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:bg-surface aria-disabled:hover:text-ink sm:grid";

/** Estantes de categorías en el inicio: una fila que se desliza con el dedo, el teclado o las flechas del rótulo. */
export function HomeCategories({ n }: { n: number }) {
  useDemoVersion();
  const { ref, atStart, atEnd, page } = useRail<HTMLUListElement>(visibleCategories().map((c) => c.slug).join());
  return (
    <section aria-labelledby="cats-title">
      <HomeBlockTitle id="cats-title" n={n} kicker="El rack" title="Comprá por categoría" action={{ href: "/categorias/", label: "Ver todas" }}>
        <button type="button" aria-label="Categorías anteriores" aria-controls="cats-rail" aria-disabled={atStart || undefined} onClick={() => !atStart && page(-1)} className={ARROW}><ArrowLeft size={18} aria-hidden="true" /></button>
        <button type="button" aria-label="Más categorías" aria-controls="cats-rail" aria-disabled={atEnd || undefined} onClick={() => !atEnd && page(1)} className={ARROW}><ArrowRight size={18} aria-hidden="true" /></button>
      </HomeBlockTitle>
      <CategoryShelves layout="rail" listRef={ref} />
    </section>
  );
}
