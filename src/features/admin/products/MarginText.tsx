import { formatRange, type Range } from "@/demo/admin/product-metrics";
import type { StockRow } from "@/demo/admin/stock";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

const pct = (n: number) => `${n} %`;

/** Margen (o rango de márgenes) en %: en rojo si alguna presentación pierde plata. */
export function MarginText({ value }: { value: number | Range | null }) {
  const range = typeof value === "number" ? { min: value, max: value } : value;
  if (!range) return <span className="text-muted">—</span>;
  return <span className={cn("tabular-nums", range.min < 0 && "font-bold text-danger")}>{formatRange(range, pct)}</span>;
}

/**
 * Costo del proveedor; "≈" cuando se estimó en proporción al precio porque la presentación no tiene uno propio.
 * `relative`: el texto para lectores de pantalla (absoluto) queda dentro del carril de la tabla y no ensancha la página.
 */
export function CostText({ row }: { row: Pick<StockRow, "cost" | "costEstimated"> }) {
  if (!row.cost) return <span className="text-muted">—</span>;
  return row.costEstimated
    ? <span className="relative" title="Estimado en proporción al precio: cargá el costo de esta presentación en Costos o en el editor"><span aria-hidden="true">≈ </span>{formatARS(row.cost)}<span className="sr-only"> (estimado)</span></span>
    : <>{formatARS(row.cost)}</>;
}
