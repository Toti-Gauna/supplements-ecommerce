import type { ReactNode, Ref } from "react";
import { QuizProgress } from "./QuizProgress";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

interface Props {
  eyebrow: string;
  title: string;
  /** El título recibe el foco al llegar al resultado. */
  titleRef?: Ref<HTMLHeadingElement>;
  intro?: ReactNode;
  step: number;
  /** Preguntas: el escenario ocupa la pantalla (de borde a borde en el celular) y la placa queda centrada. */
  fill?: boolean;
  /** Ya arrancó: en el celular el título se achica y la volanta y la bajada se van, para que la pregunta entre en la pantalla. */
  compact?: boolean;
  children: ReactNode;
}

/**
 * Escenario del quiz: banda noche con halo plasma y rayo. En el celular, título, batería de avance y contenido uno
 * debajo del otro; en escritorio, título y batería a la izquierda y la pantalla actual a la derecha. Con las preguntas
 * ocupa la pantalla (de borde a borde en el celular), una placa por pregunta.
 */
export function QuizStage({ eyebrow, title, titleRef, intro, step, fill = false, compact = false, children }: Props) {
  return (
    <section aria-labelledby="quiz-title" data-quiz-stage={fill ? "full" : undefined}
      className={cn("relative isolate overflow-clip bg-night text-on-night sm:rounded-sm sm:p-10 lg:p-12", fill
        ? "-mx-4 flex min-h-[calc(100svh-9.5rem)] flex-col justify-center px-4 py-6 sm:mx-0 sm:min-h-[calc(100svh-12rem)]"
        : "rounded-sm px-5 py-7")}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_0%_0%,color-mix(in_srgb,var(--brand-glow)_22%,transparent),transparent_70%),radial-gradient(55%_45%_at_100%_100%,color-mix(in_srgb,var(--brand-volt)_9%,transparent),transparent_70%)]" />
      <svg aria-hidden="true" viewBox="0 0 120 200" className="pointer-events-none absolute -right-6 top-6 -z-10 h-48 w-28 opacity-[0.07] sm:h-72 sm:w-44 lg:-bottom-10 lg:left-[30%] lg:right-auto lg:top-auto lg:h-96 lg:w-56">
        <path d="M74 0 18 112h38l-12 88 58-120H64Z" fill={brand.signature.volt} />
      </svg>
      <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14", compact && "max-sm:gap-4")}>
        <div className={cn("flex flex-col gap-6 lg:self-start", fill && "lg:sticky lg:top-28", compact && "max-sm:gap-3")}>
          <header>
            <p className={cn("eyebrow text-volt", compact && "max-sm:hidden")}>{eyebrow}</p>
            <h1 id="quiz-title" ref={titleRef} tabIndex={-1}
              className={cn("font-display mt-2 text-[clamp(2.3rem,9vw,4rem)] leading-[0.98] outline-none", compact && "max-sm:mt-0 max-sm:text-2xl")}>{title}</h1>
            {intro && <div className={cn("mt-3 max-w-xl text-night-muted sm:text-lg", compact && "max-sm:hidden")}>{intro}</div>}
          </header>
          <QuizProgress step={step} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
