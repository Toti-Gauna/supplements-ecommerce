import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { cn } from "@/lib/cn";

/** Las cuatro preguntas del quiz, como celdas de batería que se van cargando. */
const STEPS = ["Objetivo", "Días", "Horario", "Restricciones"];

/** Tarjeta llamativa hacia el quiz "¿Qué necesitás?" (`/crear/quiz/`), para quien no sabe por dónde arrancar. */
export function QuizCard({ className }: { className?: string }) {
  return (
    <Link href="/crear/quiz/"
      className={cn("group relative isolate flex items-center gap-4 overflow-hidden rounded-[var(--radius-card)] bg-night p-4 text-on-night ring-1 ring-plasma/40 transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-22px_rgb(139_114_255/0.9)] sm:p-5", className)}>
      <span aria-hidden="true" className="absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-plasma/35 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-volt text-night shadow-[0_0_24px_-4px_var(--color-volt)]">
        <CircleHelp size={24} strokeWidth={2.4} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-lg leading-tight sm:text-xl">¿No sabés por dónde arrancar? <span className="text-volt">Hacé el quiz</span></span>
        <span className="hidden text-[13px] leading-snug text-night-muted sm:block">4 preguntas y te armamos el stack, con el porqué de cada producto.</span>
        <span className="mt-1 flex items-center gap-1">
          {STEPS.map((s, i) => <span key={s} aria-hidden="true" className={cn("h-1.5 w-6 rounded-full transition-colors duration-300", i === 0 ? "bg-volt" : "bg-white/15 group-hover:bg-volt/60")} style={{ transitionDelay: `${i * 70}ms` }} />)}
          <span className="eyebrow ml-2 text-[9.5px] text-night-muted sm:hidden">4 preguntas</span>
        </span>
      </span>
      <ArrowRight size={22} aria-hidden="true" className="shrink-0 text-volt transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
