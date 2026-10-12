"use client";
import Link from "next/link";
import { repurchasesIn } from "@/demo/admin/repurchase";
import { runOutLine } from "@/demo/admin/repurchase-text";
import { NotifyActions } from "./NotifyActions";
import { profileHref } from "./Reminders";
import { useCustomerViews } from "./useCustomerViews";

const WEEK_HREF = "/admin-demo/usuarios/?segmento=semana";
const LATE_HREF = "/admin-demo/usuarios/?segmento=atrasada";

/**
 * "Recompras de la semana" para el inicio del panel: a quién se le termina el pote en los próximos 7 días, cuándo, y el
 * aviso por email o WhatsApp (el mismo de la ficha: no se repite). Debajo, cuántas recompras van atrasadas.
 */
export function RepurchaseWeek({ limit = 6, className }: { limit?: number; className?: string }) {
  const customers = useCustomerViews();
  const week = repurchasesIn(customers, "week");
  const late = repurchasesIn(customers, "overdue").length;
  const more = week.length - limit;
  return (
    <section aria-labelledby="recompras-semana" className={className}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 id="recompras-semana" className="font-display text-2xl">Recompras de la semana</h2>
        <Link href={WEEK_HREF} className="text-sm font-bold text-primary underline">Ver en Clientes</Link>
      </div>
      {week.length ? (
        <ul className="flex flex-col gap-2">
          {week.slice(0, limit).map((item) => (
            <li key={`${item.email}:${item.key}`} className="@container rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
              <div className="flex flex-col gap-3 @min-[34rem]:flex-row @min-[34rem]:items-center">
                <div className="min-w-0 flex-1">
                  <Link href={profileHref(item.email)} className="font-bold hover:underline">{item.name}</Link>
                  <p className="text-sm text-muted">{item.product} · {item.variant}</p>
                  <p className="text-sm font-bold">{runOutLine(item)}</p>
                </div>
                <NotifyActions item={item} className="@min-[34rem]:shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-4 text-sm text-muted">Esta semana no se le termina el pote a nadie.</p>
      )}
      {(more > 0 || late > 0) && (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {more > 0 && <Link href={WEEK_HREF} className="font-bold text-primary underline">{more === 1 ? "1 más esta semana" : `${more} más esta semana`}</Link>}
          {late > 0 && <Link href={LATE_HREF} className="font-bold text-primary underline">{late === 1 ? "1 recompra atrasada" : `${late} recompras atrasadas`}</Link>}
        </p>
      )}
    </section>
  );
}
