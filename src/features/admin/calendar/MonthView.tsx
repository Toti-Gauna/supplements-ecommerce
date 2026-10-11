"use client";
import { closureFor, monthGrid, type WorkCalendar } from "@/demo/engine/workdays";
import type { CalendarEvent } from "@/demo/fixtures/workshop";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { CalendarDnd } from "./dnd";
import { EntryChip } from "./EntryChip";
import type { Entry } from "./entries";
import { EventChip } from "./EventChip";

export const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const MAX_CHIPS = 3;

export interface CalendarViewProps {
  cursor: string;
  today: string;
  days: Map<string, Entry[]>;
  events: Map<string, CalendarEvent[]>;
  cal: WorkCalendar;
  capacity: number;
  dnd: CalendarDnd;
  /** Abre el día: ver, crear y editar sus entradas (8.3.15). */
  onDay: (day: string) => void;
  onOpen: (code: string) => void;
  onEvent: (id: string) => void;
}

export function capacityText(used: number, capacity: number): string {
  return used >= capacity ? (used > capacity ? `${used}/${capacity} sobrecargado` : "Completo") : `${used}/${capacity}`;
}

export function dayLabel(day: string, list: Entry[], events: CalendarEvent[], closed: { reason: string } | null, capacity: number): string {
  const used = list.filter((e) => e.counts).length;
  return `${formatDay(day, "long")}${closed ? `, ${closed.reason}` : ""}: ${list.length} ${list.length === 1 ? "entrega" : "entregas"}${!closed ? `, ${capacityText(used, capacity).toLowerCase()} de capacidad` : ""}${events.length ? `, ${events.length} ${events.length === 1 ? "entrada" : "entradas"}` : ""}. Abrir el día`;
}

/** Mientras se arrastra: el día bajo el cursor que no acepta muestra por qué (cerrado, completo, ya pasó). */
export function BlockedBadge({ dnd, day }: { dnd: CalendarDnd; day: string }) {
  if (dnd.blocked?.day !== day) return null;
  return <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-xl bg-danger-soft/95 p-1 text-center text-[11px] font-extrabold leading-tight text-danger ring-2 ring-danger">No se puede: {dnd.blocked.short}</span>;
}

/**
 * Mes de lunes a domingo. Tocar un día (cualquier parte de la celda) lo abre para ver, crear y editar entradas; en
 * escritorio los pedidos y las entradas se arrastran a otro día. En el celular cada día muestra puntos.
 */
export function MonthView({ cursor, today, days, events, cal, capacity, dnd, onDay, onOpen, onEvent }: CalendarViewProps) {
  const month = cursor.slice(0, 7);
  return (
    <table className="w-full table-fixed border-separate border-spacing-1 sm:border-spacing-1.5">
      <caption className="sr-only">Entregas y entradas de {formatDay(cursor, "month")}. Tocá un día para ver o agregar entradas; arrastrá un pedido a otro día para reprogramarlo.</caption>
      <thead>
        <tr>{WEEKDAYS.map((d) => <th key={d} scope="col" className="pb-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">{d}</th>)}</tr>
      </thead>
      <tbody>
        {monthGrid(cursor).map((week) => (
          <tr key={week[0]}>
            {week.map((day) => {
              const list = days.get(day) ?? [];
              const evs = events.get(day) ?? [];
              const used = list.filter((e) => e.counts).length;
              const closed = closureFor(day, cal);
              const outside = day.slice(0, 7) !== month;
              const invalid = !!dnd.blockOf(day);
              const chips = [...list.map((e) => ({ key: e.order.code, node: <EntryChip entry={e} onOpen={onOpen} dnd={dnd} /> })), ...evs.map((e) => ({ key: e.id, node: <EventChip event={e} onOpen={onEvent} dnd={dnd} /> }))];
              return (
                <td key={day} {...dnd.zone(day)} data-day={day}
                  className={cn("relative h-16 rounded-xl align-top transition-colors sm:h-32",
                    dnd.over === day ? "bg-accent ring-2 ring-primary" : closed ? "bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(28_32_22/0.04)_6px_12px)]" : outside ? "bg-surface/55" : "bg-surface",
                    !closed && "shadow-[var(--shadow-card)]", invalid && "opacity-60")}>
                  <button type="button" onClick={() => onDay(day)} aria-label={dayLabel(day, list, evs, closed, capacity)}
                    className="absolute inset-0 rounded-xl hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary" />
                  <div className="pointer-events-none relative flex items-center gap-1 px-1.5 pt-1.5">
                    <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-extrabold tabular-nums",
                      day === today ? "bg-night text-[#f6f1e8]" : closed || outside ? "text-muted" : "text-ink")}>{Number(day.slice(8))}</span>
                    {!closed && day >= today && list.length > 0 && (
                      <span className={cn("ml-auto hidden rounded-full px-1.5 text-[10px] font-extrabold tabular-nums sm:inline", used >= capacity ? "bg-warning-soft text-warning" : "bg-bg text-muted")}>{capacityText(used, capacity)}</span>
                    )}
                  </div>
                  {closed?.closure && <p className="pointer-events-none absolute inset-x-1.5 bottom-1.5 hidden truncate text-[10px] font-bold text-muted sm:block">{closed.reason}</p>}
                  {/* Celular: puntos por pedido y por entrada (decorativos: el botón del día lleva la cuenta). */}
                  {chips.length > 0 && (
                    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-0.5 sm:hidden">
                      {list.slice(0, 4).map((e) => <span key={e.order.code} className={cn("h-1.5 w-1.5 rounded-full", e.late || e.blocked ? "bg-danger" : e.counts ? "bg-primary" : "bg-muted/50")} />)}
                      {evs.slice(0, 2).map((e) => <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-brass-ink" />)}
                    </span>
                  )}
                  <ul className="pointer-events-none relative hidden flex-col gap-1 px-1.5 pb-1.5 pt-1 sm:flex">
                    {chips.slice(0, MAX_CHIPS).map((c) => <li key={c.key} className="pointer-events-auto">{c.node}</li>)}
                    {chips.length > MAX_CHIPS && (
                      <li className="pointer-events-auto"><button type="button" onClick={() => onDay(day)} className="relative z-10 text-[11px] font-bold text-primary underline">+{chips.length - MAX_CHIPS} más</button></li>
                    )}
                  </ul>
                  <BlockedBadge dnd={dnd} day={day} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
