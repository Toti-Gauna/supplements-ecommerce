"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input, Textarea } from "@/components/atoms/Field";
import { addRow, blankNutrition, patchRow, removeRow } from "@/demo/admin/nutrition-form";
import type { Nutrition } from "@/demo/types";

const cell = "min-h-10 px-2 font-lab text-sm";

/**
 * Tabla nutricional editable con el formato del rótulo argentino: porción, y por renglón el valor por porción, por
 * 100 g y el %VD. En el celular cada renglón se apila en dos líneas. Lo que se guarda es lo que muestra la ficha.
 * Un suplemento necesita, como mínimo, la porción y el renglón de proteínas (label-checks.ts).
 */
export function NutritionEditor({ value, onChange, invalid = false }: { value?: Nutrition; onChange: (n: Nutrition | undefined) => void; invalid?: boolean }) {
  if (!value) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-dashed border-line p-4">
        <p className="flex-1 text-sm text-muted">Este producto no tiene tabla nutricional cargada.</p>
        <Button variant="secondary" size="sm" onClick={() => onChange(blankNutrition())}><Plus size={16} aria-hidden="true" />Cargar tabla nutricional</Button>
      </div>
    );
  }
  const n = value;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-bold">Tabla nutricional <span className="font-normal text-muted">· valores como figuran en el rótulo</span></legend>
      <label className="flex flex-col gap-1 text-sm font-bold">Porción<Input value={n.serving} onChange={(e) => onChange({ ...n, serving: e.target.value })} aria-invalid={invalid && !n.serving.trim()} placeholder="1 scoop (30 g)" className="font-lab" /></label>
      <div role="group" aria-label="Renglones del rótulo" className="flex flex-col gap-2">
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto_auto] gap-2 px-1 font-lab text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
          <span>Nutriente</span><span>Porción</span><span>100 g</span><span>%VD</span><span>Sangría</span><span className="w-9" />
        </div>
        {n.rows.map((r, i) => {
          const name = r.label.trim() || `Renglón ${i + 1}`;
          return (
            <div key={i} className="grid grid-cols-3 gap-2 rounded-sm bg-bg p-2 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto_auto] sm:items-center sm:bg-transparent sm:p-0">
              <Input aria-label={`Nutriente del renglón ${i + 1}`} value={r.label} onChange={(e) => onChange(patchRow(n, i, { label: e.target.value }))} className={`${cell} col-span-3 sm:col-span-1`} placeholder="Proteínas" />
              <Input aria-label={`${name} por porción`} value={r.serving} onChange={(e) => onChange(patchRow(n, i, { serving: e.target.value }))} className={cell} placeholder="24 g" />
              <Input aria-label={`${name} por 100 g`} value={r.per100 ?? ""} onChange={(e) => onChange(patchRow(n, i, { per100: e.target.value }))} className={cell} placeholder="—" />
              <Input aria-label={`${name}, % del valor diario`} value={r.dv ?? ""} onChange={(e) => onChange(patchRow(n, i, { dv: e.target.value }))} className={cell} placeholder="—" />
              <label className="col-span-2 flex min-h-10 items-center gap-2 text-xs font-semibold sm:col-span-1 sm:justify-center">
                <input type="checkbox" checked={!!r.sub} onChange={(e) => onChange(patchRow(n, i, { sub: e.target.checked }))} className="h-5 w-5 accent-[var(--color-primary)]" />
                <span className="sm:sr-only">Subrenglón de {name}</span>
              </label>
              <Button variant="ghost" size="sm" aria-label={`Quitar ${name}`} onClick={() => onChange(removeRow(n, i))} className="justify-self-end px-2"><Trash2 size={16} aria-hidden="true" /></Button>
            </div>
          );
        })}
        <Button variant="secondary" size="sm" className="self-start" onClick={() => onChange(addRow(n))}><Plus size={16} aria-hidden="true" />Agregar renglón</Button>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold">Ingredientes<Textarea value={n.ingredients} onChange={(e) => onChange({ ...n, ingredients: e.target.value })} className="min-h-20" /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Alérgenos<Input value={n.allergens ?? ""} onChange={(e) => onChange({ ...n, allergens: e.target.value })} placeholder="Ej.: contiene leche y derivados de soja." /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Leyenda del rótulo <span className="text-xs font-normal text-muted">Opcional. Por ejemplo, cuando no aporta cantidades significativas de algún nutriente.</span>
        <Input value={n.note ?? ""} onChange={(e) => onChange({ ...n, note: e.target.value })} placeholder="No aporta cantidades significativas de proteínas…" />
      </label>
    </fieldset>
  );
}
