"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { SampleQr } from "@/components/molecules/SampleQr";
import { collectionErrors, type CollectionKey } from "@/demo/admin/collection";
import { fileToThumbnail } from "@/lib/image";
import { PhotoInput } from "../../personalize/PhotoInput";
import { useSettingsDraft } from "../settings/useSettingsDraft";
import { useSessionDraft } from "../useSessionDraft";

type Key = CollectionKey;
type Draft = Record<Key, string>;
const isDraft = (x: unknown): x is Draft => { const d = x as Draft | null; return !!d && typeof d.alias === "string" && typeof d.cbu === "string" && typeof d.holder === "string"; };

/**
 * Datos de cobro (8.3.30): alias, CBU/CVU, titular y QR estático de muestra. Una sola fuente (los ajustes de la demo)
 * para Ajustes → Datos de cobro y el modal de Pagos. Guardar no aprueba pagos ni toca pedidos: cambia las
 * instrucciones de las compras nuevas del checkout. `draftKey`: borrador en la pestaña (Ajustes); sin él, cancelar
 * olvida lo escrito (modal).
 */
export function useCollectionForm(draftKey = "") {
  const { settings, commit } = useSettingsDraft();
  const session = useSessionDraft<Draft>(draftKey, { alias: settings.transferAlias, cbu: settings.transferCbu, holder: settings.transferHolder }, isDraft);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  return {
    draft: session.draft, errors, dirty: session.dirty, restored: session.restored,
    set: (k: Key, v: string) => { session.setDraft({ ...session.draft, [k]: v }); setErrors({ ...errors, [k]: undefined }); },
    /** true si se guardó. */
    submit: () => {
      const d = session.draft;
      const found = collectionErrors(d);
      if (Object.keys(found).length) { setErrors(found); return false; }
      commit("Datos de cobro de muestra guardados", { transferAlias: d.alias, transferCbu: d.cbu, transferHolder: d.holder.trim() });
      return true;
    },
    discard: () => { session.reset(); setErrors({}); },
  };
}

type CollectionForm = ReturnType<typeof useCollectionForm>;

/** Campos de cobro y el QR de muestra (vista previa local, no se guarda). */
export function CollectionFields({ form }: { form: CollectionForm }) {
  const [qr, setQr] = useState<string | null>(null);
  const field = (k: Key, label: string, props: Partial<React.ComponentProps<"input">> = {}) => (
    <Field id={`col-${k}`} label={label} error={form.errors[k]}>
      <Input id={`col-${k}`} value={form.draft[k]} onChange={(e) => form.set(k, props.inputMode === "numeric" ? e.target.value.replace(/\D/g, "") : e.target.value)} aria-invalid={!!form.errors[k]} aria-describedby={describedBy(`col-${k}`, form.errors[k])} {...props} />
    </Field>
  );
  return (
    <>
      <p className="rounded-xl bg-warning-soft p-2.5 text-xs font-bold text-warning">Solo datos ficticios: se muestran en el checkout de este navegador como “datos de muestra”. No cargues datos bancarios reales.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {field("alias", "Alias", { autoComplete: "off" })}
        {field("cbu", "CBU / CVU", { inputMode: "numeric", maxLength: 22 })}
        {field("holder", "Titular", { autoComplete: "off" })}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {qr ? (
          <figure className="relative w-44">
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local */}
            <img src={qr} alt="QR cargado (vista previa local)" className="w-44 rounded-2xl border border-line opacity-60" />
            <span className="absolute inset-0 grid place-items-center"><span className="rotate-[-12deg] rounded-lg bg-warning px-2 py-1 text-sm font-extrabold text-white">MUESTRA</span></span>
          </figure>
        ) : <SampleQr />}
        <div className="flex-1">
          <PhotoInput label="QR estático del vendedor" hint="Vista previa local con marca de agua. No se guarda ni se muestra en la tienda demo. En producción es un archivo del panel."
            onFile={async (f) => setQr(await fileToThumbnail(f, 400))} />
        </div>
      </div>
    </>
  );
}

/** Editor con su propio formulario (modal "Configurar datos de cobro" de Pagos). */
export function CollectionEditor({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) {
  const form = useCollectionForm();
  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (form.submit()) onDone?.(); }}>
      <CollectionFields form={form} />
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" size={onCancel ? "md" : "sm"} className={onCancel ? "" : "self-start"}>Guardar datos de cobro</Button>
      </div>
    </form>
  );
}
