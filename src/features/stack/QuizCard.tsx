import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { cn } from "@/lib/cn";
import { QUIZ_STEPS } from "../quiz/quiz-steps";

/** Las cinco preguntas del quiz, como celdas de batería que se van cargando. */
const STEPS = QUIZ_STEPS.map((s) => s.label);

/** Tarjeta llamativa hacia el quiz "¿Qué necesitás?" (`/crear/quiz/`), para quien no sabe por dónde arrancar: objetivos y deporte. */
export function QuizCard({ className }: { className?: string }) {
  return (
    <Link href="/crear/quiz/"
      className={cn("group relative isolate flex items-center gap-4 overflow-hidden rounded-sm bg-night p-4 text-on-night ring-1 ring-plasma/40 transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-22px_color-mix(in_srgb,var(--brand-glow)_90%,transparent)] sm:p-5", className)}>
      <span aria-hidden="true" className="absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-plasma/35 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-sm bg-volt text-night shadow-[0_0_24px_-4px_var(--color-volt)]">
        <CircleHelp size={24} strokeWidth={2.4} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-lg leading-tight sm:text-xl">¿No sabés por dónde arrancar? <span className="text-volt">Hacé el quiz</span></span>
        <span className="hidden text-[13px] leading-snug text-night-muted sm:block">{STEPS.length} preguntas sobre tus objetivos y tu deporte: te armamos el programa, con el porqué de cada producto.</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-1.5">
          {STEPS.map((s, i) => <span key={s} aria-hidden="true" className={cn("h-1.5 w-6 rounded-sm transition-colors duration-300", i === 0 ? "bg-volt" : "bg-white/15 group-hover:bg-volt/60")} style={{ transitionDelay: `${i * 70}ms` }} />)}
          <span className="eyebrow ml-2 text-[9.5px] text-night-muted sm:hidden">{STEPS.length} preguntas · objetivos y deporte</span>
        </span>
      </span>
      <ArrowRight size={22} aria-hidden="true" className="shrink-0 text-volt transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
