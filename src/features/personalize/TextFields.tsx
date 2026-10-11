"use client";
import { Field, Input } from "@/components/atoms/Field";
import { validateText } from "@/demo/engine/personalization";
import { FONT_FAMILIES } from "@/demo/fixtures/templates";
import type { PersonalizationTemplate } from "@/demo/types";
import { cn } from "@/lib/cn";

export interface TextDraft {
  text: string;
  font: string;
  color: string;
  colorName: string;
}

interface Props { template: PersonalizationTemplate; draft: TextDraft; onChange: (d: TextDraft) => void; touched: boolean; label?: string; colorLegend?: string }

/** Campos de texto, fuente y color. La vista previa en vivo se dibuja en la galería de la ficha. */
export function TextFields({ template: tmpl, draft, onChange, touched, label = "Texto", colorLegend = "Color del texto" }: Props) {
  const max = tmpl.maxChars ?? 12;
  const error = draft.text || touched ? validateText(draft.text, max) : null;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Field id="p-text" label={label} hint={`Hasta ${max} caracteres. Acentos y ñ permitidos.`} error={error ?? undefined}>
          <Input id="p-text" value={draft.text} maxLength={max + 4} autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? "p-text-error" : "p-text-hint"}
            onChange={(e) => onChange({ ...draft, text: e.target.value })} placeholder="Ej.: Ñoqui" />
        </Field>
        <p className="mt-1 text-right text-xs tabular-nums text-muted" aria-live="polite">{[...draft.text].length}/{max}</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Fuente</legend>
        <div className="flex flex-wrap gap-2">
          {(tmpl.fonts ?? []).map((f) => (
            <label key={f} className={cn("cursor-pointer rounded-full border-2 px-4 py-1.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", draft.font === f ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink/40")} style={{ fontFamily: FONT_FAMILIES[f] }}>
              <input type="radio" name="font" className="sr-only" checked={draft.font === f} onChange={() => onChange({ ...draft, font: f })} />
              <span className="text-base font-bold">{f}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">{colorLegend}: <span className="font-semibold text-muted">{draft.colorName}</span></legend>
        <div className="flex flex-wrap gap-2">
          {(tmpl.colors ?? []).map((c) => (
            <label key={c.hex} title={c.name} className={cn("grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", draft.color === c.hex ? "border-ink" : "border-transparent")}>
              <input type="radio" name="color" className="sr-only" checked={draft.color === c.hex} onChange={() => onChange({ ...draft, color: c.hex, colorName: c.name })} />
              <span aria-hidden="true" className="h-8 w-8 rounded-full border border-black/15" style={{ background: c.hex }} />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
