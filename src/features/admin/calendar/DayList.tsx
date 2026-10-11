"use client";
import { AlarmClock, CalendarClock, Link2, StickyNote } from "lucide-react";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { closureFor, type WorkCalendar } from "@/demo/engine/workdays";
import type { CalendarEvent } from "@/demo/fixtures/workshop";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { fulfillmentLabel } from "../OrderCard";
import type { Entry } from "./entries";
import { capacityText } from "./MonthView";

/** Fila de un pedido con fecha: estado, cliente, productos y botón para reprogramar. */
export function EntryRow({ entry: e, onOpen }: { entry: Entry; onOpen: (code: string) => void }) {
  return (
    <li className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)]", e.late ? "ring-1 ring-danger" : e.blocked && "ring-1 ring-warning")}>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold tabular-nums">{e.order.code}</span>
          <StatusBadge status={e.order.status} />
          {e.late && <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-bold text-danger"><AlarmClock size={12} aria-hidden="true" /> Atrasado</span>}
          {e.blocked && <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning">Día cerrado: reprogramar</span>}
        </span>
        <span className="mt-1 block text-sm font-semibold">{e.order.customer.name} <span className="font-normal text-muted">· {fulfillmentLabel(e.order.fulfillment)}</span></span>
        <span className="block text-sm text-muted">{e.summary}</span>
      </span>
      <button type="button" onClick={() => onOpen(e.order.code)} aria-label={`${e.movable ? "Reprogramar" : "Ver"} ${e.order.code}`}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-3.5 text-sm font-bold hover:bg-accent/50">
        <CalendarClock size={16} aria-hidden="true" /> {e.movable ? "Reprogramar" : "Ver"}
      </button>
    </li>
  );
}

interface AgendaProps { entries: Entry[]; events: CalendarEvent[]; today: string; cal: WorkCalendar; capacity: number; onOpen: (code: string) => void; onEvent: (id: string) => void }

/** Agenda: atrasados primero y después cada día con entregas o entradas, desde hoy. */
export function AgendaView({ entries, events, today, cal, capacity, onOpen, onEvent }: AgendaProps) {
  const late = entries.filter((e) => e.late);
  const upcoming = entries.filter((e) => !e.late && e.day >= today && e.movable);
  const ahead = events.filter((e) => e.date >= today);
  const days = [...new Set([...upcoming.map((e) => e.day), ...ahead.map((e) => e.date)])].sort();
  return (
    <div className="flex flex-col gap-6">
      {late.length > 0 && (
        <section aria-labelledby="ag-late">
          <h2 id="ag-late" className="mb-2 flex items-center gap-2 font-bold text-danger"><AlarmClock size={18} aria-hidden="true" /> Atrasados ({late.length})</h2>
          <ul className="flex flex-col gap-2">{late.map((e) => <EntryRow key={e.order.code} entry={e} onOpen={onOpen} />)}</ul>
        </section>
      )}
      {days.map((day) => {
        const list = upcoming.filter((e) => e.day === day);
        const used = list.filter((e) => e.counts).length;
        const closed = closureFor(day, cal);
        return (
          <section key={day} aria-labelledby={`ag-${day}`}>
            <h2 id={`ag-${day}`} className="mb-2 flex flex-wrap items-baseline gap-2 font-bold first-letter:uppercase">
              {formatDay(day, "long")}{day === today && <span className="text-sm text-primary">· hoy</span>}
              <span className={cn("text-sm", closed ? "text-danger" : used >= capacity ? "text-warning" : "text-muted")}>{closed ? `${closed.reason} (día cerrado)` : capacityText(used, capacity)}</span>
            </h2>
            <ul className="flex flex-col gap-2">
              {list.map((e) => <EntryRow key={e.order.code} entry={e} onOpen={onOpen} />)}
              {ahead.filter((e) => e.date === day).map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => onEvent(e.id)} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-brass-ink/40 bg-bg p-3 text-left text-sm hover:bg-accent/40">
                    {e.kind === "pedido" ? <Link2 size={16} aria-hidden="true" className="shrink-0 text-brass-ink" /> : <StickyNote size={16} aria-hidden="true" className="shrink-0 text-brass-ink" />}
                    <span className="min-w-0 flex-1"><span className="block font-bold">{e.title}</span>{e.orderCode && <span className="text-xs text-muted">{e.orderCode}</span>}</span>
                    <span className="text-xs font-bold text-primary">Editar</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!late.length && !days.length && <p className="text-sm text-muted">No hay entregas por delante.</p>}
    </div>
  );
}
