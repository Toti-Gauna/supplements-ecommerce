"use client";
import { CalendarDays, Check } from "lucide-react";
import { LogoMark } from "@/components/atoms/Logo";
import { Sheet } from "@/components/motion/Sheet";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { currentTheme, themeOffer } from "@/demo/engine/themes";
import { cn } from "@/lib/cn";
import { formatDayRange } from "@/lib/date";
import { useDemoData } from "@/stores/admin";
import { useThemePreview, type ThemePreview } from "@/stores/themePreview";
import { reloadWithTheme } from "./reloadWithTheme";
import { skinOf } from "./skins";
import { brand } from "@/config/brand";

/** Selector de "Probar temáticas": cambia solo la vista de este navegador; el panel define la real. */
export function ThemePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const themes = useDemoData((d) => d.themes).filter((t) => t.active);
  const previewId = useThemePreview((s) => s.previewId);
  const byPanel = open ? currentTheme(new Date(), null) : null;
  // Recarga a propósito: vuelve a salir la pantalla de carga, ahora de la temática elegida.
  const pick = (id: ThemePreview) => { onClose(); reloadWithTheme(id); };
  const option = (on: boolean) => cn("flex w-full items-center gap-3 rounded-sm border p-4 text-left transition-colors", on ? "border-primary bg-accent/60" : "border-line bg-surface hover:bg-accent/40");
  return (
    <Sheet open={open} onClose={onClose} title="Probar temáticas">
      <div className="px-6 pb-3 pt-6">
        <p className="eyebrow text-volt-ink">Fechas especiales</p>
        <h2 className="font-display mt-1 text-3xl">Probar temáticas</h2>
        <p className="mt-2 text-sm text-muted">Mirá cómo se ve la tienda en cada fecha comercial: colores, pantalla de carga, fondos animados y ofertas. Solo cambia en este navegador.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => pick(null)} aria-pressed={previewId === null} className={option(previewId === null)}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-accent text-primary"><CalendarDays size={20} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <strong className="block text-[15px]">Automática</strong>
              <span className="block text-xs text-muted">La del cliente hoy: {byPanel ? byPanel.name : "ninguna"}</span>
            </span>
            {previewId === null && <Check size={18} aria-hidden="true" className="text-primary" />}
          </button>
          <button type="button" onClick={() => pick("original")} aria-pressed={previewId === "original"} aria-label="Probar Original" className={option(previewId === "original")}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-night"><LogoMark className="h-6 w-6 text-volt" /></span>
            <span className="min-w-0 flex-1">
              <strong className="block text-[15px]">Original</strong>
              <span className="block text-xs text-muted">{brand.name} sin temática</span>
            </span>
            {previewId === "original" && <Check size={18} aria-hidden="true" className="text-primary" />}
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {themes.map((t) => {
            const skin = skinOf(t.id);
            const on = previewId === t.id;
            const offer = themeOffer(t);
            return (
              <li key={t.id}>
                <button type="button" onClick={() => pick(t.id)} aria-pressed={on} aria-label={`Probar ${t.name}`}
                  className={cn("relative flex h-full w-full flex-col overflow-hidden rounded-sm text-left text-white ring-offset-2 ring-offset-bg transition-transform hover:-translate-y-0.5", on && "ring-2 ring-primary")}
                  style={{ background: `linear-gradient(140deg, ${skin.from}, ${skin.to})` }}>
                  <Decor kind={skin.decor[0]} className="absolute -right-2 -top-1 h-16 w-16 rotate-6 opacity-95" />
                  <span className="relative mt-12 px-3 text-[15px] font-bold leading-tight">{t.name}</span>
                  <span className="relative px-3 text-[11px] text-white/75">{formatDayRange(t.startsOn, t.endsOn)}</span>
                  <span className="relative mx-3 mb-3 mt-2 w-fit rounded-sm px-2 py-0.5 text-[11px] font-extrabold" style={{ background: skin.accent, color: skin.accentInk }}>{offer?.label ?? "Sin oferta"}</span>
                  {on && <Check size={16} aria-hidden="true" className="absolute left-3 top-3" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Sheet>
  );
}
