"use client";
import { BadgeCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { VariantPicker } from "@/components/molecules/VariantPicker";
import { demoChoices } from "@/demo/engine/collar";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { CollarFields } from "../personalize/CollarFields";
import { PhotoControls } from "../personalize/PhotoControls";
import { ReferenceFields } from "../personalize/ReferenceFields";
import { TextFields } from "../personalize/TextFields";
import type { PersonalizationDraft } from "../personalize/usePersonalizationDraft";
import { QuantityPicker } from "./QuantityPicker";
import type { useVariantSelection } from "./useVariantSelection";

const TITLE = { TEXT: "Escribí tu nombre", PHOTO: "Subí tu foto", PHOTO_REFERENCE: "Contanos cómo lo querés" };

interface Props {
  product: Product;
  sel: ReturnType<typeof useVariantSelection>;
  draft: PersonalizationDraft;
  quantity: number;
  max: number;
  stockNote: string;
  onQuantity: (n: number) => void;
  actions: ReactNode;
}

/** Todo lo que se elige en una sola tarjeta: opción, personalización, cantidad y compra. */
export function ConfigureCard({ product, sel, draft, quantity, max, stockNote, onQuantity, actions }: Props) {
  const tmpl = draft.tmpl;
  const divider = <hr className="border-line" />;
  return (
    <section id="personalizar" aria-label="Configurá tu pieza" className="flex scroll-mt-28 flex-col gap-5 rounded-[1.75rem] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      {(sel.colorOptions.length > 0 || sel.sizeOptions.length > 0) && (
        <div className="flex flex-col gap-5">
          {sel.colorOptions.length > 0 && <VariantPicker legend="Color" options={sel.colorOptions} value={sel.color} onChange={sel.chooseColor} swatches />}
          {sel.sizeOptions.length > 0 && <VariantPicker legend={tmpl?.collar ? "Talle" : "Opción"} options={sel.sizeOptions} value={sel.size}
            onChange={(size) => { sel.chooseSize(size); if (draft.collar?.neckCm !== undefined) draft.setCollar({ ...draft.collar, neckCm: undefined }); }} />}
        </div>
      )}
      {tmpl && (
        <>
          {(sel.colorOptions.length > 0 || sel.sizeOptions.length > 0) && divider}
          <div>
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-night text-brass"><Sparkles size={16} aria-hidden="true" /></span>
              <div>
                <h2 className="font-display text-[1.6rem] leading-tight">{tmpl.collar ? "Armá tu collar" : TITLE[tmpl.kind]}</h2>
                <p className="text-sm text-muted">La vista previa se actualiza en vivo{tmpl.surcharge > 0 ? ` · personalización ${formatARS(tmpl.surcharge)} incluida` : ""}.</p>
              </div>
            </div>
            {tmpl.kind === "TEXT" && <TextFields template={tmpl} draft={draft.text} onChange={draft.setText} touched={draft.touched}
              {...(tmpl.collar ? { label: "Nombre", colorLegend: "Color de las letras" } : {})} />}
            {tmpl.collar && draft.collar && (
              <div className="mt-5">
                <CollarFields spec={tmpl.collar} product={product} config={draft.collar} onChange={draft.setCollar} variantId={sel.variant.id}
                  onSize={(id) => { const v = product.variants.find((x) => x.id === id); if (v?.size) sel.chooseSize(v.size); }} />
              </div>
            )}
            {tmpl.kind === "PHOTO" && <PhotoControls draft={draft.photo} onChange={draft.setPhoto} />}
            {tmpl.kind === "PHOTO_REFERENCE" && <ReferenceFields product={product} draft={draft.reference} onFile={draft.onReferenceFile} onNotes={draft.setNotes} />}
            {draft.touched && draft.problem && tmpl.kind !== "TEXT" && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{draft.problem}</p>}
          </div>
        </>
      )}
      {divider}
      <QuantityPicker value={quantity} max={max} note={stockNote} onChange={onQuantity} />
      {tmpl && (
        <p className="-mt-2 flex items-start gap-2 text-[13px] text-muted">
          <BadgeCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
          <span>Al agregarlo confirmás <strong className="text-ink">“Así lo quiero”</strong>: {demoChoices(tmpl.collar, draft.collar).length
            ? "el taller fabrica la vista previa que ves; lo marcado como demo te lo confirma antes por WhatsApp."
            : "el taller fabrica exactamente la vista previa que ves."}</span>
        </p>
      )}
      {actions}
    </section>
  );
}
