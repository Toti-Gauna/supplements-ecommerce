"use client";
import { Plus } from "lucide-react";
import { closureFor, weekOf } from "@/demo/engine/workdays";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { EntryChip } from "./EntryChip";
import { EventChip } from "./EventChip";
import { BlockedBadge, capacityText, dayLabel, type CalendarViewProps } from "./MonthView";

/** Semana de lunes a domingo: columnas en escritorio, lista en el celular. El título de cada día abre el día. */
export function WeekView({ cursor, today, days, events, cal, capacity, dnd, onDay, onOpen, onEvent }: CalendarViewProps) {
  return (
    <ol aria-label={`Semana del ${formatDay(weekOf(cursor)[0]!, "long")}`} className="grid grid-cols-[minmax(0,1fr)] gap-2 lg:grid-cols-7">
      {weekOf(cursor).map((day) => {
        const list = days.get(day) ?? [];
        const evs = events.get(day) ?? [];
        const used = list.filter((e) => e.counts).length;
        const closed = closureFor(day, cal);
        return (
          <li key={day} {...dnd.zone(day)} data-day={day}
            className={cn("relative flex min-h-24 flex-col gap-2 rounded-2xl p-2.5 transition-colors lg:min-h-[22rem]",
              dnd.over === day ? "bg-accent ring-2 ring-primary" : closed ? "bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(28_32_22/0.04)_6px_12px)]" : "bg-surface",
              !closed && "shadow-[var(--shadow-card)]", dnd.blockOf(day) && "opacity-60")}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="min-w-0">
                <button type="button" onClick={() => onDay(day)} aria-label={dayLabel(day, list, evs, closed, capacity)}
                  className={cn("inline-flex items-center gap-1 rounded-full text-sm font-extrabold first-letter:uppercase hover:underline", day === today && "text-primary")}>
                  {formatDay(day)}<Plus size={13} aria-hidden="true" className="text-muted" />
                </button>
              </h3>
              {!closed && <span className={cn("ml-auto rounded-full px-2 text-[11px] font-extrabold tabular-nums", used >= capacity ? "bg-warning-soft text-warning" : "bg-bg text-muted")}>{capacityText(used, capacity)}</span>}
            </div>
            {closed && <p className="text-xs font-bold text-muted">{closed.reason}</p>}
            {list.length + evs.length ? (
              <ul className="flex flex-col gap-1.5">
                {list.map((e) => <li key={e.order.code}><EntryChip entry={e} variant="card" onOpen={onOpen} dnd={dnd} /></li>)}
                {evs.map((e) => <li key={e.id}><EventChip event={e} variant="card" onOpen={onEvent} dnd={dnd} /></li>)}
              </ul>
            ) : !closed && <p className="text-xs text-muted">Sin entregas</p>}
            <BlockedBadge dnd={dnd} day={day} />
          </li>
        );
      })}
    </ol>
  );
}
