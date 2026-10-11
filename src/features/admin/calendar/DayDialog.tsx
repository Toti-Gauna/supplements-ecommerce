"use client";
import Link from "next/link";
import { CalendarOff, Link2, Pencil, Plus, StickyNote, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { EVENT_KIND_LABEL, eventDraft, hasImpact, isPresetHolidayDate, scheduleImpact, type EventDraft, type ScheduleImpact } from "@/demo/admin/workshop/schedule";
import { calendarOf } from "@/demo/engine/delivery";
import { closureFor } from "@/demo/engine/workdays";
import type { CalendarEvent, Closure } from "@/demo/fixtures/workshop";
import { formatDay } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";
import { EntryRow } from "./DayList";
import type { Entry } from "./entries";
import { EventForm } from "./EventForm";
import { ImpactConfirm, InlineConfirm } from "./ImpactConfirm";

type Mode = { view: true } | { form: EventDraft; id?: string } | { remove: CalendarEvent } | { removeClosure: Closure } | { impact: ScheduleImpact; closure: Closure };

interface Props { day: string | null; eventId: string | null; today: string; entries: Entry[]; onClose: () => void; onReschedule: (code: string) => void }

/**
 * Un día del calendario (8.3.15): sus entregas, sus entradas y si el taller trabaja. Desde acá se crean y editan
 * entradas o se cierra el día, todo en el mismo modal (sin otro encima).
 */
export function DayDialog({ day, eventId, today, entries, onClose, onReschedule }: Props) {
  return (
    <Sheet open={!!day} onClose={onClose} title={day ? `Día ${formatDay(day, "long")}` : "Día"} side="dialog" className="bg-bg sm:w-[min(94vw,680px)]">
      {day && <DayBody key={`${day}-${eventId ?? ""}`} day={day} eventId={eventId} today={today} entries={entries} onReschedule={onReschedule} />}
    </Sheet>
  );
}

function DayBody({ day, eventId, today, entries, onReschedule }: Omit<Props, "day" | "onClose"> & { day: string }) {
  const { orders, workshop, saveEvent, removeEvent, addClosure, removeClosure } = useAdmin();
  const save = useDemoSave();
  const settings = workshop.settings;
  const events = workshop.events.filter((e) => e.date === day);
  const editing = workshop.events.find((e) => e.id === eventId);
  const [mode, setMode] = useState<Mode>(editing ? { form: eventDraft(day, editing), id: editing.id } : { view: true });
  const closed = closureFor(day, calendarOf(settings));
  const used = entries.filter((e) => e.counts).length;
  const linkable = orders.filter((o) => o.promisedDate && o.status !== "CANCELLED");

  const closeDay = (c: Closure) => {
    const impact = scheduleImpact(orders, settings, { ...settings, closures: [...settings.closures, c] }, today);
    if (hasImpact(impact)) { setMode({ impact, closure: c }); return; }
    save(`${formatDay(c.date)}: ${c.name}`, () => addClosure(c));
    setMode({ view: true });
  };
  const submit = (d: EventDraft, id?: string): string | void => {
    if (d.kind === "cierre") {
      const already = closureFor(d.date, calendarOf(settings))?.closure;
      if (already) return `Ese día ya está cerrado: ${already.name}.`;
      closeDay({ date: d.date, name: d.title, kind: "cierre" });
      return;
    }
    const event: CalendarEvent = { id: id ?? `ev-${Date.now().toString(36)}`, date: d.date, title: d.title, kind: d.kind, ...(d.notes ? { notes: d.notes } : {}), ...(d.kind === "pedido" ? { orderCode: d.orderCode } : {}) };
    save(id ? "Entrada actualizada" : "Entrada agregada", () => saveEvent(event), d.date !== day ? `Quedó el ${formatDay(d.date)}. Cambio guardado solo en esta demo.` : undefined);
    setMode({ view: true });
  };

  return (
    <div className="flex max-h-[94dvh] flex-col gap-4 overflow-y-auto p-5 pt-7 sm:max-h-[90dvh] sm:p-7">
      <header className="pr-12">
        <h2 className="font-display text-3xl first-letter:uppercase">{formatDay(day, "long")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{closed ? `${closed.reason} · el taller no trabaja` : `Taller abierto · ${used} de ${settings.dailyCapacity} pedidos${used > settings.dailyCapacity ? " (sobrecargado)" : used === settings.dailyCapacity ? " (completo)" : ""}`}</p>
      </header>
      {"form" in mode ? (
        <EventForm initial={mode.form} today={today} orders={linkable} allowClosure={!mode.id} editing={!!mode.id} onCancel={() => setMode({ view: true })} onSave={(d) => submit(d, mode.id)}
          onRemove={mode.id ? () => setMode({ remove: workshop.events.find((e) => e.id === mode.id)! }) : undefined} />
      ) : "remove" in mode ? (
        <InlineConfirm label="Quitar entrada" title={`¿Quitar “${mode.remove.title}”?`} action="Quitar entrada" cancel="Cancelar" onCancel={() => setMode({ view: true })}
          onConfirm={() => { const id = mode.remove.id; save("Entrada quitada", () => removeEvent(id)); setMode({ view: true }); }} />
      ) : "removeClosure" in mode ? (
        <InlineConfirm label="Quitar cierre" title={`¿Quitar “${mode.removeClosure.name}”?`} action="Quitar cierre" cancel="Cancelar" onCancel={() => setMode({ view: true })}
          onConfirm={() => { const c = mode.removeClosure; save("Cierre quitado: el taller trabaja ese día", () => removeClosure(c.date)); setMode({ view: true }); }}>
          <p>El taller vuelve a trabajar ese día y la tienda lo ofrece como fecha de entrega.</p>
        </InlineConfirm>
      ) : "impact" in mode ? (
        <ImpactConfirm impact={mode.impact} action="Cerrar igual" onCancel={() => setMode({ view: true })}
          onConfirm={() => { const c = mode.closure; save(`${formatDay(c.date)}: ${c.name}`, () => addClosure(c), "Las entregas de ese día quedaron marcadas para reprogramar."); setMode({ view: true }); }} />
      ) : (
        <>
          {closed?.closure && (
            <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface p-3 text-sm shadow-[var(--shadow-card)]">
              <CalendarOff size={16} aria-hidden="true" className="text-muted" /><span className="min-w-0 flex-1 font-semibold">{closed.closure.name}</span>
              {isPresetHolidayDate(day)
                ? day >= today && <Button size="sm" variant="secondary" onClick={() => { save(`${formatDay(day)}: el taller trabaja`, () => removeClosure(day)); }}>Trabajar ese día</Button>
                : <Button size="sm" variant="ghost" onClick={() => setMode({ removeClosure: closed.closure! })}>Quitar cierre</Button>}
            </p>
          )}
          {closed && !closed.closure && <p className="text-sm text-muted">Los días de trabajo se cambian en “Capacidad y feriados”.</p>}
          <section aria-label="Entregas del día">
            <h3 className="mb-2 font-bold">Entregas ({entries.length})</h3>
            {entries.length ? <ul className="flex flex-col gap-2">{entries.map((e) => <EntryRow key={e.order.code} entry={e} onOpen={onReschedule} />)}</ul> : <p className="text-sm text-muted">No hay entregas comprometidas.</p>}
          </section>
          <section aria-label="Entradas del día">
            <h3 className="mb-2 font-bold">Entradas ({events.length})</h3>
            {events.length ? (
              <ul className="flex flex-col gap-2">
                {events.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-start gap-3 rounded-2xl bg-surface p-3 text-sm shadow-[var(--shadow-card)]">
                    {e.kind === "pedido" ? <Link2 size={16} aria-hidden="true" className="mt-0.5 text-brass-ink" /> : <StickyNote size={16} aria-hidden="true" className="mt-0.5 text-brass-ink" />}
                    <span className="min-w-0 flex-1 basis-40">
                      <span className="block font-bold">{e.title}</span>
                      <span className="block text-xs text-muted">{EVENT_KIND_LABEL[e.kind]}{e.orderCode && <> · <Link href={`/admin-demo/pedidos/detalle/?codigo=${e.orderCode}`} className="font-bold text-primary underline">{e.orderCode}</Link></>}</span>
                      {e.notes && <span className="mt-1 block text-muted">{e.notes}</span>}
                    </span>
                    <span className="flex gap-1">
                      <button type="button" onClick={() => setMode({ form: eventDraft(day, e), id: e.id })} aria-label={`Editar ${e.title}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent/60"><Pencil size={16} aria-hidden="true" /></button>
                      <button type="button" onClick={() => setMode({ remove: e })} aria-label={`Quitar ${e.title}`} className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={16} aria-hidden="true" /></button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">Sin entradas propias.</p>}
          </section>
          <div className="flex flex-wrap justify-end gap-2">
            {!closed && day >= today && <Button variant="ghost" onClick={() => setMode({ form: { ...eventDraft(day), kind: "cierre" } })}><CalendarOff size={16} aria-hidden="true" /> Cerrar el taller este día</Button>}
            <Button onClick={() => setMode({ form: eventDraft(day) })}><Plus size={16} aria-hidden="true" /> Nueva entrada</Button>
          </div>
        </>
      )}
    </div>
  );
}
