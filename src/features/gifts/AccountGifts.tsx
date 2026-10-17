"use client";
import { Gift as GiftIcon, KeyRound, Zap } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { giftStatusLabel } from "@/demo/engine/gift-status";
import { giftsFor, type Gift } from "@/demo/engine/gifts";
import { demoGifts, moreSampleGifts } from "@/demo/fixtures/gifts";
import { useDemoData } from "@/stores/admin";
import { useGifts } from "@/stores/gifts";
import { GiftCardWallet } from "./account/GiftCardWallet";
import { SentGiftRow } from "./account/SentGiftRow";
import { occasionColors } from "./occasion";
import { openingName } from "./scenes";

/** Regalos que llegan a la cuenta: los de muestra (con email), los comprados en este navegador y los guardados. */
export function receivedGifts(email: string, sent: Gift[], saved: Gift[]): Gift[] {
  return giftsFor(email, { addressed: [...demoGifts, ...moreSampleGifts, ...sent], saved });
}

/**
 * "Mis regalos" en Mi box (R3b): mis gift cards con su saldo, los regalos que me mandaron (se abren sin el link) y los
 * que hice, con su estado (enviado, abierto, sabor elegido, canjeado) para volver a mandar la tarjeta.
 */
export function AccountGifts({ email }: { email: string }) {
  const { sent, saved, opened } = useGifts();
  const records = useDemoData((d) => d.giftRecords ?? []);
  const issued = useDemoData((d) => d.giftCards ?? []);
  const received = receivedGifts(email, sent, saved);
  const statusOf = (code: string) => records.find((r) => r.code === code);
  const cards = received.flatMap((g) => { const card = g.giftCard && issued.find((c) => c.code === g.giftCard!.code); return card ? [{ card, from: g.from }] : []; });
  return (
    <div className="flex flex-col gap-8">
      {cards.length > 0 && (
        <section aria-labelledby="mis-gift-cards" className="flex flex-col gap-3">
          <h3 id="mis-gift-cards" className="eyebrow text-muted">Mis gift cards</h3>
          <GiftCardWallet cards={cards} />
        </section>
      )}
      <section aria-labelledby="me-regalaron" className="flex flex-col gap-3">
        <h3 id="me-regalaron" className="eyebrow text-muted">Me regalaron</h3>
        {received.length === 0 ? (
          <p className="rounded-sm bg-bg p-4 text-sm text-muted">Todavía no recibiste regalos en esta cuenta.</p>
        ) : (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {received.map((g) => {
              const record = statusOf(g.code);
              const isNew = !opened.includes(g.code) && (!record || record.status === "enviado");
              const c = occasionColors(g.occasion);
              const state = isNew ? "Sin abrir" : record ? giftStatusLabel(record.status, g.openChoice) : "Abierto";
              return (
                <li key={g.code}>
                  <Link href={`/regalo/?c=${g.code}`} style={{ "--g-from": c.from, "--g-to": c.to } as CSSProperties}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-sm bg-[linear-gradient(135deg,var(--g-from),var(--g-to))] p-4 text-on-night shadow-[var(--shadow-card)]">
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-sm bg-white/15 ${isNew ? "gift-tile-new" : ""}`}><GiftIcon size={26} aria-hidden="true" style={{ color: c.accent }} /></span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-wider opacity-80">{state} · de {g.from}</span>
                      <span className="block font-bold leading-snug">{isNew ? openingName(g.occasion, g.opening) : g.item.name}</span>
                      <span className="mt-0.5 block text-sm opacity-85">{isNew ? "Tocá y abrilo" : record?.chosenLabel ?? "Ver el regalo y el mensaje"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/regalo/" className="flex w-fit items-center gap-2 text-sm font-bold text-volt-ink underline"><KeyRound size={15} aria-hidden="true" /> Tengo un código de regalo</Link>
      </section>
      <section aria-labelledby="regalos-que-hice" className="flex flex-col gap-3">
        <h3 id="regalos-que-hice" className="eyebrow text-muted">Regalos que hice</h3>
        {sent.length === 0 ? (
          <p className="rounded-sm bg-bg p-4 text-sm text-muted">Cuando regales algo, acá ves si lo abrió, qué sabor eligió y si ya lo canjeó.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sent.map((g) => <SentGiftRow key={g.code} gift={g} record={statusOf(g.code)} balance={g.giftCard ? issued.find((c) => c.code === g.giftCard!.code)?.balance : undefined} />)}
          </ul>
        )}
        <Link href="/regalar/" className="flex w-fit items-center gap-2 text-sm font-bold text-volt-ink underline"><Zap size={15} aria-hidden="true" /> Regalá energía</Link>
      </section>
    </div>
  );
}
