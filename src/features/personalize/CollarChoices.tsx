"use client";
import { FlaskConical } from "lucide-react";
import { useId } from "react";
import { CordSwatch } from "@/components/illustrations/collar/Cord";
import type { CollarConfig, CollarOption, CollarPatternOption } from "@/demo/fixtures/collar";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/** Sello de las opciones que son ejemplos de la demo (Volta todavía no las confirmó). */
function DemoTag({ on }: { on: boolean }) {
  return (
    <span className={cn("rounded-full px-1.5 py-px text-[10px] font-extrabold uppercase tracking-wide", on ? "bg-bg/20 text-bg" : "bg-volt/25 text-volt-ink")}>
      Demo<span className="sr-only"> (ejemplo de la demo, sin confirmar por el taller)</span>
    </span>
  );
}

/**
 * En el celular cada grupo es una fila que se desliza (así la vista previa sigue a la vista); desde tablet, se
 * acomodan. Los fieldset llevan min-w-0 (por defecto no se achican por debajo de su contenido) y la fila es
 * `relative` para recortar también los radios ocultos (sr-only es absoluto): si no, estiraban la página a lo ancho.
 */
const row = "no-scrollbar relative -mx-1 flex snap-x gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0";

const chip = (on: boolean) => cn("flex min-h-11 shrink-0 cursor-pointer snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-bold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50",
  on ? "border-ink bg-ink text-bg" : "border-ink/15 bg-surface hover:border-ink/35");

function Legend({ title, hint, demo }: { title: string; hint?: string; demo?: boolean }) {
  return (
    <legend className="mb-2 flex w-full items-baseline justify-between gap-2 text-sm">
      <span className="font-bold">{title}</span>
      <span className="text-right font-semibold text-muted">{[hint, demo ? "ejemplo de la demo" : ""].filter(Boolean).join(" · ")}</span>
    </legend>
  );
}

/** Opciones en pastillas (estilo de letras, adorno, material, dije), con su recargo y el sello de demo. */
export function OptionChips<T extends string>({ legend, options, value, onChange }: { legend: string; options: CollarOption<T>[]; value: T; onChange: (v: T) => void }) {
  const name = useId();
  const current = options.find((o) => o.id === value);
  return (
    <fieldset className="min-w-0">
      <Legend title={legend} hint={current?.hint} demo={current?.demo} />
      <div className={row}>
        {options.map((o) => (
          <label key={o.id} className={chip(value === o.id)}>
            <input type="radio" name={name} className="sr-only" checked={value === o.id} onChange={() => onChange(o.id)} />
            {o.name}{o.delta > 0 && <span className={value === o.id ? "text-bg/75" : "text-muted"}>+{formatARS(o.delta)}</span>}
            {o.demo && <DemoTag on={value === o.id} />}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Patrón del cordón: cada opción muestra un tramo del cordón con los colores elegidos. */
export function PatternChips({ patterns, config, onChange }: { patterns: CollarPatternOption[]; config: CollarConfig; onChange: (pattern: CollarPatternOption["id"]) => void }) {
  const name = useId();
  const value = config.pattern ?? "solid";
  const current = patterns.find((o) => o.id === value);
  return (
    <fieldset className="min-w-0">
      <Legend title="Patrón del cordón" hint={current?.hint} demo={current?.demo} />
      <div className={row}>
        {patterns.map((o) => (
          <label key={o.id} className={cn(chip(value === o.id), "pl-2")}>
            <input type="radio" name={name} className="sr-only" checked={value === o.id} onChange={() => onChange(o.id)} />
            <CordSwatch material={config.material} pattern={o.id} cord={config.cordColor} accent={config.accentColor ?? config.cordColor} className="h-6 w-14 shrink-0 rounded-full bg-white/70" />
            {o.name}
            {o.demo && <DemoTag on={value === o.id} />}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Círculos de color (cordón o segundo color del patrón). */
export function ColorDots({ legend, colors, value, valueName, onChange }: { legend: string; colors: { name: string; hex: string }[]; value: string; valueName: string; onChange: (c: { name: string; hex: string }) => void }) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-bold">{legend}: <span className="font-semibold text-muted">{valueName}</span></legend>
      <div className={row}>
        {colors.map((c) => (
          <label key={c.hex} title={c.name} className={cn("grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", value === c.hex ? "border-ink" : "border-transparent")}>
            <input type="radio" name={name} className="sr-only" checked={value === c.hex} onChange={() => onChange(c)} />
            <span aria-hidden="true" className="h-8 w-8 rounded-full border border-black/15 bg-[repeating-linear-gradient(135deg,rgb(0_0_0/0.12)_0_3px,transparent_3px_6px)]" style={{ backgroundColor: c.hex }} />
            <span className="sr-only">{c.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Aviso cuando la combinación incluye ejemplos de la demo: no se ofrecen como algo que el taller ya fabrica. */
export function DemoChoicesNote({ names }: { names: string[] }) {
  if (!names.length) return null;
  return (
    <p role="status" className="flex items-start gap-2 rounded-2xl bg-accent/60 p-3 text-[13px] text-ink">
      <FlaskConical size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
      <span><strong>Ejemplo de la demo:</strong> {names.join(", ")}. Volta todavía no lo confirmó; antes de fabricar, el taller te avisa si se puede hacer.</span>
    </p>
  );
}
