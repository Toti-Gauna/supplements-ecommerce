"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input, Textarea } from "@/components/atoms/Field";
import type { Faq } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { ListControls, moveItem } from "../ListControls";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";
import { CONTENT_SECTION } from "./ContentHub";

const isFaqs = (x: unknown): x is Faq[] => Array.isArray(x) && x.every((f) => typeof f?.q === "string" && typeof f?.a === "string");

/** Preguntas frecuentes (8.3.28): su propia página; guardar no toca el carrusel ni los textos de inicio. */
export function FaqPage() {
  const saved = useAdmin((s) => s.data.content.faqs);
  const saveFaqs = useAdmin((s) => s.saveFaqs);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<Faq[]>("volta-ui:content-draft:faqs", saved, isFaqs);
  const faqs = session.draft;
  const [error, setError] = useState<string | null>(null);
  const change = (next: Faq[]) => { session.setDraft(next); setError(null); };
  const patch = (i: number, p: Partial<Faq>) => change(faqs.map((f, k) => (k === i ? { ...f, ...p } : f)));
  const submit = () => {
    const half = faqs.findIndex((f) => !f.q.trim() !== !f.a.trim());
    if (half >= 0) return setError(`A la pregunta ${half + 1} le falta ${faqs[half]!.q.trim() ? "la respuesta" : "la pregunta"}.`);
    saveFaqs(faqs.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({ q: f.q.trim(), a: f.a.trim() })));
    push({ tone: "success", title: "Preguntas guardadas", description: "Ya se ven en la ayuda de la tienda de este navegador (solo en esta demo)." });
  };
  return (
    <div>
      <SubpageHeader trail={[MARKETING, CONTENT_SECTION]} back={CONTENT_SECTION} title="Preguntas frecuentes" intro="Las preguntas y respuestas de la página de ayuda. Las vacías no se guardan." />
      {error && <p role="alert" className="mb-3 rounded-2xl bg-danger-soft p-3 text-sm font-semibold text-danger">{error}</p>}
      <ol className="flex flex-col gap-3">
        {faqs.map((f, i) => (
          <li key={i}>
            <fieldset className="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
              <legend className="sr-only">Pregunta {i + 1}</legend>
              <p aria-hidden="true" className="flex items-center gap-2 border-b border-line pb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-volt-ink">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs text-primary">{i + 1}</span>Pregunta frecuente
              </p>
              <label className="flex flex-col gap-1 text-sm font-bold">Pregunta<Input value={f.q} onChange={(e) => patch(i, { q: e.target.value })} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">Respuesta<Textarea value={f.a} onChange={(e) => patch(i, { a: e.target.value })} className="min-h-20" /></label>
              <div className="self-end"><ListControls index={i} length={faqs.length} label={`pregunta ${i + 1}`} onMove={(d) => change(moveItem(faqs, i, d))} onRemove={() => change(faqs.filter((_, k) => k !== i))} /></div>
            </fieldset>
          </li>
        ))}
      </ol>
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => change([...faqs, { q: "", a: "" }])}><Plus size={16} aria-hidden="true" /> Agregar pregunta</Button>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar preguntas" discardText="Las preguntas vuelven a como están guardadas." onDiscard={() => { session.reset(); setError(null); }} />
    </div>
  );
}
