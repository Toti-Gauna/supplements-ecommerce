"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import type { DemoData } from "@/demo/engine/source";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";
import { CONTENT_SECTION } from "./ContentHub";
import { CountedField } from "./CountedField";

type Cta = DemoData["content"]["homeCta"];
const LIMITS = { title: 60, text: 160 };
const isCta = (x: unknown): x is Cta => typeof (x as Cta | null)?.title === "string" && typeof (x as Cta).text === "string";

/** Textos del bloque "Crear" del inicio (8.3.28): su propia página, borrador y validación. */
export function HomeTextsEditor() {
  const saved = useAdmin((s) => s.data.content.homeCta);
  const saveHomeCta = useAdmin((s) => s.saveHomeCta);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<Cta>("volta-ui:content-draft:home", saved, isCta);
  const d = session.draft;
  const [errors, setErrors] = useState<string[]>([]);
  const set = (p: Partial<Cta>) => { session.setDraft({ ...d, ...p }); setErrors([]); };
  const submit = () => {
    const n = (t: string) => [...t.trim()].length;
    const found = [
      ...(!n(d.title) ? ["Escribí el título."] : n(d.title) > LIMITS.title ? [`El título tiene ${n(d.title)} caracteres; el máximo es ${LIMITS.title}.`] : []),
      ...(!n(d.text) ? ["Escribí el texto."] : n(d.text) > LIMITS.text ? [`El texto tiene ${n(d.text)} caracteres; el máximo es ${LIMITS.text}.`] : []),
    ];
    setErrors(found);
    if (found.length) return;
    saveHomeCta({ title: d.title.trim(), text: d.text.trim() });
    push({ tone: "success", title: "Textos de inicio guardados", description: "Ya se ven en el inicio de la tienda de este navegador (solo en esta demo)." });
  };
  return (
    <div>
      <SubpageHeader trail={[MARKETING, CONTENT_SECTION]} back={CONTENT_SECTION} title="Textos de inicio" intro="El bloque del inicio que invita a crear un producto propio." />
      <section aria-label="Bloque “Crear”" className="flex max-w-2xl flex-col gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        {errors.length > 0 && (
          <div role="alert" className="flex gap-2 rounded-2xl bg-danger-soft p-3 text-sm font-semibold text-danger">
            <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <CountedField label="Título del bloque “Crear”" value={d.title} max={LIMITS.title} onChange={(title) => set({ title })} />
        <CountedField label="Texto" multiline value={d.text} max={LIMITS.text} onChange={(text) => set({ text })} />
      </section>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar textos" discardText="Los textos vuelven a como están guardados." onDiscard={() => { session.reset(); setErrors([]); }} />
    </div>
  );
}
