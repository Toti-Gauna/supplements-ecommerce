import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Pasos numerados con línea de progreso. */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start" aria-label="Pasos">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center" aria-current={active ? "step" : undefined}>
            {i > 0 && <span aria-hidden="true" className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 transition-colors duration-500", done || active ? "bg-primary" : "bg-line")} />}
            <span className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold transition-all duration-300",
              done && "bg-primary text-on-primary", active && "bg-night text-[#f6f1e8] ring-4 ring-primary/15", !done && !active && "bg-surface text-muted ring-1 ring-line")}>
              {done ? <Check size={15} aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn("text-[11px] font-bold sm:text-xs", active ? "text-ink" : "text-muted")}>{step}{done && <span className="sr-only"> (completo)</span>}</span>
          </li>
        );
      })}
    </ol>
  );
}
