"use client";
import { Copy } from "lucide-react";
import { LedPrice } from "@/components/atoms/Led";
import { GIFT_CARD_STATUS_LABEL, giftCardStatus, type GiftCardRecord } from "@/demo/engine/gift-cards";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useToasts } from "@/stores/toast";

/**
 * Gift cards de la cuenta (R3b): cada una como una tarjeta de acero con el saldo en el marcador, el código para usar
 * en el paso "Pago" y hasta cuándo vale. Una vencida o sin saldo queda apagada.
 */
export function GiftCardWallet({ cards }: { cards: { card: GiftCardRecord; from: string }[] }) {
  const toast = useToasts((s) => s.push);
  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); toast({ tone: "success", title: "Código copiado", description: code }); }
    catch { toast({ tone: "error", title: "No se pudo copiar", description: code }); }
  };
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2" aria-label="Mis gift cards">
      {cards.map(({ card, from }) => {
        const status = giftCardStatus(card, DEMO_TODAY);
        const live = status === "activa" || status === "en-uso";
        return (
          <li key={card.code} className={cn("led-dark floor relative overflow-hidden rounded-sm p-5 text-on-night ring-1 ring-white/10", !live && "opacity-70")}>
            <span aria-hidden="true" className="absolute -right-8 top-0 h-7 w-36 -skew-x-[30deg] bg-volt" />
            <p className="eyebrow text-night-muted">Gift card de {from} · {GIFT_CARD_STATUS_LABEL[status]}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <LedPrice amount={card.balance} tone={live ? "volt" : "chalk"} motion="none" className="h-10" signClassName={live ? "text-volt" : "text-night-muted"} />
              <span className="pb-1 text-right text-xs text-night-muted">de {formatARS(card.amount)}</span>
            </div>
            <button type="button" onClick={() => void copy(card.code)} aria-label={`Copiar el código ${card.code}`}
              className="mt-4 flex w-full items-center justify-between gap-2 rounded-sm border border-dashed border-volt/50 px-3 py-2 font-mono text-sm font-extrabold tracking-[0.12em] text-volt hover:bg-white/5">
              {card.code} <Copy size={15} aria-hidden="true" />
            </button>
            <p className="mt-2 text-xs text-night-muted">
              {status === "vencida" ? `Venció el ${formatDate(card.expires)}.` : status === "agotada" ? "Ya la usaste completa." : `Vale hasta el ${formatDate(card.expires)}. Usala en el paso “Pago” del checkout.`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
