"use client";
import { Field, Textarea } from "@/components/atoms/Field";
import type { Product } from "@/demo/types";
import { PhotoInput } from "./PhotoInput";
import type { ReferenceDraft } from "./useReferenceDraft";

/** Foto de referencia + notas para piezas pintadas a mano. No se renderiza: el taller la interpreta. */
export function ReferenceFields({ product, draft, onFile, onNotes }: { product: Product; draft: ReferenceDraft; onFile: (f: File) => void; onNotes: (n: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent">
          {draft.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL local, sin optimización posible
            <img src={draft.thumbnail} alt="Tu foto de referencia" className="h-full w-full object-cover" />
          ) : <span className="p-2 text-center text-xs text-muted">{draft.processing ? "Procesando…" : "Tu foto va acá"}</span>}
        </div>
        <div className="min-w-0 flex-1"><PhotoInput label="Foto de referencia" hint="JPG, PNG o WEBP de hasta 10 MB. Se procesa solo en tu navegador; en la demo no se sube." onFile={onFile} /></div>
      </div>
      {draft.error && <p role="alert" className="text-sm font-semibold text-danger">{draft.error}</p>}
      <Field id="p-notes" label="Notas para el taller" hint="Mínimo 10 caracteres.">
        <Textarea id="p-notes" value={draft.notes} onChange={(e) => onNotes(e.target.value)} placeholder={product.personalization?.notesPlaceholder} aria-describedby="p-notes-hint" maxLength={500} />
      </Field>
    </div>
  );
}
