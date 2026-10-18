"use client";
import { RotateCcw } from "lucide-react";
import { brandsOf } from "@/demo/admin/bulk-price";
import { brandMargin, currentMargin } from "@/demo/admin/supplier-list/costs";
import { useAdmin } from "@/stores/admin";
import { CommitNumberField } from "../NumberField";
import { useDemoSave } from "../useDemoSave";
import { useCostBook } from "./useCostBook";

/**
 * Margen objetivo por marca (R4c): cada marca deja lo que el dueño quiere (sobre el precio de venta). Sin uno propio
 * vale el general de Costos y margen. Debajo de cada campo, lo que deja hoy el precio de lista.
 */
export function BrandMargins({ brands }: { brands?: string[] }) {
  const products = useAdmin((s) => s.data.products);
  const setBrandMargin = useAdmin((s) => s.setBrandMargin);
  const book = useCostBook();
  const save = useDemoSave();
  const list = brands?.length ? brands : brandsOf(products);
  const today = (brand: string) => {
    const values = products.filter((p) => p.brand === brand).flatMap((p) => p.variants.map((v) => currentMargin(p, v, book))).filter((m): m is number => m !== null);
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  };
  return (
    <section aria-labelledby="margenes-marca" className="plate rounded-sm p-4">
      <h2 id="margenes-marca" className="text-lg font-extrabold">Margen por marca</h2>
      <p className="mt-0.5 text-sm text-muted">Lo que querés ganar sobre el precio de venta. Con eso se propone el precio nuevo de cada variante. General de la tienda: {book.settings.targetMarginPct} %.</p>
      <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((brand) => {
          const own = book.settings.brandMargins?.[brand] !== undefined;
          const now = today(brand);
          return (
            <li key={brand} data-brand={brand} className="flex min-w-0 flex-col gap-1 rounded-sm bg-bg p-3">
              <CommitNumberField id={`mb-${brand.replace(/\W+/g, "-")}`} label={brand} suffix="%" min={1} max={90} value={brandMargin(brand, book.settings)}
                onCommit={(n) => save(`Margen de ${brand}: ${n} %`, () => setBrandMargin(brand, n))} />
              <p className="text-xs text-muted">{now === null ? "Sin costos cargados" : `Hoy deja ${now} % en promedio`}</p>
              {own && <button type="button" onClick={() => save(`${brand} vuelve al margen general`, () => setBrandMargin(brand, null))} className="inline-flex min-h-8 items-center gap-1 self-start text-xs font-bold text-primary underline"><RotateCcw size={12} aria-hidden="true" />Usar el general</button>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
