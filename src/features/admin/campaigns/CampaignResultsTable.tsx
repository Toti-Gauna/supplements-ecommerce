"use client";
import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable } from "@/components/organisms/data-table/DataTable";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { campaignResults, resultsTotals, type CampaignResult } from "@/demo/admin/campaign-results";
import type { FilterSpec } from "@/demo/admin/table";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { editorHref } from "./links";

const search = (r: CampaignResult) => `${r.name} ${r.code}`;

/** Resultados del cupón de cada campaña: usos, pedidos, descuento dado y lo vendido (datos de muestra y de esta demo). */
export function CampaignResultsTable() {
  const themes = useAdmin((s) => s.data.themes);
  const coupons = useAdmin((s) => s.data.coupons);
  const orders = useAdmin((s) => s.orders);
  const rows = campaignResults(themes, coupons, orders);
  const onExport = useExport("resultados-campanas");
  const filters: FilterSpec<CampaignResult>[] = [
    { id: "uso", label: "Uso", options: [{ value: "con", label: "Con usos" }, { value: "sin", label: "Sin usos" }], test: (r, v) => (v === "con" ? r.uses > 0 : r.uses === 0) },
  ];
  const state = useTableState("campaign-results", { sort: { id: "uses", dir: "desc" }, filterIds: filters.map((f) => f.id) });
  const columns: Column<CampaignResult>[] = [
    { id: "name", header: "Campaña", pinned: true, primary: true, cell: (r) => r.name, sortValue: (r) => r.name, exportValue: (r) => r.name },
    { id: "code", header: "Cupón", cell: (r) => <span className="inline-flex items-center gap-2 font-mono font-bold">{r.code}{!r.couponActive && <Badge tone="warning">Pausado</Badge>}</span>, sortValue: (r) => r.code, exportValue: (r) => r.code },
    { id: "uses", header: "Usos", align: "right", cell: (r) => r.uses, sortValue: (r) => r.uses, exportValue: (r) => r.uses },
    { id: "orders", header: "Pedidos", align: "right", cell: (r) => r.orders, sortValue: (r) => r.orders, exportValue: (r) => r.orders },
    { id: "discount", header: "Descuento dado", align: "right", money: true, cell: (r) => formatARS(r.discount), sortValue: (r) => r.discount, exportValue: (r) => r.discount },
    { id: "revenue", header: "Vendido con el cupón", align: "right", money: true, cell: (r) => formatARS(r.revenue), sortValue: (r) => r.revenue, exportValue: (r) => r.revenue },
    { id: "ticket", header: "Ticket promedio", align: "right", money: true, defaultHidden: true, cell: (r) => (r.orders ? formatARS(r.avgTicket) : "—"), sortValue: (r) => r.avgTicket, exportValue: (r) => r.avgTicket },
  ];
  const Card = ({ row: r }: RowCardProps<CampaignResult>) => (
    <Link href={editorHref(r.id)} className="flex flex-col gap-1 rounded-sm bg-bg p-3 text-sm ring-1 ring-ink/[0.06]">
      <span className="flex items-center justify-between gap-2"><span className="font-bold">{r.name}</span><span className="font-mono text-xs font-bold">{r.code}</span></span>
      <span className="text-muted"><strong className="text-ink tabular-nums">{r.uses}</strong> usos · <strong className="text-ink tabular-nums">{r.orders}</strong> pedidos · descuento <strong className="text-ink tabular-nums">{formatARS(r.discount)}</strong></span>
    </Link>
  );
  return (
    <section aria-labelledby="res-title">
      <h2 id="res-title" className="font-display mb-1 text-2xl">Resultados de los cupones</h2>
      <p className="mb-3 max-w-3xl text-sm text-muted">Usos del cupón de cada campaña (simulados, incluye los de esta demo), pedidos del panel que lo usaron, el descuento que dieron y lo vendido con él. Los pedidos cancelados no cuentan.</p>
      <DataTable caption="Resultados de los cupones por campaña" noun="campañas" rows={rows} columns={columns} state={state} filters={filters}
        searchLabel="Buscar campaña o cupón" searchPlaceholder="Black, HOTSALE30…" searchText={search}
        rowKey={(r) => r.id} rowLabel={(r) => `Seleccionar ${r.name}`} rowHref={(r) => editorHref(r.id)} onExport={onExport} renderCard={Card} pageSize={20}
        footer={(list) => { const t = resultsTotals(list); return <p className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t border-line px-5 py-3 text-sm text-muted">Usos: <strong className="tabular-nums text-ink">{t.uses}</strong> Pedidos: <strong className="tabular-nums text-ink">{t.orders}</strong> Descuento dado: <strong className="tabular-nums text-ink">{formatARS(t.discount)}</strong></p>; }}
        empty={<EmptyState title="Nada para mostrar">No hay campañas en este filtro. Tocá “Reiniciar” para ver todas.</EmptyState>} />
    </section>
  );
}
