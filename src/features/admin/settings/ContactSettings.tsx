"use client";
import { useState } from "react";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { checkWhatsapp } from "@/demo/admin/settings-form";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";

const isText = (x: unknown): x is string => typeof x === "string";

/** Ajustes → Contacto y WhatsApp (8.3.29): solo el número del botón; guardar no toca otras secciones. */
export function ContactSettings() {
  const saved = useAdmin((s) => s.data.settings.whatsappNumber) ?? "";
  const saveSettings = useAdmin((s) => s.saveSettings);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<string>("volta-ui:settings-draft:contacto", saved, isText);
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const problem = checkWhatsapp(session.draft);
    setError(problem);
    if (problem) return;
    const digits = session.draft.replace(/\D/g, "");
    saveSettings({ whatsappNumber: digits || null });
    session.reset(digits);
    push({ tone: "success", title: "WhatsApp guardado", description: "Cambio guardado solo en esta demo (este navegador)." });
  };
  return (
    <div>
      <SubpageHeader title="Contacto y WhatsApp" intro="El botón de WhatsApp de la tienda abre una conversación con este número." />
      <section aria-label="WhatsApp" className="flex max-w-2xl flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        {session.restored && <p role="status" className="rounded-sm bg-warning-soft px-3 py-2 text-sm font-bold text-warning">Recuperamos el número que quedó sin guardar.</p>}
        <Field id="wa" label="Número para el botón de WhatsApp" error={error ?? undefined} hint="Con código de país y área. Vacío: el botón abre WhatsApp para elegir contacto. Usá un número de prueba en la demo.">
          <Input id="wa" value={session.draft} onChange={(e) => { session.setDraft(e.target.value); setError(null); }} inputMode="tel" placeholder="54 9 223 555 0000" aria-invalid={!!error} aria-describedby={describedBy("wa", error ?? undefined, true)} />
        </Field>
      </section>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar contacto" discardText="El número vuelve a como está guardado." onDiscard={() => { session.reset(); setError(null); }} />
    </div>
  );
}
