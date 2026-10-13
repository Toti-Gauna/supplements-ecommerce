import type { HeroPick } from "@/demo/engine/home";
import { cn } from "@/lib/cn";

/**
 * Destacados como en un marcador: una placa por producto con su número. Elegir una cambia el rack y la tira de datos
 * (los dígitos dan la vuelta); nada avanza solo. La campaña vigente, si hay, es la 01.
 */
export function HeroMarkers({ picks, current, onPick }: { picks: HeroPick[]; current: string; onPick: (key: string) => void }) {
  return (
    <div role="group" aria-label="Destacados" className="no-scrollbar -mx-4 flex gap-px overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {picks.map((p, i) => {
        const on = p.key === current;
        return (
          <button key={p.key} type="button" aria-pressed={on} onClick={() => onPick(p.key)}
            className={cn("plate flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-left font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition-colors",
              on ? "border-(--season-accent) text-ink" : "border-transparent text-muted hover:text-ink")}>
            <span className={cn("font-display text-xl leading-none", on && "text-volt-ink")}>{String(i + 1).padStart(2, "0")}</span>
            <span className="max-w-[11rem] truncate">{p.kind === "campaign" ? "Campaña" : p.product.name}</span>
          </button>
        );
      })}
    </div>
  );
}
