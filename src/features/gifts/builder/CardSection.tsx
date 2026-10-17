"use client";
import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { Field } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import type { LineGift } from "@/demo/engine/cart-types";
import { GIFT_DESIGNS } from "@/demo/engine/gift-options";
import { isOccasion } from "@/demo/engine/gifts";
import { seasonalThemes } from "@/demo/fixtures/themes";
import { cn } from "@/lib/cn";
import { useGiftDraft } from "@/stores/giftDraft";
import { brand } from "@/config/brand";
import { designSwatch } from "../card/designs";
import { bagPhrase } from "../scenes";
import { StepTitle } from "./StepTitle";

/** Paso 3, "La tarjeta": el diseño de la imagen que se manda por WhatsApp y la ocasión (viste la bolsa y la tarjeta). */
export function CardSection({ onEdit }: { onEdit: (p: Partial<LineGift>) => void }) {
  const draft = useGiftDraft((s) => s.draft);
  return (
    <section aria-labelledby="regalo-tarjeta" className="flex flex-col gap-4">
      <StepTitle n={3} title="La tarjeta" id="regalo-tarjeta" />
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Diseño</legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
          {GIFT_DESIGNS.map((d) => {
            const on = (draft.cardDesign ?? "box") === d.id;
            const sw = designSwatch(d.id, draft.occasion);
            return (
              <label key={d.id} title={d.note} className={cn("group relative flex cursor-pointer flex-col overflow-hidden rounded-sm border text-left transition-[border-color,box-shadow] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                on ? "border-volt-ink shadow-[var(--shadow-card)]" : "border-line hover:border-ink/40")}>
                <input type="radio" name="gift-design" value={d.id} checked={on} onChange={() => onEdit({ cardDesign: d.id })} className="sr-only" />
                {/* Muestra del diseño: fondo, franja en diagonal y el filo de luz (arte, colores propios). */}
                <span aria-hidden="true" style={{ "--a": sw.from, "--b": sw.to, "--c": sw.accent } as CSSProperties}
                  className="relative block h-14 bg-[linear-gradient(150deg,var(--a),var(--b))] [clip-path:inset(0)]">
                  <span className="absolute -right-3 top-0 h-4 w-20 -skew-x-[30deg] bg-(--c)" />
                  <span className="absolute bottom-2 left-2 h-1.5 w-10 bg-(--c)" />
                  {on && <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-xs bg-(--c) text-night"><Check size={13} strokeWidth={3} /></span>}
                </span>
                <span className="bg-surface px-2.5 py-2 text-xs font-bold leading-tight">{d.name}
                  {d.id === "fecha" && draft.occasion === "volta" && <span className="block font-normal text-muted">Elegí una fecha</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <Field id="gift-occasion" label="Ocasión" hint={draft.opening === "locker" ? "La tarjeta lleva el nombre de la fecha." : `Lo abre a golpes contra ${bagPhrase(draft.occasion)}.`}>
        <Select id="gift-occasion" value={draft.occasion} onChange={(e) => isOccasion(e.target.value) && onEdit({ occasion: e.target.value })} aria-describedby="gift-occasion-hint">
          <option value="volta">Sin fecha especial ({brand.mark})</option>
          {seasonalThemes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </Field>
    </section>
  );
}
