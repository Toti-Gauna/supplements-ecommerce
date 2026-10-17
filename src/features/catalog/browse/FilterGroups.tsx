"use client";
import { useId } from "react";
import type { FacetGroup, FacetKey, FacetOption } from "@/demo/engine/catalog-facets";
import { cn } from "@/lib/cn";

/** Cuántas opciones se ven de entrada; el resto, en "Ver más" (los sabores son muchos). */
const VISIBLE = 7;
const LEGEND = "lane mb-2 w-full pb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted";
const ROW = "group flex min-h-11 cursor-pointer items-center gap-3 border-b border-line/60 py-1 text-[15px] sm:min-h-10 lg:text-sm";
const BOX = "size-[18px] shrink-0 cursor-pointer accent-(--color-primary)";

interface Props {
  groups: FacetGroup[];
  onToggle: (key: FacetKey, id: string) => void;
  className?: string;
}

function Option({ group, option, name, onToggle }: { group: FacetGroup; option: FacetOption; name: string; onToggle: Props["onToggle"] }) {
  const radio = group.kind === "radio";
  const empty = option.count === 0 && !option.checked;
  return (
    <li>
      <label className={cn(ROW, empty && "cursor-default opacity-50")}>
        <input type={radio ? "radio" : "checkbox"} name={name} value={option.id} checked={option.checked} disabled={empty}
          onChange={() => onToggle(group.key, option.id)} className={BOX} />
        <span className="min-w-0 flex-1 truncate font-semibold group-has-[:checked]:text-ink">{option.label}</span>
        <span aria-hidden="true" className="font-mono text-[11px] tabular-nums text-muted">{option.count}</span>
        <span className="sr-only">, {option.count === 1 ? "1 producto" : `${option.count} productos`}</span>
      </label>
    </li>
  );
}

/**
 * Filtros del catálogo con controles nativos: casillas por grupo (objetivo, marca, sabor, sellos, categoría) y radios
 * para el rango de precio por servicio, cada opción con cuántos productos quedarían. Lo mismo en la columna del
 * escritorio y en el panel del celular.
 */
export function FilterGroups({ groups, onToggle, className }: Props) {
  const uid = useId();
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {groups.map((group) => {
        const name = `${uid}-${group.key}`;
        const radio = group.kind === "radio";
        const head = group.options.slice(0, VISIBLE);
        const tail = group.options.slice(VISIBLE);
        const opened = tail.some((o) => o.checked);
        return (
          <fieldset key={group.key} className="min-w-0">
            <legend className={LEGEND}>{group.label}</legend>
            <ul>
              {radio && (
                <li>
                  <label className={ROW}>
                    <input type="radio" name={name} value="" checked={!group.options.some((o) => o.checked)} onChange={() => onToggle(group.key, "")} className={BOX} />
                    <span className="flex-1 font-semibold">Cualquiera</span>
                  </label>
                </li>
              )}
              {head.map((o) => <Option key={o.id} group={group} option={o} name={name} onToggle={onToggle} />)}
            </ul>
            {tail.length > 0 && (
              <details open={opened || undefined} className="group/more">
                <summary className="mt-1 flex min-h-10 cursor-pointer list-none items-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4 [&::-webkit-details-marker]:hidden">
                  <span className="group-open/more:hidden">Ver {tail.length} más</span>
                  <span className="hidden group-open/more:inline">Ver menos</span>
                </summary>
                <ul>{tail.map((o) => <Option key={o.id} group={group} option={o} name={name} onToggle={onToggle} />)}</ul>
              </details>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
