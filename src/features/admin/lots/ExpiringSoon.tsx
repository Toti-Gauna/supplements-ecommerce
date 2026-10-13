"use client";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { useId, useState } from "react";
import { expiringLots, type LotRow } from "@/demo/admin/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatExpiry } from "@/demo/engine/lots";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { ClearanceSheet } from "./ClearanceSheet";
import { clearAction, LotBadge } from "./LotBadge";

export const EXPIRING_HREF = "/admin-demo/productos/?ver=variantes&vence=pronto";

interface Props {
  /** Cuántos lotes mostrar (los más urgentes). */
  limit?: number;
  className?: string;
}

/**
 * "Próximos a vencer" (Fase 6) para el inicio del panel: lotes vencidos o que vencen en menos de 60 días, el más
 * urgente primero, con "Liquidar" en el mismo lugar. Lee el catálogo del panel; no necesita props.
 */
export function ExpiringSoon({ limit = 5, className }: Props) {
  const products = useAdmin((s) => s.data.products);
  const [lot, setLot] = useState<LotRow | null>(null);
  const id = useId();
  const all = expiringLots(products, DEMO_TODAY);
  const units = all.reduce((s, r) => s + r.lot.units, 0);
  return (
    <section aria-labelledby={id} className={cn("rounded-sm bg-surface p-5 shadow-[var(--shadow-card)]", className)}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 id={id} className="font-display flex items-center gap-2 text-2xl"><CalendarClock size={22} aria-hidden="true" className="text-warning" />Próximos a vencer</h2>
        {all.length > 0 && <Link href={EXPIRING_HREF} className="text-sm font-bold text-primary underline">Ver {all.length === 1 ? "el lote" : `los ${all.length} lotes`}</Link>}
      </div>
      {all.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-4 text-sm text-muted">Ningún lote vence en los próximos 60 días.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">{all.length} {all.length === 1 ? "lote vence" : "lotes vencen"} en menos de 60 días · {units} unidades. Liquidalos antes de que queden parados.</p>
          <ul className="flex flex-col gap-2">
            {all.slice(0, limit).map((r) => (
              <li key={r.key} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm bg-bg p-3">
                <span className="min-w-0 flex-1 basis-56">
                  <span className="block font-bold leading-tight">{r.productName}</span>
                  <span className="text-sm text-muted">{r.variantLabel}</span>
                  <span className="font-lab mt-1 block text-xs text-muted">Lote <strong className="text-ink">{r.lot.code}</strong> · vence <strong className="text-ink">{formatExpiry(r.lot.expires)}</strong> · {r.lot.units} u.</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <LotBadge row={r} />
                  {r.clearance !== null && <span className="text-sm font-bold tabular-nums">{formatARS(r.clearance)}</span>}
                  <button type="button" onClick={() => setLot(r)} aria-label={clearAction(r).label}
                    className="inline-flex h-10 items-center rounded-sm bg-night px-4 text-sm font-bold text-on-night hover:bg-night/90">
                    {clearAction(r).text}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <ClearanceSheet lot={lot} onClose={() => setLot(null)} />
    </section>
  );
}
