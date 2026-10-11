"use client";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/motion/Sheet";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { AdminOrder } from "@/demo/admin/types";
import { getProduct } from "@/demo/engine/catalog";
import { calendarOf, checkReschedule, loadByDay, nextFreeDayFor, orderLeadDays } from "@/demo/engine/delivery";
import { demoData } from "@/demo/engine/source";
import { closureFor, nextWorkday, prevWorkday } from "@/demo/engine/workdays";
import type { WorkshopSettings } from "@/demo/fixtures/workshop";
import { formatDay } from "@/lib/date";
import { fulfillmentLabel } from "../OrderCard";
import { InlineConfirm } from "./ImpactConfirm";
import { capacityText } from "./MonthView";
import { PickDate } from "./PickDate";

interface Props {
  order: AdminOrder | null;
  orders: AdminOrder[];
  settings: WorkshopSettings;
  today: string;
  late: boolean;
  movable: boolean;
  /** Avisos del último cambio (día sobrecargado, antes del plazo). */
  warnings: string[];
  onMove: (code: string, day: string) => void;
  onClose: () => void;
}

/**
 * Ficha de entrega: qué lleva el pedido, su fecha y cómo moverla (alternativa a arrastrar, para teclado y celular).
 * Llevarlo a un día completo se confirma antes (8.3.15).
 */
export function ScheduleSheet({ order, orders, settings, today, late, movable, warnings, onMove, onClose }: Props) {
  const cal = calendarOf(settings);
  const day = order?.promisedDate;
  const used = day ? (loadByDay(orders).get(day) ?? 0) : 0;
  const free = order ? nextFreeDayFor(order, today, orders, settings) : null;
  const [overload, setOverload] = useState<string | null>(null);
  const move = (d: string) => {
    if (!order) return;
    if (checkReschedule(order, d, today, orders, settings).overload) { setOverload(d); return; }
    setOverload(null);
    onMove(order.code, d);
  };
  const step = "inline-flex h-11 items-center justify-center gap-1 rounded-full border border-ink/15 px-3 text-sm font-bold hover:bg-accent/50 disabled:opacity-40";
  return (
    <Sheet open={!!order} onClose={onClose} title={order ? `Entrega ${order.code}` : "Entrega"} side="right" className="max-w-lg bg-bg">
      {order && (
        <div className="flex h-full flex-col overflow-y-auto">
          <header className="border-b border-line bg-surface px-6 pb-5 pt-6 pr-16">
            <p className="eyebrow text-muted">Entrega comprometida</p>
            <h2 className="font-display mt-1 text-3xl first-letter:uppercase">{day ? formatDay(day, "long") : "Sin fecha"}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <StatusBadge status={order.status} />
              {late && <span className="font-bold text-danger">Atrasado</span>}
              {day && day >= today && !closureFor(day, cal) && <span>{capacityText(used, settings.dailyCapacity)} ese día</span>}
            </div>
          </header>
          <div className="flex flex-col gap-5 p-6">
            <section aria-label="Pedido" className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <p className="font-bold">{order.code} · {order.customer.name}</p>
              <p className="text-sm text-muted">{fulfillmentLabel(order.fulfillment)}{order.address ? ` · ${order.address}` : ""}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {order.lines.map((l) => {
                  const p = getProduct(l.productSlug);
                  const v = p?.variants.find((x) => x.id === l.variantId);
                  return (
                    <li key={l.id} className="flex items-center gap-3 text-sm">
                      {p && <div className="w-12 shrink-0"><LineThumb art={p.art} tint={v?.colorHex} name={p.name} personalization={l.personalization} zone={demoData().textZones[p.art]} /></div>}
                      <span className="min-w-0 flex-1"><span className="block font-semibold">{l.quantity} × {p?.name ?? l.productSlug}</span><span className="text-muted">{v?.label}</span></span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted">Plazo de fabricación: {orderLeadDays(order.lines)} días hábiles.</p>
            </section>
            {movable ? (
              <section aria-labelledby="move-title" className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
                <h3 id="move-title" className="font-bold">Reprogramar</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className={step} disabled={!day || prevWorkday(day, cal) < today} onClick={() => day && move(prevWorkday(day, cal))}><ChevronLeft size={16} aria-hidden="true" /> Día hábil anterior</button>
                  <button type="button" className={step} disabled={!day} onClick={() => day && move(nextWorkday(day, cal))}>Día hábil siguiente <ChevronRight size={16} aria-hidden="true" /></button>
                </div>
                {free && free !== day && (
                  <button type="button" className={step} onClick={() => move(free)}><Sparkles size={16} aria-hidden="true" className="text-brass-ink" /> Primera fecha libre: {formatDay(free)}</button>
                )}
                <PickDate key={`${order.code}-${day}`} id="schedule-date" label="Elegir otra fecha" min={today} value={day ?? ""} action="Mover" onPick={move} />
                {overload && (
                  <InlineConfirm label="Día completo" title={`El ${formatDay(overload)} ya está completo`} action="Mover igual" cancel="Elegir otro día"
                    onCancel={() => setOverload(null)} onConfirm={() => { const d = overload; setOverload(null); onMove(order.code, d); }}>
                    <p>Ya tiene {loadByDay(orders, order.code).get(overload) ?? 0} de {settings.dailyCapacity} pedidos: con este queda sobrecargado.</p>
                  </InlineConfirm>
                )}
                {warnings.length > 0 && (
                  <ul role="status" className="flex flex-col gap-1 rounded-2xl bg-warning-soft p-3 text-sm font-semibold text-warning">
                    {warnings.map((w) => <li key={w} className="flex gap-2"><TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />{w}</li>)}
                  </ul>
                )}
                <p className="text-xs text-muted">En escritorio también podés arrastrar el pedido a otro día del calendario. En producción, el cliente recibiría un aviso con la fecha nueva.</p>
              </section>
            ) : <p className="text-sm text-muted">Este pedido ya salió del taller: su fecha no se reprograma.</p>}
            <Link href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary underline">
              Abrir el pedido completo <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}
