"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHydrated } from "@/stores/hydration";
import { loadQuizAnswers, saveQuizAnswers } from "./quiz-memory";
import { completeAnswers, isAnswered, QUIZ_STEPS, RESULT_STEP, type QuizDraft } from "./quiz-steps";

/** Cuánto se ve la opción elegida antes de pasar solo a la pregunta siguiente (con "reducir movimiento", casi nada). */
export const AUTO_ADVANCE_MS = { normal: 320, reduced: 120 } as const;

/**
 * Estado del quiz "¿Qué necesitás?": pantalla actual (0-4 preguntas, 5 resultado), respuestas, sentido del avance
 * para la animación y el último resultado guardado en el navegador. Al cambiar de pantalla el foco va al título nuevo.
 * Las preguntas de una sola respuesta avanzan solas al elegir (`pick`); la de objetivos (varias) espera "Siguiente".
 */
export function useQuiz(reduceMotion = false) {
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
  // El avance automático corre después del render: lee lo último contestado y el paso actual, no los de su closure.
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (moved) headingRef.current?.focus();
  }, [step, moved]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (to: number) => {
    clearTimeout(timer.current);
    setDir(to >= stepRef.current ? 1 : -1);
    stepRef.current = to;
    setStep(to);
    setMoved(true);
    setError(false);
  };
  const answer = (patch: QuizDraft) => {
    draftRef.current = { ...draftRef.current, ...patch };
    setDraft(draftRef.current);
    setError(false);
  };
  const next = () => {
    const at = stepRef.current;
    const current = draftRef.current;
    if (!isAnswered(current, QUIZ_STEPS[at]!.id)) { setError(true); return; }
    const done = completeAnswers(current);
    if (at === RESULT_STEP - 1 && done) saveQuizAnswers(done);
    go(at + 1);
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
    answer,
    /** Respuesta única elegida con clic, toque o espacio: se ve marcada un instante y pasa a la siguiente. */
    pick: (patch: QuizDraft) => {
      answer(patch);
      const from = stepRef.current;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { if (stepRef.current === from) next(); }, reduceMotion ? AUTO_ADVANCE_MS.reduced : AUTO_ADVANCE_MS.normal);
    },
    /** Siguiente (o "Ver mi programa" en la última): sin respuesta avisa y no avanza. */
    next,
    back: () => go(Math.max(0, stepRef.current - 1)),
    goTo: go,
    resume: () => { if (!saved) return; answer(saved); go(RESULT_STEP); },
    restart: () => { draftRef.current = {}; setDraft({}); setResumeOff(true); go(0); },
  };
}

export type QuizState = ReturnType<typeof useQuiz>;
