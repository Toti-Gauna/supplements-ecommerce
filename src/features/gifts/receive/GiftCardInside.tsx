"use client";
import { Copy } from "lucide-react";
import { LedPrice } from "@/components/atoms/Led";
import type { Gift } from "@/demo/engine/gifts";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

/**
 * Lo de adentro de una gift card (R3b), en la tarjeta de atleta: la placa de acero con el saldo en el marcador, el
 * código para usar en el paso "Pago" del checkout y hasta cuándo vale. El saldo sale del panel de este navegador si la
 * tarjeta se emitió acá; si llegó por link a otro teléfono, se muestra el monto con el que se mandó.
 */
export function GiftCardInside({ gift }: { gift: Gift }) {
  const card = gift.giftCard!;
  const issued = useDemoData((d) => d.giftCards?.find((c) => c.code === card.code));
  const balance = issued?.balance ?? card.balance;
  const toast = useToasts((s) => s.push);
  const copy = async () => {
    try { await navigator.clipboard.writeText(card.code); toast({ tone: "success", title: "Código copiado", description: card.code }); }
    catch { toast({ tone: "error", title: "No se pudo copiar", description: card.code }); }
  };
  return (
    <section aria-label="Tu gift card" className="led-dark relative overflow-hidden rounded-md bg-[linear-gradient(135deg,var(--color-night),var(--color-night-2))] p-5 text-left ring-1 ring-white/15">
      <span aria-hidden="true" className="absolute -right-10 top-0 h-8 w-44 -skew-x-[30deg] bg-volt" />
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-night-muted">Saldo para usar</p>
      <div className="mt-2"><LedPrice amount={balance} motion="power" className="h-11" signClassName="text-volt" /></div>
      <button type="button" onClick={() => void copy()} aria-label={`Copiar el código ${card.code}`}
        className="mt-4 flex w-full items-center justify-between gap-2 rounded-sm border border-dashed border-volt/50 px-3 py-2 font-mono text-sm font-extrabold tracking-[0.12em] text-volt hover:bg-white/5">
        {card.code} <Copy size={15} aria-hidden="true" />
      </button>
      <p className="mt-2 text-xs text-night-muted">
        Vale hasta el {formatDate(card.expires)}{balance < card.amount ? ` · se mandó por ${formatARS(card.amount)}` : ""}. Elegí lo que quieras y escribí el código en el paso “Pago”: el saldo se descuenta del total.
      </p>
    </section>
  );
}
