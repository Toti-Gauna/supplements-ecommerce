"use client";
import { ArrowUpRight, Clock, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { RackRow, type RackRowData } from "@/components/molecules/RackRow";
import { cn } from "@/lib/cn";

/** Una opción del buscador: un producto (fila de rack) o una búsqueda para cargar (reciente o popular). */
export type SearchOption =
  | { key: string; kind: "product"; href: string; row: RackRowData }
  | { key: string; kind: "query"; text: string; recent?: boolean };

export interface OptionGroup {
  id: string;
  label: string;
  options: SearchOption[];
  className?: string;
}

export const optionId = (listId: string, index: number) => `${listId}-opt-${index}`;

interface SearchListboxProps {
  id: string;
  label: string;
  groups: OptionGroup[];
  active: number;
  onActive: (index: number) => void;
  onPick: (option: SearchOption) => void;
  className?: string;
}

/**
 * Lista del buscador con el patrón combobox: el foco queda en el campo y las flechas mueven la opción activa
 * (`aria-activedescendant`). Las opciones no son links (una opción no puede tener controles adentro): elegir navega.
 */
export function SearchListbox({ id, label, groups, active, onActive, onPick, className }: SearchListboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active < 0) return;
    ref.current?.querySelector(`#${CSS.escape(optionId(id, active))}`)?.scrollIntoView({ block: "nearest" });
  }, [active, id]);
  const shown = groups.filter((g) => g.options.length);
  const starts = shown.map((_, k) => shown.slice(0, k).reduce((n, g) => n + g.options.length, 0));
  return (
    <div ref={ref} id={id} role="listbox" aria-label={label} className={cn("flex flex-col gap-6", className)}>
      {shown.map((g, k) => (
        <div key={g.id} role="group" aria-labelledby={`${id}-${g.id}`} className={g.className}>
          <p id={`${id}-${g.id}`} role="presentation" className="eyebrow mb-2 text-muted">{g.label}</p>
          <div className={cn("grid grid-cols-[minmax(0,1fr)]", g.options[0]?.kind === "product" ? "gap-1.5" : "gap-0.5")}>
            {g.options.map((o, j) => {
              const i = starts[k]! + j;
              return (
                <div key={o.key} id={optionId(id, i)} role="option" aria-selected={i === active} onClick={() => onPick(o)} onMouseDown={(e) => e.preventDefault()} onMouseMove={() => i !== active && onActive(i)}
                  className="cursor-pointer">
                  {o.kind === "product" ? <RackRow item={o.row} active={i === active} /> : <QueryRow option={o} active={i === active} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function QueryRow({ option, active }: { option: Extract<SearchOption, { kind: "query" }>; active: boolean }) {
  const Icon = option.recent ? Clock : TrendingUp;
  return (
    <span className={cn("flex min-h-11 items-center gap-3 border-l-2 px-3 text-[15px] font-semibold transition-colors", active ? "border-volt bg-accent text-ink" : "border-transparent text-ink/90")}>
      <Icon size={16} aria-hidden="true" className={option.recent ? "text-muted" : "text-volt-ink"} />
      <span className="flex-1 truncate">{option.text}</span>
      <ArrowUpRight size={16} aria-hidden="true" className={cn("text-muted transition-opacity", active ? "opacity-100" : "opacity-0")} />
    </span>
  );
}
