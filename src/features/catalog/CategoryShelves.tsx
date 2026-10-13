"use client";
import Link from "next/link";
import type { CSSProperties, Ref } from "react";
import { RackShot } from "@/components/illustrations/RackShot";
import { categoryHref, visibleCategories } from "@/demo/engine/catalog";
import { categoryShelf } from "@/demo/engine/rack";
import { cn } from "@/lib/cn";
import { balancedColumns } from "@/lib/grid";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { useDemoVersion } from "@/stores/admin";

/**
 * Categorías como estantes del rack: los tres potes más vendidos de cada una en su estante y el rótulo con lo que
 * importa para elegir ("desde $ 459/serv · 3 marcas"). En el inicio, una fila que se desliza; en /categorias/, grilla sin estantes solos en la última fila.
 */
export function CategoryShelves({ layout = "grid", listRef }: { layout?: "rail" | "grid"; listRef?: Ref<HTMLUListElement> }) {
  useDemoVersion();
  const shelves = visibleCategories().map((c) => ({ c, s: categoryShelf(c.slug) }));
  const rail = layout === "rail";
  return (
    <ul ref={listRef} id={rail ? "cats-rail" : undefined} aria-label="Categorías"
      style={rail ? undefined : { "--c2": balancedColumns(shelves.length, 2), "--c3": balancedColumns(shelves.length, 3), "--c4": balancedColumns(shelves.length, 4) } as CSSProperties}
      className={rail
        ? "no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6"
        : "grid grid-cols-[minmax(0,1fr)] gap-3 min-[420px]:grid-cols-[repeat(var(--c2),minmax(0,1fr))] md:grid-cols-[repeat(var(--c3),minmax(0,1fr))] xl:grid-cols-[repeat(var(--c4),minmax(0,1fr))]"}>
      {shelves.map(({ c, s }) => (
        <li key={c.slug} className={cn(rail && "w-[72%] shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-2.25rem)/4)]")}>
          <Link href={categoryHref(c.slug)} className="group flex h-full flex-col border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
            <span className="rack-bay block aspect-[16/9] overflow-hidden">
              <RackShot items={s.products.map((p) => ({ art: p.art, pack: p.pack, tint: p.variants[0]?.colorHex }))} label="" className="transition-transform duration-300 group-hover:-translate-y-1" />
            </span>
            <span className="plate flex flex-1 flex-col gap-1 px-3 py-2.5">
              <span className="font-display text-xl leading-none">{c.name}</span>
              <span className="font-mono text-[11px] text-muted">
                {s.fromPerServing ? `desde ${formatARS(s.fromPerServing)}/serv · ` : ""}{plural(s.brands, "marca", "marcas")} · {plural(s.count, "producto", "productos")}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
