"use client";
import { motion, useReducedMotion } from "motion/react";
import { History } from "lucide-react";
import { Breadcrumbs } from "@/components/templates/PageHeader";
import { answerLabel, QUIZ_STEPS, RESULT_STEP } from "./quiz-steps";
import { QuizOutcome } from "./QuizOutcome";
import { QuizQuestion } from "./QuizQuestion";
import { QuizStage } from "./QuizStage";
import { useQuiz } from "./useQuiz";

/**
 * Quiz "¿Qué necesitás?" (Fase 3, L4): cinco preguntas (objetivos, deporte, días, horario y restricciones), una por
 * pantalla, y "Tu programa": el stack con el porqué de cada producto, el equipamiento del deporte y la compra mensual. Cada pantalla entra deslizándose en el sentido del avance; con "reducir movimiento", sin animación.
 */
export function QuizView() {
  const quiz = useQuiz();
  const reduce = useReducedMotion();
  const enter = reduce || !quiz.moved ? false : { opacity: 0, x: quiz.dir * 36 };
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs crumbs={[{ href: "/crear/", label: "Armá tu stack" }]} />
      {quiz.step === RESULT_STEP && quiz.answers ? (
        <QuizOutcome answers={quiz.answers} titleRef={quiz.headingRef} animate={!reduce} onEdit={quiz.goTo} onRestart={quiz.restart} />
      ) : (
        <QuizStage eyebrow="Quiz · 5 preguntas · 1 minuto" title="¿Qué necesitás?" step={quiz.step}
          intro="Contanos tus objetivos, tu deporte y cómo entrenás: te armamos un programa con el porqué de cada producto.">
          <div className="flex flex-col gap-5">
            {quiz.step === 0 && quiz.saved && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-sm bg-white/[0.05] px-4 py-3 text-sm ring-1 ring-white/10">
                <History size={18} aria-hidden="true" className="shrink-0 text-ion" />
                <p className="min-w-0 flex-1">Tu último programa: <strong>{QUIZ_STEPS.map((s) => answerLabel(quiz.saved!, s.id)).join(" · ")}</strong></p>
                <button type="button" onClick={quiz.resume} className="min-h-11 font-bold text-volt underline underline-offset-4">Ver mi último programa</button>
              </div>
            )}
            <motion.div key={quiz.step} initial={enter} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <QuizQuestion step={quiz.step} draft={quiz.draft} error={quiz.error} headingRef={quiz.headingRef} onAnswer={quiz.answer} onNext={quiz.next} onBack={quiz.back} />
            </motion.div>
          </div>
        </QuizStage>
      )}
    </div>
  );
}
