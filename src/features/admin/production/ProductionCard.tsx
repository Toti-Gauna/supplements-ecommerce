"use client";
import Link from "next/link";
import { AlarmClock, ArrowRight, CalendarDays, ChevronDown, GripVertical, MessageSquareText } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { LineThumb } from "@/components/organisms/LineThumb";
import { isLate } from "@/demo/admin/order-groups";
import type { AdminOrder } from "@/demo/admin/types";
import { nextColumn, PRODUCTION_COLUMNS, productionMove, type ProductionColumn } from "@/demo/admin/workshop/production";
import { collarLineDetail, getProduct } from "@/demo/engine/catalog";
import { calendarOf } from "@/demo/engine/delivery";
import { demoData } from "@/demo/engine/source";
import { workdaysBetween } from "@/demo/engine/workdays";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";

const KIND = { TEXT: "Texto", PHOTO: "Foto", PHOTO_REFERENCE: "Foto de referencia" };
export const columnLabel = (c: ProductionColumn) => PRODUCTION_COLUMNS.find((x) => x.id === c)!.label;

function DueChip({ order, today }: { order: AdminOrder; today: string }) {
  const settings = useAdmin((s) => s.workshop.settings);
  if (!order.promisedDate) return null;
  const late = isLate(order, today);
  const left = workdaysBetween(today, order.promisedDate, calendarOf(settings));
  return (
    <span className={cn("inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", late ? "bg-danger-soft text-danger" : left <= 1 && order.status !== "READY" ? "bg-warning-soft text-warning" : "bg-bg text-muted")}>
      {late ? <AlarmClock size={12} aria-hidden="true" /> : <CalendarDays size={12} aria-hidden="true" />}
      {late ? `Atrasado · era el ${formatDay(order.promisedDate)}` : `${order.status === "READY" ? "Entrega" : "Para el"} ${formatDay(order.promisedDate)}`}
    </span>
  );
}

/** "Mover etapa" (8.3.16): las etapas a las que puede ir el pedido según las reglas, sin arrastrar (teclado y celular). */
function MoveStage({ order, column, onMove }: { order: AdminOrder; column: ProductionColumn; onMove: (to: ProductionColumn) => void }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const targets = PRODUCTION_COLUMNS.filter((c) => c.id !== column && productionMove(order, c.id).ok);
  if (!targets.length) return null;
  const close = () => { setOpen(false); button.current?.focus(); };
  return (
    <div className="relative" onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); close(); } }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}>
      <button ref={button} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`mover-${order.code}`}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-ink/15 px-3 text-xs font-bold hover:bg-accent/50">
        Mover etapa<span className="sr-only"> de {order.code}</span> <ChevronDown size={14} aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <ul id={`mover-${order.code}`} aria-label={`Mover ${order.code} a`} className="absolute bottom-full left-0 z-20 mb-1 flex min-w-44 flex-col gap-0.5 rounded-2xl bg-surface p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-ink/10">
          {targets.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => { setOpen(false); onMove(c.id); }} aria-label={`Mover ${order.code} a ${c.label}`}
                className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-accent/60">
                {c.label}<span className="text-xs font-normal text-muted">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props { order: AdminOrder; column: ProductionColumn; today: string; onMove: (code: string, to: ProductionColumn) => void; onDragStart: (code: string) => void; onDragEnd: () => void }

/** Tarjeta del tablero: pedido, cliente, vencimiento, productos con variante y lo aprobado, y las acciones abajo. */
export function ProductionCard({ order, column, today, onMove, onDragStart, onDragEnd }: Props) {
  const next = nextColumn(column);
  const draggable = column !== "ready";
  const start = (e: DragEvent) => { e.dataTransfer.setData("text/plain", order.code); e.dataTransfer.effectAllowed = "move"; onDragStart(order.code); };
  return (
    <article draggable={draggable} onDragStart={draggable ? start : undefined} onDragEnd={onDragEnd} aria-label={`Pedido ${order.code}`}
      className={cn("flex flex-col gap-3 rounded-3xl bg-surface p-3.5 shadow-[var(--shadow-card)] ring-1", isLate(order, today) ? "ring-danger" : "ring-ink/[0.05]", draggable && "cursor-grab active:cursor-grabbing")}>
      <header className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <Link href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="font-extrabold tabular-nums hover:text-primary hover:underline">{order.code}</Link>
          <span className="block truncate text-sm font-semibold text-ink/80">{order.customer.name}</span>
        </span>
        {draggable && <GripVertical size={16} aria-hidden="true" className="mt-1 shrink-0 text-muted/60" />}
      </header>
      <DueChip order={order} today={today} />
      <ul className="flex flex-col gap-2">
        {order.lines.map((l) => {
          const p = getProduct(l.productSlug);
          const v = p?.variants.find((x) => x.id === l.variantId);
          const per = l.personalization;
          return (
            <li key={l.id} className="flex gap-3">
              {p && <div className="w-14 shrink-0"><LineThumb art={p.art} tint={v?.colorHex} name={p.name} personalization={per} zone={demoData().textZones[p.art]} /></div>}
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold leading-snug">{l.quantity} × {p?.name ?? l.productSlug}</p>
                {v && <p className="text-muted">{v.label}</p>}
                {per && <p className="mt-0.5 text-xs font-semibold text-success">{KIND[per.kind]} aprobada{per.text ? `: “${per.text}”` : ""}{per.font ? ` · ${per.font}` : ""}{per.colorName ? ` · ${per.colorName}` : ""}</p>}
                {per?.collar && <p className="text-xs font-semibold text-ink">{collarLineDetail(l)}</p>}
                {per?.notes && <p className="text-xs text-muted">{per.notes}</p>}
              </div>
            </li>
          );
        })}
      </ul>
      {order.notes.length > 0 && <p className="flex gap-1.5 rounded-2xl bg-bg p-2 text-xs text-muted"><MessageSquareText size={14} aria-hidden="true" className="mt-px shrink-0" />{order.notes.at(-1)}</p>}
      {(next || column !== "ready") && (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <MoveStage order={order} column={column} onMove={(to) => onMove(order.code, to)} />
          {next && (
            <button type="button" onClick={() => onMove(order.code, next)} aria-label={`Pasar ${order.code} a ${columnLabel(next)}`}
              className="ml-auto inline-flex h-9 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-bold text-on-primary hover:bg-primary-hover">
              {columnLabel(next)} <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
