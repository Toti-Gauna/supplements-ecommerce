"use client";
import { Copy, Eye, Gift, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { giftPath } from "@/demo/engine/gift-link";
import type { Gift as GiftData } from "@/demo/engine/gifts";
import { withBase } from "@/lib/base-path";
import { formatDay } from "@/lib/date";
import { useToasts } from "@/stores/toast";
import { bagPhrase } from "./scenes";
import { brand } from "@/config/brand";

const noop = () => () => {};
const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Link completo (con el dominio) para mandar por WhatsApp o copiar. */
export function giftUrl(gift: GiftData): string {
  return `${window.location.origin}${withBase(giftPath(gift))}`;
}

/** El regalo listo para mandar: código, link para copiar, WhatsApp y la hoja de compartir del celular. */
export function GiftShare({ gift, compact }: { gift: GiftData; compact?: boolean }) {
  const toast = useToasts((s) => s.push);
  const share = useSyncExternalStore(noop, canShare, () => false);
  const text = (url: string) => `🥊 ¡${gift.to}, te llegó un regalo de ${gift.from} en ${brand.name}! Se abre a golpes: ${url} (o con el código ${gift.code})`;
  // La hoja de compartir del celular lleva el link aparte: el texto no lo repite.
  const shareText = `🥊 ¡${gift.to}, te llegó un regalo de ${gift.from} en ${brand.name}! Se abre a golpes. También con el código ${gift.code}.`;
  const copy = async (value: string, title: string) => {
    try { await navigator.clipboard.writeText(value); toast({ tone: "success", title, description: value.length > 40 ? undefined : value }); }
    catch { toast({ tone: "error", title: "No se pudo copiar", description: "Copialo a mano: " + value }); }
  };
  return (
    <div className="rounded-[1.6rem] bg-night p-5 text-on-night sm:p-6">
      {!compact && (
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-volt/20 text-volt"><Gift size={22} aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="eyebrow text-volt">Regalo listo para mandar</p>
            <p className="mt-1 font-bold">Para {gift.to} · {gift.item.name}</p>
            <p className="mt-0.5 text-sm text-night-muted">Lo abre a golpes contra {bagPhrase(gift.occasion)}.{gift.eta ? ` Listo para entregar el ${formatDay(gift.eta)}.` : ""}</p>
          </div>
        </div>
      )}
      <button type="button" onClick={() => void copy(gift.code, "Código copiado")} aria-label={`Copiar código ${gift.code}`}
        className={`${compact ? "" : "mt-5 "}flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-volt/60 px-4 py-3 font-mono text-lg font-extrabold tracking-[0.12em] text-volt transition hover:bg-white/5`}>
        {gift.code} <Copy size={16} aria-hidden="true" />
      </button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(text(giftUrl(gift)))}`} target="_blank" rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 text-sm font-bold text-[#0b2e17] hover:brightness-105">
          <MessageCircle size={17} aria-hidden="true" /> WhatsApp
        </a>
        {share ? (
          <button type="button" onClick={() => void navigator.share({ title: `Un regalo de ${brand.name}`, text: shareText, url: giftUrl(gift) }).catch(() => {})}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-on-night px-4 text-sm font-bold text-night hover:bg-white">
            <Share2 size={17} aria-hidden="true" /> Compartir
          </button>
        ) : (
          <button type="button" onClick={() => void copy(giftUrl(gift), "Link copiado")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-on-night px-4 text-sm font-bold text-night hover:bg-white">
            <Copy size={17} aria-hidden="true" /> Copiar link
          </button>
        )}
      </div>
      <Link href={`${giftPath(gift)}&vista=previa`} className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-night-muted underline-offset-4 hover:text-white hover:underline">
        <Eye size={16} aria-hidden="true" /> Ver cómo lo recibe
      </Link>
      {gift.toEmail && <p className="mt-2 text-center text-xs text-night-muted">También le aparece en su cuenta ({gift.toEmail}). En la demo no se manda ningún email.</p>}
    </div>
  );
}
