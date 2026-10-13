import { Info, Pencil } from "lucide-react";
import type { CSSProperties } from "react";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { useGoal } from "../catalog/useGoals";
import type { QuizAnswers } from "@/demo/fixtures/stack-builder";
import { answerLabel, QUIZ_STEPS } from "./quiz-steps";

/**
 * Arriba del resultado: las cuatro respuestas (cada una vuelve a su pregunta para cambiarla) y los ajustes que hizo
 * el quiz por esas respuestas ("Entrenás de noche: el pre va sin cafeína…").
 */
export function QuizRecap({ answers, notes, onEdit }: { answers: QuizAnswers; notes: string[]; onEdit: (step: number) => void }) {
  const hue = useGoal(answers.goal)?.hue;
  return (
    <div className="flex flex-col gap-4">
      <ul aria-label="Tus respuestas" className="grid grid-cols-2 gap-2">
        {QUIZ_STEPS.map((s, i) => {
          const value = answerLabel(answers, s.id);
          return (
            <li key={s.id} className="flex">
              <button type="button" onClick={() => onEdit(i)} aria-label={`Cambiar ${s.label.toLowerCase()}: ${value}`} style={{ "--hue": hue } as CSSProperties}
                className="group flex min-h-14 w-full items-center gap-2 rounded-sm bg-white/[0.06] px-3.5 py-2 text-left ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.12] hover:ring-volt/40">
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block text-[10px] text-night-muted">{s.label}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-sm font-bold leading-tight">
                    {s.id === "goal" && <GoalGlyph goal={answers.goal} className="h-4 w-4 shrink-0 text-[color:var(--hue)]" />}{value}
                  </span>
                </span>
                <Pencil size={14} aria-hidden="true" className="shrink-0 text-night-muted transition-colors group-hover:text-volt" />
              </button>
            </li>
          );
        })}
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
