"use client";
import { CornerDownRight, TriangleAlert } from "lucide-react";
import type { SearchSuggestion } from "@/demo/engine/search";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";

function text(s: SearchSuggestion): { lead: string; quoted: string } {
  if (s.kind === "spelling") return { lead: "¿Quisiste decir", quoted: s.query };
  return { lead: "Sin", quoted: s.kind === "drop-chip" ? s.chip.label : s.term };
}

/** Con 0 resultados: consultas parecidas que sí dan resultados ("¿Quisiste decir…?", "Sin «Vainilla» hay 4"). */
export function SearchSuggestions({ suggestions, onQuery, className }: { suggestions: SearchSuggestion[]; onQuery: (q: string) => void; className?: string }) {
  if (!suggestions.length) return <p className={cn("text-sm text-muted", className)}>Probá con otra palabra o mirá las categorías.</p>;
  return (
    <ul aria-label="Probá así" className={cn("flex flex-col gap-2", className)}>
      {suggestions.map((s) => {
        const { lead, quoted } = text(s);
        return (
          <li key={`${s.kind}:${s.query}`}>
            <button type="button" onClick={() => onQuery(s.query)}
              className="group flex min-h-11 w-full items-center gap-3 border border-line bg-surface px-3 py-2 text-left text-sm hover:border-ink/50">
              <CornerDownRight size={16} aria-hidden="true" className="shrink-0 text-volt-ink" />
              <span className="flex-1">
                {lead} <strong className="font-bold text-ink">«{quoted}»</strong>{s.kind === "spelling" ? "?" : " hay"}
              </span>
              <span className="shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-volt-ink group-hover:underline">
                {plural(s.count, "producto", "productos")}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** "sin X" que no es un sello del rótulo: no se puede filtrar y se avisa (no se busca al revés). */
export function IgnoredNote({ ignored, className }: { ignored: string[]; className?: string }) {
  if (!ignored.length) return null;
  const list = ignored.map((t) => `«${t}»`).join(" ni ");
  return (
    <p role="note" className={cn("flex items-start gap-2 border-l-2 border-warning bg-warning-soft px-3 py-2 text-sm text-ink", className)}>
      <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
      <span>No podemos filtrar {list}: no es un sello del rótulo. Te mostramos el resto de la búsqueda; revisá la ficha de cada producto.</span>
    </p>
  );
}
