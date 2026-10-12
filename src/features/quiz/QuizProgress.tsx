import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { cn } from "@/lib/cn";
import { QUIZ_STEPS, RESULT_STEP } from "./quiz-steps";

/**
 * Avance del quiz como una batería de cuatro celdas: se enciende una por pregunta contestada y queda completa (en
 * verde) en el resultado. Debajo, el rótulo de cada pregunta con la actual marcada.
 */
export function QuizProgress({ step }: { step: number }) {
  const done = step >= RESULT_STEP;
  return (
    <div className="flex flex-col gap-2">
      <BatteryMeter pct={(Math.min(step, RESULT_STEP) / RESULT_STEP) * 100} cells={RESULT_STEP} tone={done ? "success" : "volt"}
        label={done ? "Quiz completo" : `Pregunta ${step + 1} de ${RESULT_STEP}`} className="border-white/15" />
      <ol aria-hidden="true" className="grid grid-cols-4 gap-[3px] pr-[5px]">
        {QUIZ_STEPS.map((s, i) => (
          <li key={s.id} className={cn("truncate text-[11px] font-bold leading-tight", i === step ? "text-volt" : i < step ? "text-on-night" : "text-night-muted")}>
            <span className="font-lab font-normal opacity-70 max-sm:hidden">{i + 1} </span>{s.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
