"use client";
import { CollectionFields, useCollectionForm } from "../payments/CollectionEditor";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { SETTINGS_SECTION } from "./SettingsHub";

/** Ajustes → Datos de cobro (8.3.29/8.3.30): el mismo editor y la misma fuente que "Configurar datos de cobro" en Pagos. */
export function CollectionSettings() {
  const form = useCollectionForm("volta-ui:settings-draft:cobro");
  return (
    <div>
      <SubpageHeader trail={[SETTINGS_SECTION]} back={SETTINGS_SECTION} title="Datos de cobro" intro="Los datos que ve el comprador para transferir. Es el mismo editor que abre “Configurar datos de cobro” en Pagos." />
      <section aria-label="Datos de cobro" className="flex max-w-3xl flex-col gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        {form.restored && <p role="status" className="rounded-2xl bg-warning-soft px-3 py-2 text-sm font-bold text-warning">Recuperamos los datos que quedaron sin guardar.</p>}
        <CollectionFields form={form} />
      </section>
      <SaveBar onSave={() => form.submit()} dirty={form.dirty} label="Guardar datos de cobro" discardText="Los datos de cobro vuelven a como están guardados." onDiscard={form.discard} />
    </div>
  );
}
