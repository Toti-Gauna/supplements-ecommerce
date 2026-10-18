"use client";
import { AlarmClock, CalendarDays } from "lucide-react";
import { isLate } from "@/demo/admin/order-groups";
import type { AdminOrder } from "@/demo/admin/types";
import { calendarOf } from "@/demo/engine/delivery";
import { workdaysBetween } from "@/demo/engine/workdays";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { FULFILLMENT_ICON } from "../calendar/EntryChip";
import { fulfillmentLabel } from "../OrderCard";

/** Cuándo sale el pedido (atrasado en rojo, mañana o antes en ámbar) y cómo: cadete, correo o retiro. */
export function DueChip({ order, today }: { order: AdminOrder; today: string }) {
  const settings = useAdmin((s) => s.workshop.settings);
  const Icon = FULFILLMENT_ICON[order.fulfillment];
  const late = isLate(order, today);
  const left = order.promisedDate ? workdaysBetween(today, order.promisedDate, calendarOf(settings)) : null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {order.promisedDate && (
        <span className={cn("inline-flex w-fit items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-bold", late ? "bg-danger-soft text-danger" : left !== null && left <= 1 ? "bg-warning-soft text-warning" : "bg-bg text-muted")}>
          {late ? <AlarmClock size={12} aria-hidden="true" /> : <CalendarDays size={12} aria-hidden="true" />}
          {late ? `Atrasado · era el ${formatDay(order.promisedDate)}` : `Despacho ${formatDay(order.promisedDate)}`}
        </span>
      )}
      <span className="inline-flex w-fit items-center gap-1 rounded-sm bg-bg px-2 py-0.5 text-[11px] font-bold text-muted"><Icon size={12} aria-hidden="true" />{fulfillmentLabel(order.fulfillment)}</span>
    </span>
  );
}
