import { differenceText, type CounterClosure } from "@/demo/engine/counter-close";
import { chargeLabel } from "@/demo/engine/counter-pay";
import type { CounterSale } from "@/demo/engine/counter-sale";
import { formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";

const units = (s: CounterSale) => s.lines.reduce((n, l) => n + l.qty, 0);

/** Tickets abiertos del día: número, hora, potes, medio y total (con el vuelto o la cuota). */
export function DayTickets({ sales }: { sales: CounterSale[] }) {
  return (
    <section aria-labelledby="tickets-dia" className="flex flex-col gap-3">
      <h2 id="tickets-dia" className="font-display text-3xl">Tickets del día</h2>
      <ol className="flex flex-col divide-y divide-line rounded-sm border border-line bg-surface">
        {sales.map((s) => (
          <li key={s.id} data-sale={s.number} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-3 sm:p-4">
            <span className="min-w-0">
              <span className="font-mono text-sm font-bold">#{s.number}</span>{" "}
              <span className="text-sm text-muted">{formatDateTime(s.at)} · {plural(units(s), "pote", "potes")}</span>
              <span className="block text-sm">{chargeLabel(s)}{s.installments > 1 ? ` de ${formatARS(s.installment)}` : ""}{s.change ? ` · vuelto ${formatARS(s.change)}` : ""}</span>
            </span>
            <span className="font-lab font-bold tabular-nums">{formatARS(s.total)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Cierres anteriores: cuándo, cuánto se cobró, la caja esperada y lo contado. */
export function ClosureList({ closures }: { closures: CounterClosure[] }) {
  return (
    <section aria-labelledby="cierres" className="flex flex-col gap-3">
      <h2 id="cierres" className="font-display text-3xl">Cierres anteriores</h2>
      <ul className="flex flex-col gap-2">
        {closures.map((c) => (
          <li key={c.id} data-closure className="plate flex flex-col gap-1 rounded-sm border border-line p-3 text-sm sm:p-4">
            <p className="font-bold">Cerrado el {formatDateTime(c.at)} · {plural(c.tickets, "ticket", "tickets")} · {formatARS(c.total)}</p>
            <p className="text-muted">
              Caja esperada {formatARS(c.cashExpected)}
              {c.counted === null || c.difference === null ? " · sin contar" : ` · contaste ${formatARS(c.counted)}: ${differenceText(c.difference).toLowerCase()}`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
