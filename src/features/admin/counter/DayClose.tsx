"use client";
import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Scoreboard, type ScoreCell } from "@/components/molecules/Scoreboard";
import { daySummary, differenceText, type DaySummary } from "@/demo/engine/counter-close";
import { COUNTER_METHODS, METHOD_LABEL } from "@/demo/engine/counter-pay";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { CommitNumberField } from "../NumberField";
import { useDemoSave } from "../useDemoSave";
import { ClosureList, DayTickets } from "./DayLists";

function cells(s: DaySummary): ScoreCell[] {
  return [
    { key: "caja", label: "Caja esperada", value: s.cashExpected, money: true, wide: true, tone: "volt", hint: `Fondo ${formatARS(s.float)} + efectivo ${formatARS(s.byMethod.CASH)}` },
    { key: "cobrado", label: "Cobrado", value: s.total, money: true, wide: true, tone: "chalk", hint: plural(s.units, "pote", "potes") },
    { key: "tickets", label: "Tickets", value: s.tickets, wide: true, reading: plural(s.tickets, "ticket", "tickets"), tone: "chalk", hint: `${s.installmentSales} en cuotas` },
  ];
}

/**
 * Mostrador · Cierre del día (R4b): la caja que tiene que haber en efectivo (fondo + efectivo cobrado), lo cobrado por
 * medio de pago, los recargos y los tickets. Se cuenta la caja, se ve la diferencia y se cierra (simulado).
 */
export function DayClose() {
  const sales = useAdmin((s) => s.counter.sales);
  const closures = useAdmin((s) => s.counter.closures);
  const float = useAdmin((s) => s.counter.float);
  const setFloat = useAdmin((s) => s.setCounterFloat);
  const closeDay = useAdmin((s) => s.closeCounterDay);
  const save = useDemoSave();
  const [counted, setCounted] = useState("");
  const sum = useMemo(() => daySummary(sales, DEMO_TODAY, float), [sales, float]);
  const cash = counted.trim() === "" || !Number.isFinite(Number(counted)) ? null : Math.max(0, Math.round(Number(counted)));
  const diff = cash === null ? null : cash - sum.cashExpected;
  const onCloseDay = () => save("Día cerrado (simulado)", () => {
    const r = closeDay(cash);
    if (r.ok) setCounted("");
    return r.ok || r.error;
  }, "Las ventas que registres desde ahora van al próximo cierre.");
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Cierre del día">
        <p>La caja esperada es el fondo con el que abriste más todo lo cobrado en efectivo (el vuelto ya salió de lo que te dieron).</p>
        <p className="mt-3">Contá la plata, anotala y cerrá: queda guardado con la diferencia. Las ventas que vengan después van al próximo cierre. Todo es simulado y queda en este navegador.</p>
      </AdminPageHeader>
      <p className="-mt-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{formatDay(DEMO_TODAY, "long")}</p>
      <Scoreboard label="Caja del día" cells={cells(sum)} />
      <section aria-labelledby="por-medio" className="flex flex-col gap-3">
        <h2 id="por-medio" className="font-display text-3xl">Por medio de pago</h2>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-5">
          {COUNTER_METHODS.map((m) => (
            <div key={m} data-method={m} className="flex flex-col gap-1 bg-surface p-3">
              <dt className="eyebrow text-muted">{METHOD_LABEL[m]}</dt>
              <dd className="font-lab text-xl font-bold tabular-nums">{formatARS(sum.byMethod[m])}</dd>
            </div>
          ))}
          <div data-method="recargos" className="col-span-2 flex flex-col gap-1 bg-surface p-3 sm:col-span-1">
            <dt className="eyebrow text-muted">Recargos de cuotas</dt>
            <dd className="font-lab text-xl font-bold tabular-nums">{formatARS(sum.surcharges)}<span className="block font-sans text-xs font-normal text-muted">Ya sumados en crédito</span></dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="contar" className="flex max-w-2xl flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <h2 id="contar" className="font-display text-3xl">Contar la caja</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <CommitNumberField id="fondo" label="Fondo de caja" suffix="$" value={float} onCommit={setFloat} hint="Con lo que abriste el día." />
          <div className="flex flex-col gap-1">
            <label htmlFor="contado" className="text-sm font-bold">Efectivo contado <span className="font-normal text-muted">($)</span></label>
            <Input id="contado" type="number" inputMode="numeric" min={0} step={1} value={counted} onChange={(e) => setCounted(e.target.value)} aria-describedby="contado-h" />
            <p id="contado-h" aria-live="polite" className={diff === null ? "text-xs text-muted" : diff === 0 ? "text-sm font-bold text-success" : "text-sm font-bold text-warning"}>
              {diff === null ? "Opcional: si lo anotás, queda la diferencia." : differenceText(diff)}
            </p>
          </div>
        </div>
        <ConfirmButton size="lg" className="self-start" disabled={!sum.tickets} title="¿Cerrar el día?" confirmLabel="Cerrar el día" onConfirm={onCloseDay}
          description={<>Se guardan {plural(sum.tickets, "ticket", "tickets")} por {formatARS(sum.total)}. Caja esperada: <strong>{formatARS(sum.cashExpected)}</strong>{diff !== null ? `. ${differenceText(diff)}.` : "."} Es un cierre simulado.</>}>
          Cerrar el día
        </ConfirmButton>
      </section>
      {sum.tickets > 0 && <DayTickets sales={sum.sales} />}
      {!sum.tickets && !closures.length && (
        <EmptyState title="Todavía no hay ventas" action={<ButtonLink href="/admin-demo/mostrador/">Ir a vender</ButtonLink>}>Cuando registres una venta en el mostrador, aparece acá con su medio de pago.</EmptyState>
      )}
      {closures.length > 0 && <ClosureList closures={closures} />}
    </div>
  );
}
