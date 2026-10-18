"use client";
import { useMemo } from "react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable } from "@/components/organisms/data-table/DataTable";
import { liveCostRows, type LiveCostRow } from "@/demo/admin/live-rows";
import type { FilterSpec } from "@/demo/admin/table";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { useCostBook } from "../supplier-list/useCostBook";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { LiveCard, liveColumns } from "./liveColumns";

const FILTERS: FilterSpec<LiveCostRow>[] = [
  { id: "cobertura", label: "Cobertura", options: [{ value: "corta", label: "Se acaba pronto" }, { value: "larga", label: "Stock de sobra" }], test: (r, v) => r.coverage.state === v || (v === "corta" && r.coverage.state === "sin-stock") },
  { id: "costo", label: "Costo", options: [{ value: "viejo", label: "Sin actualizar hace más de 60 días" }], test: (r) => r.stale },
  { id: "lote", label: "Lotes", options: [{ value: "vence", label: "Con lote por vencer" }], test: (r) => !!r.lot },
];
const FILTER_IDS = FILTERS.map((f) => f.id);

/**
 * Costos vivos (R4c): cada costo con la fecha desde la que rige, para cuántos días alcanza el stock al ritmo de venta
 * (stock / venta diaria promedio de las últimas 8 semanas) y, en los lotes por vencer, qué se gana o se pierde si se
 * liquidan con el descuento propuesto. Orientativo: usa los pedidos y ventas del mostrador de esta demo.
 */
export function LiveCostsTable() {
  const products = useAdmin((s) => s.data.products);
  const orders = useAdmin((s) => s.orders);
  const sales = useAdmin((s) => s.counter.sales);
  const book = useCostBook();
  const onExport = useExport("costos-vivos");
  const state = useTableState("live-costs", { sort: { id: "coverage", dir: "asc" }, hidden: ["perDay"], filterIds: FILTER_IDS });
  const rows = useMemo(() => liveCostRows(products, book, orders, sales, DEMO_TODAY), [products, book, orders, sales]);
  const stale = rows.filter((r) => r.stale).length;
  const short = rows.filter((r) => r.coverage.state === "corta" || r.coverage.state === "sin-stock").length;
  const lots = rows.filter((r) => r.liquidation);
  const profit = lots.reduce((s, r) => s + (r.liquidation?.profit ?? 0), 0);
  const card = (label: string, value: string, note: string, tone?: string) => (
    <div className="rounded-sm bg-bg p-3"><p className="text-xs font-bold text-muted">{label}</p><p className={cn("text-2xl font-extrabold tabular-nums", tone)}>{value}</p><p className="text-xs text-muted">{note}</p></div>
  );
  return (
    <>
      <AdminPageHeader title="Costos vivos">Cada costo con la fecha desde la que rige, para cuántos días alcanza el stock al ritmo de venta y, en los lotes que vencen, cuánto ganás o perdés si los liquidás con el descuento propuesto. Se calcula con los pedidos y las ventas del mostrador de las últimas 8 semanas; es orientativo.</AdminPageHeader>
      <section aria-label="Resumen de costos vivos" className="mb-5 grid grid-cols-2 gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-3">
        {card("Costos sin actualizar", String(stale), "hace más de 60 días", stale ? "text-warning" : "text-success")}
        {card("Se acaban pronto", String(short), "14 días o menos de stock", short ? "text-danger" : "text-success")}
        {card("Lotes por vencer", lots.length ? `${profit < 0 ? "−" : "+"}${formatARS(Math.abs(profit))}` : "—", lots.length ? `si se liquidan ${plural(lots.length, "lote", "lotes")}` : "nada por liquidar")}
      </section>
      <DataTable caption="Costos vivos por variante" noun="variantes" rows={rows} columns={liveColumns} state={state} searchLabel="Buscar producto" searchPlaceholder="Whey, creatina…" searchText={(r) => `${r.productName} ${r.variantLabel} ${r.brand}`} filters={FILTERS}
        rowKey={(r) => r.key} rowLabel={(r) => `Seleccionar ${r.productName} ${r.variantLabel}`} onExport={onExport} renderCard={(p) => <LiveCard {...p} />}
        rowTone={(r) => (r.liquidation?.profit != null && r.liquidation.profit < 0 ? "danger" : r.stale || r.coverage.state === "corta" ? "warning" : undefined)}
        empty={<EmptyState title="Nada para mostrar">No hay variantes con ese filtro. Tocá “Reiniciar” para ver todas.</EmptyState>} />
    </>
  );
}
