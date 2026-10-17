import { CreditCard, Landmark } from "lucide-react";
import type { PriceOptions } from "@/demo/engine/sheet";
import { formatARS } from "@/lib/money";

/**
 * Los dos precios explicados, como salen del engine: con transferencia o QR (cuánto ahorrás) y con tarjeta o Mercado
 * Pago (precio de lista y la cuota de muestra). Va adentro de la placa del precio, debajo del total.
 */
export function TwoPrices({ options: o }: { options: PriceOptions }) {
  const row = "flex items-center gap-3 px-4 py-2.5 sm:px-5";
  return (
    <ul aria-label="Cómo pagar" className="divide-y divide-line border-t border-line text-sm">
      {o.savings > 0 && (
        <li className={row}>
          <Landmark size={17} aria-hidden="true" className="shrink-0 text-success" />
          <span className="min-w-0 flex-1 leading-tight"><strong>Transferencia o QR</strong><span className="block text-xs text-muted">Ahorrás {formatARS(o.savings)} (−{o.transferPct} %)</span></span>
          <strong key={o.transfer} className="animate-num shrink-0 font-lab text-base tabular-nums text-success sm:text-lg">{formatARS(o.transfer)}</strong>
        </li>
      )}
      <li className={row}>
        <CreditCard size={17} aria-hidden="true" className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 leading-tight"><strong>Tarjeta o Mercado Pago</strong><span className="block text-xs text-muted">{o.installments} cuotas de {formatARS(o.perInstallment)} (de muestra)</span></span>
        <strong key={o.card} className="animate-num shrink-0 font-lab text-base tabular-nums sm:text-lg">{formatARS(o.card)}</strong>
      </li>
    </ul>
  );
}
