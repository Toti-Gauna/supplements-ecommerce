"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { DateInput } from "@/components/atoms/DateInput";
import { Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Pagination } from "@/components/molecules/Pagination";
import { byYear, hasImpact, holidayRows, ownClosures, scheduleImpact, type ScheduleImpact } from "@/demo/admin/workshop/schedule";
import { closureFor } from "@/demo/engine/workdays";
import { calendarOf } from "@/demo/engine/delivery";
import type { Closure } from "@/demo/fixtures/workshop";
import { formatDay } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { TabFilter } from "../table/TabFilter";
import { usePaged } from "../usePaged";
import { useDemoSave } from "../useDemoSave";
import { HolidayRow, OwnClosureRow } from "./ClosureRow";
import { ImpactConfirm, InlineConfirm } from "./ImpactConfirm";

type Tab = "feriados" | "propios";
type Pending = { impact: ScheduleImpact; action: string; run: () => void } | { remove: Closure };

/**
 * Días cerrados y feriados (8.3.14): los feriados cargados (2026–2027) separados de los cierres que agrega el taller,
 * de a 10 por página y por año. Cerrar un día con entregas pide confirmación; quitar un cierre también.
 */
export function ClosuresSection({ today }: { today: string }) {
  const settings = useAdmin((s) => s.workshop.settings);
  const orders = useAdmin((s) => s.orders);
  const { addClosure, removeClosure, updateClosure } = useAdmin();
  const save = useDemoSave();
  const [tab, setTab] = useState<Tab>("feriados");
  const [year, setYear] = useState("proximos");
  const [pending, setPending] = useState<Pending | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const holidays = holidayRows(settings, today);
  const own = ownClosures(settings);
  const rows = byYear(tab === "feriados" ? holidays : own, year, today);
  const paged = usePaged(rows, 10, `${tab}-${year}-${rows.length}`);
  const years = [...new Set([...holidays, ...own].map((c) => c.date.slice(0, 4)))].sort();

  /** Aplica un cambio de cierres; si deja entregas en un día cerrado, primero lo confirma. */
  const guarded = (closures: Closure[], action: string, run: () => void) => {
    const impact = scheduleImpact(orders, settings, { ...settings, closures }, today);
    if (hasImpact(impact)) setPending({ impact, action, run: () => { run(); setPending(null); } });
    else run();
  };
  const taken = (d: string, except?: string) => d !== except && closureFor(d, calendarOf(settings))?.closure;
  const add = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) { setError("Elegí una fecha de hoy en adelante."); return; }
    const already = taken(date);
    if (already) { setError(`Ese día ya está cerrado: ${already.name}.`); return; }
    const c: Closure = { date, name: name.trim() || "Cierre del taller", kind: "cierre" };
    guarded([...settings.closures, c], "Cerrar igual", () => { save(`${formatDay(date)}: ${c.name}`, () => addClosure(c)); setDate(""); setName(""); setError(null); setTab("propios"); });
  };
  const edit = (from: string, c: Closure): string | null => {
    if (c.date < today) return "Elegí una fecha de hoy en adelante.";
    const already = taken(c.date, from);
    if (already) return `Ese día ya está cerrado: ${already.name}.`;
    guarded([...settings.closures.filter((x) => x.date !== from), c], "Guardar igual", () => { save("Cierre actualizado", () => updateClosure(from, c)); setEditing(null); });
    return null;
  };

  return (
    <section id="taller-cierres" aria-label="Días cerrados y feriados" className="flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <form aria-label="Agregar un cierre del taller" className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]" noValidate onSubmit={(e) => { e.preventDefault(); add(); }}>
        <DateInput aria-label="Fecha del cierre" min={today} value={date} onChange={(e) => { setDate(e.target.value); setError(null); }} />
        <Input aria-label="Motivo" placeholder="Vacaciones, feria…" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" variant="secondary" disabled={!date}><Plus size={16} aria-hidden="true" /> Agregar cierre</Button>
        {error && <p role="alert" className="text-xs font-semibold text-danger sm:col-span-3">{error}</p>}
      </form>
      {pending && ("remove" in pending ? (
        <InlineConfirm label="Quitar un cierre" title={`¿Quitar “${pending.remove.name}” (${formatDay(pending.remove.date)})?`} action="Quitar cierre" cancel="Cancelar"
          onCancel={() => setPending(null)} onConfirm={() => { const c = pending.remove; save("Cierre quitado: el taller trabaja ese día", () => removeClosure(c.date)); setPending(null); }}>
          <p>El taller vuelve a trabajar ese día y la tienda lo ofrece como fecha de entrega.</p>
        </InlineConfirm>
      ) : <ImpactConfirm impact={pending.impact} action={pending.action} onConfirm={pending.run} onCancel={() => setPending(null)} />)}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TabFilter label="Qué días ver" value={tab} onChange={(t) => { setTab(t); setEditing(null); }}
          tabs={[{ id: "feriados", label: "Feriados nacionales", count: byYear(holidays, year, today).length }, { id: "propios", label: "Cierres del taller", count: byYear(own, year, today).length }]} />
        <span className="flex items-center gap-2">
          <label htmlFor="closures-year" className="text-sm font-bold">Año</label>
          <Select id="closures-year" value={year} onChange={(e) => setYear(e.target.value)} className="h-10 min-h-10! w-36">
            <option value="proximos">Próximos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
            <option value="todos">Todos</option>
          </Select>
        </span>
      </div>
      {tab === "feriados" && <p className="text-xs text-muted">Feriados nacionales y días no laborables ya cargados (Ley 27.399 y Resolución 164/2025). Los días turísticos de 2027 se agregan como cierre cuando se publiquen.</p>}
      {paged.items.length ? (
        <ul aria-label={tab === "feriados" ? "Feriados nacionales" : "Cierres del taller"} className="flex flex-col divide-y divide-line">
          {tab === "feriados"
            ? paged.items.map((r) => {
              const h = r as (typeof holidays)[number];
              return <HolidayRow key={h.date} row={h} today={today} onOpen={() => save(`${formatDay(h.date)}: el taller trabaja`, () => removeClosure(h.date))}
                onClose={() => guarded([...settings.closures, { date: h.date, name: h.name, kind: h.kind }], "Cerrar igual", () => save(`${formatDay(h.date)}: ${h.name}`, () => addClosure({ date: h.date, name: h.name, kind: h.kind })))} />;
            })
            : paged.items.map((c) => <OwnClosureRow key={c.date} closure={c} today={today} editing={editing === c.date} onEdit={() => setEditing(c.date)} onCancel={() => setEditing(null)}
                onSave={(next) => edit(c.date, next)} onRemove={() => setPending({ remove: c })} />)}
        </ul>
      ) : <p className="rounded-2xl border border-dashed border-ink/15 p-4 text-center text-sm text-muted">{tab === "feriados" ? "No hay feriados en ese período." : "No hay cierres del taller en ese período. Agregá uno arriba."}</p>}
      <Pagination {...paged} noun={tab === "feriados" ? "feriados" : "cierres"} onPage={paged.setPage} />
    </section>
  );
}
