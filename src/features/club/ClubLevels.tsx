"use client";
import { Check } from "lucide-react";
import { ClubMedal } from "@/components/illustrations/ClubMedal";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import type { LevelProgress } from "@/demo/engine/club-levels";
import { CLUB_BASE_PERKS, CLUB_LEVELS } from "@/demo/fixtures/club";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { DemoAccountButton } from "./DemoAccountButton";
import { NIGHT_PLATE, NIGHT_PLATE_ON } from "./styles";

const METAL_NAME = { bronce: "bronce", plata: "plata", oro: "oro", platino: "platino" } as const;

/**
 * Tabla de niveles con medallas de metal (bronce, plata, oro y platino): desde cuánto se llega y qué suma cada uno. Lo
 * que es de todos los socios va arriba, una sola vez. Tu nivel queda encendido; con cuenta, la batería hasta el próximo.
 */
export function ClubLevels({ progress, signedIn }: { progress: LevelProgress; signedIn: boolean }) {
  // Sin cuenta no hay "tu nivel": ninguna fila se enciende.
  const current = signedIn ? CLUB_LEVELS.findIndex((l) => l.id === progress.level.id) : -1;
  return (
    <div className="flex flex-col gap-6">
      <div className={cn(NIGHT_PLATE, "rounded-sm p-5 sm:p-6")}>
        {signedIn ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-display text-2xl">Nivel {progress.level.name} · medalla de {METAL_NAME[progress.level.metal]}</p>
              <p className="text-sm text-night-muted">
                {progress.next ? <>Te faltan <strong className="text-on-night">{formatARS(progress.missing)}</strong> para {progress.next.name}</> : "Llegaste al nivel más alto"}
              </p>
            </div>
            <BatteryMeter pct={progress.pct} label={progress.next ? `Carga hacia el nivel ${progress.next.name}` : "Nivel máximo"} className="mt-3 border-white/15" />
            <p className="mt-3 text-xs text-night-muted">Gasto de ejemplo de la cuenta demo, en pedidos pagados de los últimos 12 meses.</p>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-md text-sm text-night-muted"><strong className="block font-display text-2xl text-on-night">Arrancás en bronce.</strong>Con la cuenta demo ves tu nivel, lo que te falta para el siguiente y tu medalla.</p>
            <DemoAccountButton variant="dark" />
          </div>
        )}
      </div>
      <p className="text-sm text-night-muted"><strong className="text-on-night">Para todos los socios:</strong> {CLUB_BASE_PERKS.join(" · ")}.</p>
      <ol aria-label="Tabla de niveles" className="flex flex-col gap-2">
        {CLUB_LEVELS.map((l, i) => {
          const on = i === current;
          const done = i < current;
          return (
            <li key={l.id} aria-current={on ? "step" : undefined}
              className={cn("relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-sm p-4 sm:grid-cols-[auto_minmax(0,14rem)_minmax(0,1fr)] sm:p-5", on ? NIGHT_PLATE_ON : NIGHT_PLATE)}>
              <ClubMedal metal={l.metal} label={`Medalla de ${METAL_NAME[l.metal]}`} className={cn("h-20 w-16", !on && !done && "opacity-80")} />
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-night-muted">Nivel {i + 1} · {METAL_NAME[l.metal]}</p>
                <p className="font-display text-3xl leading-none">{l.name}</p>
                <p className="font-lab mt-1 text-[12px] text-night-muted">{l.minSpend ? `Desde ${formatARS(l.minSpend)}` : "Desde tu primera compra"}</p>
                {on && <span className="font-lab mt-2 inline-block rounded-xs bg-volt px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night">Tu nivel</span>}
              </div>
              <ul className="col-span-2 flex flex-col gap-1.5 text-[14px] leading-snug sm:col-span-1">
                {l.perks.map((perk) => <li key={perk} className="flex gap-2"><Check size={15} aria-hidden="true" className={cn("mt-0.5 shrink-0", on || done ? "text-volt" : "text-night-muted")} />{perk}</li>)}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
