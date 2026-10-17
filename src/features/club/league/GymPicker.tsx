"use client";
import { Check } from "lucide-react";
import { GYMS, GYM_KIND_LABEL } from "@/demo/fixtures/gyms";
import { cn } from "@/lib/cn";
import { useClub } from "@/stores/club";

/**
 * Elegí tu gimnasio: un grupo de radios nativos (flechas para moverse, foco visible) dibujados como placas del rack.
 * El elegido se guarda en este navegador y tu aporte del mes suma a ese box. Se puede cambiar cuando quieras.
 */
export function GymPicker({ selected }: { selected: string | null }) {
  const setGym = useClub((s) => s.setGym);
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Elegí tu gimnasio</legend>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {GYMS.map((g) => {
          const on = g.id === selected;
          return (
            <label key={g.id} className={cn("plate relative flex min-h-16 cursor-pointer items-center gap-3 rounded-sm border p-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary", on ? "border-primary shadow-[inset_0_2px_0_var(--color-volt)]" : "border-line hover:border-ink/40")}>
              <input type="radio" name="gym" value={g.id} checked={on} onChange={() => setGym(g.id)} className="sr-only" />
              <span aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-xs border", on ? "border-transparent bg-primary text-on-primary" : "border-line")}>{on && <Check size={14} />}</span>
              <span className="min-w-0">
                <span className="block truncate font-bold">{g.name}</span>
                <span className="block truncate text-xs text-muted">{g.barrio} · {GYM_KIND_LABEL[g.kind]}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
