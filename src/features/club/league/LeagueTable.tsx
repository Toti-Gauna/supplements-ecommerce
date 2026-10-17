import { Led } from "@/components/atoms/Led";
import type { LeagueRow } from "@/demo/engine/gym-league";
import { GYM_KIND_LABEL } from "@/demo/fixtures/gyms";
import { cn } from "@/lib/cn";
import { NIGHT_PLATE, NIGHT_PLATE_ON } from "../styles";

/**
 * Tabla de posiciones de la liga: el puesto y los puntos en LED, la barra contra el líder y, en tu box, tu aporte
 * resaltado. `compact` es la versión de la banda del Club (sin socios ni barrio).
 */
export function LeagueTable({ rows, label, compact }: { rows: LeagueRow[]; label: string; compact?: boolean }) {
  const top = Math.max(1, rows[0]?.points ?? 1);
  return (
    <ol aria-label={label} className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <li key={r.gym.id} aria-current={r.mine ? "true" : undefined}
          className={cn("grid grid-cols-[2.6rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-sm px-3 py-2.5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:px-4", r.mine ? NIGHT_PLATE_ON : NIGHT_PLATE)}>
          <Led value={String(r.position).padStart(2, "0")} label={`Puesto ${r.position}`} tone={r.position === 1 ? "amber" : "volt"} motion="none" className="h-7! sm:h-8!" />
          <div className="min-w-0">
            <p className="truncate font-display text-xl leading-tight">{r.gym.name}</p>
            {!compact && <p className="truncate text-xs text-night-muted">{r.gym.barrio} · {GYM_KIND_LABEL[r.gym.kind]} · {r.gym.members} socios</p>}
            {r.mine && (
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs font-bold text-volt">
                <span className="rounded-xs bg-volt px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-night">Tu box</span>
                Tu aporte: +{r.contribution.toLocaleString("es-AR")} pts
              </p>
            )}
          </div>
          <p className="text-right">
            <span className="font-lab block text-lg font-bold tabular-nums">{r.points.toLocaleString("es-AR")}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-night-muted">pts</span>
          </p>
          {!compact && (
            <span aria-hidden="true" className="col-span-3 h-1.5 overflow-hidden rounded-xs bg-white/10">
              <span className="block h-full" style={{ width: `${Math.round((r.points / top) * 100)}%`, background: r.mine ? "var(--led-volt)" : "rgb(255 255 255 / 0.35)" }} />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
