"use client";
import { CalendarClock, TriangleAlert, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { PriceUndo } from "@/demo/admin/bulk-price";
import type { LotRow } from "@/demo/admin/lots";
import { formatDateTime } from "@/lib/date";

interface Props {
  reorder: number;
  low: number;
  expiring: LotRow[];
  lastPrice: PriceUndo | null;
  onReorder: () => void;
  onExpiring: () => void;
  onUndoPrice: () => void;
}

const banner = "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1";

function AlertButton({ onClick, icon, children, cta }: { onClick: () => void; icon: ReactNode; children: ReactNode; cta: string }) {
  return (
    <button type="button" onClick={onClick} className={`${banner} bg-warning-soft text-warning ring-warning/30`}>
      {icon}<span className="flex-1">{children}</span><span className="underline">{cta}</span>
    </button>
  );
}

/** Avisos de Productos y stock: reposición, lotes que vencen pronto y el último aumento de precios (con deshacer). */
export function CatalogAlerts({ reorder, low, expiring, lastPrice, onReorder, onExpiring, onUndoPrice }: Props) {
  const units = expiring.reduce((s, r) => s + r.lot.units, 0);
  if (!reorder && !expiring.length && !lastPrice) return null;
  return (
    <div className="mb-4 flex flex-col gap-2">
      {lastPrice && (
        <div role="status" className={`${banner} flex-wrap bg-accent/60 text-ink ring-ink/10`}>
          <Undo2 size={18} aria-hidden="true" className="text-primary" />
          <span className="min-w-0 flex-1 basis-60">Último cambio de precios: <strong>{lastPrice.label}</strong> · {lastPrice.count} variantes · <span className="font-normal text-muted">{formatDateTime(lastPrice.at)}</span></span>
          <ConfirmButton size="sm" variant="secondary" title="¿Deshacer el último cambio de precios?" confirmLabel="Deshacer" onConfirm={onUndoPrice}
            description={`Los precios de esas ${lastPrice.count} variantes vuelven exactamente a como estaban antes de “${lastPrice.label}”, también si los cambiaste después. El stock y lo demás no cambia.`}>
            Deshacer aumento
          </ConfirmButton>
        </div>
      )}
      {expiring.length > 0 && (
        <AlertButton onClick={onExpiring} icon={<CalendarClock size={18} aria-hidden="true" />} cta="Ver y liquidar">
          {expiring.length} {expiring.length === 1 ? "lote vence" : "lotes vencen"} en menos de 60 días ({units} unidades).
        </AlertButton>
      )}
      {reorder > 0 && (
        <AlertButton onClick={onReorder} icon={<TriangleAlert size={18} aria-hidden="true" />} cta="Ver stock">
          {reorder} {reorder === 1 ? "variante necesita" : "variantes necesitan"} reposición (sin stock o con {low} o menos).
        </AlertButton>
      )}
    </div>
  );
}
