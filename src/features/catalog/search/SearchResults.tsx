"use client";
import Link from "next/link";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ProductGrid } from "@/components/molecules/ProductCard";
import { bestSellers, categoryHref, featuredCategories } from "@/demo/engine/catalog";
import type { SearchOutcome } from "@/demo/engine/search";
import { popularSearches } from "@/demo/fixtures/search";
import { plural } from "@/lib/plural";
import { toCard } from "../mappers";
import { SearchSuggestions } from "./SearchFixes";

const H2 = "font-display text-2xl text-ink sm:text-3xl";

interface SearchResultsProps {
  query: string;
  outcome: SearchOutcome;
  onQuery: (q: string) => void;
}

/**
 * Cuerpo de /buscar: sin consulta, lo que más se busca; con resultados, la grilla (lo sin stock al final, en su propio
 * bloque marcado); con 0, las consultas que sí dan resultados. Sin resultados o sin consulta, lo más elegido.
 */
export function SearchResults({ query, outcome, onQuery }: SearchResultsProps) {
  const q = query.trim();
  const inStock = outcome.results.filter((r) => r.inStock);
  const soldOut = outcome.results.filter((r) => !r.inStock);
  return (
    <div className="flex min-w-0 flex-col gap-10">
      {!q ? (
        <section aria-labelledby="populares">
          <h2 id="populares" className={H2}>Lo que más se busca</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {popularSearches.map((t) => (
              <li key={t}><button type="button" onClick={() => onQuery(t)} className="plate min-h-11 border border-line px-4 text-[15px] font-semibold hover:border-ink/50">{t}</button></li>
            ))}
          </ul>
        </section>
      ) : outcome.results.length > 0 ? (
        <>
          <section aria-labelledby="resultados">
            <h2 id="resultados" className="sr-only">Resultados</h2>
            <p role="status" className="mb-5 font-mono text-[13px] uppercase tracking-[0.08em] text-muted">{plural(outcome.results.length, "resultado", "resultados")} para “{q}”</p>
            <ProductGrid products={inStock.map((r) => toCard(r.product))} />
          </section>
          {soldOut.length > 0 && (
            <section aria-labelledby="sin-stock" className="border-t border-line pt-6">
              <h2 id="sin-stock" className={H2}>Sin stock por ahora <span className="font-mono text-sm text-muted">· {soldOut.length}</span></h2>
              <p className="mb-5 mt-1 text-sm text-muted">Coinciden con tu búsqueda, pero hoy no hay unidades en el local. Consultanos cuándo vuelven.</p>
              <ProductGrid products={soldOut.map((r) => toCard(r.product))} />
            </section>
          )}
        </>
      ) : (
        <EmptyState title={`No encontramos “${q}”`}>
          <p role="status" className="sr-only">Sin resultados para “{q}”</p>
          <SearchSuggestions suggestions={outcome.suggestions} onQuery={onQuery} className="mx-auto w-full max-w-sm text-left" />
          <p className="mt-4 flex flex-wrap justify-center gap-2">
            {featuredCategories().map((c) => <Link key={c.slug} href={categoryHref(c.slug)} className="plate border border-line px-3 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-ink">{c.name}</Link>)}
          </p>
        </EmptyState>
      )}
      {(!q || outcome.results.length === 0) && (
        <section aria-labelledby="elegidos">
          <h2 id="elegidos" className={`${H2} mb-5`}>Lo más elegido del box</h2>
          <ProductGrid products={bestSellers(4).map(toCard)} />
        </section>
      )}
    </div>
  );
}
