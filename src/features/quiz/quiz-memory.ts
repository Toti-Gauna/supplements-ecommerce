import { goals } from "@/demo/fixtures/goals";
import { isSportId } from "@/demo/fixtures/sports";
import { MAX_GOALS, QUIZ_DAYS, QUIZ_RESTRICTIONS, QUIZ_TIMES, type QuizAnswers } from "@/demo/fixtures/stack-builder";
import type { Goal } from "@/demo/types";
import { STORAGE_PREFIX } from "@/stores/storage";

/**
 * Últimas respuestas del quiz en este navegador, para retomar el resultado. Con el prefijo de la demo: "Reiniciar
 * demo" las borra. Sin almacenamiento (modo privado, bloqueado) el quiz funciona igual, solo no recuerda.
 */
const KEY = `${STORAGE_PREFIX}quiz`;

/**
 * Acepta solo respuestas completas y conocidas (lo guardado roto o de otra versión se ignora). Las de antes de L4
 * (un solo `goal`, sin deporte) se leen como un objetivo y "Solo gimnasio".
 */
export function parseQuizAnswers(x: unknown): QuizAnswers | null {
  const a = x as (Partial<QuizAnswers> & { goal?: unknown }) | null;
  if (!a || typeof a !== "object") return null;
  const list: unknown[] = Array.isArray(a.goals) ? a.goals : a.goal !== undefined ? [a.goal] : [];
  const sport = a.sport ?? null;
  const ok = list.length > 0 && list.length <= MAX_GOALS && list.every((g) => goals.some((x) => x.id === g))
    && (sport === null || isSportId(sport))
    && QUIZ_DAYS.some((d) => d.value === a.days)
    && QUIZ_TIMES.some((t) => t.value === a.time)
    && Array.isArray(a.restrictions)
    && a.restrictions.every((r) => QUIZ_RESTRICTIONS.some((x) => x.value === r));
  return ok ? { goals: [...new Set(list as Goal[])], sport, days: a.days!, time: a.time!, restrictions: [...new Set(a.restrictions!)] } : null;
}

export function loadQuizAnswers(): QuizAnswers | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parseQuizAnswers(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveQuizAnswers(answers: QuizAnswers): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    /* sin almacenamiento: no se recuerda, el quiz sigue */
  }
}
