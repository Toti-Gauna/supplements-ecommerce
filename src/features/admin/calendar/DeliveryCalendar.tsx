"use client";
import { Bike, CalendarArrowDown, CalendarX2, ChevronLeft, ChevronRight, SlidersHorizontal, Store, Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { HelpButton, HelpPanel } from "@/components/molecules/Help";
import { CALENDAR_HELP } from "@/demo/admin/help";
import { toIcs } from "@/demo/admin/workshop/ics";
import { calendarOf, CAPACITY_STATUSES, pendingDeliveries } from "@/demo/engine/delivery";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { addDays, addMonths, weekOf } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { fulfillmentLabel } from "../OrderCard";
import { downloadBlob } from "../table/excel";
import { TabFilter } from "../table/TabFilter";
import { DayDialog } from "./DayDialog";
import { AgendaView } from "./DayList";
import { LEGEND, STATUS_TONE } from "./EntryChip";
import { byDay, calendarEntries, eventsByDay } from "./entries";
import { MonthView } from "./MonthView";
import { MoveConfirm } from "./MoveConfirm";
import { ScheduleSheet } from "./ScheduleSheet";
import { useCalendarMoves } from "./useCalendarMoves";
import { WeekView } from "./WeekView";
import { WorkshopSettingsDialog } from "./WorkshopSettingsDialog";
import { brand } from "@/config/brand";

type View = "month" | "week" | "agenda";
const VIEWS: { id: View; label: string }[] = [{ id: "month", label: "Mes" }, { id: "week", label: "Semana" }, { id: "agenda", label: "Agenda" }];

/**
 * Calendario de despachos (Fase 7): cada pedido en su fecha de despacho, el cupo del cadete por día (solo los pedidos
 * con cadete en Mar del Plata), feriados y cierres, atrasos, entradas propias (8.3.15) y reprogramar arrastrando o con botones.
 */
export function DeliveryCalendar() {
  const orders = useAdmin((s) => s.orders);
  const { settings, events } = useAdmin((s) => s.workshop);
  const push = useToasts((s) => s.push);
  const today = DEMO_TODAY;
  const cal = calendarOf(settings);
  const moves = useCalendarMoves(today);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(today);
  const [open, setOpen] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState<{ day: string; eventId: string | null } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [help, setHelp] = useState(false);

  const entries = calendarEntries(orders, today, cal);
  const days = byDay(entries);
  const evDays = eventsByDay(events);
  const late = entries.filter((e) => e.late);
  const blocked = entries.filter((e) => e.blocked);
  const nextDays = pendingDeliveries(orders, today, addDays(today, 6));
  const twoWeeks = Array.from({ length: 14 }, (_, i) => addDays(today, i)).filter((d) => (days.get(d) ?? []).filter((e) => e.counts).length >= settings.dailyCapacity).length;

  const openOrder = (code: string) => { moves.clearWarnings(); setDayOpen(null); setOpen(code); };
  const openEvent = (id: string) => { const e = events.find((x) => x.id === id); if (e) setDayOpen({ day: e.date, eventId: id }); };
  const shift = (dir: -1 | 1) => setCursor((c) => (view === "month" ? addMonths(c, dir) : addDays(c, 7 * dir)));
  const title = view === "week" ? `${formatDay(weekOf(cursor)[0]!)} – ${formatDay(weekOf(cursor)[6]!)}` : formatDay(cursor, "month");
  const current = open ? orders.find((o) => o.code === open) ?? null : null;
  const currentEntry = entries.find((e) => e.order.code === open);
  const viewProps = { cursor, today, days, events: evDays, cal, capacity: settings.dailyCapacity, dnd: moves.dnd, onDay: (day: string) => setDayOpen({ day, eventId: null }), onOpen: openOrder, onEvent: openEvent };

  const exportIcs = () => {
    const list = entries.filter((e) => CAPACITY_STATUSES.includes(e.order.status)).map((e) => ({
      uid: e.order.code, day: e.day,
      title: `${fulfillmentLabel(e.order.fulfillment)}: ${e.order.code} · ${e.order.customer.name}`,
      description: `${e.summary}\nEstado: ${STATUS_LABEL[e.order.status]}${e.order.address ? `\n${e.order.address}` : ""}\n(Panel demo de ${brand.name}, datos ficticios)`,
    }));
    const name = `${brand.id}-despachos-${new Date().toISOString().slice(0, 10)}.ics`;
    downloadBlob(new Blob([toIcs(list, new Date())], { type: "text/calendar;charset=utf-8" }), name);
    push({ tone: "success", title: `${list.length} despachos exportados`, description: `Abrí ${name} con Google Calendar, Outlook o el calendario del celular.` });
  };
  const kpi = (label: string, value: number | string, tone?: string) => (
    <div className="rounded-sm bg-surface p-3 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted">{label}</p><p className={cn("mt-0.5 text-2xl font-extrabold tabular-nums", tone)}>{value}</p></div>
  );

  return (
    <>
      <AdminPageHeader title="Calendario de despachos" actions={(
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}><SlidersHorizontal size={16} aria-hidden="true" /> Cupo del cadete y feriados</Button>
          <Button variant="secondary" size="sm" onClick={exportIcs}><CalendarArrowDown size={16} aria-hidden="true" /> Exportar a Google Calendar</Button>
        </div>
      )}>Cada pedido en el día que sale: con el cadete en Mar del Plata, al correo o listo para retirar. Solo el cadete tiene cupo por día. Tocá un día para ver o agregar entradas; arrastrá un pedido a otro día (se confirma antes) o tocalo para reprogramar: los días sin despachos o con el cadete completo no lo aceptan y dicen por qué.</AdminPageHeader>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {kpi("Despachos próximos 7 días", nextDays)}
        {kpi("Atrasados", late.length, late.length ? "text-danger" : undefined)}
        {kpi("Cadete completo (14 días)", twoWeeks, twoWeeks ? "text-warning" : undefined)}
        {kpi("Cupo del cadete", `${settings.dailyCapacity} por día`)}
      </div>
      {blocked.length > 0 && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm bg-warning-soft p-3 text-sm font-bold text-warning ring-1 ring-warning/30">
          <CalendarX2 size={17} aria-hidden="true" />{blocked.length === 1 ? "1 pedido quedó" : `${blocked.length} pedidos quedaron`} en un día cerrado. Reprogramalos:
          {blocked.map((e) => <button key={e.order.code} type="button" onClick={() => openOrder(e.order.code)} className="underline">{e.order.code} ({formatDay(e.day)})</button>)}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabFilter label="Vista del calendario" value={view} onChange={setView} tabs={VIEWS} />
        <HelpButton label="marcas del calendario" open={help} controls="cal-help" onToggle={() => setHelp(!help)} />
        {view !== "agenda" && (
          <div className="flex items-center gap-1 sm:ml-auto">
            <button type="button" onClick={() => shift(-1)} aria-label={view === "month" ? "Mes anterior" : "Semana anterior"} className="grid h-10 w-10 place-items-center rounded-sm bg-surface ring-1 ring-ink/10 hover:bg-accent"><ChevronLeft size={18} aria-hidden="true" /></button>
            <button type="button" onClick={() => setCursor(today)} className="h-10 rounded-sm bg-surface px-4 text-sm font-bold ring-1 ring-ink/10 hover:bg-accent">Hoy</button>
            <button type="button" onClick={() => shift(1)} aria-label={view === "month" ? "Mes siguiente" : "Semana siguiente"} className="grid h-10 w-10 place-items-center rounded-sm bg-surface ring-1 ring-ink/10 hover:bg-accent"><ChevronRight size={18} aria-hidden="true" /></button>
            <h2 aria-live="polite" className="font-display ml-2 min-w-0 text-2xl first-letter:uppercase">{title}</h2>
          </div>
        )}
      </div>

      {help && <HelpPanel id="cal-help" help={CALENDAR_HELP} onClose={() => setHelp(false)} className="mb-4" />}
      {view === "month" && <MonthView {...viewProps} />}
      {view === "week" && <WeekView {...viewProps} />}
      {view === "agenda" && <AgendaView entries={entries} events={events} today={today} cal={cal} capacity={settings.dailyCapacity} onOpen={openOrder} onEvent={openEvent} />}
      <p aria-live="polite" className="sr-only">{moves.dnd.blocked ? `No se puede soltar: ${moves.dnd.blocked.reason}` : ""}</p>

      <ul aria-label="Referencias de color" className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted">
        {LEGEND.map((l) => <li key={l.status} className="flex items-center gap-1.5"><span aria-hidden="true" className={cn("h-3.5 w-5 rounded", STATUS_TONE[l.status])} />{l.label}</li>)}
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3.5 w-5 rounded border border-danger bg-danger-soft" />Atrasado</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3.5 w-5 rounded border border-dashed border-volt-ink/45 bg-bg" />Entrada propia</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3.5 w-5 rounded bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgb(127_127_127/0.35)_3px_6px)] ring-1 ring-line" />Sin despachos</li>
        <li className="flex items-center gap-1.5"><Bike size={14} aria-hidden="true" />Cadete (ocupa cupo)</li>
        <li className="flex items-center gap-1.5"><Truck size={14} aria-hidden="true" />Correo</li>
        <li className="flex items-center gap-1.5"><Store size={14} aria-hidden="true" />Retiro</li>
      </ul>

      <ScheduleSheet key={current?.code} order={current} orders={orders} settings={settings} today={today} late={!!currentEntry?.late} movable={currentEntry?.movable ?? false}
        warnings={moves.warnings} onMove={moves.move} onClose={() => setOpen(null)} />
      <DayDialog day={dayOpen?.day ?? null} eventId={dayOpen?.eventId ?? null} today={today} entries={dayOpen ? days.get(dayOpen.day) ?? [] : []} onClose={() => setDayOpen(null)} onReschedule={openOrder} />
      <MoveConfirm move={moves.pending} onConfirm={moves.confirm} onClose={moves.cancel} />
      <WorkshopSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} today={today} />
    </>
  );
}
