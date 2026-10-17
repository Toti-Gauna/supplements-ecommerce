"use client";
import { ArrowLeft, ArrowRight, MousePointerClick, Zap } from "lucide-react";
import { useRef, type FormEvent, type KeyboardEvent, type Ref } from "react";
import { Led } from "@/components/atoms/Led";
import { Button } from "@/components/atoms/Button";
import { QuizOptions } from "./QuizOptions";
import { QUIZ_STEPS, RESULT_STEP, type QuizDraft, type QuizStepId } from "./quiz-steps";

const ERROR: Partial<Record<QuizStepId, string>> = {
  goals: "Elegí al menos un objetivo.",
  restrictions: "Marcá al menos una opción, o Ninguna.",
};

/** Preguntas de una sola respuesta: al elegir, pasan solas a la siguiente. */
const SINGLE: QuizStepId[] = ["sport", "days", "time"];

interface Props {
  step: number;
  draft: QuizDraft;
  error: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onAnswer: (patch: QuizDraft) => void;
  /** Elegir una respuesta única: se ve marcada y avanza sola. */
  onPick: (patch: QuizDraft) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Una pregunta del quiz como una placa: el número en LED, la pregunta (legend del fieldset), sus opciones nativas y
 * Atrás/Siguiente. Las de una sola respuesta avanzan solas con clic, toque o espacio; con las flechas solo se elige
 * (para recorrer las opciones con el teclado) y Enter avanza, igual que el botón.
 */
export function QuizQuestion({ step, draft, error, headingRef, onAnswer, onPick, onNext, onBack }: Props) {
  const info = QUIZ_STEPS[step]!;
  const last = step === RESULT_STEP - 1;
  const single = SINGLE.includes(info.id);
  // La última tecla fue una flecha: el cambio de radio es para recorrer, no para elegir.
  const arrowNav = useRef(false);
  const choose = (patch: QuizDraft) => (arrowNav.current ? onAnswer(patch) : onPick(patch));
  const submit = (e: FormEvent) => { e.preventDefault(); onNext(); };
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    arrowNav.current = e.key.startsWith("Arrow");
    // Los radios y checkboxes no envían el formulario con Enter por sí solos.
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) { e.preventDefault(); e.currentTarget.requestSubmit(); }
  };
  return (
    <form onSubmit={submit} onKeyDown={onKeyDown} onPointerDown={() => { arrowNav.current = false; }} noValidate data-quiz-step={info.id}
      className="relative flex flex-col rounded-sm bg-white/[0.035] p-4 ring-1 ring-white/10 bevel sm:p-6">
      <fieldset aria-describedby={`quiz-hint-${info.id}${error ? ` quiz-error-${info.id}` : ""}`}>
        <legend className="mb-5 w-full">
          <span className="flex items-center justify-between gap-3">
            <span className="eyebrow block text-night-muted">Pregunta {step + 1} de {RESULT_STEP}</span>
            <span aria-hidden="true" className="flex items-end gap-1 text-night-muted">
              <Led value={String(step + 1).padStart(2, "0")} label="" motion="flip" key={step} className="h-7 sm:h-8" />
              <span className="font-lab pb-0.5 text-xs">/{String(RESULT_STEP).padStart(2, "0")}</span>
            </span>
          </span>
          <h2 ref={headingRef} tabIndex={-1} className="font-display mt-2 text-[clamp(1.7rem,7vw,2.8rem)] leading-[1.02] text-on-night outline-none">{info.question}</h2>
          <span id={`quiz-hint-${info.id}`} className="mt-1.5 block text-sm text-night-muted">{info.hint}</span>
        </legend>
        <QuizOptions step={info.id} draft={draft} onAnswer={onAnswer} onPick={choose} />
      </fieldset>
      {error && <p id={`quiz-error-${info.id}`} role="alert" className="mt-4 rounded-sm bg-danger-soft px-3 py-2 text-sm font-bold text-danger">{ERROR[info.id] ?? "Elegí una opción para seguir."}</p>}
      {single && (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-night-muted">
          <MousePointerClick size={15} aria-hidden="true" className="shrink-0 text-volt" />Elegí una y pasamos solos a la siguiente.
        </p>
      )}
      {/* En el celular, Atrás/Siguiente quedan a mano arriba del dock mientras se recorren las opciones. */}
      <div className="mt-5 flex items-center justify-between gap-3 max-sm:sticky max-sm:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] max-sm:z-10 max-sm:-mx-4 max-sm:-mb-4 max-sm:border-t max-sm:border-white/10 max-sm:bg-night/95 max-sm:px-4 max-sm:py-3 max-sm:backdrop-blur">
        {step > 0 ? (
          <Button variant="dark" onClick={onBack} className="px-5"><ArrowLeft size={17} aria-hidden="true" />Atrás</Button>
        ) : <span />}
        <Button type="submit" variant="light" className="min-w-[9.5rem] px-6">
          {last ? <><Zap size={17} aria-hidden="true" className="fill-current" />Ver mi programa</> : <>Siguiente<ArrowRight size={17} aria-hidden="true" /></>}
        </Button>
      </div>
    </form>
  );
}
