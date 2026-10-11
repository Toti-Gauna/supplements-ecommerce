"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { DateInput } from "@/components/atoms/DateInput";
import { Input } from "@/components/atoms/Field";
import type { Closure, ClosureKind } from "@/demo/fixtures/workshop";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";

export const KIND_LABEL: Record<ClosureKind, string> = { feriado: "Feriado nacional", "no-laborable": "Día no laborable", cierre: "Cierre del taller" };
const action = "inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-3.5 text-sm font-bold hover:bg-accent/50";

/** Fecha de una fila: "jue, 8 oct · 2027" cuando no es el año en curso. */
function When({ date, today }: { date: string; today: string }) {
  return <span className="w-32 shrink-0 font-bold tabular-nums first-letter:uppercase">{formatDay(date)}{date.slice(0, 4) !== today.slice(0, 4) ? ` · ${date.slice(0, 4)}` : ""}</span>;
}

/** Feriado cargado: cerrado (se puede trabajar ese día) o abierto (se puede volver a cerrar). Los pasados no cambian. */
export function HolidayRow({ row, today, onOpen, onClose }: { row: Closure & { closed: boolean; past: boolean }; today: string; onOpen: () => void; onClose: () => void }) {
  return (
    <li className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 text-sm", row.past && "text-muted")}>
      <When date={row.date} today={today} />
      <span className="min-w-0 flex-1 basis-40"><span className="block">{row.name}</span>
        <span className="text-xs text-muted">{KIND_LABEL[row.kind]} · {row.past ? "ya pasó" : row.closed ? "taller cerrado" : <strong className="text-success">el taller trabaja</strong>}</span></span>
      {!row.past && (row.closed
        ? <button type="button" className={action} onClick={onOpen} aria-label={`Trabajar el ${formatDay(row.date)} (${row.name})`}>Trabajar ese día</button>
        : <button type="button" className={action} onClick={onClose} aria-label={`Volver a cerrar el ${formatDay(row.date)} (${row.name})`}>Volver a cerrar</button>)}
    </li>
  );
}

interface OwnProps { closure: Closure; today: string; editing: boolean; onEdit: () => void; onCancel: () => void; onSave: (c: Closure) => string | null; onRemove: () => void }

/** Cierre propio: editar motivo o fecha en la misma fila, o quitarlo (con confirmación, la pide la sección). */
export function OwnClosureRow({ closure: c, today, editing, onEdit, onCancel, onSave, onRemove }: OwnProps) {
  const [date, setDate] = useState(c.date);
  const [name, setName] = useState(c.name);
  const [error, setError] = useState<string | null>(null);
  if (editing) {
    return (
      <li className="py-2.5">
        <form className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]" aria-label={`Editar cierre del ${formatDay(c.date)}`}
          onSubmit={(e) => { e.preventDefault(); setError(onSave({ ...c, date, name: name.trim() || "Cierre del taller" })); }}>
          <DateInput aria-label="Fecha del cierre" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          <Input aria-label="Motivo" value={name} onChange={(e) => setName(e.target.value)} />
          <span className="flex gap-2"><Button type="submit" size="sm">Guardar</Button><Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button></span>
        </form>
        {error && <p role="alert" className="mt-1 text-xs font-semibold text-danger">{error}</p>}
      </li>
    );
  }
  return (
    <li className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 text-sm", c.date < today && "text-muted")}>
      <When date={c.date} today={today} />
      <span className="min-w-0 flex-1 basis-40"><span className="block">{c.name}</span><span className="text-xs text-muted">{KIND_LABEL[c.kind]}{c.date < today ? " · ya pasó" : ""}</span></span>
      <span className="flex gap-1.5">
        <button type="button" className={action} onClick={onEdit} aria-label={`Editar el cierre del ${formatDay(c.date)}`}><Pencil size={15} aria-hidden="true" /> Editar</button>
        <button type="button" onClick={onRemove} aria-label={`Quitar el cierre del ${formatDay(c.date)}`}
          className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={16} aria-hidden="true" /></button>
      </span>
    </li>
  );
}
