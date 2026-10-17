import { normalize } from "../engine/search-text";
import { withTopic } from "../engine/help";
import { storeFaqs } from "../fixtures/content";
import type { Faq } from "../types";
import type { AdminData } from "./defaults";

/**
 * v16 (R2c, ayuda del box): cada pregunta guardada recibe su tema (el que se deduce de su texto, sin tocar la
 * pregunta ni la respuesta) y se suman al final las preguntas nuevas de la ayuda que el dueño todavía no tiene.
 */
export function withFaqTopics(saved: Partial<AdminData>): Partial<AdminData> {
  const data = saved.data;
  if (!data?.content) return saved;
  const old = (Array.isArray(data.content.faqs) ? data.content.faqs : []) as (Faq & { topic?: unknown })[];
  const faqs = old.filter((f) => typeof f?.q === "string" && typeof f?.a === "string").map(withTopic);
  const have = new Set(faqs.map((f) => normalize(f.q)));
  for (const f of storeFaqs) if (!have.has(normalize(f.q))) faqs.push({ ...f });
  return { ...saved, data: { ...data, content: { ...data.content, faqs } } };
}
