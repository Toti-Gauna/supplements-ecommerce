import type { ReactNode, Ref } from "react";
import { QuizProgress } from "./QuizProgress";
import { brand } from "@/config/brand";

interface Props {
  eyebrow: string;
  title: string;
  /** El título recibe el foco al llegar al resultado. */
  titleRef?: Ref<HTMLHeadingElement>;
  intro?: ReactNode;
  step: number;
  children: ReactNode;
}

/**
 * Escenario del quiz: banda noche con halo plasma y rayo. En el celular, título, batería de avance y contenido uno
 * debajo del otro; en escritorio, título y batería a la izquierda y la pantalla actual a la derecha.
 */
export function QuizStage({ eyebrow, title, titleRef, intro, step, children }: Props) {
  return (
    <section aria-labelledby="quiz-title" className="relative isolate overflow-hidden rounded-sm bg-night px-5 py-7 text-on-night sm:rounded-sm sm:p-10 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_0%_0%,color-mix(in_srgb,var(--brand-glow)_22%,transparent),transparent_70%),radial-gradient(55%_45%_at_100%_100%,color-mix(in_srgb,var(--brand-volt)_9%,transparent),transparent_70%)]" />
      <svg aria-hidden="true" viewBox="0 0 120 200" className="pointer-events-none absolute -right-6 top-6 -z-10 h-48 w-28 opacity-[0.07] sm:h-72 sm:w-44 lg:-bottom-10 lg:left-[30%] lg:right-auto lg:top-auto lg:h-96 lg:w-56">
        <path d="M74 0 18 112h38l-12 88 58-120H64Z" fill={brand.signature.volt} />
      </svg>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="flex flex-col gap-6 lg:self-start">
          <header>
            <p className="eyebrow text-volt">{eyebrow}</p>
            <h1 id="quiz-title" ref={titleRef} tabIndex={-1} className="font-display mt-2 text-[clamp(2.3rem,9vw,4rem)] leading-[0.98] outline-none">{title}</h1>
            {intro && <div className="mt-3 max-w-xl text-night-muted sm:text-lg">{intro}</div>}
          </header>
          <QuizProgress step={step} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
