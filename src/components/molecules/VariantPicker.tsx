"use client";
import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface Option {
  value: string;
  label: string;
  hex?: string;
  disabled?: boolean;
  /** Segunda línea (servicios y precio por servicio): la opción se dibuja como tarjeta. */
  detail?: string;
  /** Sello arriba de la tarjeta ("Mejor precio por servicio"). */
  badge?: string;
}

/** Selector de variante: indicador animado compartido (layoutId) entre opciones. Con `detail`, opciones como tarjetas. */
export function VariantPicker({ legend, options, value, onChange, swatches }: { legend: string; options: Option[]; value?: string; onChange: (v: string) => void; swatches?: boolean }) {
  const group = useId();
  return (
    <fieldset>
      <legend className="mb-3 flex w-full items-baseline justify-between text-sm">
        <span className="font-bold">{legend}</span><span className="font-semibold text-muted">{value ?? "Elegí una opción"}</span>
      </legend>
      <div className={options.some((o) => o.detail) ? "grid grid-cols-2 gap-2 pt-1 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]" : "flex flex-wrap gap-2"}>
        {options.map((o) => {
          const selected = value === o.value;
          const card = !swatches && Boolean(o.detail);
          return (
            <label key={o.value} title={o.label}
              className={cn("relative flex cursor-pointer items-center justify-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50",
                swatches && o.hex ? "h-12 w-12 rounded-full" : card ? "min-h-[4.5rem] flex-col rounded-2xl px-3 pb-2.5 pt-4 text-center" : "min-h-12 rounded-full px-5 text-sm font-bold",
                !swatches && !selected && "border border-ink/15 bg-surface hover:border-ink/35",
                o.disabled && "opacity-45")}>
              <input type="radio" className="sr-only" name={group} value={o.value} checked={selected} onChange={() => onChange(o.value)} />
              {selected && (
                <motion.span layoutId={`${group}-pick`} transition={{ type: "spring", stiffness: 500, damping: 36 }} aria-hidden="true"
                  className={cn("absolute inset-0", card ? "rounded-2xl bg-night ring-2 ring-primary" : "rounded-full", swatches && o.hex ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : !card && "bg-night")} />
              )}
              {o.badge && <span className="font-lab absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-volt px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-night">{o.badge}</span>}
              {swatches && o.hex ? (
                <span aria-hidden="true" className="relative h-9 w-9 rounded-full border border-black/10 shadow-inner" style={{ background: o.hex }} />
              ) : card ? (
                <>
                  <span className={cn("relative text-sm font-bold", selected && "text-on-night", o.disabled && "line-through")}>{o.label}</span>
                  <span className={cn("font-lab relative mt-0.5 text-[11px]", selected ? "text-volt" : "text-muted")}>{o.detail}</span>
                </>
              ) : (
                <span className={cn("relative", selected && "text-on-night", o.disabled && "line-through")}>{o.label}</span>
              )}
              <span className="sr-only">{swatches ? o.label : ""}{o.badge ? ` (${o.badge})` : ""}{o.disabled ? " (sin stock)" : ""}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
