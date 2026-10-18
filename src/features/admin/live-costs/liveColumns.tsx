import { Badge } from "@/components/atoms/Badge";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { COVERAGE_LABEL } from "@/demo/admin/live-costs";
import type { LiveCostRow } from "@/demo/admin/live-rows";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { expiryText } from "../lots/LotBadge";

const signed = (n: number) => `${n < 0 ? "−" : "+"}${formatARS(Math.abs(n))}`;
const coverageText = (r: LiveCostRow) => (r.coverage.days === null ? COVERAGE_LABEL[r.coverage.state] : plural(r.coverage.days, "día", "días"));

export function CoverageCell({ r }: { r: LiveCostRow }) {
  const tone = r.coverage.state === "corta" || r.coverage.state === "sin-stock" ? "danger" : r.coverage.state === "larga" ? "warning" : "neutral";
  return <span className="flex flex-col items-start gap-0.5"><strong className="tabular-nums">{coverageText(r)}</strong><Badge tone={tone}>{COVERAGE_LABEL[r.coverage.state]}</Badge></span>;
}

export function SinceCell({ r }: { r: LiveCostRow }) {
  return <span className="flex flex-col items-start gap-0.5"><span>{formatDate(r.since)}</span>{r.stale && <Badge tone="warning">Hace {r.age} días</Badge>}</span>;
}

export function LiquidationCell({ r }: { r: LiveCostRow }) {
  if (!r.lot) return <span className="text-muted">—</span>;
  const l = r.liquidation;
  if (!l) return <span className="text-sm font-bold text-danger">Vencido: sacalo de la venta</span>;
  return (
    <span className="flex flex-col items-start gap-0.5 text-sm">
      <strong className={cn("tabular-nums", l.profit !== null && l.profit < 0 && "text-danger")}>{l.profit === null ? "Sin costo" : signed(l.profit)}</strong>
      <span className="text-xs text-muted">Lote {r.lot.lot.code}: {plural(l.units, "u.", "u.")} a −{l.pct} %{l.ifExpires !== null && `. Si vence: ${signed(l.ifExpires)}`}</span>
    </span>
  );
}

export const liveColumns: Column<LiveCostRow>[] = [
  { id: "name", header: "Producto", pinned: true, primary: true, cell: (r) => <span className="flex flex-col"><span className="font-bold">{r.productName}</span><span className="text-xs font-normal text-muted">{r.variantLabel}</span></span>, sortValue: (r) => `${r.productName} ${r.variantLabel}`, exportValue: (r) => `${r.productName} · ${r.variantLabel}` },
  { id: "cost", header: "Costo", align: "right", money: true, cell: (r) => <span className="tabular-nums">{formatARS(r.supplierCost)}{r.estimated && <span className="block text-xs text-muted">estimado</span>}</span>, sortValue: (r) => r.supplierCost, exportValue: (r) => r.supplierCost },
  { id: "since", header: "Rige desde", cell: (r) => <SinceCell r={r} />, sortValue: (r) => r.since, exportValue: (r) => r.since },
  { id: "stock", header: "Stock", align: "right", cell: (r) => (r.stock < 0 ? "A pedido" : r.stock), sortValue: (r) => r.stock, exportValue: (r) => r.stock },
  { id: "perDay", header: "Venta diaria", align: "right", defaultHidden: true, cell: (r) => (r.perDay ? r.perDay.toFixed(2).replace(".", ",") : "—"), sortValue: (r) => r.perDay, exportValue: (r) => Math.round(r.perDay * 100) / 100 },
  { id: "coverage", header: "Cobertura", cell: (r) => <CoverageCell r={r} />, sortValue: (r) => r.coverage.days, exportValue: (r) => r.coverage.days ?? COVERAGE_LABEL[r.coverage.state] },
  { id: "lot", header: "Ganancia al liquidar", cell: (r) => <LiquidationCell r={r} />, sortValue: (r) => r.liquidation?.profit ?? null, exportValue: (r) => r.liquidation?.profit ?? "" },
];

export function LiveCard({ row: r, onOpen }: RowCardProps<LiveCostRow>) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-sm bg-bg p-3 text-left ring-1 ring-ink/[0.06]">
      <button type="button" onClick={onOpen} className="flex items-start gap-2 text-left"><span className="min-w-0 flex-1 font-bold">{r.productName}<span className="block text-xs font-normal text-muted">{r.variantLabel}</span></span></button>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted">
        <div><dt>Costo</dt><dd className="text-sm font-bold text-ink tabular-nums">{formatARS(r.supplierCost)}</dd></div>
        <div><dt>Rige desde</dt><dd className="text-sm font-bold text-ink"><SinceCell r={r} /></dd></div>
        <div><dt>Cobertura</dt><dd className="text-sm text-ink"><CoverageCell r={r} /></dd></div>
        {r.lot && <div><dt>Lote por vencer ({expiryText(r.lot.days)})</dt><dd className="text-sm text-ink"><LiquidationCell r={r} /></dd></div>}
      </dl>
    </div>
  );
}
