"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock, Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { Sheet } from "@/components/motion/Sheet";
import { activeProducts, bestSellers, fromPrice, getCategory, productHref } from "@/demo/engine/catalog";
import { recommendForCart } from "@/demo/engine/recommend";
import { searchProducts, suggestTerm } from "@/demo/engine/search";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useDemoVersion } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useRecentSearches } from "@/stores/recentSearches";
import { useUi } from "@/stores/ui";

const TRENDING = ["comedero", "lámpara con foto", "nfc", "collar", "vela", "regalo"];

/** Buscador superpuesto: recientes, tendencias, recomendados y resultados en vivo mientras escribís. */
export function SearchModal() {
  const { searchOpen, setSearch } = useUi();
  const router = useRouter();
  const data = useDemoVersion();
  const lines = useCart((s) => s.lines);
  const { terms, remember, clear } = useRecentSearches();
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim() ? searchProducts(q, data.products.filter((p) => p.active !== false), data.categories) : []), [q, data]);
  const suggestion = q.trim() && results.length === 0 ? suggestTerm(q, activeProducts()) : null;
  const close = () => { setSearch(false); setQ(""); };
  const goSearch = (term: string) => { if (!term.trim()) return; remember(term); close(); router.push(`/buscar/?q=${encodeURIComponent(term.trim())}`); };
  const pick = () => { remember(q); close(); };
  const recommended = lines.length ? recommendForCart(lines, 4) : bestSellers(4);
  const chip = "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-ink/30 hover:bg-accent/40";

  return (
    <Sheet open={searchOpen} onClose={close} title="Buscar" side="top">
      <form role="search" onSubmit={(e) => { e.preventDefault(); goSearch(q); }} className="border-b border-line px-4 pb-4 pt-5 pr-16 sm:px-6 sm:pr-20">
        <label htmlFor="search-modal" className="sr-only">Buscar productos</label>
        <div className="relative">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input id="search-modal" data-autofocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Comedero, lámpara, nfc…" autoComplete="off" enterKeyHint="search"
            className="min-h-13 w-full rounded-full border-2 border-ink/10 bg-surface pl-12 pr-4 text-[17px] outline-none transition-colors focus:border-primary" />
        </div>
      </form>
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-5 sm:px-6">
        {q.trim() === "" ? (
          <div className="flex flex-col gap-7">
            {terms.length > 0 && (
              <section aria-labelledby="recientes">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="recientes" className="eyebrow text-muted">Búsquedas recientes</h2>
                  <button type="button" onClick={clear} className="text-xs font-bold text-primary underline underline-offset-4">Borrar</button>
                </div>
                <ul className="flex flex-wrap gap-2">{terms.map((t) => <li key={t}><button type="button" onClick={() => goSearch(t)} className={chip}><Clock size={14} aria-hidden="true" className="text-muted" />{t}</button></li>)}</ul>
              </section>
            )}
            <section aria-labelledby="tendencias">
              <h2 id="tendencias" className="eyebrow mb-3 text-muted">Lo más buscado</h2>
              <ul className="flex flex-wrap gap-2">{TRENDING.map((t) => <li key={t}><button type="button" onClick={() => setQ(t)} className={chip}><TrendingUp size={14} aria-hidden="true" className="text-brass-ink" />{t}</button></li>)}</ul>
            </section>
            <section aria-labelledby="sugeridos">
              <h2 id="sugeridos" className="eyebrow mb-3 text-muted">{lines.length ? "Combina con tu carrito" : "Recomendados"}</h2>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">{recommended.map((p) => <ResultRow key={p.slug} product={p} onPick={close} />)}</ul>
            </section>
          </div>
        ) : results.length > 0 ? (
          <section aria-label="Resultados">
            <p role="status" className="mb-3 text-sm text-muted">{results.length} {results.length === 1 ? "resultado" : "resultados"} para “{q}”</p>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">{results.slice(0, 6).map((r) => <ResultRow key={r.product.slug} product={r.product} onPick={pick} />)}</ul>
            {results.length > 6 && <button type="button" onClick={() => goSearch(q)} className="mt-4 w-full rounded-2xl bg-night py-3 text-sm font-bold text-[#f6f1e8]">Ver los {results.length} resultados</button>}
          </section>
        ) : (
          <div role="status" className="rounded-3xl bg-surface p-6 text-center">
            <p className="font-display text-2xl">No encontramos “{q}”</p>
            {suggestion ? <p className="mt-2 text-sm">¿Quisiste decir <button type="button" onClick={() => setQ(suggestion)} className="font-bold text-primary underline">{suggestion}</button>?</p> : <p className="mt-2 text-sm text-muted">Probá con otra palabra o mirá las categorías.</p>}
          </div>
        )}
      </div>
    </Sheet>
  );
}

function ResultRow({ product: p, onPick }: { product: Product; onPick: () => void }) {
  return (
    <li>
      <Link href={productHref(p.slug)} onClick={onPick} className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-surface">
        <ProductVisual art={p.art} photoUrl={p.photoDataUrl} tint={p.variants[0]?.colorHex} label="" showBadge={false} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{p.name}</span>
          <span className="block text-xs text-muted">{getCategory(p.categorySlug)?.name}{p.personalization ? " · Personalizable" : ""}</span>
        </span>
        <span className="shrink-0 text-right text-sm font-extrabold tabular-nums">{formatARS(fromPrice(p))}</span>
        <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:rotate-45" />
      </Link>
    </li>
  );
}

