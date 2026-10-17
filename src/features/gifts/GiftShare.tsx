"use client";
import { Copy, Eye, ImageDown, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { giftPath } from "@/demo/engine/gift-link";
import type { Gift as GiftData } from "@/demo/engine/gifts";
import { withBase } from "@/lib/base-path";
import { formatDay } from "@/lib/date";
import { useToasts } from "@/stores/toast";
import { GiftCardCanvas } from "./card/GiftCardCanvas";
import { artFromGift, sendGiftCard } from "./card/share";
import { bagPhrase } from "./scenes";
import { brand } from "@/config/brand";

const noop = () => () => {};
const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Link completo (con el dominio) para mandar por WhatsApp o copiar. */
export function giftUrl(gift: GiftData): string {
  return `${window.location.origin}${withBase(giftPath(gift))}`;
}

const opensWith = (gift: GiftData) => (gift.opening === "locker" ? "un locker con combinación" : bagPhrase(gift.occasion));

/**
 * El regalo listo para mandar (R3b): la tarjeta como imagen para WhatsApp (con el link), el código, el link para copiar
 * y "Ver cómo lo recibe". `compact` (Mis regalos) muestra la tarjeta chica al lado.
 */
export function GiftShare({ gift, compact }: { gift: GiftData; compact?: boolean }) {
  const toast = useToasts((s) => s.push);
  const share = useSyncExternalStore(noop, canShare, () => false);
  const [busy, setBusy] = useState(false);
  const text = (url: string) => `🥊 ¡${gift.to}, te llegó un regalo de ${gift.from} en ${brand.name}! Abrilo acá: ${url} (o con el código ${gift.code})`;
  const copy = async (value: string, title: string) => {
    try { await navigator.clipboard.writeText(value); toast({ tone: "success", title, description: value.length > 40 ? undefined : value }); }
    catch { toast({ tone: "error", title: "No se pudo copiar", description: "Copialo a mano: " + value }); }
  };
  const sendCard = async () => {
    setBusy(true);
    try {
      const result = await sendGiftCard(gift, giftUrl(gift));
      if (result === "downloaded") toast({ tone: "success", title: "Tarjeta descargada", description: "Adjuntala en WhatsApp y pegá el link del regalo." });
    } catch {
      toast({ tone: "error", title: "No se pudo armar la tarjeta", description: "Mandá el link: también abre el regalo." });
    } finally { setBusy(false); }
  };
  const side = compact ? "sm:grid-cols-[9rem_minmax(0,1fr)]" : "sm:grid-cols-[13rem_minmax(0,1fr)]";
  return (
    <div className="floor rounded-sm p-4 text-on-night ring-1 ring-white/10 sm:p-5">
      <div className={`grid grid-cols-[minmax(0,1fr)] items-start gap-4 sm:gap-5 ${side}`}>
        <GiftCardCanvas data={artFromGift(gift)} className="mx-auto w-[min(60vw,13rem)] sm:w-full" />
        <div className="flex min-w-0 flex-col gap-3">
          {!compact && (
            <div>
              <p className="eyebrow text-volt">Regalo listo para mandar</p>
              <p className="mt-1 font-bold">Para {gift.to} · {gift.item.name}</p>
              <p className="mt-0.5 text-sm text-night-muted">Lo abre con {opensWith(gift)}.{gift.eta ? ` Listo para entregar el ${formatDay(gift.eta)}.` : ""}</p>
            </div>
          )}
          <button type="button" onClick={() => void sendCard()} disabled={busy}
            className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-volt px-4 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-night shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-3px_0_rgb(0_0_0/0.28)] hover:bg-volt-soft disabled:opacity-60">
            <ImageDown size={18} aria-hidden="true" /> {busy ? "Armando la tarjeta…" : "Mandar la tarjeta"}
          </button>
          <button type="button" onClick={() => void copy(gift.code, "Código copiado")} aria-label={`Copiar código ${gift.code}`}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-volt/60 px-4 py-2.5 font-mono text-base font-extrabold tracking-[0.12em] text-volt transition hover:bg-white/5">
            {gift.code} <Copy size={16} aria-hidden="true" />
          </button>
          <div className="grid grid-cols-2 gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(text(giftUrl(gift)))}`} target="_blank" rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-sm bg-white/10 px-3 text-sm font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp
            </a>
            {share ? (
              <button type="button" onClick={() => void navigator.share({ title: `Un regalo de ${brand.name}`, text: text(""), url: giftUrl(gift) }).catch(() => {})}
                className="flex min-h-11 items-center justify-center gap-2 rounded-sm bg-white/10 px-3 text-sm font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
                <Share2 size={17} aria-hidden="true" /> Compartir
              </button>
            ) : (
              <button type="button" onClick={() => void copy(giftUrl(gift), "Link copiado")}
                className="flex min-h-11 items-center justify-center gap-2 rounded-sm bg-white/10 px-3 text-sm font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
                <Copy size={17} aria-hidden="true" /> Copiar link
              </button>
            )}
          </div>
          <Link href={`${giftPath(gift)}&vista=previa`} className="flex items-center justify-center gap-2 text-sm font-semibold text-night-muted underline-offset-4 hover:text-on-night hover:underline">
            <Eye size={16} aria-hidden="true" /> Ver cómo lo recibe
          </Link>
          {gift.toEmail && <p className="text-center text-xs text-night-muted">También le aparece en su cuenta ({gift.toEmail}). En la demo no se manda ningún email.</p>}
        </div>
      </div>
    </div>
  );
}
