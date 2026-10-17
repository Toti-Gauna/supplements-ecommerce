import { cn } from "@/lib/cn";

/** Opciones múltiples como fichas (checkbox nativos con la estética del panel). */
export function Chips({ legend, options, value, onChange }: { legend: string; options: readonly (readonly [string, string])[]; value: readonly string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([id, label]) => (
          <label key={id} className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-sm border px-3 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", value.includes(id) ? "border-primary bg-primary text-on-primary" : "border-line bg-bg")}>
            <input type="checkbox" className="sr-only" checked={value.includes(id)} onChange={(e) => onChange(e.target.checked ? [...value, id] : value.filter((x) => x !== id))} />{label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
