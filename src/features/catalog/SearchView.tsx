"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ProductGrid } from "@/components/molecules/ProductCard";
import { SearchForm } from "@/components/molecules/SearchForm";
import { bestSellers, categoryHref, featuredCategories } from "@/demo/engine/catalog";
import { searchProducts, suggestTerm } from "@/demo/engine/search";
import { activeProducts } from "@/demo/engine/catalog";
import { useDemoVersion } from "@/stores/admin";
import { toCard } from "./mappers";

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const data = useDemoVersion();
  const results = useMemo(() => searchProducts(q, data.products.filter((p) => p.active !== false), data.categories), [q, data]);
  const suggestion = results.length === 0 ? suggestTerm(q, activeProducts()) : null;
  const onSearch = (value: string) => {
    setQ(value);
    router.replace(`/buscar/?q=${encodeURIComponent(value)}`, { scroll: false });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xl"><SearchForm value={q} autoFocus={!q} onSearch={onSearch} /></div>
      {q.trim() === "" ? (
        <section aria-label="Sugerencias">
          <p className="mb-3 font-bold">Probá con:</p>
          <div className="flex flex-wrap gap-2">
            {["comedero", "lampara", "nfc", "collar", "vela", "regalo"].map((t) => (
              <button key={t} type="button" onClick={() => onSearch(t)} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold hover:bg-accent">{t}</button>
            ))}
          </div>
        </section>
      ) : results.length > 0 ? (
        <section aria-label="Resultados">
          <p className="mb-4 text-sm text-muted" role="status">{results.length} {results.length === 1 ? "resultado" : "resultados"} para “{q}”</p>
          <ProductGrid products={results.map((r) => toCard(r.product))} />
        </section>
      ) : (
        <div className="flex flex-col gap-8">
          <EmptyState title={`No encontramos “${q}”`}>
            {suggestion ? (
              <p>¿Quisiste decir <button type="button" onClick={() => onSearch(suggestion)} className="font-bold text-primary underline">{suggestion}</button>?</p>
            ) : (
              <p>Revisá cómo lo escribiste o mirá las categorías.</p>
            )}
            <p className="mt-3 flex flex-wrap justify-center gap-2">
              {featuredCategories().map((c) => <Link key={c.slug} href={categoryHref(c.slug)} className="rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-ink">{c.name}</Link>)}
            </p>
          </EmptyState>
          <section aria-label="Más vendidos"><h2 className="mb-4 text-xl font-extrabold">Lo más elegido</h2><ProductGrid products={bestSellers(4).map(toCard)} /></section>
        </div>
      )}
    </div>
  );
}
