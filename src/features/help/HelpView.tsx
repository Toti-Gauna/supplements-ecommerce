"use client";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { inputClass } from "@/components/atoms/Field";
import { FaqList } from "@/components/molecules/FaqList";
import { helpResults } from "@/demo/engine/help";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import { useDemoData } from "@/stores/admin";
import { HelpContact } from "./HelpContact";

const code = (i: number) => String(i + 1).padStart(2, "0");
const CHIP = "flex min-h-10 shrink-0 items-center gap-2 border border-line bg-surface px-3 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink hover:border-ink/50";

/**
 * Ayuda del box (R2c): buscador (sin tildes ni mayúsculas, en el motor) arriba, el índice de temas como placas y las
 * preguntas agrupadas por tema, con la placa de contacto al costado (abajo en el celular). Las preguntas y su tema se
 * editan en el panel → Contenido → Preguntas frecuentes.
 */
export function HelpView() {
  const faqs = useDemoData((d) => d.content.faqs);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const { groups, count } = useMemo(() => helpResults(faqs, deferred), [faqs, deferred]);
  const searching = deferred.trim().length > 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0">
        <div role="search" className="plate border border-line p-3 sm:p-4">
          <label htmlFor="help-search" className="eyebrow text-muted">Buscá en la ayuda</label>
          <div className="relative mt-2">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
            <input id="help-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off"
              placeholder="Envío, cuotas, talle, lote…" aria-describedby="help-search-status" className={cn(inputClass, "pl-11 pr-12 [&::-webkit-search-cancel-button]:hidden")} />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Borrar la búsqueda" className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center text-muted hover:text-ink">
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
          <p id="help-search-status" role="status" className="mt-2 font-mono text-[11px] text-muted">
            {searching ? (count ? `${plural(count, "pregunta", "preguntas")} con “${deferred.trim()}”` : `No encontramos “${deferred.trim()}”. Probá con otra palabra o preguntale al local.`) : `${plural(count, "pregunta", "preguntas")} en ${plural(groups.length, "tema", "temas")}`}
          </p>
        </div>
        {!searching && (
          <nav aria-label="Temas de la ayuda" className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
            {groups.map((g, i) => (
              <a key={g.topic.id} href={`#tema-${g.topic.id}`} className={CHIP}><span aria-hidden="true" className="text-volt-ink">{code(i)}</span>{g.topic.label}</a>
            ))}
          </nav>
        )}
        <div className="mt-8 flex flex-col gap-10">
          {groups.map((g, i) => (
            <section key={g.topic.id} id={`tema-${g.topic.id}`} aria-labelledby={`tema-${g.topic.id}-title`} className="scroll-mt-28">
              <div className="lane mb-1 flex items-end justify-between gap-3 pb-3">
                <div>
                  <p aria-hidden="true" className="font-mono text-[11px] font-bold text-volt-ink">{code(i)}</p>
                  <h2 id={`tema-${g.topic.id}-title`} className="font-display text-3xl leading-none sm:text-4xl">{g.topic.label}</h2>
                  <p className="mt-1 text-sm text-muted">{g.topic.hint}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{plural(g.items.length, "pregunta", "preguntas")}</span>
              </div>
              <FaqList faqs={g.items} code={code(i)} open={searching} />
            </section>
          ))}
        </div>
      </div>
      <HelpContact className="lg:sticky lg:top-24" />
    </div>
  );
}
