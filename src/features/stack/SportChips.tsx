"use client";
import { useId, type CSSProperties, type ReactNode } from "react";
import { Dumbbell } from "lucide-react";
import { SportArt } from "@/components/illustrations/SportArt";
import { sports } from "@/demo/fixtures/sports";
import type { SportId } from "@/demo/types";
import { cn } from "@/lib/cn";

interface SportChipsProps {
  value: SportId | null;
  onChange: (sport: SportId | null) => void;
  legend?: string;
  /** Debajo de los chips (qué sumó el deporte). */
  note?: ReactNode;
  className?: string;
}

const CHIP = "relative inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-sm border py-1 pl-1 pr-3 text-sm font-bold transition-[background-color,border-color,box-shadow] duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg";
const ON = "border-[var(--hue)] bg-night text-on-night shadow-[0_0_0_1px_var(--hue),0_10px_26px_-12px_var(--hue)]";
const OFF = "border-line bg-surface text-ink hover:border-ink/30";
const INPUT = "absolute inset-0 z-10 cursor-pointer appearance-none rounded-sm opacity-0";
const ICON = "grid h-9 w-9 place-items-center overflow-hidden rounded-sm bg-night ring-1 ring-white/10";

/**
 * Deporte opcional (radios nativos): "Solo gimnasio" o uno de los doce, con su dibujo chico en el color del deporte.
 * Elegir uno suma sus objetivos detrás de los tuyos y su equipamiento sugerido.
 */
export function SportChips({ value, onChange, legend = "Tu deporte (opcional)", note, className }: SportChipsProps) {
  const name = useId();
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="eyebrow mb-3 text-volt-ink">{legend}</legend>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <label style={{ "--hue": "var(--color-volt)" } as CSSProperties} className={cn(CHIP, value === null ? ON : OFF)}>
          <input type="radio" name={name} value="" checked={value === null} onChange={() => onChange(null)} className={INPUT} />
          <span aria-hidden="true" className={cn(ICON, "text-volt")}><Dumbbell size={18} /></span>
          Solo gimnasio
        </label>
        {sports.map((s) => (
          <label key={s.id} style={{ "--hue": s.hue } as CSSProperties} className={cn(CHIP, value === s.id ? ON : OFF)}>
            <input type="radio" name={name} value={s.id} checked={value === s.id} onChange={() => onChange(s.id)} className={INPUT} />
            <span aria-hidden="true" className={cn(ICON, "text-(--hue)")}><SportArt sport={s.id} className="h-8 w-auto" /></span>
            {s.name}
          </label>
        ))}
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] leading-snug text-muted">{note}</p>
    </fieldset>
  );
}
