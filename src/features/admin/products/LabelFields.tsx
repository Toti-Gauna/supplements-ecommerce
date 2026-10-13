"use client";
import { Input, Textarea } from "@/components/atoms/Field";
import { blankUsage } from "@/demo/admin/nutrition-form";
import type { Product, UsageMoment } from "@/demo/types";
import { Chips } from "./Chips";
import { NutritionEditor } from "./NutritionEditor";

const MOMENTS: readonly (readonly [UsageMoment, string])[] = [["manana", "Mañana"], ["comida", "Comidas"], ["pre", "Pre"], ["intra", "Durante"], ["post", "Post"], ["noche", "Noche"]];

/** Paso "Rótulo": RNPA, tabla nutricional y modo de uso (momentos del día, dosis y cómo se prepara). */
export function LabelFields({ d, set }: { d: Product; set: (p: Partial<Product>) => void }) {
  const usage = d.usage ?? blankUsage();
  return (
    <>
      <label className="flex max-w-sm flex-col gap-1 text-sm font-bold">RNPA <span className="text-xs font-normal text-muted">Registro que figura en el rótulo. Lo muestra la etiqueta del lote en la ficha.</span>
        <Input value={d.rnpa ?? ""} onChange={(e) => set({ rnpa: e.target.value || undefined })} placeholder="00-071204" className="font-lab" />
      </label>
      <NutritionEditor value={d.nutrition} onChange={(nutrition) => set({ nutrition })} />
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
