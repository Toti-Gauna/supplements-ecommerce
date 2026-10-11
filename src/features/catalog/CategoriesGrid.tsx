"use client";
import type { CSSProperties } from "react";
import { CategoryTile } from "@/components/molecules/CategoryTile";
import { categoryHref, productsInCategory, visibleCategories } from "@/demo/engine/catalog";
import { balancedColumns } from "@/lib/grid";
import { useDemoVersion } from "@/stores/admin";

/**
 * Todas las categorías, a la vista de una: filas parejas (hasta 3 por fila en el celular, 5 en tablet y 10 en
 * escritorio, donde entran todas en una sola fila) y la última centrada; ninguna queda sola en su fila.
 */
export function CategoriesGrid() {
  useDemoVersion();
  const cats = visibleCategories();
  const n = cats.length;
  const cols = { "--c1": balancedColumns(n, 3), "--c2": balancedColumns(n, 5), "--c3": balancedColumns(n, 10) } as CSSProperties;
  return (
    <ul aria-label="Todas las categorías" style={cols} className="flex flex-wrap justify-center gap-4 [--c:var(--c1)] sm:[--c:var(--c2)] lg:[--c:var(--c3)]">
      {cats.map((c) => (
        <li key={c.slug} className="w-[calc((100%_-_(var(--c)_-_1)_*_1rem)_/_var(--c)_-_1px)]"><CategoryTile href={categoryHref(c.slug)} name={c.name} art={c.art} count={productsInCategory(c.slug).length} /></li>
      ))}
    </ul>
  );
}
