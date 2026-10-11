"use client";
import { ImagePlus, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { MAX_STUDIO_PRODUCTS, type StudioTexts } from "@/demo/admin/studio/content";
import { MAX_VIDEO_S, MIN_VIDEO_S } from "@/demo/admin/studio/timeline";
import type { Product, SeasonalTheme, SeasonId } from "@/demo/types";
import { cn } from "@/lib/cn";
import type { StudioMusic } from "./music";

export interface StudioControlsProps {
  themes: SeasonalTheme[];
  themeId: SeasonId | null;
  onTheme: (id: SeasonId | null) => void;
  catalog: Product[];
  selected: string[];
  onToggleProduct: (slug: string) => void;
  photoUrl: string | null;
  onPhoto: (file: File | null) => void;
  texts: StudioTexts;
  onTexts: (t: StudioTexts) => void;
  onResetTexts: () => void;
  showPrice: boolean;
  onShowPrice: (v: boolean) => void;
  showOffer: boolean;
  onShowOffer: (v: boolean) => void;
  hasOffer: boolean;
  duration: number;
  onDuration: (s: number) => void;
  music: StudioMusic;
  onMusic: (m: StudioMusic) => void;
  onListen: () => void;
}

const card = "rounded-3xl border border-line bg-surface p-5";

/** Fecha, productos o foto propia, textos, precio y oferta, duración y música. */
export function StudioControls(p: StudioControlsProps) {
  const full = p.selected.length >= MAX_STUDIO_PRODUCTS;
  const set = (patch: Partial<StudioTexts>) => p.onTexts({ ...p.texts, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <section className={card} aria-labelledby="st-when">
        <h2 id="st-when" className="font-display text-2xl">Fecha</h2>
        <Field id="st-theme" label="Temática" hint="Usa su fondo animado, sus colores y su oferta." className="mt-3">
          <Select id="st-theme" value={p.themeId ?? "original"} onChange={(e) => p.onTheme(e.target.value === "original" ? null : (e.target.value as SeasonId))} aria-describedby="st-theme-hint">
            <option value="original">Volta (sin temática)</option>
            {p.themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
      </section>
      <section className={card} aria-labelledby="st-products">
        <h2 id="st-products" className="font-display text-2xl">Productos <span className="font-sans text-sm font-bold text-muted">({p.selected.length}/{MAX_STUDIO_PRODUCTS})</span></h2>
        <div role="group" aria-label="Productos de la pieza" className="mt-3 flex flex-wrap gap-2">
          {p.catalog.map((prod) => {
            const on = p.selected.includes(prod.slug);
            return (
              <button key={prod.slug} type="button" aria-pressed={on} disabled={!on && full} onClick={() => p.onToggleProduct(prod.slug)}
                className={cn("min-h-10 rounded-full border px-3.5 text-sm font-bold transition-colors disabled:opacity-40", on ? "border-ink bg-ink text-bg" : "border-ink/15 bg-surface hover:border-ink/35")}>
                {on && <span aria-hidden="true">{p.selected.indexOf(prod.slug) + 1} · </span>}{prod.name}
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl bg-bg p-3">
          <label htmlFor="st-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-full px-1 text-sm font-bold text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50">
            <ImagePlus size={18} aria-hidden="true" />Usar una foto propia
            {/* Se vacía después de elegir: así se puede volver a elegir la misma foto después de quitarla. */}
            <input id="st-photo" type="file" accept="image/*" className="sr-only" onChange={(e) => { p.onPhoto(e.target.files?.[0] ?? null); e.target.value = ""; }} />
          </label>
          <p className="mt-1 text-xs text-muted">Reemplaza la imagen del primer producto. Las fotos reales rinden más que las ilustraciones; no sale de tu navegador.</p>
          {p.photoUrl && (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto local del dueño (blob) */}
              <img src={p.photoUrl} alt="Tu foto" className="h-14 w-14 rounded-xl object-cover" />
              <Button size="sm" variant="ghost" onClick={() => p.onPhoto(null)}><X size={16} aria-hidden="true" />Quitar foto</Button>
            </div>
          )}
        </div>
      </section>
      <section className={card} aria-labelledby="st-texts">
        <div className="flex items-center justify-between gap-2">
          <h2 id="st-texts" className="font-display text-2xl">Textos</h2>
          <Button size="sm" variant="ghost" onClick={p.onResetTexts}><RotateCcw size={15} aria-hidden="true" />Restaurar</Button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          <Field id="st-eyebrow" label="Bajada"><Input id="st-eyebrow" value={p.texts.eyebrow} maxLength={40} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <Field id="st-title" label="Titular"><Input id="st-title" value={p.texts.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field id="st-subtitle" label="Texto"><Textarea id="st-subtitle" value={p.texts.subtitle} maxLength={120} rows={3} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
          <Field id="st-cta" label="Cierre"><Input id="st-cta" value={p.texts.cta} maxLength={44} onChange={(e) => set({ cta: e.target.value })} /></Field>
          <Switch checked={p.showPrice} onChange={p.onShowPrice} label="Mostrar el precio" />
          {p.hasOffer ? <Switch checked={p.showOffer} onChange={p.onShowOffer} label="Mostrar la oferta" description="El cupón de la temática, su condición y el precio con descuento." />
            : <p className="text-xs text-muted">Esta fecha no tiene un cupón activo: la pieza sale sin oferta.</p>}
        </div>
      </section>
      <section className={card} aria-labelledby="st-video">
        <h2 id="st-video" className="font-display text-2xl">Video</h2>
        <Field id="st-duration" label={`Duración: ${p.duration} s`} className="mt-3">
          <input id="st-duration" type="range" min={MIN_VIDEO_S} max={MAX_VIDEO_S} step={1} value={p.duration} onChange={(e) => p.onDuration(Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
        </Field>
        <div className="mt-3 flex items-end gap-2">
          <Field id="st-music" label="Música" className="flex-1">
            <Select id="st-music" value={p.music} onChange={(e) => p.onMusic(e.target.value as StudioMusic)}>
              <option value="none">Sin música</option><option value="calida">Cálida</option><option value="festiva">Festiva</option>
            </Select>
          </Field>
          <Button variant="secondary" disabled={p.music === "none"} onClick={p.onListen} aria-label="Escuchar la música"><Play size={16} aria-hidden="true" />Escuchar</Button>
        </div>
        <p className="mt-2 text-xs text-muted">Sintetizada en el navegador: sin archivos ni derechos de autor.</p>
      </section>
    </div>
  );
}
