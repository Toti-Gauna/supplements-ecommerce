"use client";
import type { Ref } from "react";
import { recommendStack } from "@/demo/engine/quiz";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { encodeStack, stackSummary } from "@/demo/engine/stack-builder";
import { useGoal } from "../catalog/useGoals";
import type { QuizAnswers } from "@/demo/fixtures/stack-builder";
import { useDemoData } from "@/stores/admin";
import { QuizPickCard } from "./QuizPickCard";
import { QuizRecap } from "./QuizRecap";
import { QuizStage } from "./QuizStage";
import { QuizTotals } from "./QuizTotals";
import { RESULT_STEP } from "./quiz-steps";

interface Props {
  answers: QuizAnswers;
  titleRef: Ref<HTMLHeadingElement>;
  animate: boolean;
  onEdit: (step: number) => void;
  onRestart: () => void;
}

/**
 * Resultado del quiz: el stack que arma el motor (`recommendStack`) con el catálogo y la regla de descuento vigentes
 * del panel, cada producto con su porqué y el resumen con el mismo cálculo que el carrito.
 */
export function QuizOutcome({ answers, titleRef, animate, onEdit, onRestart }: Props) {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const result = recommendStack(answers, catalog);
  const summary = stackSummary(result.picks, catalog, rule);
  const goal = useGoal(answers.goal)?.name.toLowerCase() ?? answers.goal;
  return (
    <>
      <QuizStage eyebrow="¿Qué necesitás? · Tu resultado" title={`Tu stack para ${goal}`} titleRef={titleRef} step={RESULT_STEP}
        intro="Recomendación orientativa según tus respuestas: no reemplaza la consulta con un profesional de la salud o del deporte.">
        <QuizRecap answers={answers} notes={result.notes} onEdit={onEdit} />
      </QuizStage>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <section aria-labelledby="quiz-picks-title">
          <h2 id="quiz-picks-title" className="font-display text-2xl sm:text-3xl">Qué lleva y por qué</h2>
          {summary.lines.length === 0 ? (
            <p className="mt-4 rounded-sm bg-surface p-6 text-muted">Con estas restricciones no encontramos productos con stock. Probá con menos restricciones o armalo a mano.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
              {summary.lines.map((line, i) => (
                <QuizPickCard key={line.slot} line={line} index={i} animate={animate} reasons={result.picks.find((p) => p.slot === line.slot)?.reasons ?? []} />
              ))}
            </ul>
          )}
        </section>
        <QuizTotals summary={summary} rule={rule} builderHref={`/crear/?${encodeStack(answers.goal, result.picks)}`} onRestart={onRestart} />
      </div>
    </>
  );
}
