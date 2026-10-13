import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Pasos como carriles del box: cada paso es una placa numerada ("01") sobre un riel; los hechos quedan cargados,
 * el actual encendido y los que faltan apagados. El estado va en texto para lectores de pantalla.
 */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="grid auto-cols-fr grid-flow-col gap-1" aria-label="Pasos">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex min-w-0 flex-col gap-2" aria-current={active ? "step" : undefined}>
            <span aria-hidden="true" className={cn("h-1.5 transition-colors duration-300", done ? "bg-volt-ink" : active ? "bg-ink" : "bg-line")} />
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("grid h-7 min-w-7 shrink-0 place-items-center rounded-xs px-1 font-mono text-[12px] font-bold tabular-nums",
                done && "bg-volt-ink text-bg", active && "bg-ink text-bg", !done && !active && "border border-line text-muted")}>
                {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : String(i + 1).padStart(2, "0")}
              </span>
              <span className={cn("truncate font-mono text-[11px] font-bold uppercase tracking-[0.06em] sm:text-xs", active ? "text-ink" : "text-muted")}>
                {step}{done && <span className="sr-only"> (completo)</span>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
