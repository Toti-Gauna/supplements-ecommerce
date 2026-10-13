"use client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { bestSellers, productHref } from "@/demo/engine/catalog";
import { popularSearches } from "@/demo/fixtures/search";
import type { Product } from "@/demo/types";
import { plural } from "@/lib/plural";
import { useRecentSearches } from "@/stores/recentSearches";
import { useUi } from "@/stores/ui";
import { ChipToggles, DetectedChips } from "./search/SearchChips";
import { SearchField } from "./search/SearchField";
import { IgnoredNote, SearchSuggestions } from "./search/SearchFixes";
import { optionId, SearchListbox, type OptionGroup, type SearchOption } from "./search/SearchListbox";
import { toRackRow, useCatalogSearch } from "./search/useCatalogSearch";
import { useListNav } from "./search/useListNav";

const LIST_ID = "buscador-opciones";
const LIVE_ROWS = 6;
const productOption = (p: Product): SearchOption => ({ key: p.slug, kind: "product", href: productHref(p.slug), row: toRackRow(p) });

/**
 * Buscador superpuesto (protagonista): campo grande, filtros del rubro para tocar, resultados en vivo como filas de
 * rack y búsquedas populares. Teclado completo (↑ ↓ Enter, Escape cierra), foco atrapado por el `Sheet` y, en el
 * celular, a pantalla completa.
 */
export function SearchModal() {
  const { searchOpen, setSearch } = useUi();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const { terms: recent, remember, clear } = useRecentSearches();
  const [q, setQ] = useState("");
  const { outcome, options: chipGroups } = useCatalogSearch(q);
  const typed = q.trim() !== "";
  const { results } = outcome;

  const groups: OptionGroup[] = useMemo(() => {
    if (typed) return [{ id: "productos", label: "Productos", options: results.slice(0, LIVE_ROWS).map((r) => productOption(r.product)) }];
    const asQuery = (recentList: boolean) => (text: string): SearchOption => ({ key: `${recentList ? "r" : "p"}:${text}`, kind: "query", text, recent: recentList });
    return [
      { id: "recientes", label: "Tus búsquedas", options: recent.map(asQuery(true)) },
      { id: "populares", label: "Lo que más se busca", options: popularSearches.map(asQuery(false)) },
      { id: "elegidos", label: "Lo más elegido del box", options: bestSellers(3).map(productOption), className: "sm:col-start-2 sm:row-span-2 sm:row-start-1" },
    ];
  }, [typed, results, recent]);
  const flat = groups.flatMap((g) => g.options);

  const close = () => { setSearch(false); setQ(""); };
  // Lo que se toca adentro (filtro, sugerencia, borrar) deja el foco en el campo: el botón tocado desaparece.
  const refine = (next: string) => { setQ(next); input.current?.focus(); };
  const clearRecent = () => { clear(); input.current?.focus(); };
  const goAll = () => { if (!typed) return; remember(q); close(); router.push(`/buscar/?q=${encodeURIComponent(q.trim())}`); };
  const pick = (o: SearchOption) => {
    if (o.kind === "query") return refine(o.text);
    if (typed) remember(q);
    close();
    router.push(o.href);
  };
  const nav = useListNav(flat, q, pick, goAll);
  const status = !typed ? "" : results.length ? `${plural(results.length, "resultado", "resultados")} para “${q.trim()}”` : `No encontramos “${q.trim()}”`;

  return (
    <Sheet open={searchOpen} onClose={close} title="Buscar" side="top" className="h-dvh sm:h-auto sm:w-[min(94vw,960px)]">
      <div className="plate flex h-14 shrink-0 items-center gap-3 border-b border-line pl-4 pr-16 sm:pl-6">
        <span className="eyebrow text-volt-ink">Buscador</span>
        <span aria-hidden="true" className="hidden font-mono text-[11px] text-muted sm:inline">↑ ↓ elegir · Enter abrir · Esc cerrar</span>
      </div>
      <div className="shrink-0 border-b border-line px-4 pb-4 pt-4 sm:px-6">
        <SearchField id="search-modal" size="hero" inputRef={input} value={q} onValue={setQ} onSubmit={goAll} data-autofocus
          role="combobox" aria-expanded={flat.length > 0} aria-controls={LIST_ID} aria-autocomplete="list"
          aria-activedescendant={nav.active >= 0 ? optionId(LIST_ID, nav.active) : undefined} onKeyDown={nav.onKeyDown} />
        <DetectedChips query={q} chips={outcome.chips} onQuery={refine} className="mt-3" />
        <ChipToggles query={q} groups={chipGroups} active={outcome.chips} onQuery={refine} className="mt-3" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4 sm:px-6">
        <p role="status" className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-muted empty:hidden">{status}</p>
        <IgnoredNote ignored={outcome.ignored} className="mb-3" />
        {typed && !results.length ? (
          <SearchSuggestions suggestions={outcome.suggestions} onQuery={refine} />
        ) : (
          <SearchListbox id={LIST_ID} label={typed ? "Resultados" : "Sugerencias"} groups={groups} active={nav.active} onActive={nav.setActive} onPick={pick}
            className={typed ? undefined : "sm:grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-x-8"} />
        )}
        {!typed && recent.length > 0 && (
          <button type="button" onClick={clearRecent} className="mt-6 min-h-10 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4">Borrar tus búsquedas</button>
        )}
        {results.length > LIVE_ROWS && (
          <Button variant="secondary" onClick={goAll} className="mt-4 w-full">Ver los {results.length} resultados</Button>
        )}
      </div>
    </Sheet>
  );
}
