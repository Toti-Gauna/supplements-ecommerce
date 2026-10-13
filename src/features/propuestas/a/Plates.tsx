import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import s from "./box.module.css";

/**
 * Opciones como placas de acero (sabor y tamaño): radios nativos, la placa elegida se ilumina con el voltio en el filo.
 * Cada opción trae su contenido; el grupo solo pone la grilla, la leyenda y el estado.
 */
export interface PlateOption { value: string; content: ReactNode; label: string; tag?: string }

interface PlatesProps {
  legend: string;
  /** Lo elegido, a la derecha de la leyenda. */
  current: string;
  name: string;
  value: string;
  options: PlateOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Plates({ legend, current, name, value, options, onChange, className }: PlatesProps) {
  return (
    <fieldset className={className}>
      <legend className="flex w-full justify-between font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-(--bx-dim)">
        <span>{legend}</span><span className="text-(--bx-chalk)">{current}</span>
      </legend>
      <div className={cn("mt-2 grid gap-px bg-(--bx-carbon)", options.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              s.plate,
              "relative flex min-h-16 cursor-pointer flex-col justify-center gap-1 px-3 py-2.5",
              "has-checked:bg-(--bx-graphite) has-checked:shadow-[inset_0_0_0_1px_#c8ff2e,0_0_18px_-6px_rgb(200_255_46/0.6)]",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--bx-volt)",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} aria-label={o.label} className="sr-only" />
            {o.tag && <span className="absolute -top-px right-0 bg-(--bx-volt) px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-(--bx-volt-ink)">{o.tag}</span>}
            {o.content}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
