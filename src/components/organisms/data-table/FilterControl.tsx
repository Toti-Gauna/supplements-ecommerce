"use client";
import { DateInput } from "@/components/atoms/DateInput";
import { HelpButton } from "@/components/molecules/Help";
import type { FilterSpec } from "@/demo/admin/table";
import { cn } from "@/lib/cn";

interface Props<T> {
  spec: FilterSpec<T>;
  value: string;
  onChange: (value: string) => void;
  /** Cuántas filas quedan con cada opción (se muestra entre paréntesis). */
  count?: (value: string) => number;
  /** Prefijo del id: el mismo filtro puede estar en la barra y en "Más filtros" (uno de los dos oculto). */
  idPrefix: string;
  className?: string;
  /** Si el filtro tiene explicación: si está abierta, a qué panel apunta y cómo abrirla. */
  help?: { open: boolean; controls: string; onToggle: () => void };
}

const field = "h-11 w-full rounded-2xl border px-3 text-sm font-bold focus:border-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/12";

/** Un filtro de la tabla: select con el conteo de cada opción (resaltado cuando filtra), o una fecha. */
export function FilterControl<T>({ spec, value, onChange, count, idPrefix, className, help }: Props<T>) {
  const id = `${idPrefix}-${spec.id}`;
  const n = (v: string) => (count ? ` (${count(v)})` : "");
  return (
    <div className={cn("min-w-0 flex-col gap-1 text-sm font-bold", className)}>
      <span className="flex min-h-5 items-center justify-between gap-1">
        <label htmlFor={id}>{spec.label}</label>
        {spec.help && help && <HelpButton label={spec.label} {...help} className="-my-1.5 h-7 w-7" />}
      </span>
      {spec.kind === "date" ? (
        <DateInput id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 min-h-11! text-sm" />
      ) : (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(field, value ? "border-primary bg-primary/[0.06]" : "border-ink/12 bg-surface")}>
          <option value="">{spec.allLabel ?? "Todos"}{n("")}</option>
          {spec.options?.map((o) => <option key={o.value} value={o.value}>{o.label}{n(o.value)}</option>)}
        </select>
      )}
    </div>
  );
}
