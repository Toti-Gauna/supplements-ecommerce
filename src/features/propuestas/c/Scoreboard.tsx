import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import s from "./arena.module.css";

export type ScoreTone = "volt" | "plasma" | "ember" | "ink";

export interface ScoreCell {
  label: string;
  value: ReactNode;
  /** Unidad o aclaración chica al lado del número ("/ serv.", "u."). */
  unit?: string;
  /** Línea de abajo, en mono. */
  note?: ReactNode;
  tone?: ScoreTone;
}

const TONE: Record<ScoreTone, string> = {
  volt: "text-[var(--a-volt)] [text-shadow:0_0_18px_rgb(200_255_46/0.35)]",
  plasma: "text-[var(--a-plasma-ink)] [text-shadow:0_0_18px_rgb(139_114_255/0.4)]",
  ember: "text-[var(--a-ember)] [text-shadow:0_0_18px_rgb(255_106_61/0.35)]",
  ink: "text-[var(--a-ink)]",
};

interface ScoreboardProps {
  cells: ScoreCell[];
  /** Tamaño del número: `xl` para el hero y el panel, `md` para la ficha. */
  size?: "md" | "xl";
  /** Gira cada número al entrar en pantalla (marcador). */
  flip?: boolean;
  /** Si cambia, los números vuelven a girar (otra variante elegida). */
  flipKey?: string;
  className?: string;
  classNames?: { cell?: string; value?: string };
}

/**
 * Marcador de datos: celdas de número grande (dorsal, itálica condensada) con su rótulo en mono. Es el mismo en el
 * hero, en la ficha y en el panel: el dato que vende o que hay que mirar, sin buscarlo.
 */
export function Scoreboard({ cells, size = "md", flip = false, flipKey, className, classNames }: ScoreboardProps) {
  return (
    <dl className={cn("grid gap-px bg-[var(--a-line)] [perspective:600px]", className)}>
      {cells.map((c) => (
        <div key={c.label} className={cn("flex min-w-0 flex-col justify-between gap-2 bg-[var(--a-stage)] p-3 sm:p-4", classNames?.cell)}>
          <dt className={cn(s.mono, "text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--a-muted)]")}>{c.label}</dt>
          <dd key={flipKey} className={cn("flex min-w-0 flex-col", flip && s.flip, flipKey !== undefined && s.flipOnce)}>
            <span className={cn(s.display, s.num, "flex items-baseline gap-1.5 whitespace-nowrap", size === "xl" ? "text-[clamp(2.1rem,3.6vw,3.3rem)]" : "text-[clamp(1.9rem,3.4vw,3rem)]", TONE[c.tone ?? "ink"], classNames?.value)}>
              {c.value}
              {c.unit && <span className={cn(s.mono, "text-[11px] font-semibold not-italic normal-case tracking-normal text-[var(--a-muted)] [text-shadow:none]")}>{c.unit}</span>}
            </span>
            {c.note && <span className={cn(s.mono, "mt-1.5 text-[11px] text-[var(--a-muted)]")}>{c.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
