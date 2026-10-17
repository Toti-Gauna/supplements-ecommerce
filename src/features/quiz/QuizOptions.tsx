"use client";
import { LayoutGrid, Moon, Sun, Sunrise, type LucideIcon } from "lucide-react";
import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import { QUIZ_DAYS, QUIZ_RESTRICTIONS, QUIZ_TIMES, type Restriction, type TrainingDays, type TrainingTime } from "@/demo/fixtures/stack-builder";
import { cn } from "@/lib/cn";
import { QuizChoice } from "./QuizChoice";
import { QuizGoalOptions } from "./QuizGoalOptions";
import { QuizSportOptions } from "./QuizSportOptions";
import type { QuizDraft, QuizStepId } from "./quiz-steps";

const TIME_ICON: Record<TrainingTime, LucideIcon> = { manana: Sunrise, tarde: Sun, noche: Moon };
const TIME_HINT: Record<TrainingTime, string> = { manana: "Antes de arrancar el día", tarde: "Entre el laburo y la cena", noche: "Cuidamos tu descanso: nada de cafeína" };
const DAYS_LIT: Record<TrainingDays, number> = { "1-2": 2, "3-4": 4, "5+": 6 };

/** Semana de 7 rayitas con los días que entrenás encendidos (dibujo de la opción). */
function WeekBars({ lit }: { lit: number }) {
  return (
    <span className="flex h-6 items-end gap-[3px]">
      {Array.from({ length: 7 }, (_, i) => <span key={i} className={cn("w-1 rounded-sm", i < lit ? "h-6 bg-[var(--hue)] shadow-[0_0_6px_var(--hue)]" : "h-3 bg-white/20")} />)}
    </span>
  );
}

interface Props {
  step: QuizStepId;
  draft: QuizDraft;
  onAnswer: (patch: QuizDraft) => void;
  /** Respuesta única (deporte, días, horario): avanza sola. */
  onPick: (patch: QuizDraft) => void;
}

/** Las opciones de cada pregunta: objetivos (hasta 3), deporte, días, horario y restricciones (con "Ninguna"). */
export function QuizOptions({ step, draft, onAnswer, onPick }: Props) {
  if (step === "goals") return <QuizGoalOptions chosen={draft.goals ?? []} onChange={(goals) => onAnswer({ goals })} />;
  if (step === "sport") return <QuizSportOptions value={draft.sport} onChange={(sport) => onPick({ sport })} />;
  if (step === "days") {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
        {QUIZ_DAYS.map((d) => (
          <QuizChoice key={d.value} type="radio" name="days" value={d.value} checked={draft.days === d.value} onChange={() => onPick({ days: d.value })}
            icon={<WeekBars lit={DAYS_LIT[d.value]} />} title={d.label} description={d.hint} />
        ))}
      </div>
    );
  }
  if (step === "time") {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
        {QUIZ_TIMES.map((t) => {
          const Icon = TIME_ICON[t.value];
          return (
            <QuizChoice key={t.value} type="radio" name="time" value={t.value} hue={t.value === "noche" ? "var(--color-plasma)" : undefined} checked={draft.time === t.value}
              onChange={() => onPick({ time: t.value })} icon={<Icon size={22} />} title={t.label} description={TIME_HINT[t.value]} />
          );
        })}
      </div>
    );
  }
  const list = draft.restrictions;
  const toggle = (r: Restriction, on: boolean) => {
    const rest = (list ?? []).filter((x) => x !== r);
    // Desmarcar la última deja la pregunta sin contestar (hay que elegir algo o "Ninguna").
    onAnswer({ restrictions: on ? [...rest, r] : rest.length ? rest : undefined });
  };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 min-[420px]:grid-cols-2">
      {QUIZ_RESTRICTIONS.map((r) => (
        <QuizChoice key={r.value} type="checkbox" name="restrictions" value={r.value} checked={!!list?.includes(r.value)} onChange={(on) => toggle(r.value, on)}
          icon={<BadgeGlyph badge={r.value} className="h-6 w-6" />} title={r.label} />
      ))}
      <QuizChoice type="checkbox" name="restrictions" value="ninguna" checked={list?.length === 0} onChange={(on) => onAnswer({ restrictions: on ? [] : undefined })}
        icon={<LayoutGrid size={22} />} title="Ninguna" description="Te mostramos todo el catálogo" className="min-[420px]:col-span-2" />
    </div>
  );
}
