"use client";
import Link from "next/link";
import { AlarmClock, ArrowRight, CalendarDays, GripVertical, MessageSquareText, ScanBarcode } from "lucide-react";
import type { DragEvent } from "react";
import { LineThumb } from "@/components/organisms/LineThumb";
import { isLate } from "@/demo/admin/order-groups";
import type { AdminOrder } from "@/demo/admin/types";
import { lotFor } from "@/demo/admin/workshop/lots";
import { nextColumn, prepLabel, type PrepColumn } from "@/demo/admin/workshop/preparation";
import { getProduct } from "@/demo/engine/catalog";
import { calendarOf } from "@/demo/engine/delivery";
import { workdaysBetween } from "@/demo/engine/workdays";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { FULFILLMENT_ICON } from "../calendar/EntryChip";
import { fulfillmentLabel } from "../OrderCard";
import { MoveStage } from "./MoveStage";

function DueChip({ order, today }: { order: AdminOrder; today: string }) {
  const settings = useAdmin((s) => s.workshop.settings);
  if (!order.promisedDate) return null;
  const late = isLate(order, today);
  const left = workdaysBetween(today, order.promisedDate, calendarOf(settings));
  const Icon = FULFILLMENT_ICON[order.fulfillment];
  return (
    <span className="flex flex-wrap gap-1.5">
      <span className={cn("inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", late ? "bg-danger-soft text-danger" : left <= 1 && order.status !== "READY" ? "bg-warning-soft text-warning" : "bg-bg text-muted")}>
        {late ? <AlarmClock size={12} aria-hidden="true" /> : <CalendarDays size={12} aria-hidden="true" />}
        {late ? `Atrasado · era el ${formatDay(order.promisedDate)}` : `Despacho ${formatDay(order.promisedDate)}`}
      </span>
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted"><Icon size={12} aria-hidden="true" />{fulfillmentLabel(order.fulfillment)}</span>
    </span>
  );
}

interface Props {
  order: AdminOrder;
  column: PrepColumn;
  today: string;
  onMove: (code: string, to: PrepColumn) => void;
  onCheckLots: (code: string) => void;
  onDragStart: (code: string) => void;
  onDragEnd: () => void;
}

/** Tarjeta del tablero: pedido, cliente, despacho, productos con el lote que sale y la acción de la etapa abajo. */
export function PreparationCard({ order, column, today, onMove, onCheckLots, onDragStart, onDragEnd }: Props) {
  const next = nextColumn(column);
  const draggable = column !== "ready";
  const start = (e: DragEvent) => { e.dataTransfer.setData("text/plain", order.code); e.dataTransfer.effectAllowed = "move"; onDragStart(order.code); };
  const advance = () => (column === "lot-check" ? onCheckLots(order.code) : next && onMove(order.code, next));
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
          const lot = order.lotCheck?.[l.id] ?? lotFor(p, v).text;
          return (
            <li key={l.id} className="flex gap-3">
              {p && <div className="w-14 shrink-0"><LineThumb art={p.art} pack={p.pack} tint={v?.colorHex} name={p.name} /></div>}
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold leading-snug">{l.quantity} × {p?.name ?? l.productSlug}</p>
                {v && <p className="text-muted">{v.label}</p>}
                <p className={cn("font-lab mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold", order.lotCheck?.[l.id] ? "bg-success-soft text-success" : "bg-bg text-muted")}>
                  {order.lotCheck?.[l.id] ? "Salió" : "Sale"} · lote {lot}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {order.notes.length > 0 && <p className="flex gap-1.5 rounded-2xl bg-bg p-2 text-xs text-muted"><MessageSquareText size={14} aria-hidden="true" className="mt-px shrink-0" />{order.notes.at(-1)}</p>}
      {next && (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <MoveStage order={order} column={column} onMove={(to) => (to === "ready" ? onCheckLots(order.code) : onMove(order.code, to))} />
          <button type="button" onClick={advance} aria-label={column === "lot-check" ? `Controlar lotes de ${order.code}` : `Pasar ${order.code} a ${prepLabel(next)}`}
            className="ml-auto inline-flex h-9 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-bold text-on-primary hover:bg-primary-hover">
            {column === "lot-check" ? <><ScanBarcode size={14} aria-hidden="true" /> Controlar lotes</> : <>{prepLabel(next)} <ArrowRight size={14} aria-hidden="true" /></>}
          </button>
        </div>
      )}
    </article>
  );
}
