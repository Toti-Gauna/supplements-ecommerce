"use client";
import Link from "next/link";
import { AlarmClock, CalendarDays, Cake, Spool } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { customerRows } from "@/demo/admin/customers";
import { isLate } from "@/demo/admin/order-groups";
import { materialRows } from "@/demo/admin/workshop/materials";
import { customerReminders } from "@/demo/admin/workshop/reminders";
import { pendingDeliveries } from "@/demo/engine/delivery";
import { addDays } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";

/** Resumen del taller en el inicio: entregas de la semana, atrasos, insumos y clientes para contactar. */
export function WorkshopStrip() {
  const orders = useAdmin((s) => s.orders);
  const users = useAdmin((s) => s.users);
  const products = useAdmin((s) => s.data.products);
  const w = useAdmin((s) => s.workshop);
  const nextDays = pendingDeliveries(orders, DEMO_TODAY, addDays(DEMO_TODAY, 6));
  const late = orders.filter((o) => isLate(o, DEMO_TODAY)).length;
  const reorder = materialRows(w.materials, orders, w.recipes).filter((m) => m.state !== "ok").length;
  const reminders = customerReminders(customerRows(users, orders), w.profiles, products, w.settings, DEMO_TODAY, 7).length;
  const tiles: { href: string; icon: LucideIcon; label: string; value: number; hint: string; tone?: string }[] = [
    { href: "/admin-demo/calendario/", icon: CalendarDays, label: "Entregas próximos 7 días", value: nextDays, hint: "Ver el calendario" },
    { href: "/admin-demo/produccion/", icon: AlarmClock, label: "Pedidos atrasados", value: late, hint: "Abrir la cola de producción", tone: late ? "text-danger" : undefined },
    { href: "/admin-demo/insumos/", icon: Spool, label: "Insumos para reponer", value: reorder, hint: "Ver insumos", tone: reorder ? "text-warning" : undefined },
    { href: "/admin-demo/usuarios/?escribir=7", icon: Cake, label: "Clientes para escribir", value: reminders, hint: "Cumpleaños y recompras de la semana" },
  ];
  return (
    <section aria-labelledby="taller">
      <h2 id="taller" className="font-display mb-3 text-2xl">El taller</h2>
      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tiles.map(({ href, icon: Icon, label, value, hint, tone }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full flex-col gap-1 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] transition-shadow hover:ring-primary">
              <span className="flex items-center gap-2 text-sm font-bold text-muted"><Icon size={17} aria-hidden="true" className="text-brass-ink" />{label}</span>
              <span className={cn("text-3xl font-extrabold tabular-nums", tone)}>{value}</span>
              <span className="text-xs font-semibold text-primary group-hover:underline">{hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
