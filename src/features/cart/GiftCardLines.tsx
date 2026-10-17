"use client";
import { CreditCard, Trash2 } from "lucide-react";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useCart } from "@/stores/cart";

/**
 * Gift cards del carrito (R3b): una placa noche por cada una, con el monto en el marcador, para quién y "Quitar".
 * No suman al envío gratis ni a los descuentos.
 */
export function GiftCardLines({ compact }: { compact?: boolean }) {
  const cards = useCart((s) => s.giftCards ?? []);
  const remove = useCart((s) => s.removeGiftCard);
  return cards.map((c) => (
    <li key={c.id} className={cn("floor flex items-center gap-3 rounded-sm text-on-night ring-1 ring-white/10", compact ? "p-3" : "p-4")}>
      <span className="grid h-12 w-16 shrink-0 place-items-center rounded-sm bg-[linear-gradient(135deg,var(--color-night-2),var(--color-night))] text-volt shadow-[inset_0_2px_0_var(--color-volt)] ring-1 ring-white/15">
        <CreditCard size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-tight">Gift card</span>
        <span className="block truncate text-sm text-night-muted">Regalo para {c.gift.to} · de {c.gift.from}</span>
      </span>
      <span className="shrink-0 font-mono text-lg font-extrabold tabular-nums text-volt">{formatARS(c.amount)}</span>
      <button type="button" onClick={() => remove(c.id)} aria-label={`Quitar la gift card para ${c.gift.to}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-sm text-night-muted hover:bg-white/10 hover:text-on-night">
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </li>
  ));
}
