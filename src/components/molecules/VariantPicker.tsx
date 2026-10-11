"use client";
import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface Option {
  value: string;
  label: string;
  hex?: string;
  disabled?: boolean;
}

/** Selector de variante: indicador animado compartido (layoutId) entre opciones. */
export function VariantPicker({ legend, options, value, onChange, swatches }: { legend: string; options: Option[]; value?: string; onChange: (v: string) => void; swatches?: boolean }) {
  const group = useId();
  return (
    <fieldset>
      <legend className="mb-3 flex w-full items-baseline justify-between text-sm">
        <span className="font-bold">{legend}</span><span className="font-semibold text-muted">{value ?? "Elegí una opción"}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label key={o.value} title={o.label}
              className={cn("relative flex cursor-pointer items-center justify-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50",
                swatches && o.hex ? "h-12 w-12 rounded-full" : "min-h-12 rounded-full px-5 text-sm font-bold",
                !swatches && !selected && "border border-ink/15 bg-surface hover:border-ink/35",
                o.disabled && "opacity-45")}>
              <input type="radio" className="sr-only" name={group} value={o.value} checked={selected} onChange={() => onChange(o.value)} />
              {selected && (
                <motion.span layoutId={`${group}-pick`} transition={{ type: "spring", stiffness: 500, damping: 36 }} aria-hidden="true"
                  className={cn("absolute inset-0 rounded-full", swatches && o.hex ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : "bg-night")} />
              )}
              {swatches && o.hex ? (
                <span aria-hidden="true" className="relative h-9 w-9 rounded-full border border-black/10 shadow-inner" style={{ background: o.hex }} />
              ) : (
                <span className={cn("relative", selected && "text-[#f6f1e8]", o.disabled && "line-through")}>{o.label}</span>
              )}
              <span className="sr-only">{swatches ? o.label : ""}{o.disabled ? " (sin stock)" : ""}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
