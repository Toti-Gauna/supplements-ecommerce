"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ProductGrid } from "@/components/molecules/ProductCard";
import { SearchForm } from "@/components/molecules/SearchForm";
import { bestSellers, categoryHref, featuredCategories, goalHref, productsForGoal } from "@/demo/engine/catalog";
import { searchProducts, suggestTerm } from "@/demo/engine/search";
import { activeProducts } from "@/demo/engine/catalog";
import { goalInfo } from "@/demo/engine/goals";
import type { Goal } from "@/demo/types";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import { useDemoVersion } from "@/stores/admin";
import { toCard } from "./mappers";
import { useGoals } from "./useGoals";

/** Filtro por objetivo (`?objetivo=`): chips arriba y la grilla de ese objetivo, sin necesidad de escribir. */
function GoalView({ goal }: { goal: Goal }) {
  useDemoVersion();
  const goals = useGoals();
  const info = goals.find((g) => g.id === goal)!;
  const list = productsForGoal(goal);
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Objetivos" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {goals.map((g) => (
          <Link key={g.id} href={goalHref(g.id)} aria-current={g.id === goal ? "page" : undefined}
            className={cn("inline-flex shrink-0 items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold transition-colors", g.id === goal ? "border-primary bg-primary text-on-primary" : "border-line bg-surface hover:border-ink/30")}>
            <GoalGlyph goal={g.id} className="h-4 w-4" /> {g.name}
          </Link>
        ))}
      </nav>
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">{info.name}</h2>
        <p className="mt-1 text-muted">{info.pitch} <span className="font-mono text-xs font-bold uppercase tracking-wider text-volt-ink">{plural(list.length, "producto", "productos")}</span></p>
      </div>
      <ProductGrid products={list.map(toCard)} />
    </div>
  );
}

export function SearchView() {
  const params = useSearchParams();
  const goal = params.get("objetivo");
  if (goal && goalInfo(goal as Goal)) return <GoalView goal={goal as Goal} />;
  return <TextSearch />;
}

function TextSearch() {
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
            {["whey", "creatina", "pre entreno", "vegano", "omega", "alfajor"].map((t) => (
              <button key={t} type="button" onClick={() => onSearch(t)} className="rounded-sm border border-line bg-surface px-4 py-2 text-sm font-bold hover:bg-accent">{t}</button>
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
              {featuredCategories().map((c) => <Link key={c.slug} href={categoryHref(c.slug)} className="rounded-sm bg-accent px-3 py-1.5 text-sm font-bold text-ink">{c.name}</Link>)}
            </p>
          </EmptyState>
          <section aria-label="Más vendidos"><h2 className="mb-4 text-xl font-extrabold">Lo más elegido</h2><ProductGrid products={bestSellers(4).map(toCard)} /></section>
        </div>
      )}
    </div>
  );
}
