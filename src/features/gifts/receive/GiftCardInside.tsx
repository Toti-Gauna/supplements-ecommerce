"use client";
import { Copy, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { LedPrice } from "@/components/atoms/Led";
import type { Gift } from "@/demo/engine/gifts";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

/**
 * Lo de adentro de una gift card (R3b): la tarjeta de acero con el saldo en el marcador, el código para usar en el
 * checkout y hasta cuándo vale. El saldo sale del panel de este navegador si la tarjeta se emitió acá; si llegó por
 * link a otro teléfono, se muestra el monto con el que se mandó.
 */
export function GiftCardInside({ gift, onBack }: { gift: Gift; onBack: () => void }) {
  const card = gift.giftCard!;
  const issued = useDemoData((d) => d.giftCards?.find((c) => c.code === card.code));
  const balance = issued?.balance ?? card.balance;
  const toast = useToasts((s) => s.push);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(card.code); toast({ tone: "success", title: "Código copiado", description: card.code }); }
    catch { toast({ tone: "error", title: "No se pudo copiar", description: card.code }); }
  };
  return (
    <div ref={box} tabIndex={-1} className="flex max-h-full w-full max-w-md flex-col items-center gap-5 overflow-y-auto pb-4 text-center outline-none">
      <p className="eyebrow text-volt-soft">Gift card de {gift.from}</p>
      <div className="led-dark relative w-full overflow-hidden rounded-md bg-[linear-gradient(135deg,var(--color-night-2),var(--color-night)_55%,var(--color-night-2))] p-6 text-left shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
        <span aria-hidden="true" className="absolute -right-10 top-0 h-10 w-48 -skew-x-[30deg] bg-volt" />
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-night-muted">Saldo para usar</p>
        <div className="mt-3"><LedPrice amount={balance} motion="power" className="h-12 sm:h-14" signClassName="text-volt" /></div>
        <p className="mt-5 font-mono text-lg font-extrabold tracking-[0.14em]">{card.code}</p>
        <p className="mt-1 text-xs text-night-muted">Vale hasta el {formatDay(card.expires, "long")}{balance < card.amount ? ` · se mandó por ${formatARS(card.amount)}` : ""}</p>
      </div>
      <p className="max-w-sm text-sm text-night-muted">Elegí lo que quieras en la tienda y escribí el código en el paso “Pago”: el saldo se descuenta del total.</p>
      <div className="grid w-full gap-2">
        <button type="button" onClick={() => void copy()} className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-volt-soft px-6 font-bold text-night hover:brightness-105">
          <Copy size={18} aria-hidden="true" /> Copiar el código
        </button>
        <Link href="/categorias/" className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-white/10 px-6 font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
          <ShoppingBag size={18} aria-hidden="true" /> Usala en la tienda
        </Link>
        <button type="button" onClick={onBack} className="text-sm font-semibold text-night-muted hover:text-on-night">Volver al regalo</button>
      </div>
    </div>
  );
}
