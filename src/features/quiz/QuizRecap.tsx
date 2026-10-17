import { Info, Pencil } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { AthleteSilhouette } from "@/components/illustrations/AthleteSilhouette";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { SportArt } from "@/components/illustrations/SportArt";
import { sportInfo } from "@/demo/engine/sports";
import type { QuizAnswers } from "@/demo/fixtures/stack-builder";
import { cn } from "@/lib/cn";
import { useGoals } from "../catalog/useGoals";
import { answerLabel, QUIZ_STEPS, type QuizStepId } from "./quiz-steps";

const hued = (hue: string | undefined) => ({ "--hue": hue ?? "var(--color-volt)" }) as CSSProperties;

/** Lo que se ve de cada respuesta: los objetivos con su ícono y color, el deporte con su dibujo, lo demás en texto. */
function AnswerValue({ id, answers }: { id: QuizStepId; answers: QuizAnswers }) {
  const goals = useGoals();
  if (id === "goals") {
    return (
      <span className="flex flex-wrap gap-x-3 gap-y-1">
        {answers.goals.map((g) => {
          const info = goals.find((x) => x.id === g);
          return (
            <span key={g} style={hued(info?.hue)} className="flex items-center gap-1.5">
              <GoalGlyph goal={g} className="h-4 w-4 shrink-0 text-[color:var(--hue)]" />{info?.name ?? g}
            </span>
          );
        })}
      </span>
    );
  }
  let art: ReactNode = null;
  if (id === "sport") {
    const sport = answers.sport ? sportInfo(answers.sport) : undefined;
    art = (
      <span aria-hidden="true" style={hued(sport?.hue)} className="text-[color:var(--hue)]">
        {sport ? <SportArt sport={sport.id} className="h-6 w-5" /> : <AthleteSilhouette goal="fuerza" className="h-6 w-4" />}
      </span>
    );
  }
  return <span className="flex items-center gap-1.5">{art}{answerLabel(answers, id)}</span>;
}

/**
 * Arriba del resultado: las cinco respuestas (cada una vuelve a su pregunta para cambiarla) y los ajustes que hizo
 * el quiz por esas respuestas ("Para fútbol sumamos resistencia…", "Entrenás de noche: el pre va sin cafeína…").
 */
export function QuizRecap({ answers, notes, onEdit }: { answers: QuizAnswers; notes: string[]; onEdit: (step: number) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <ul aria-label="Tus respuestas" className="grid grid-cols-2 gap-2">
        {QUIZ_STEPS.map((s, i) => (
          <li key={s.id} className={cn("flex", s.id === "goals" && "col-span-2")}>
            <button type="button" onClick={() => onEdit(i)} aria-label={`Cambiar ${s.label.toLowerCase()}: ${answerLabel(answers, s.id)}`}
              className="group flex min-h-14 w-full items-center gap-2 rounded-sm bg-white/[0.06] px-3.5 py-2 text-left ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.12] hover:ring-volt/40">
              <span className="min-w-0 flex-1">
                <span className="eyebrow block text-[10px] text-night-muted">{s.label}</span>
                <span className="mt-0.5 block text-sm font-bold leading-tight"><AnswerValue id={s.id} answers={answers} /></span>
              </span>
              <Pencil size={14} aria-hidden="true" className="shrink-0 text-night-muted transition-colors group-hover:text-volt" />
            </button>
          </li>
        ))}
      </ul>
      {notes.length > 0 && (
        <ul aria-label="Ajustes por tus respuestas" className="flex flex-col gap-2">
          {notes.map((n) => (
            <li key={n} className="flex items-start gap-2.5 rounded-sm bg-ion/10 px-3.5 py-2.5 text-sm ring-1 ring-ion/25">
              <Info size={17} aria-hidden="true" className="mt-px shrink-0 text-ion" />{n}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
