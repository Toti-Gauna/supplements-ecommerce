"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { DateInput } from "@/components/atoms/DateInput";
import { describedBy, Field, Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { checkEvent, EVENT_KIND_LABEL, type EventDraft } from "@/demo/admin/workshop/schedule";
import type { AdminOrder } from "@/demo/admin/types";

interface Props {
  initial: EventDraft;
  today: string;
  orders: AdminOrder[];
  /** Al editar una entrada no se puede convertir en cierre (los cierres se manejan aparte). */
  allowClosure: boolean;
  editing: boolean;
  /** Devuelve un error de fecha si no se pudo (por ejemplo, el día ya está cerrado). */
  onSave: (d: EventDraft) => string | void;
  onCancel: () => void;
  onRemove?: () => void;
}

/** Alta y edición de una entrada del día (8.3.15): título, tipo, fecha, notas y pedido vinculado, o un cierre del taller. */
export function EventForm({ initial, today, orders, allowClosure, editing, onSave, onCancel, onRemove }: Props) {
  const [d, setD] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<EventDraft>) => { setD({ ...d, ...patch }); setErrors({}); };
  const closure = d.kind === "cierre";
  const codes = orders.map((o) => o.code);
  return (
    <form noValidate aria-label={editing ? "Editar entrada" : "Nueva entrada"} className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]"
      onSubmit={(e) => { e.preventDefault(); const found = checkEvent(d, today, codes); setErrors(found); if (Object.keys(found).length) return; const error = onSave({ ...d, title: d.title.trim(), notes: d.notes.trim() }); if (error) setErrors({ date: error }); }}>
      <h3 className="font-bold">{editing ? "Editar entrada" : "Nueva entrada"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="ev-kind" label="Tipo">
          <Select id="ev-kind" value={d.kind} onChange={(e) => set({ kind: e.target.value as EventDraft["kind"] })}>
            <option value="tarea">{EVENT_KIND_LABEL.tarea}</option>
            <option value="pedido">{EVENT_KIND_LABEL.pedido}</option>
            {allowClosure && <option value="cierre">Cierre del taller</option>}
          </Select>
        </Field>
        <Field id="ev-date" label="Fecha" error={errors.date}>
          <DateInput id="ev-date" min={closure ? today : undefined} value={d.date} onChange={(e) => set({ date: e.target.value })} aria-invalid={!!errors.date} aria-describedby={describedBy("ev-date", errors.date)} />
        </Field>
      </div>
      <Field id="ev-title" label={closure ? "Motivo del cierre" : "Título"} error={errors.title}>
        <Input id="ev-title" autoComplete="off" value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder={closure ? "Vacaciones, feria…" : "Retirar insumos, llamar a un cliente…"}
          aria-invalid={!!errors.title} aria-describedby={describedBy("ev-title", errors.title)} />
      </Field>
      {d.kind === "pedido" && (
        <Field id="ev-order" label="Pedido" error={errors.orderCode}>
          <Select id="ev-order" value={d.orderCode} onChange={(e) => set({ orderCode: e.target.value })} aria-invalid={!!errors.orderCode}>
            <option value="">Elegí un pedido…</option>
            {orders.map((o) => <option key={o.code} value={o.code}>{o.code} · {o.customer.name}</option>)}
          </Select>
        </Field>
      )}
      {!closure && (
        <Field id="ev-notes" label="Notas (opcional)" error={errors.notes}>
          <Textarea id="ev-notes" rows={3} value={d.notes} onChange={(e) => set({ notes: e.target.value })} aria-describedby={describedBy("ev-notes", errors.notes)} />
        </Field>
      )}
      {closure && <p className="text-xs text-muted">El taller no trabaja ese día: no se ofrece en la tienda y no se puede comprometer ahí. Si ya hay entregas, se avisa antes de cerrar.</p>}
      <div className="flex flex-wrap items-center gap-2">
        {onRemove && <Button variant="ghost" className="text-danger" onClick={onRemove}>Quitar entrada</Button>}
        <span className="ml-auto flex gap-2"><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button type="submit">{closure ? "Cerrar el taller ese día" : "Guardar entrada"}</Button></span>
      </div>
    </form>
  );
}
