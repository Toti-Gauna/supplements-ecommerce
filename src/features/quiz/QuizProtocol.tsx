import { Dumbbell, Moon, Sunrise, Zap, type LucideIcon } from "lucide-react";
import { dayProtocol, type ProtocolBlock, type ProtocolMoment } from "@/demo/engine/protocol";
import { QUIZ_TIMES, type TrainingTime } from "@/demo/fixtures/stack-builder";
import type { Product } from "@/demo/types";
import { cn } from "@/lib/cn";

const COLS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };
const ICON: Record<ProtocolMoment, LucideIcon> = { manana: Sunrise, pre: Zap, post: Dumbbell, noche: Moon };

/** Un momento del día: la hora, el nombre, cuándo y lo que se toma, con la dosis. */
function Moment({ block }: { block: ProtocolBlock }) {
  const Icon = ICON[block.moment];
  return (
    <li data-protocol-moment={block.moment} className="relative flex min-w-0 gap-3 md:flex-col">
      <span aria-hidden="true" className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-night text-volt ring-1 ring-volt/30 shadow-[0_0_18px_-6px_var(--color-volt)]">
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1 rounded-sm border border-line bg-surface p-3.5 shadow-[var(--shadow-card)]">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-lab text-xl font-bold tabular-nums text-ink">{block.clock}</span>
          <span className="font-display text-lg leading-tight">{block.label}</span>
        </p>
        <p className="text-[13px] text-muted">{block.when}</p>
        <ul className="mt-2.5 flex flex-col gap-2 border-t border-line pt-2.5">
          {block.items.map((item) => (
            <li key={item.slug} data-protocol-item={item.slug} className="text-sm leading-snug">
              <span className="font-bold">{item.name}</span>
              {item.dose && <span className="font-lab block text-xs text-muted">{item.dose}</span>}
              {(item.during || item.trainingOnly) && (
                <span className="font-lab mt-1 block w-fit rounded-sm bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-ink">
                  {item.during ? "Durante el entreno" : "Solo los días que entrenás"}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/**
 * "El protocolo del día" de Tu programa (R2c): una línea de tiempo (vertical en el celular, de izquierda a derecha en
 * escritorio) con cuándo tomar cada producto, sacada de su "Cómo tomarlo" y del horario de entrenamiento. Orientativo.
 */
export function QuizProtocol({ products, time }: { products: Product[]; time: TrainingTime }) {
  const blocks = dayProtocol(products, time);
  if (!blocks.length) return null;
  const timeLabel = QUIZ_TIMES.find((t) => t.value === time)?.label.toLowerCase() ?? "";
  return (
    <section aria-labelledby="quiz-protocol-title" data-protocol>
      <p className="eyebrow text-volt-ink">Cuándo tomar cada uno</p>
      <h2 id="quiz-protocol-title" className="font-display mt-1 text-2xl sm:text-3xl">El protocolo del día</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Según el modo de uso de cada producto y tu horario: entrenás {timeLabel}. Las horas son orientativas; un servicio de cada uno por día.
      </p>
      <ol className={cn("relative mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 md:gap-3",
        "before:absolute before:bottom-6 before:left-[1.375rem] before:top-6 before:w-0.5 before:bg-line md:before:bottom-auto md:before:left-6 md:before:right-6 md:before:top-[1.375rem] md:before:h-0.5 md:before:w-auto",
        COLS[blocks.length])}>
        {blocks.map((b) => <Moment key={b.moment} block={b} />)}
      </ol>
    </section>
  );
}
