"use client";
import { Badge } from "@/components/atoms/Badge";
import type { LotRow } from "@/demo/admin/lots";
import type { StockRow } from "@/demo/admin/stock";
import { formatExpiry } from "@/demo/engine/lots";

export function expiryText(days: number): string {
  if (days < 0) return "Vencido";
  if (days === 0) return "Vence hoy";
  return `Vence en ${days} ${days === 1 ? "día" : "días"}`;
}

const TONE = { expired: "danger", soon: "warning", ok: "neutral" } as const;

/** Texto visible y nombre accesible del botón que abre la liquidación de un lote (empieza igual que el texto visible). */
export function clearAction(r: Pick<LotRow, "lot" | "productName" | "variantLabel">): { text: string; label: string } {
  const text = r.lot.clearancePct ? "Cambiar" : "Liquidar";
  return { text, label: `${r.lot.clearancePct ? "Cambiar la liquidación" : "Liquidar"} del lote ${r.lot.code} de ${r.productName} · ${r.variantLabel}` };
}

/** Estado de un lote con texto (nunca solo color): "Vence en 27 días", "Vencido" y, si corresponde, la liquidación. */
export function LotBadge({ row }: { row: Pick<LotRow, "lot" | "days" | "state"> }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Badge tone={TONE[row.state]}>{expiryText(row.days)}</Badge>
      {row.lot.clearancePct ? <Badge tone="brand">Liquidación −{row.lot.clearancePct} %</Badge> : null}
    </span>
  );
}

/** Lote que sale primero de la variante y, si alguno vence pronto, el aviso con "Liquidar". */
export function LotCell({ row, onClear }: { row: StockRow; onClear: (lot: LotRow) => void }) {
  if (!row.lot) return <span className="text-muted">Sin lote</span>;
  const urgent = row.expiring[0];
  const action = urgent && clearAction(urgent);
  return (
    <span className="flex flex-col items-start gap-1">
      <span className="font-lab whitespace-nowrap text-xs">{row.lot.code} · {formatExpiry(row.lot.expires)}</span>
      {row.lots > 1 && <span className="text-xs text-muted">Sale primero · {row.lots} lotes en el local</span>}
      {urgent && action && (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <LotBadge row={urgent} />
          <button type="button" onClick={() => onClear(urgent)} aria-label={action.label} className="text-xs font-bold text-primary underline underline-offset-2">{action.text}</button>
        </span>
      )}
    </span>
  );
}
