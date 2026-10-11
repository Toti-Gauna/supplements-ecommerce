"use client";
import { Gift as GiftIcon, KeyRound } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { giftsFor } from "@/demo/engine/gifts";
import { demoGifts } from "@/demo/fixtures/gifts";
import { useGifts } from "@/stores/gifts";
import { GiftShare } from "./GiftShare";
import { occasionColors } from "./occasion";
import { GIFT_SCENE_NAMES } from "./scenes";

/** "Mis regalos" en la cuenta: los que me mandaron (se abren sin el link) y los que regalé (para volver a mandarlos). */
export function AccountGifts({ email }: { email: string }) {
  const { sent, saved, opened } = useGifts();
  const received = giftsFor(email, { addressed: [...demoGifts, ...sent], saved });
  return (
    <div className="flex flex-col gap-6">
      {received.length === 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-sm text-muted">Todavía no recibiste regalos en esta cuenta.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {received.map((g) => {
            const isNew = !opened.includes(g.code);
            const c = occasionColors(g.occasion);
            return (
              <li key={g.code}>
                <Link href={`/regalo/?c=${g.code}`} style={{ "--g-from": c.from, "--g-to": c.to } as CSSProperties}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,var(--g-from),var(--g-to))] p-4 text-[#f6f1e8] shadow-[var(--shadow-card)]">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ${isNew ? "gift-tile-new" : ""}`}><GiftIcon size={26} aria-hidden="true" style={{ color: c.accent }} /></span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider opacity-80">{isNew ? "Sin abrir" : "Abierto"} · de {g.from}</span>
                    <span className="block font-bold leading-snug">{isNew ? GIFT_SCENE_NAMES[g.occasion] : g.item.name}</span>
                    <span className="mt-0.5 block text-sm opacity-85">{isNew ? "Tocá para abrirlo" : "Ver el regalo y el mensaje"}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link href="/regalo/" className="flex w-fit items-center gap-2 text-sm font-bold text-primary underline"><KeyRound size={15} aria-hidden="true" /> Tengo un código de regalo</Link>
      {sent.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold">Regalos que hice</h3>
          {sent.map((g) => (
            <div key={g.code} className="flex flex-col gap-2">
              <p className="text-sm"><strong>Para {g.to}</strong> · {g.item.name}</p>
              <GiftShare gift={g} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
