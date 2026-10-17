"use client";
import type { CSSProperties, Ref } from "react";
import { SportArt } from "@/components/illustrations/SportArt";
import { programPack } from "@/demo/engine/program";
import { recommendStack } from "@/demo/engine/quiz";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { encodeStack, stackSummary } from "@/demo/engine/stack-builder";
import type { QuizAnswers } from "@/demo/fixtures/stack-builder";
import { useDemoData } from "@/stores/admin";
import { useGoals } from "../catalog/useGoals";
import { QuizGearCard } from "./QuizGearCard";
import { QuizPickCard } from "./QuizPickCard";
import { QuizProgramPanel } from "./QuizProgramPanel";
import { QuizRecap } from "./QuizRecap";
import { QuizStage } from "./QuizStage";
import { programTitle, RESULT_STEP } from "./quiz-steps";

interface Props {
  answers: QuizAnswers;
  titleRef: Ref<HTMLHeadingElement>;
  animate: boolean;
  onEdit: (step: number) => void;
  onRestart: () => void;
}

/**
 * Resultado del quiz, "Tu programa": el stack que arma el motor (`recommendStack`) con el catálogo vigente del panel,
 * cada producto con su porqué; el equipamiento del deporte ("Para tu deporte"); y la compra del programa como un pack a
 * medida (`programPack`), una vez o todos los meses.
 */
export function QuizOutcome({ answers, titleRef, animate, onEdit, onRestart }: Props) {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const goals = useGoals();
  const result = recommendStack(answers, catalog);
  const summary = stackSummary(result.picks, catalog, rule);
  const inProgram = new Set(programPack(result)?.items.map((i) => i.productSlug));
  const title = programTitle(answers.goals.map((g) => goals.find((x) => x.id === g)?.name ?? g), result.sport?.name);
  return (
    <>
      <QuizStage eyebrow="¿Qué necesitás? · Tu resultado" title={title} titleRef={titleRef} step={RESULT_STEP}
        intro="Recomendación orientativa según tus respuestas: no reemplaza la consulta con un profesional de la salud o del deporte.">
        <QuizRecap answers={answers} notes={result.notes} onEdit={onEdit} />
      </QuizStage>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-10">
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
          {result.sport && result.gear.length > 0 && (
            <section aria-labelledby="quiz-gear-title" style={{ "--hue": result.sport.hue } as CSSProperties}>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid h-14 w-12 shrink-0 place-items-center rounded-sm bg-night text-[color:var(--hue)]">
                  <SportArt sport={result.sport.id} className="h-12 w-10" />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow text-muted">{result.sport.name} · equipamiento</p>
                  <h2 id="quiz-gear-title" className="font-display text-2xl sm:text-3xl">Para tu deporte</h2>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
                {result.gear.map((g) => <QuizGearCard key={g.product.slug} product={g.product} variant={g.variant} included={inProgram.has(g.product.slug)} />)}
              </ul>
            </section>
          )}
        </div>
        <QuizProgramPanel result={result} builderHref={`/crear/?${encodeStack(result.goals, result.picks, answers.sport)}`} onRestart={onRestart} />
      </div>
    </>
  );
}
