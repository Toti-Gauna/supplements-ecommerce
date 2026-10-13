"use client";
import Link from "next/link";
import { Copy, Pause, Play } from "lucide-react";
import { useThemePreview } from "@/stores/themePreview";
import { useAmbientPause } from "./useAmbientPause";
import { useCurrentTheme } from "./useCurrentTheme";
import { useThemeCoupon } from "./useThemeCoupon";

const LINK = "inline-flex min-h-6 items-center underline decoration-(--season-accent) underline-offset-4 hover:text-(--season-accent)";

/**
 * La fecha vigente en la cinta de avisos: su nombre en el acento de temporada, la oferta, el código para copiar, la
 * pausa de los fondos animados y, en vista previa, cómo salir. Es lo único de la temática que vive en el header.
 */
export function TickerSeason() {
  const { theme, offer, previewing } = useCurrentTheme();
  const setPreview = useThemePreview((s) => s.setPreview);
  const { copy } = useThemeCoupon();
  const { paused, toggle } = useAmbientPause();
  if (!theme) return null;
  return (
    <span data-theme-ribbon={theme.id} className="flex items-center gap-2.5">
      <span className="bg-(--season-accent) px-1.5 py-0.5 font-bold text-(--season-accent-ink)">{theme.name}</span>
      {offer && <span className="text-on-night">{offer.label}</span>}
      {offer && (
        <button type="button" onClick={() => copy(offer.coupon.code)} aria-label={`Copiar el código ${offer.coupon.code}`}
          className="inline-flex min-h-6 items-center gap-1 border border-dashed border-(--season-accent) px-1.5 font-bold tracking-[0.14em] text-(--season-accent)">
          {offer.coupon.code} <Copy size={11} aria-hidden="true" />
        </button>
      )}
      <Link href="/#ofertas-tematicas" className={LINK}>Ver ofertas</Link>
      <button type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Reanudar animaciones de la temática" : "Pausar animaciones de la temática"}
        className="grid size-6 place-items-center border border-white/20 text-night-muted hover:text-on-night">
        {paused ? <Play size={10} aria-hidden="true" /> : <Pause size={10} aria-hidden="true" />}
      </button>
      {previewing && (
        <span className="flex items-center gap-1.5 text-night-muted">
          Vista previa <button type="button" onClick={() => setPreview(null)} className={`font-bold text-on-night ${LINK}`}>Salir</button>
        </span>
      )}
    </span>
  );
}
