"use client";
import { Check } from "lucide-react";
import { LevelGlyph } from "@/components/illustrations/LevelGlyph";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { levelProgress } from "@/demo/engine/club-levels";
import { CLUB_LEVELS } from "@/demo/fixtures/club";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/**
 * Los cuatro niveles del club como una batería que se carga: el nivel actual resaltado, los anteriores cumplidos y una
 * barra con lo que falta para el siguiente. `spend` es lo gastado en pedidos pagados (muestra en la demo).
 */
export function ClubLevels({ spend, signedIn }: { spend: number; signedIn: boolean }) {
  const p = levelProgress(spend);
  const current = CLUB_LEVELS.indexOf(p.level);
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-display text-2xl">Nivel {p.level.name}</p>
          <p className="text-sm text-night-muted">
            {p.next ? <>Te faltan <strong className="text-on-night">{formatARS(p.missing)}</strong> para {p.next.name}</> : "Llegaste al nivel más alto"}
          </p>
        </div>
        <BatteryMeter pct={p.pct} label={p.next ? `Carga hacia el nivel ${p.next.name}` : "Nivel máximo"} className="mt-3 border-white/15" />
        <p className="mt-3 text-xs text-night-muted">{signedIn ? "Gasto de ejemplo de la cuenta demo, en pedidos pagados de los últimos 12 meses." : "Sin cuenta arrancás en Novato."}</p>
      </div>
      <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CLUB_LEVELS.map((l, i) => {
          const on = i === current;
          const done = i < current;
          return (
            <li key={l.id} aria-current={on ? "step" : undefined}
              className={cn("relative flex flex-col gap-3 rounded-3xl border p-4 sm:p-5", on ? "border-volt bg-volt/10 shadow-[0_0_32px_-12px_var(--color-volt)]" : "border-white/10 bg-white/[0.03]")}>
              {on && <span className="font-lab absolute right-3 top-3 rounded-full bg-volt px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night">Tu nivel</span>}
              <LevelGlyph level={l.id} className={cn("h-12 w-12 sm:h-14 sm:w-14", on || done ? "text-volt" : "text-night-muted")} />
              <div>
                <p className="font-display text-xl leading-tight">{l.name}</p>
                <p className="font-lab mt-0.5 text-[11px] text-night-muted">{l.minSpend ? `Desde ${formatARS(l.minSpend)}` : "Desde tu primera compra"}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-[13px] leading-snug text-night-muted">
                {l.perks.map((perk) => <li key={perk} className="flex gap-1.5"><Check size={14} aria-hidden="true" className={cn("mt-0.5 shrink-0", on || done ? "text-volt" : "text-night-muted")} />{perk}</li>)}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
