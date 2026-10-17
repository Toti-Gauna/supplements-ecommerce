import { Plus } from "lucide-react";
import type { Faq } from "@/demo/types";

/**
 * Preguntas en acordeón con el sistema BOX: cada una es un renglón de la hoja con su código ("03.2"), la pregunta en
 * negrita y un "+" que gira al abrir. `open` las muestra abiertas (resultados de una búsqueda).
 */
export function FaqList({ faqs, code, open }: { faqs: Faq[]; code?: string; open?: boolean }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f, i) => (
        <details key={`${f.q}-${open ? "abierta" : "cerrada"}`} open={open || undefined} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-3 pr-1 transition-colors hover:bg-accent/50 [&::-webkit-details-marker]:hidden">
            {code && <span aria-hidden="true" className="w-10 shrink-0 font-mono text-[11px] font-bold text-volt-ink">{code}.{i + 1}</span>}
            <span className="flex-1 font-bold leading-snug text-ink">{f.q}</span>
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center border border-line text-ink transition-transform duration-200 group-open:rotate-45 group-open:border-volt-ink">
              <Plus size={16} />
            </span>
          </summary>
          <p className={`animate-fade-in pb-4 pr-2 leading-relaxed sm:pr-10 text-muted ${code ? "pl-[3.25rem]" : ""}`}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
