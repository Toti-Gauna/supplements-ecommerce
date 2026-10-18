"use client";
import Link from "next/link";
import { Check, MessageSquareText } from "lucide-react";
import { isLate } from "@/demo/admin/order-groups";
import { packStep } from "@/demo/admin/order-work";
import type { AdminOrder } from "@/demo/admin/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { OrderWhatsapp } from "../orders/OrderWhatsapp";
import { DueChip } from "./DueChip";
import { LotStep } from "./LotStep";
import { PickStep } from "./PickStep";

const STEPS = ["Juntá los potes", "Controlá lote y vencimiento"] as const;

interface Props { order: AdminOrder; today: string; highlight?: boolean }

/**
 * Un pedido de Para armar (R4b): quién, cuándo sale, el total y el WhatsApp arriba; abajo, el checklist del paso en
 * que está (1. juntar los potes, 2. controlar lote y vencimiento). Sin columnas ni arrastrar.
 */
export function PackCard({ order, today, highlight = false }: Props) {
  const step = packStep(order) ?? 1;
  const late = isLate(order, today);
  return (
    <article id={`armar-${order.code}`} aria-label={`Pedido ${order.code}`} data-step={step} tabIndex={-1}
      className={cn("flex scroll-mt-32 flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 focus:outline-none", late ? "ring-danger" : highlight ? "ring-2 ring-primary" : "ring-ink/[0.05]")}>
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <span className="min-w-0 flex-1">
          <Link href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="font-extrabold tabular-nums hover:text-primary hover:underline">{order.code}</Link>
          <span className="block truncate text-sm font-semibold text-ink/80">{order.customer.name}</span>
        </span>
        <span className="text-right">
          <span className="block text-[11px] font-bold text-muted">Total</span>
          <span className="block text-lg font-extrabold tabular-nums">{formatARS(order.total)}</span>
        </span>
        <span className="flex w-full flex-wrap items-center justify-between gap-2">
          <DueChip order={order} today={today} />
          <OrderWhatsapp order={order} compact />
        </span>
      </header>
      <ol aria-label="Pasos del armado" className="grid grid-cols-2 gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "next";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined}
              className={cn("flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-bold leading-tight ring-1",
                state === "done" ? "bg-success-soft text-success ring-success/30" : state === "current" ? "bg-primary/10 text-ink ring-primary/40" : "bg-bg text-muted ring-ink/[0.06]")}>
              <span aria-hidden="true" className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-sm font-lab", state === "current" ? "bg-night text-volt" : "bg-surface")}>
                {state === "done" ? <Check size={13} /> : n}
              </span>
              <span>{label}<span className="sr-only">{state === "done" ? " (hecho)" : state === "current" ? " (ahora)" : " (después)"}</span></span>
            </li>
          );
        })}
      </ol>
      {step === 1 ? <PickStep order={order} /> : <LotStep order={order} />}
      {order.notes.length > 0 && <p className="flex gap-1.5 rounded-sm bg-bg p-2 text-xs text-muted"><MessageSquareText size={14} aria-hidden="true" className="mt-px shrink-0" />{order.notes.at(-1)}</p>}
    </article>
  );
}
