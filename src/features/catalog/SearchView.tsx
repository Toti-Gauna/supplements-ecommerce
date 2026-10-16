"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { decodeGoals } from "@/demo/engine/stack-builder";
import { GoalView } from "./GoalView";
import { ChipToggles, DetectedChips } from "./search/SearchChips";
import { SearchField } from "./search/SearchField";
import { IgnoredNote } from "./search/SearchFixes";
import { SearchResults } from "./search/SearchResults";
import { useCatalogSearch } from "./search/useCatalogSearch";

/**
 * /buscar/: `?objetivo=` muestra la grilla de ese objetivo (con varios, como en los links del armador, el primero);
 * `?q=` la búsqueda del rubro (va dentro de `<Suspense>`).
 */
export function SearchView() {
  const params = useSearchParams();
  const goal = decodeGoals(params.get("objetivo"))[0];
  if (goal) return <GoalView goal={goal} />;
  return <TextSearch />;
}

/** La consulta vive en `?q=` (se puede compartir y volver atrás); el campo la sigue si cambia desde afuera. */
function TextSearch() {
  const params = useSearchParams();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [seen, setSeen] = useState(urlQ);
  if (urlQ !== seen) { setSeen(urlQ); setQ(urlQ); }
  const { outcome, options } = useCatalogSearch(q);
  const update = (next: string) => {
    setQ(next);
    setSeen(next);
    router.replace(next ? `/buscar/?q=${encodeURIComponent(next)}` : "/buscar/", { scroll: false });
  };
  // Tocar un filtro o una sugerencia deja el foco en el campo (el botón tocado desaparece).
  const refine = (next: string) => { update(next); input.current?.focus(); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-3xl flex-col gap-3">
        <SearchField inputRef={input} value={q} onValue={update} onSubmit={() => input.current?.blur()} autoFocus={!urlQ} />
        <DetectedChips query={q} chips={outcome.chips} onQuery={refine} />
        <IgnoredNote ignored={outcome.ignored} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside aria-label="Afiná la búsqueda" className="lg:sticky lg:top-24 lg:self-start">
          <ChipToggles query={q} groups={options} active={outcome.chips} onQuery={refine} variant="panel" />
        </aside>
        <SearchResults query={q} outcome={outcome} onQuery={refine} />
      </div>
    </div>
  );
}
