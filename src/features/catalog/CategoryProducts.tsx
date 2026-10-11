"use client";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ProductGrid } from "@/components/molecules/ProductCard";
import { productsInCategory, sortProducts, type SortKey } from "@/demo/engine/catalog";
import { useDemoVersion } from "@/stores/admin";
import { useAccount } from "@/stores/account";
import { useHydrated } from "@/stores/hydration";
import { toCard } from "./mappers";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "new", label: "Nuevos primero" },
];

export function CategoryProducts({ categorySlug, hadProducts }: { categorySlug: string; hadProducts: boolean }) {
  useDemoVersion();
  const hydrated = useHydrated();
  const storedSort = useAccount((s) => s.sort);
  const setSort = useAccount((s) => s.setSort);
  const sort = hydrated ? storedSort : "relevance";
  const cards = sortProducts(productsInCategory(categorySlug), sort).map(toCard);
  if (cards.length === 0 || !hadProducts) {
    return <EmptyState title="Todavía no hay productos acá" action={<ButtonLink href="/categorias/">Ver otras categorías</ButtonLink>}>Estamos preparando piezas nuevas.</EmptyState>;
  }
  return (
    <>
      {/* En pantallas muy angostas (320 px) el orden pasa abajo del contador en lugar de desbordar. */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-sm text-muted" aria-live="polite">{cards.length} {cards.length === 1 ? "producto" : "productos"}</p>
        <label className="flex min-w-0 items-center gap-2 text-sm font-bold">
          Ordenar por
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="min-h-11 min-w-0 max-w-full rounded-full border border-ink/12 bg-surface pl-4 font-semibold text-ink hover:border-ink/25 focus:border-primary focus:outline-none">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <ProductGrid products={cards} />
    </>
  );
}
