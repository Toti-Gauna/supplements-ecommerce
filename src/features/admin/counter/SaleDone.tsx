import { CircleCheck } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { chargeLabel } from "@/demo/engine/counter-pay";
import type { CounterSale } from "@/demo/engine/counter-sale";
import { formatARS } from "@/lib/money";
import { lotsText } from "./TicketLines";

/** El comprobante en pantalla después de cobrar: total, vuelto o cuotas y de qué lote salió cada pote. */
export function SaleDone({ sale, titleId, onNew }: { sale: CounterSale; titleId: string; onNew: () => void }) {
  const how = sale.installments > 1 ? `${chargeLabel(sale).toLowerCase()} de ${formatARS(sale.installment)}` : chargeLabel(sale).toLowerCase();
  return (
    <div role="status" data-sale-done={sale.number} className="flex flex-col gap-4">
      <p className="eyebrow flex items-center gap-2 text-success"><CircleCheck size={16} aria-hidden="true" />Ticket {sale.number}</p>
      <h2 id={titleId} className="font-display text-4xl">Venta registrada (simulada)</h2>
      <p className="text-lg">Cobraste <strong className="font-lab">{formatARS(sale.total)}</strong> en {how}.</p>
      {sale.surcharge > 0 && <p className="text-sm text-muted">Incluye {formatARS(sale.surcharge)} de recargo por las cuotas ({sale.pct} %).</p>}
      {sale.change !== undefined && (
        <p className="rounded-sm bg-success-soft p-4 text-2xl font-extrabold text-success">Vuelto: {formatARS(sale.change)}</p>
      )}
      <ul className="flex flex-col gap-2 rounded-sm border border-line bg-surface p-4 text-sm">
        {sale.lines.map((l) => (
          <li key={`${l.productSlug}-${l.variantId}`} className="flex justify-between gap-3">
            <span className="min-w-0"><span className="font-bold">{l.qty} × {l.productName}</span> <span className="text-muted">{l.variantLabel}</span>
              {lotsText(l) && <span className="block font-mono text-[11px] text-muted">{lotsText(l)}</span>}</span>
            <span className="shrink-0 font-lab tabular-nums">{formatARS(l.total)}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">El stock ya bajó en el panel y en la tienda de esta demo. No se cobró nada de verdad ni se emitió factura.</p>
      <Button size="lg" onClick={onNew} className="w-full">Nueva venta</Button>
    </div>
  );
}
