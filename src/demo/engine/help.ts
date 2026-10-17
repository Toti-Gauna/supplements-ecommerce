import { FALLBACK_FAQ_TOPIC, FAQ_TOPICS, type FaqTopicInfo } from "../fixtures/help";
import type { Faq, FaqTopic, StoreFaq } from "../types";
import { levenshtein, normalize, stems, tokenScore } from "./search-text";

/**
 * Ayuda del box (R2c): preguntas frecuentes agrupadas por tema y un buscador que no distingue tildes ni mayúsculas y
 * perdona un error de tipeo. Puro: en producción el mismo filtro corre en el cliente sobre lo que manda el servidor.
 */
export interface FaqGroup {
  topic: FaqTopicInfo;
  items: StoreFaq[];
}

export const isFaqTopic = (x: unknown): x is FaqTopic => FAQ_TOPICS.some((t) => t.id === x);

/** El tema que más se nombra en la pregunta (vale 5) y en la respuesta (vale 1); sin pistas, "Compras". */
export function inferFaqTopic(faq: Faq): FaqTopic {
  const q = normalize(faq.q);
  const a = normalize(faq.a);
  let best: { id: FaqTopic; score: number } = { id: FALLBACK_FAQ_TOPIC, score: 0 };
  for (const t of FAQ_TOPICS) {
    const score = t.keywords.reduce((s, k) => s + (q.includes(k) ? 5 : 0) + (a.includes(k) ? 1 : 0), 0);
    if (score > best.score) best = { id: t.id, score };
  }
  return best.id;
}

/** La pregunta con su tema: el guardado si es válido o el que se deduce del texto. */
export function withTopic(faq: Faq & { topic?: unknown }): StoreFaq {
  return { q: faq.q, a: faq.a, topic: isFaqTopic(faq.topic) ? faq.topic : inferFaqTopic(faq) };
}

const topicLabel = (id: FaqTopic) => FAQ_TOPICS.find((t) => t.id === id)?.label ?? "";
/** Palabras que no ayudan a encontrar una pregunta ("¿cómo es el envío?" busca "envío"). */
const STOPWORDS = new Set(["a", "al", "como", "con", "cual", "de", "del", "el", "en", "es", "la", "las", "lo", "los", "me", "mi", "o", "para", "por", "que", "se", "si", "su", "un", "una", "y"]);

/** La palabra coincide, empieza así o la contiene; o, si es de 5 letras o más, con un solo error de tipeo. */
function wordMatch(token: string, word: string): boolean {
  if (tokenScore(token, word) >= 2) return true;
  return token.length >= 5 && Math.min(levenshtein(token, word), levenshtein(token, word.slice(0, token.length))) <= 1;
}

/** Cada palabra de la búsqueda tiene que aparecer (con tolerancia) en la pregunta, la respuesta o el nombre del tema. */
export function searchFaqs(faqs: StoreFaq[], query: string): StoreFaq[] {
  const tokens = stems(query).filter((t) => !STOPWORDS.has(t));
  if (!tokens.length) return faqs;
  return faqs.filter((f) => {
    const words = stems(`${f.q} ${f.a} ${topicLabel(f.topic)}`);
    return tokens.every((t) => words.some((w) => wordMatch(t, w)));
  });
}

/** Grupos en el orden de los temas, sin los vacíos; adentro, el orden que eligió el dueño. */
export function groupFaqs(faqs: StoreFaq[]): FaqGroup[] {
  return FAQ_TOPICS.map((topic) => ({ topic, items: faqs.filter((f) => f.topic === topic.id) })).filter((g) => g.items.length > 0);
}

/** Lo que muestra la ayuda para una búsqueda: los grupos con lo que coincide y cuántas preguntas son. */
export function helpResults(faqs: StoreFaq[], query: string): { groups: FaqGroup[]; count: number } {
  const found = searchFaqs(faqs.map(withTopic), query);
  return { groups: groupFaqs(found), count: found.length };
}
