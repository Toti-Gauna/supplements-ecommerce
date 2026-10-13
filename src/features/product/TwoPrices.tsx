import { CreditCard, Landmark } from "lucide-react";
import type { Clearance } from "@/demo/engine/lots";
import type { PriceOptions } from "@/demo/engine/sheet";
import { formatARS, withoutNationalTaxes } from "@/lib/money";
import { ClearanceTag } from "./SupplementFacts";

interface Props {
  price: number;
  options: PriceOptions;
  clearance: Clearance | null;
  taxRate: number;
}

/**
 * Los dos precios explicados, como salen del engine: con transferencia o QR (cuánto ahorrás) y con tarjeta o Mercado
 * Pago (precio de lista y la cuota de muestra). Abajo, el precio sin impuestos nacionales que exige la ley.
 */
export function TwoPrices({ price, options: o, clearance, taxRate }: Props) {
  const row = "flex items-center gap-3 px-3 py-2.5";
  return (
    <div className="flex flex-col gap-2">
      {clearance && <ClearanceTag clearance={clearance} />}
      <ul aria-label="Cómo pagar" className="divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface text-sm">
        {o.savings > 0 && (
          <li className={row}>
            <Landmark size={18} aria-hidden="true" className="shrink-0 text-success" />
            <span className="min-w-0 flex-1"><strong>Transferencia o QR</strong><span className="block text-xs text-muted">Ahorrás {formatARS(o.savings)} (−{o.transferPct} %)</span></span>
            <strong key={o.transfer} className="animate-num font-lab text-xl tabular-nums text-success">{formatARS(o.transfer)}</strong>
          </li>
        )}
        <li className={row}>
          <CreditCard size={18} aria-hidden="true" className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1"><strong>Tarjeta o Mercado Pago</strong><span className="block text-xs text-muted">{o.installments} cuotas de {formatARS(o.perInstallment)} (de muestra)</span></span>
          <strong key={price} className="animate-num font-lab text-xl tabular-nums">{formatARS(o.card)}</strong>
        </li>
      </ul>
      <p className="text-xs text-muted">Precio sin impuestos nacionales: {formatARS(withoutNationalTaxes(price, taxRate))} · precios de muestra</p>
    </div>
  );
}
