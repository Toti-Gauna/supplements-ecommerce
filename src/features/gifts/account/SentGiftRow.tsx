"use client";
import { ChevronDown, CreditCard, Gift as GiftIcon, Layers } from "lucide-react";
import type { GiftRecord } from "@/demo/engine/gift-status";
import type { Gift } from "@/demo/engine/gifts";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { GiftShare } from "../GiftShare";
import { openingName } from "../scenes";
import { GiftStatusTrack } from "./GiftStatusTrack";

/**
 * Un regalo que hice (R3b): para quién, qué, el estado en la barra (enviado, abierto, sabor elegido, canjeado), lo que
 * eligió y, plegado, la tarjeta para volver a mandarla. Una gift card muestra cuánto saldo le queda.
 */
export function SentGiftRow({ gift, record, balance }: { gift: Gift; record?: GiftRecord; balance?: number }) {
  const status = record?.status ?? "enviado";
  const Icon = gift.kind === "gift-card" ? CreditCard : gift.kind === "stack" ? Layers : GiftIcon;
  return (
    <li className="flex flex-col gap-3 rounded-sm border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-night text-volt"><Icon size={20} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight">Para {gift.to} · {gift.item.name}</p>
          <p className="text-sm text-muted">
            {formatDate(gift.createdAt)} · {openingName(gift.occasion, gift.opening)}
            {record?.chosenLabel ? <> · eligió <strong className="text-ink">{record.chosenLabel}</strong></> : null}
            {gift.giftCard && balance !== undefined ? <> · le quedan <strong className="text-ink">{formatARS(balance)}</strong></> : null}
          </p>
        </div>
      </div>
      <GiftStatusTrack status={status} openChoice={gift.openChoice} />
      <details className="group">
        <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-volt-ink [&::-webkit-details-marker]:hidden">
          Mandar la tarjeta otra vez <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2"><GiftShare gift={gift} compact /></div>
      </details>
    </li>
  );
}
