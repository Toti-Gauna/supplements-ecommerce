"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHydrated } from "@/stores/hydration";
import { loadQuizAnswers, saveQuizAnswers } from "./quiz-memory";
import { completeAnswers, isAnswered, QUIZ_STEPS, RESULT_STEP, type QuizDraft } from "./quiz-steps";

/**
 * Estado del quiz "¿Qué necesitás?": pantalla actual (0-4 preguntas, 5 resultado), respuestas, sentido del avance
 * para la animación y el último resultado guardado en el navegador. Al cambiar de pantalla el foco va al título nuevo.
 */
export function useQuiz() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [moved, setMoved] = useState(false);
  const [draft, setDraft] = useState<QuizDraft>({});
  const [error, setError] = useState(false);
  const [resumeOff, setResumeOff] = useState(false);
  const hydrated = useHydrated();
  // Se lee después de rehidratar: el HTML estático no sabe qué hay guardado.
  const saved = useMemo(() => (hydrated ? loadQuizAnswers() : null), [hydrated]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (moved) headingRef.current?.focus();
  }, [step, moved]);

  const go = (to: number) => {
    setDir(to >= step ? 1 : -1);
    setStep(to);
    setMoved(true);
    setError(false);
  };
  const answers = completeAnswers(draft);

  return {
    step: step === RESULT_STEP && !answers ? 0 : step,
    dir,
    moved,
    draft,
    answers,
    error,
    saved: resumeOff ? null : saved,
    headingRef,
    answer: (patch: QuizDraft) => { setDraft((d) => ({ ...d, ...patch })); setError(false); },
    /** Siguiente (o "Ver mi programa" en la última): sin respuesta avisa y no avanza. */
    next: () => {
      if (!isAnswered(draft, QUIZ_STEPS[step]!.id)) { setError(true); return; }
      if (step === RESULT_STEP - 1 && answers) saveQuizAnswers(answers);
      go(step + 1);
    },
    back: () => go(Math.max(0, step - 1)),
    goTo: go,
    resume: () => { if (!saved) return; setDraft(saved); go(RESULT_STEP); },
    restart: () => { setDraft({}); setResumeOff(true); go(0); },
  };
}

export type QuizState = ReturnType<typeof useQuiz>;
