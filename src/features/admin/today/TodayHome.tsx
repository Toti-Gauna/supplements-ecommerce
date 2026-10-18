"use client";
import { demoNow } from "@/demo/clock";
import { salesSummary } from "@/demo/admin/metrics";
import { greetingFor, summaryLine } from "@/demo/engine/today";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { SalesByDay } from "../SalesByDay";
import { TodayList } from "./TodayList";
import { TodayScoreboard } from "./TodayScoreboard";
import { useTodayBoard } from "./useTodayBoard";

/**
 * "Hoy en tu tienda" (R4a), el inicio del panel: arriba el marcador del día, debajo la lista de lo que hay que hacer
 * ordenada por urgencia (cada fila con un botón) y al final cómo viene la semana. El motor es `engine/today*.ts`.
 * Se muestra después de leer el estado local (AdminGate), así la hora del saludo no choca con el HTML estático.
 */
export function TodayHome() {
  const { score, actions, snapshot } = useTodayBoard();
  const sales = salesSummary(snapshot.orders, DEMO_TODAY);
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-volt-ink">{formatDay(DEMO_TODAY, "long")} · panel demo</p>
        <h1 className="font-display text-[clamp(2.75rem,9vw,5.5rem)] leading-[0.9]">Hoy en tu tienda</h1>
        <p data-today-summary className="max-w-2xl text-muted"><strong className="text-ink">{greetingFor(demoNow())}.</strong> {summaryLine(actions)}</p>
      </header>
      <TodayScoreboard score={score} />
      <TodayList actions={actions} snapshot={snapshot} />
      <section aria-labelledby="semana" className="flex flex-col gap-3">
        <h2 id="semana" className="font-display text-3xl sm:text-4xl">Cómo viene la semana</h2>
        <SalesByDay days={sales.days} orders={snapshot.orders} />
      </section>
    </div>
  );
}
