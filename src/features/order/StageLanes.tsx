import { Check } from "lucide-react";
import type { TimelineStep } from "@/components/molecules/StatusTimeline";
import { cn } from "@/lib/cn";

interface StageLanesProps {
  steps: TimelineStep[];
  /** "board": el tablero del seguimiento (descripción y fecha); "strip": la tira corta de la confirmación. */
  variant?: "board" | "strip";
  /** Sobre una banda noche (oscura en los dos modos). */
  dark?: boolean;
  className?: string;
}

/**
 * Etapas del pedido como carriles del box (R2): cada etapa es una placa numerada con su carril pintado; las hechas
 * quedan cargadas, la actual encendida con el acento y las que faltan apagadas. Se ve igual en una captura de
 * página entera: nada depende de entrar en pantalla. El estado va en texto para lectores de pantalla.
 */
export function StageLanes({ steps, variant = "board", dark = false, className }: StageLanesProps) {
  const board = variant === "board";
  const muted = dark ? "text-night-muted" : "text-muted";
  return (
    <ol className={cn("grid gap-px", board ? "lg:grid-cols-7" : "grid-cols-2 sm:grid-cols-4", className)}>
      {steps.map((s, i) => {
        const done = s.state === "done";
        const now = s.state === "current";
        return (
          <li key={s.label} aria-current={now ? "step" : undefined}
            className={cn("relative flex min-w-0 gap-3 p-3", board ? "lg:flex-col lg:gap-2" : "flex-col gap-1.5", dark ? (now ? "bg-white/10" : "bg-white/[0.04]") : now ? "bg-accent" : "plate")}>
            <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", done ? (dark ? "bg-volt" : "bg-volt-ink") : now ? "bg-(--season-accent)" : dark ? "bg-white/10" : "bg-line")} />
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-xs font-mono text-[12px] font-bold tabular-nums",
              done && (dark ? "bg-volt text-night" : "bg-volt-ink text-bg"), now && (dark ? "bg-on-night text-night" : "bg-ink text-bg"), s.state === "pending" && cn("border", dark ? "border-white/20 text-night-muted" : "border-line text-muted"))}>
              {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className={cn("block font-mono text-[11px] font-bold uppercase leading-tight tracking-[0.06em]", s.state === "pending" && muted)}>
                {s.label}
                {now && <span className={cn("ml-1", dark ? "text-volt" : "text-volt-ink")}>· ahora</span>}
                {done && <span className="sr-only"> (hecho)</span>}
              </span>
              {board && <span className={cn("mt-1 block text-xs", muted)}>{s.description}</span>}
              {s.date && <span className={cn("mt-1 block font-mono text-[11px] tabular-nums", muted)}>{s.date}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
