"use client";
import { useState } from "react";
import { checkDrop, checkReschedule } from "@/demo/engine/delivery";
import { formatDay } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useCalendarDnd, type DragItem, type DropBlock } from "./dnd";
import type { PendingMove } from "./MoveConfirm";

const SHORT = { fixed: "ya salió", past: "ya pasó", closed: "cerrado", full: "completo" } as const;

/**
 * Reglas para mover cosas en el calendario (8.3.15): un pedido arrastrado solo entra en un día válido y con lugar, y
 * se confirma antes de cambiar su fecha; una entrada propia se mueve directo. Todo pasa por el engine.
 */
export function useCalendarMoves(today: string) {
  const orders = useAdmin((s) => s.orders);
  const { settings, events } = useAdmin((s) => s.workshop);
  const rescheduleOrder = useAdmin((s) => s.rescheduleOrder);
  const moveEvent = useAdmin((s) => s.moveEvent);
  const push = useToasts((s) => s.push);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingMove | null>(null);

  const move = (code: string, day: string) => {
    const r = rescheduleOrder(code, day);
    if (!r.ok) { push({ tone: "error", title: "No se puede mover ahí", description: r.error }); return; }
    setWarnings(r.warnings);
    push({ tone: r.warnings.length ? "info" : "success", title: `${code} pasa al ${formatDay(day)}`, description: r.warnings.length ? r.warnings.join(" ") : "Cambio guardado solo en esta demo (este navegador)." });
  };
  const check = (item: DragItem, day: string): DropBlock | null => {
    if (item.kind === "event") return null;
    const order = orders.find((o) => o.code === item.code);
    if (!order) return { reason: "No se encontró el pedido.", short: "no existe" };
    if (order.promisedDate === day) return null;
    const r = checkDrop(order, day, today, orders, settings);
    return r.ok ? null : { reason: r.error ?? "No se puede mover ahí.", short: SHORT[r.blocked ?? "closed"] };
  };
  const drop = (item: DragItem, day: string) => {
    if (item.kind === "event") {
      const ev = events.find((e) => e.id === item.id);
      if (!ev || ev.date === day) return;
      moveEvent(ev.id, day);
      push({ tone: "success", title: `“${ev.title}” pasa al ${formatDay(day)}`, description: "Cambio guardado solo en esta demo (este navegador)." });
      return;
    }
    const order = orders.find((o) => o.code === item.code);
    if (!order || order.promisedDate === day) return;
    setPending({ code: order.code, customer: order.customer.name, from: order.promisedDate, to: day, warnings: checkReschedule(order, day, today, orders, settings).warnings });
  };
  const dnd = useCalendarDnd(check, drop, (b) => push({ tone: "error", title: "No se puede soltar ahí", description: b.reason }));
  return {
    dnd, move, warnings, clearWarnings: () => setWarnings([]), pending,
    confirm: () => { if (pending) move(pending.code, pending.to); setPending(null); },
    cancel: () => setPending(null),
  };
}
