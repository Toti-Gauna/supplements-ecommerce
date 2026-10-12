"use client";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import type { FormEvent, KeyboardEvent, Ref } from "react";
import { Button } from "@/components/atoms/Button";
import { QuizOptions } from "./QuizOptions";
import { QUIZ_STEPS, RESULT_STEP, type QuizDraft } from "./quiz-steps";

interface Props {
  step: number;
  draft: QuizDraft;
  error: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onAnswer: (patch: QuizDraft) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Una pregunta del quiz: formulario con fieldset y legend (la pregunta), sus opciones nativas y Atrás/Siguiente.
 * Enter sobre una opción avanza, igual que el botón; sin respuesta avisa en lugar de avanzar.
 */
export function QuizQuestion({ step, draft, error, headingRef, onAnswer, onNext, onBack }: Props) {
  const info = QUIZ_STEPS[step]!;
  const last = step === RESULT_STEP - 1;
  const submit = (e: FormEvent) => { e.preventDefault(); onNext(); };
  // Los radios y checkboxes no envían el formulario con Enter por sí solos.
  const enterSubmits = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) { e.preventDefault(); e.currentTarget.requestSubmit(); }
  };
  return (
    <form onSubmit={submit} onKeyDown={enterSubmits} noValidate>
      <fieldset aria-describedby={`quiz-hint-${info.id}${error ? ` quiz-error-${info.id}` : ""}`}>
        <legend className="mb-5 w-full">
          <span className="eyebrow block text-night-muted">Pregunta {step + 1} de {RESULT_STEP}</span>
          <h2 ref={headingRef} tabIndex={-1} className="font-display mt-1.5 text-[clamp(1.6rem,6.5vw,2.6rem)] leading-[1.05] text-on-night outline-none">{info.question}</h2>
          <span id={`quiz-hint-${info.id}`} className="mt-1.5 block text-sm text-night-muted">{info.hint}</span>
        </legend>
        <QuizOptions step={info.id} draft={draft} onAnswer={onAnswer} />
      </fieldset>
      {error && <p id={`quiz-error-${info.id}`} role="alert" className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm font-bold text-danger">{info.id === "restrictions" ? "Marcá al menos una opción, o Ninguna." : "Elegí una opción para seguir."}</p>}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="dark" onClick={onBack} className="px-5"><ArrowLeft size={17} aria-hidden="true" />Atrás</Button>
        ) : <span />}
        <Button type="submit" variant="light" className="min-w-[9.5rem] px-6">
          {last ? <><Zap size={17} aria-hidden="true" className="fill-current" />Ver mi stack</> : <>Siguiente<ArrowRight size={17} aria-hidden="true" /></>}
        </Button>
      </div>
    </form>
  );
}
