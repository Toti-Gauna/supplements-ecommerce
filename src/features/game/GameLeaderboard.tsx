"use client";
import { useId } from "react";
import { Led } from "@/components/atoms/Led";
import { visibleRows } from "@/demo/engine/game-ranking";
import { cn } from "@/lib/cn";
import { NIGHT_PLATE, NIGHT_PLATE_ON } from "../club/styles";
import { useWeeklyRanking } from "./useWeeklyRanking";

/**
 * Ranking semanal de Shaker Rush como tablero de arcade: puesto y puntaje en LED, y alias. Tu mejor partida de
 * la semana entra en su puesto y queda encendida; si quedaste abajo del top, tu fila se ve igual al final.
 */
export function GameLeaderboard({ compact, className }: { compact?: boolean; className?: string }) {
  const id = useId();
  const { rows, mine, rival } = useWeeklyRanking();
  const shown = visibleRows(rows, compact ? 5 : 10);
  return (
    <section aria-labelledby={id} className={cn("floor led-dark relative flex flex-col gap-4 overflow-hidden rounded-sm p-5 text-on-night sm:p-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow text-volt">Shaker Rush · se reinicia el lunes</p>
          <h2 id={id} className="font-display font-wide mt-1 text-3xl uppercase leading-none">Ranking de la semana</h2>
        </div>
        <p className="font-mono text-[11px] text-night-muted">{mine ? `Vas ${mine.position}.º` : "Jugá para entrar"}{rival ? ` · rival: ${rival.row.alias}` : ""}</p>
      </div>
      <ol aria-label="Ranking semanal de Shaker Rush" className="flex flex-col gap-1">
        {shown.map((r) => (
          <li key={`${r.alias}-${r.position}`} aria-current={r.mine ? "true" : undefined}
            className={cn("grid grid-cols-[2.4rem_minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-3 py-1.5", r.mine ? NIGHT_PLATE_ON : NIGHT_PLATE)}>
            <Led value={String(r.position).padStart(2, "0")} label={`Puesto ${r.position}`} tone={r.position === 1 ? "amber" : "volt"} motion="none" className="h-6!" />
            <p className="min-w-0">
              <span className="block truncate font-mono text-sm font-bold tracking-wider">{r.alias}{r.mine && <span className="ml-2 rounded-xs bg-volt px-1.5 py-0.5 text-[10px] text-night">Tu partida</span>}</span>
            </p>
            <span className="font-lab text-base font-bold tabular-nums">{r.score.toLocaleString("es-AR")}</span>
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-night-muted">Alias y puntajes de muestra. Tu mejor partida de la semana entra sola.</p>
    </section>
  );
}
