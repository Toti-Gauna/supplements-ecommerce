"use client";
import { Input, Textarea } from "@/components/atoms/Field";
import { normalizeRnpa, RNPA_EXAMPLE } from "@/demo/admin/label-checks";
import { blankUsage } from "@/demo/admin/nutrition-form";
import type { Product, UsageMoment } from "@/demo/types";
import { Chips } from "./Chips";
import { NutritionEditor } from "./NutritionEditor";

const MOMENTS: readonly (readonly [UsageMoment, string])[] = [["manana", "Mañana"], ["comida", "Comidas"], ["pre", "Pre"], ["intra", "Durante"], ["post", "Post"], ["noche", "Noche"]];

/**
 * Paso "Rótulo" de un suplemento: RNPA, tabla nutricional y modo de uso (momentos del día, dosis y cómo se prepara).
 * `errors`: los del paso, después de intentar guardar; marcan el campo que corresponde.
 */
export function LabelFields({ d, set, errors = [] }: { d: Product; set: (p: Partial<Product>) => void; errors?: readonly string[] }) {
  const usage = d.usage ?? blankUsage();
  const rnpaInvalid = errors.some((e) => e.includes("RNPA"));
  return (
    <>
      <div className="flex max-w-sm flex-col gap-1">
        <label htmlFor="p-rnpa" className="text-sm font-bold">RNPA</label>
        <Input id="p-rnpa" value={d.rnpa ?? ""} onChange={(e) => set({ rnpa: e.target.value || undefined })} onBlur={() => set({ rnpa: normalizeRnpa(d.rnpa) || undefined })}
          aria-invalid={rnpaInvalid} aria-describedby="p-rnpa-h" placeholder={RNPA_EXAMPLE} inputMode="numeric" autoComplete="off" className="font-lab" />
        <p id="p-rnpa-h" className="text-xs text-muted">Como figura en el rótulo ({RNPA_EXAMPLE}). Lo muestra la etiqueta del lote en la ficha.</p>
      </div>
      <NutritionEditor value={d.nutrition} onChange={(nutrition) => set({ nutrition })} invalid={errors.some((e) => e.includes("tabla nutricional"))} />
      <fieldset className="flex flex-col gap-3 border-t border-line pt-4">
        <legend className="sr-only">Modo de uso</legend>
        <p className="text-sm font-bold">Modo de uso <span className="font-normal text-muted">· se ve en &quot;Cómo tomarlo&quot;</span></p>
        <Chips legend="Momentos del día" options={MOMENTS} value={usage.moments} onChange={(m) => set({ usage: { ...usage, moments: m as UsageMoment[] } })} />
        <label className="flex max-w-sm flex-col gap-1 text-sm font-bold">Dosis por servicio<Input value={usage.dose ?? ""} onChange={(e) => set({ usage: { ...usage, dose: e.target.value } })} placeholder="1 scoop (30 g)" className="font-lab" /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">Cómo se toma<Textarea value={usage.text} onChange={(e) => set({ usage: { ...usage, text: e.target.value } })} placeholder="1 scoop en 250 ml de agua o leche." className="min-h-20" /></label>
      </fieldset>
    </>
  );
}
