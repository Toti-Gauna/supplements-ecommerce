import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const pctChip = "inline-flex h-11 min-w-14 cursor-pointer items-center justify-center rounded-sm border px-4 text-sm font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50";

/** Cuerpo con scroll y pie con los botones de una pestaña de "Qué hacer con el lote". */
export function TabFrame({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5 sm:px-7">{children}</div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">{footer}</div>
    </div>
  );
}

/** Opciones de porcentaje como fichas (radios nativos). */
export function PctChoice({ name, legend, options, value, onChange }: { name: string; legend: string; options: readonly number[]; value: number; onChange: (n: number) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((n) => (
          <label key={n} className={cn(pctChip, value === n ? "border-primary bg-primary text-on-primary" : "border-line bg-surface")}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />{n} %
          </label>
        ))}
      </div>
    </fieldset>
  );
}
