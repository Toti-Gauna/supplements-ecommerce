"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { isFaqTopic } from "@/demo/engine/help";
import { FAQ_TOPICS } from "@/demo/fixtures/help";
import type { StoreFaq } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { ListControls, moveItem } from "../ListControls";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";

const isFaqs = (x: unknown): x is StoreFaq[] => Array.isArray(x) && x.every((f) => typeof f?.q === "string" && typeof f?.a === "string" && isFaqTopic(f?.topic));

/** Preguntas frecuentes (8.3.28): su propia página; guardar no toca el carrusel ni los textos de inicio. Cada una va en un tema de la ayuda (R2c). */
export function FaqPage() {
  const saved = useAdmin((s) => s.data.content.faqs);
  const saveFaqs = useAdmin((s) => s.saveFaqs);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<StoreFaq[]>("volta-ui:content-draft:faqs", saved, isFaqs);
  const faqs = session.draft;
  const [error, setError] = useState<string | null>(null);
  const change = (next: StoreFaq[]) => { session.setDraft(next); setError(null); };
  const patch = (i: number, p: Partial<StoreFaq>) => change(faqs.map((f, k) => (k === i ? { ...f, ...p } : f)));
  const submit = () => {
    const half = faqs.findIndex((f) => !f.q.trim() !== !f.a.trim());
    if (half >= 0) return setError(`A la pregunta ${half + 1} le falta ${faqs[half]!.q.trim() ? "la respuesta" : "la pregunta"}.`);
    saveFaqs(faqs.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({ topic: f.topic, q: f.q.trim(), a: f.a.trim() })));
    push({ tone: "success", title: "Preguntas guardadas", description: "Ya se ven en la ayuda de la tienda de este navegador (solo en esta demo)." });
  };
  return (
    <div>
      <SubpageHeader title="Preguntas frecuentes" intro="Las preguntas y respuestas de la ayuda del box, cada una en su tema. Las vacías no se guardan." />
      {error && <p role="alert" className="mb-3 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">{error}</p>}
      <ol className="flex flex-col gap-3">
        {faqs.map((f, i) => (
          <li key={i}>
            <fieldset className="flex min-w-0 flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
              <legend className="sr-only">Pregunta {i + 1}</legend>
              <p aria-hidden="true" className="flex items-center gap-2 border-b border-line pb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-volt-ink">
                <span className="grid h-7 w-7 place-items-center rounded-sm bg-accent text-xs text-primary">{i + 1}</span>Pregunta frecuente
              </p>
              <label className="flex flex-col gap-1 text-sm font-bold">Tema de la ayuda
                <Select value={f.topic} onChange={(e) => { if (isFaqTopic(e.target.value)) patch(i, { topic: e.target.value }); }}>
                  {FAQ_TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </Select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">Pregunta<Input value={f.q} onChange={(e) => patch(i, { q: e.target.value })} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">Respuesta<Textarea value={f.a} onChange={(e) => patch(i, { a: e.target.value })} className="min-h-20" /></label>
              <div className="self-end"><ListControls index={i} length={faqs.length} label={`pregunta ${i + 1}`} onMove={(d) => change(moveItem(faqs, i, d))} onRemove={() => change(faqs.filter((_, k) => k !== i))} /></div>
            </fieldset>
          </li>
        ))}
      </ol>
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => change([...faqs, { topic: faqs.at(-1)?.topic ?? FAQ_TOPICS[0]!.id, q: "", a: "" }])}><Plus size={16} aria-hidden="true" /> Agregar pregunta</Button>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar preguntas" discardText="Las preguntas vuelven a como están guardadas." onDiscard={() => { session.reset(); setError(null); }} />
    </div>
  );
}
