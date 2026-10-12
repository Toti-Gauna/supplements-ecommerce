import { goals } from "@/demo/fixtures/goals";
import { QUIZ_DAYS, QUIZ_RESTRICTIONS, QUIZ_TIMES, type QuizAnswers } from "@/demo/fixtures/stack-builder";
import { STORAGE_PREFIX } from "@/stores/storage";

/**
 * Últimas respuestas del quiz en este navegador, para retomar el resultado. Con el prefijo de la demo: "Reiniciar
 * demo" las borra. Sin almacenamiento (modo privado, bloqueado) el quiz funciona igual, solo no recuerda.
 */
const KEY = `${STORAGE_PREFIX}quiz`;

/** Acepta solo respuestas completas y conocidas (lo guardado roto o de otra versión se ignora). */
export function parseQuizAnswers(x: unknown): QuizAnswers | null {
  const a = x as Partial<QuizAnswers> | null;
  if (!a || typeof a !== "object") return null;
  const ok = goals.some((g) => g.id === a.goal)
    && QUIZ_DAYS.some((d) => d.value === a.days)
    && QUIZ_TIMES.some((t) => t.value === a.time)
    && Array.isArray(a.restrictions)
    && a.restrictions.every((r) => QUIZ_RESTRICTIONS.some((x) => x.value === r));
  return ok ? { goal: a.goal!, days: a.days!, time: a.time!, restrictions: [...new Set(a.restrictions!)] } : null;
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
