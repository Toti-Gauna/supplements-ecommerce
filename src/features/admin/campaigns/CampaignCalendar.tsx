"use client";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { calendarMonths, campaignFlag, type CampaignFlag, type MonthBar } from "@/demo/admin/campaign-calendar";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDayRange } from "@/lib/date";
import { skinOf } from "@/features/themes/skins";
import { editorHref } from "./links";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const FLAG_LABEL: Record<Exclude<CampaignFlag, null>, string> = { cace: "CACE", "black-friday": "Black Friday", sport: "Deporte" };
/** Rayado de los días del deporte: se distinguen sin depender del color. */
const SPORT_STRIPES = "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.28) 0 4px, transparent 4px 9px)";

function Bar({ bar, theme }: { bar: MonthBar; theme: SeasonalTheme }) {
  const skin = skinOf(theme.id);
  const sport = Boolean(theme.sport);
  return (
    <Link href={editorHref(theme.id)} tabIndex={-1} aria-hidden="true" title={theme.name} data-bar={theme.id}
      className={cn("absolute inset-y-1 rounded-xs ring-1 ring-ink/20 transition-[filter] hover:brightness-125", !theme.active && "opacity-40")}
      style={{ left: `${bar.left}%`, width: `max(${bar.width}%, 6px)`, background: sport ? `${SPORT_STRIPES}, ${skin.to}` : `linear-gradient(90deg, ${skin.from}, ${skin.to})` }} />
  );
}

function Chip({ theme }: { theme: SeasonalTheme }) {
  const flag = campaignFlag(theme);
  const skin = skinOf(theme.id);
  const range = formatDayRange(theme.startsOn, theme.endsOn);
  const extra = [flag && FLAG_LABEL[flag], !theme.active && "pausada"].filter(Boolean).join(", ");
  return (
    <li>
      <Link href={editorHref(theme.id)} data-campaign-chip={theme.id} data-kind={theme.sport ? "sport" : "commercial"} data-flag={flag ?? undefined}
        aria-label={`Editar ${theme.name}, ${range}${extra ? `, ${extra}` : ""}`}
        className={cn("flex min-h-11 items-center gap-2 rounded-sm bg-bg px-2.5 py-1.5 text-sm ring-1 ring-ink/[0.06] hover:ring-primary focus-visible:outline-2 focus-visible:outline-primary", theme.sport && "border-l-4 border-dashed border-ink/40", !theme.active && "text-muted")}>
        <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-xs" style={{ background: theme.sport ? `${SPORT_STRIPES}, ${skin.to}` : `linear-gradient(135deg, ${skin.from}, ${skin.to})` }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{theme.name}</span>
          <span className="block text-xs text-muted">{range}</span>
        </span>
        {theme.sport && <Dumbbell size={15} aria-hidden="true" className="shrink-0 text-muted" />}
        {flag === "cace" && <span aria-hidden="true" className="rounded-xs bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-bg">CACE</span>}
        {flag === "black-friday" && <span aria-hidden="true" className="rounded-xs bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-bg">BF</span>}
        {!theme.active && <span aria-hidden="true" className="font-mono text-[10px] font-bold uppercase text-warning">Pausada</span>}
      </Link>
    </li>
  );
}

/**
 * Calendario anual (R3, Panel → Campañas): doce meses desde el de la demo, cada campaña como barra en los días que
 * ocupa. Los días del deporte van rayados y con mancuerna; las fechas CACE (Hot Sale, CyberMonday) y Black Friday,
 * con su sello. Las barras son atajos visuales: la lista de cada mes tiene los enlaces accesibles al editor.
 */
export function CampaignCalendar({ themes }: { themes: SeasonalTheme[] }) {
  const months = calendarMonths(themes, DEMO_TODAY.slice(0, 7));
  const byId = new Map(themes.map((t) => [t.id, t]));
  const today = Number(DEMO_TODAY.slice(8, 10));
  return (
    <section aria-labelledby="cal-title" className="mb-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 id="cal-title" className="font-display text-2xl">Calendario del año</h2>
        <ul aria-label="Referencias" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-5 rounded-xs bg-plasma" />Fecha comercial</li>
          <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-5 rounded-xs bg-ion" style={{ backgroundImage: SPORT_STRIPES }} /><Dumbbell size={13} aria-hidden="true" />Día del deporte</li>
          <li className="flex items-center gap-1.5"><span aria-hidden="true" className="rounded-xs bg-ink px-1 font-mono text-[10px] font-bold text-bg">CACE</span>Hot Sale y CyberMonday</li>
          <li className="flex items-center gap-1.5"><span aria-hidden="true" className="rounded-xs bg-ink px-1 font-mono text-[10px] font-bold text-bg">BF</span>Black Friday</li>
        </ul>
      </div>
      <ol aria-label="Campañas por mes" className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {months.map((m, i) => {
          const starting = m.bars.filter((b) => b.starts).map((b) => byId.get(b.id)!);
          return (
            <li key={`${m.year}-${m.month}`} aria-label={`${MONTHS[m.month]} ${m.year}`} className="flex flex-col gap-2 rounded-sm bg-surface p-3 shadow-[var(--shadow-card)]">
              <p className="flex items-baseline justify-between text-sm font-extrabold">{MONTHS[m.month]} <span className="font-mono text-xs font-bold text-muted">{m.year}</span></p>
              <div className="relative h-8 rounded-xs bg-bg ring-1 ring-ink/[0.06]" data-month-track>
                {[10, 20].map((d) => <span key={d} aria-hidden="true" className="absolute inset-y-0 w-px bg-line" style={{ left: `${((d - 1) / m.days) * 100}%` }} />)}
                {m.bars.map((b) => <Bar key={b.id + b.from} bar={b} theme={byId.get(b.id)!} />)}
                {i === 0 && <span aria-hidden="true" title="Hoy" className="absolute -inset-y-1 w-0.5 bg-danger" style={{ left: `${((today - 0.5) / m.days) * 100}%` }} />}
              </div>
              {starting.length > 0 ? (
                <ul className="grid grid-cols-[minmax(0,1fr)] gap-1.5">{starting.map((t) => <Chip key={t.id} theme={t} />)}</ul>
              ) : <p className="text-xs text-muted">{m.bars.length ? "Sigue la campaña del mes anterior." : "Sin campañas este mes."}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
