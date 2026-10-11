"use client";
import Link from "next/link";
import { Copy, Eye, Pause, Play } from "lucide-react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { useThemePreview } from "@/stores/themePreview";
import { skinOf } from "./skins";
import { useCurrentTheme } from "./useCurrentTheme";
import { useAmbientPause } from "./useAmbientPause";
import { useThemeCoupon } from "./useThemeCoupon";

/** Cinta superior de la temática vigente: la oferta, el código para copiar y, en vista previa, cómo salir. */
export function ThemeRibbon() {
  const { theme, offer, previewing } = useCurrentTheme();
  const setPreview = useThemePreview((s) => s.setPreview);
  const { copy } = useThemeCoupon();
  const { paused, toggle } = useAmbientPause();
  if (!theme) return null;
  const skin = skinOf(theme.id);
  return (
    <div data-theme-ribbon={theme.id} className="animate-fade-in text-white" style={{ background: `linear-gradient(90deg, ${skin.from}, ${skin.to})` }}>
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[13px] font-semibold">
        <Decor kind={skin.topper} className="h-5 w-5 shrink-0" />
        <span>{theme.ribbon}</span>
        {offer && (
          <button type="button" onClick={() => copy(offer.coupon.code)} aria-label={`Copiar el código ${offer.coupon.code}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-0.5 font-mono text-[12px] font-bold tracking-wider transition-transform hover:scale-105" style={{ borderColor: skin.accent, color: skin.accent }}>
            {offer.coupon.code} <Copy size={12} aria-hidden="true" />
          </button>
        )}
        <Link href="/#ofertas-tematicas" className="underline underline-offset-4 hover:no-underline">Ver ofertas</Link>
        <button type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Reanudar animaciones de la temática" : "Pausar animaciones de la temática"}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/35">
          {paused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
        </button>
        {previewing && (
          <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-0.5 text-[12px]">
            <Eye size={13} aria-hidden="true" />Vista previa
            <button type="button" onClick={() => setPreview(null)} className="font-bold underline underline-offset-2">Salir</button>
          </span>
        )}
      </p>
    </div>
  );
}
