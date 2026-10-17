"use client";
import { useId, type ReactNode } from "react";
import type { SizePlate } from "@/demo/engine/sheet";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

interface PlateProps { name: string; checked: boolean; disabled?: boolean; onSelect: () => void; label: string; title: string; children: ReactNode }

/** Una placa elegible: radio nativo (flechas del teclado, lectores de pantalla) con la esquina en voltio si está elegida. */
function Plate({ name, checked, disabled, onSelect, label, title, children }: PlateProps) {
  return (
    <label title={title} className={cn("relative flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-sm border p-2.5 text-left has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/60",
      checked ? "border-2 border-ink bg-surface p-[9px]" : "border-line bg-bg hover:border-ink/40", disabled && "text-muted")}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} aria-label={label} className="sr-only" />
      {checked && <span aria-hidden="true" className="absolute right-0 top-0 border-l-[14px] border-t-[14px] border-l-transparent border-t-volt-ink" />}
      {children}
    </label>
  );
}

/** Colores y talles del equipamiento: placas chicas, varias por renglón. */
const COMPACT_GRID = "grid grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))]";
const legendClass = "mb-2 flex w-full items-baseline justify-between font-lab text-[11px] font-bold uppercase tracking-[0.12em] text-muted";

export interface FlavorOption { value: string; label: string; hex?: string; disabled?: boolean }

/** Sabores (o colores, `compact`) como placas: franja del color, nombre y si está sin stock en el tamaño elegido. */
export function FlavorPlates({ legend, options, value, onChange, compact = false }: { legend: string; options: FlavorOption[]; value?: string; onChange: (v: string) => void; compact?: boolean }) {
  const name = useId();
  return (
    <fieldset>
      <legend className={legendClass}><span>{legend}</span><span className="normal-case tracking-normal text-ink">{value}</span></legend>
      <div className={compact ? COMPACT_GRID : "grid grid-cols-2 gap-1.5 sm:grid-cols-4"}>
        {options.map((o) => (
          <Plate key={o.value} name={name} checked={o.value === value} disabled={o.disabled} onSelect={() => onChange(o.value)} title={o.label} label={`${o.label}${o.disabled ? ", sin stock" : ""}`}>
            <span aria-hidden="true" className="h-2.5 w-full rounded-[1px] border border-ink/25" style={{ background: o.hex }} />
            <span className={cn("text-[13.5px] font-bold leading-tight", o.disabled && "line-through")}>{o.label}</span>
            {o.disabled && <span className="font-lab text-[10.5px]">sin stock</span>}
          </Plate>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Tamaños como placas con precio, servicios y precio por servicio; la que más rinde lleva "Mejor $/serv.". En el
 * equipamiento (talle, peso) no hay servicios: placas más chicas con el talle y el precio.
 */
export function SizePlates({ legend, plates, value, onChange }: { legend: string; plates: SizePlate[]; value?: string; onChange: (v: string) => void }) {
  const name = useId();
  const servings = plates.some((z) => z.servings);
  return (
    <fieldset>
      <legend className={legendClass}><span>{legend}</span>{!servings && <span className="normal-case tracking-normal text-ink">{value}</span>}</legend>
      <div className={servings ? "grid grid-cols-2 gap-1.5" : COMPACT_GRID}>
        {plates.map((z) => {
          const reading = [z.size, formatARS(z.price), z.servings && `${z.servings} servicios`, z.perServing && `${formatARS(z.perServing)} por servicio`, z.best && "mejor precio por servicio", z.soldOut && "sin stock"].filter(Boolean).join(", ");
          return (
            <Plate key={z.size} name={name} checked={z.size === value} disabled={z.soldOut} onSelect={() => onChange(z.size)} title={z.size} label={reading}>
              <span className={cn("text-[14px] font-bold leading-tight", z.soldOut && "line-through")}>{z.size}</span>
              <span className="font-lab text-[11.5px] text-muted">{z.servings ? `${z.servings} serv. · ` : ""}{formatARS(z.price)}</span>
              {z.perServing !== null && <span className="font-lab text-[17px] font-bold tracking-[-0.03em]">{formatARS(z.perServing)}<span className="text-[11px] font-medium text-muted"> /serv.</span></span>}
              {z.best && <span className="bg-night px-1.5 py-0.5 font-lab text-[9.5px] font-bold uppercase tracking-[0.1em] text-volt">Mejor $/serv.</span>}
              {z.soldOut && <span className="font-lab text-[10.5px]">sin stock</span>}
            </Plate>
          );
        })}
      </div>
    </fieldset>
  );
}
