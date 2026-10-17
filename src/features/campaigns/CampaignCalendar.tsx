"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { shopNow } from "@/demo/clock";
import { calendarOrder, campaignWindow, daysLeftText, daysUntil } from "@/demo/engine/campaign-window";
import type { SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDayRange } from "@/lib/date";
import { plural } from "@/lib/plural";
import { seasonAccentVariables } from "../themes/palettes";
import s from "./campaign.module.css";

const STATE: Record<string, string> = { live: "En vivo", waiting: "Sala de espera", ended: "Terminó", upcoming: "Se viene" };

/**
 * Calendario de campañas (/campana/ sin campaña elegida o con una que no existe): las fechas del año en orden, cada
 * una con su filo de luz, en qué momento está y cuánto falta. Cada fila abre su página.
 */
export function CampaignCalendar({ themes }: { themes: SeasonalTheme[] }) {
  const now = shopNow();
  return (
    <section aria-labelledby="calendario" className="flex flex-col gap-6">
      <div>
        <p className="eyebrow text-volt-ink">Campañas</p>
        <h1 id="calendario" className="font-display mt-1 text-[clamp(2.4rem,5vw,4rem)] leading-[1.02]">Calendario de campañas</h1>
        <p className="mt-2 max-w-xl text-muted">Las fechas fuertes del año y los días del deporte. Las fechas son de muestra: el dueño las ajusta en el panel.</p>
      </div>
      <ol className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {calendarOrder(themes.filter((t) => t.active)).map((t) => {
          const win = campaignWindow(t, now);
          const when = win.state === "live" ? `cierra en ${plural(daysUntil(win.endsAt, now), "día", "días")}` : win.state === "ended" ? "vuelve el año que viene" : daysLeftText(daysUntil(win.startsAt, now));
          return (
            <li key={t.id} style={seasonAccentVariables(t.id) as CSSProperties}>
              <Link href={`/campana/?id=${t.id}`} className="flex h-full items-stretch gap-3 rounded-sm border border-line bg-surface p-3 hover:border-ink/40">
                <span aria-hidden="true" className="w-1.5 shrink-0 -skew-x-6 bg-(--season-accent)" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[15px]">{t.name}</strong>
                  <span className={cn(s.mono, "block text-[11px] uppercase tracking-[0.1em] text-muted")}>{formatDayRange(t.startsOn, t.endsOn)}{t.sport ? " · Día del deporte" : ""}</span>
                </span>
                <span className={cn(s.mono, "shrink-0 self-center text-right text-[10.5px] font-bold uppercase tracking-[0.1em]")}>
                  <span className="block">{STATE[win.state]}</span>
                  <span className="block font-normal normal-case tracking-normal text-muted">{when}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
