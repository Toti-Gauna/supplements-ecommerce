"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { SalesChart } from "@/components/organisms/SalesChart";
import type { DaySales } from "@/demo/admin/metrics";
import type { AdminOrder } from "@/demo/admin/types";
import { formatARS } from "@/lib/money";

const DAY = new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
const LONG = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires" });
const atNoon = (day: string) => new Date(`${day}T12:00:00-03:00`);

/**
 * Ventas por día con detalle (8.3.1): tocar una barra (o una fila de la tabla) muestra fecha, cantidad, total y los
 * pedidos de ese día, cada uno con acceso a su ficha. Todo sale de `salesSummary`: barras, tabla y KPI coinciden.
 */
export function SalesByDay({ days, orders }: { days: DaySales[]; orders: AdminOrder[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const day = days.find((d) => d.day === selected);
  const list = day ? day.codes.map((c) => orders.find((o) => o.code === c)).filter((o): o is AdminOrder => Boolean(o)) : [];
  const detail = (
    <div aria-live="polite" className="mt-4">
      {!day ? (
        <p className="text-sm text-muted">Tocá una barra para ver los pedidos de ese día.</p>
      ) : (
        <section aria-labelledby="dia-elegido" className="rounded-2xl bg-bg p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 id="dia-elegido" className="font-bold capitalize">{LONG.format(atNoon(day.day))}</h3>
            <p className="text-sm text-muted"><strong className="text-ink tabular-nums">{day.orders}</strong> {day.orders === 1 ? "pedido" : "pedidos"} · <strong className="text-ink tabular-nums">{formatARS(day.amount)}</strong></p>
          </div>
          {list.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Sin ventas ese día (pedidos pagados o posteriores, demo).</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {list.map((o) => (
                <li key={o.code}>
                  <Link href={`/admin-demo/pedidos/detalle/?codigo=${o.code}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-surface px-3 py-2 text-sm hover:bg-accent/50">
                    <span className="font-extrabold">{o.code}</span>
                    <span className="min-w-0 flex-1 truncate">{o.customer.name}</span>
                    <StatusBadge status={o.status} />
                    <span className="font-bold tabular-nums">{formatARS(o.total)}</span>
                    <ChevronRight size={16} aria-hidden="true" className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
  return (
    <SalesChart title="Ventas de muestra por día (pedidos pagados o posteriores)" selected={selected} onSelect={(k) => setSelected((s) => (s === k ? null : k))} detail={detail}
      bars={days.map((d) => ({ key: d.day, label: DAY.format(atNoon(d.day)), amount: d.amount, orders: d.orders }))} />
  );
}
