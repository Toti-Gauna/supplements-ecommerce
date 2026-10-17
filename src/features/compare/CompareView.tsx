"use client";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { getProduct } from "@/demo/engine/catalog";
import { COMPARE_MAX, comparabilityNote, compareTable, replaceCompare } from "@/demo/engine/compare";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Product } from "@/demo/types";
import { useDemoVersion } from "@/stores/admin";
import { CompareGrid } from "./CompareGrid";
import { ComparePicker } from "./ComparePicker";
import { ShareComparison } from "./ShareComparison";
import { useComparedSlugs } from "./useCompareTray";

/** Qué abrió el selector: cambiar la columna `index` o sumar una nueva. */
type Picking = { index: number } | "add" | null;

/**
 * /comparar/: 2 o 3 productos lado a lado (precio, por servicio, proteína, servicios, "te dura", vencimiento del lote
 * que sale primero, sellos y marca), con el mejor de cada renglón marcado. Se cambia o suma un producto con el
 * buscador, se agrega al carrito desde cada columna y la comparación se comparte como imagen.
 */
export function CompareView() {
  useDemoVersion();
  const { slugs, ready, update } = useComparedSlugs();
  const [picking, setPicking] = useState<Picking>(null);
  const products = useMemo(() => slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p), [slugs]);
  const table = useMemo(() => compareTable(products, DEMO_TODAY), [products]);
  if (!ready) return <ListSkeleton rows={4} label="Cargando la comparación" />;
  const pick = (slug: string) => {
    if (picking === "add") update([...slugs, slug].slice(0, COMPARE_MAX));
    else if (picking) update(replaceCompare(slugs, picking.index, slug));
  };
  const picker = (
    <ComparePicker open={picking !== null} onClose={() => setPicking(null)} onPick={pick} taken={slugs}
      anchor={picking && picking !== "add" ? slugs[picking.index] : slugs[0]} replacing={picking && picking !== "add" ? slugs[picking.index] : undefined} />
  );
  if (!products.length) {
    return (
      <>
        <EmptyState title="Todavía no elegiste nada para comparar"
          action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href="/categorias/">Ir a la tienda</ButtonLink><button type="button" onClick={() => setPicking("add")} className="min-h-12 px-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4">Elegir con el buscador</button></div>}>
          Tocá “Comparar” en hasta {COMPARE_MAX} productos (en las tarjetas o en la ficha) y volvé acá para verlos lado a lado.
        </EmptyState>
        {picker}
      </>
    );
  }
  const note = comparabilityNote(table.comparability);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
          {products.length} de {COMPARE_MAX} · {products.length < 2 ? "sumá otro para comparar" : "el mejor de cada renglón, marcado"}
        </p>
        {products.length >= 2 && <ShareComparison table={table} className="sm:ml-auto" />}
      </div>
      {note && (
        <p role="note" className="flex items-start gap-2 border-l-2 border-warning bg-warning-soft px-3 py-2 text-sm text-ink">
          <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />{note}
        </p>
      )}
      <CompareGrid table={table} slots={products.length < COMPARE_MAX ? 1 : 0}
        onChange={(index) => setPicking({ index })} onRemove={(index) => update(slugs.filter((_, i) => i !== index))} onAdd={() => setPicking("add")} />
      <p className="font-mono text-[11px] text-muted">Se compara la presentación de la tarjeta (la que mejor rinde de las que hay). “Te dura” es con 1 servicio por día. Precios de muestra de la demo.</p>
      {picker}
    </div>
  );
}
