import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PREPARE_DAYS, type PrepareList as Prepare } from "@/demo/admin/subscription-view";
import { addDays } from "@/demo/engine/workdays";
import { formatDay } from "@/lib/date";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Qué preparar: las entregas de los próximos 30 días por fecha, con lo que se repite cada mes, y el total de unidades por
 * producto del período para armar la compra al proveedor. El equipamiento no aparece: viaja solo en la primera entrega.
 */
export function PrepareList({ list, today }: { list: Prepare; today: string }) {
  return (
    <section aria-labelledby="prepare-title" className="mt-6 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="prepare-title" className="font-display text-3xl">Qué preparar</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Entregas de los próximos {PREPARE_DAYS} días (hasta el {formatDay(addDays(today, PREPARE_DAYS), "long")}). Solo lo que se repite cada mes: el equipamiento viaja en la primera entrega.
          </p>
        </div>
        <ButtonLink href="/admin-demo/proveedores/" variant="secondary">Ver compras</ButtonLink>
      </header>
      {list.deliveries === 0 ? (
        <EmptyState title="No hay entregas en los próximos 30 días">Cuando alguien compre un pack “todos los meses” o reanudes una suscripción pausada, sus entregas aparecen acá con lo que hay que armar.</EmptyState>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <ol aria-label="Entregas por fecha" className="flex flex-col gap-4">
            {list.days.map((day) => (
              <li key={day.date} className="rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
                <h3 className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-base font-extrabold">
                  <span className="first-letter:uppercase">{formatDay(day.date, "long")}</span>
                  <span className="text-sm font-bold text-muted">{plural(day.deliveries.length, "entrega", "entregas")} · {plural(day.units, "unidad", "unidades")}</span>
                </h3>
                <ul className="flex flex-col gap-3">
                  {day.deliveries.map((d) => (
                    <li key={d.sub.id} className="text-sm">
                      <p className="font-bold">{d.customer} <span className="font-normal text-muted">· {d.packName}</span></p>
                      {d.lines.length ? (
                        <ul className="mt-1 flex flex-col gap-0.5 text-ink/85">
                          {d.lines.map((l) => <li key={`${l.productSlug}-${l.variantLabel}`}><span className="tabular-nums font-bold">{l.qty} ×</span> {l.name} <span className="text-muted">· {l.variantLabel}</span></li>)}
                        </ul>
                      ) : <p className="text-muted">Sin productos para armar (el pack ya no existe).</p>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <aside aria-labelledby="totals-title" className="rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06] lg:sticky lg:top-24">
            <h3 id="totals-title" className="text-base font-extrabold">Para la compra al proveedor</h3>
            <p className="mb-2 text-sm text-muted">Unidades de todo el período, por producto.</p>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Unidades por producto de los próximos {PREPARE_DAYS} días</caption>
              <thead><tr className="border-b border-line text-xs text-muted"><th scope="col" className="py-1.5 pr-2 font-bold">Producto</th><th scope="col" className="py-1.5 text-right font-bold">Unidades</th></tr></thead>
              <tbody>
                {list.totals.map((t) => (
                  <tr key={t.key} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="py-1.5 pr-2 font-semibold">{t.name}<span className="block text-xs font-normal text-muted">{t.variantLabel}</span></th>
                    <td className="py-1.5 text-right font-extrabold tabular-nums">{t.qty}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><th scope="row" className="pt-2 text-left font-bold">Total</th><td className="pt-2 text-right font-extrabold tabular-nums">{list.units}</td></tr></tfoot>
            </table>
          </aside>
        </div>
      )}
    </section>
  );
}
