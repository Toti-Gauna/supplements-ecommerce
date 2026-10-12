"use client";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { Counter } from "@/components/motion/Counter";
import { countByStatus, delta, salesSummary } from "@/demo/admin/metrics";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { ActivityFeed, ClubPerformance, TopProducts } from "./DashboardInsights";
import { KpiTile } from "./KpiTile";
import { OrderCard } from "./OrderCard";
import { SalesByDay } from "./SalesByDay";
import { StatusPipeline } from "./StatusPipeline";
import { WorkshopStrip } from "./WorkshopStrip";
import { RepurchaseWeek } from "./customers/RepurchaseWeek";
import { ExpiringSoon } from "./lots/ExpiringSoon";

export function Dashboard() {
  const orders = useAdmin((s) => s.orders);
  const claims = useAdmin((s) => s.claims);
  const audit = useAdmin((s) => s.audit);
  const counts = countByStatus(orders);
  const sales = salesSummary(orders, DEMO_TODAY);
  const openClaims = claims.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");
  const latest = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const active = counts.PAID + counts.IN_PRODUCTION + counts.READY + counts.SHIPPED;
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-volt-ink">Panel demo · {formatDate(DEMO_TODAY)}</p>
          <h1 className="font-display mt-2 text-4xl sm:text-5xl">Buen día, Volta <span className="font-sans align-middle text-sm font-bold text-warning">(demo)</span></h1>
          <p className="mt-2 text-muted">Tenés <strong className="text-ink">{counts.PAYMENT_REVIEW} comprobantes</strong> por revisar y <strong className="text-ink">{active} pedidos</strong> en marcha. Datos ficticios.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin-demo/pagos/" variant="dark"><Search size={16} aria-hidden="true" /> Revisar comprobantes</ButtonLink>
          <ButtonLink href="/admin-demo/productos/" variant="secondary"><Plus size={16} aria-hidden="true" /> Productos</ButtonLink>
        </div>
      </header>
      <section aria-label="Indicadores (demo)" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiTile className="col-span-2 sm:col-span-1" label="Ventas últimos 7 días" value={formatARS(sales.week)} delta={delta(sales.week, sales.prevWeek)} spark={sales.days.map((d) => d.amount)} />
        <KpiTile className="col-span-2 sm:col-span-1" label="Ticket promedio" value={formatARS(sales.avgTicket)} hint={`${sales.paidCount} pedidos pagados · demo`} />
        <KpiTile label="Pedidos en marcha" value={<Counter value={active} />} hint="pagados, en producción, listos y enviados" />
        <KpiTile label="Comprobantes a verificar" value={<Counter value={counts.PAYMENT_REVIEW} />} hint="transferencia y QR · demo" dark />
      </section>
      <section aria-labelledby="pipe">
        <div className="mb-3 flex items-end justify-between"><h2 id="pipe" className="font-display text-2xl">Pedidos por estado</h2><Link href="/admin-demo/pedidos/" className="text-sm font-bold text-primary underline">Ver todos</Link></div>
        <StatusPipeline counts={counts} />
      </section>
      <WorkshopStrip />
      {/* Lo que pide acción esta semana: recompras para avisar y lotes que vencen pronto para liquidar. */}
      <div data-dashboard-actions className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <RepurchaseWeek />
        <ExpiringSoon />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SalesByDay days={sales.days} orders={orders} />
        <TopProducts orders={orders} />
      </div>
      {/* Una sección debajo de la otra, a todo el ancho (8.3.3): nada de tres columnas apretadas. */}
      <section aria-labelledby="ultimos">
        <div className="mb-3 flex items-end justify-between"><h2 id="ultimos" className="font-display text-2xl">Últimos pedidos</h2><Link href="/admin-demo/pedidos/" className="text-sm font-bold text-primary underline">Ver todos</Link></div>
        <ul className="flex flex-col gap-2">{latest.map((o) => <li key={o.code}><OrderCard order={o} /></li>)}</ul>
      </section>
      <ClubPerformance />
      <ActivityFeed audit={audit} />
      <section aria-labelledby="reclamos">
        <div className="mb-3 flex items-end justify-between"><h2 id="reclamos" className="font-display text-2xl">Reclamos de ejemplo</h2><Link href="/admin-demo/reclamos/" className="text-sm font-bold text-primary underline">Gestionar</Link></div>
        <ul className="grid gap-3 md:grid-cols-3">
          {openClaims.map((c) => <li key={c.id} className="rounded-3xl bg-surface p-4 text-sm shadow-[var(--shadow-card)]"><p className="font-bold">{c.code} · {c.name}</p><p className="text-muted">{c.message}</p></li>)}
          {openClaims.length === 0 && <li className="rounded-3xl border border-dashed border-line p-4 text-sm text-muted">Sin reclamos abiertos.</li>}
        </ul>
      </section>
    </div>
  );
}
