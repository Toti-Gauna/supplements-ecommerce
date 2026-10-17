"use client";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ProductGrid } from "@/components/molecules/ProductCard";
import { restNote, type CatalogSort, type SortedCatalog } from "@/demo/engine/catalog-sort";
import { toCard } from "../mappers";

/**
 * Grilla del catálogo. Con "Más rendidor" o "Más proteína por $", lo que no tiene ese dato (equipamiento, envases de
 * un uso, productos sin proteína) no se mezcla: va en su propio bloque, al final, con el porqué.
 */
export function CatalogResults({ sorted, sort, onClear }: { sorted: SortedCatalog; sort: CatalogSort; onClear?: () => void }) {
  const { ranked, rest } = sorted;
  if (!ranked.length && !rest.length) {
    return (
      <EmptyState title="Ningún producto con esos filtros" action={onClear && <Button onClick={onClear}>Limpiar filtros</Button>}>
        Probá sacar alguno: los números al lado de cada opción dicen cuántos quedan.
      </EmptyState>
    );
  }
  const note = restNote(sort);
  return (
    <div className="flex flex-col gap-10">
      {ranked.length > 0 && <ProductGrid products={ranked.map(toCard)} />}
      {rest.length > 0 && (
        <section aria-labelledby="fuera-de-orden" className={ranked.length ? "border-t border-line pt-6" : undefined}>
          <h2 id="fuera-de-orden" className="font-display text-2xl sm:text-3xl">
            Fuera de este orden <span className="font-mono text-sm text-muted">· {rest.length}</span>
          </h2>
          {note && <p className="mb-5 mt-1 text-sm text-muted">{note}</p>}
          <ProductGrid products={rest.map(toCard)} />
        </section>
      )}
    </div>
  );
}
