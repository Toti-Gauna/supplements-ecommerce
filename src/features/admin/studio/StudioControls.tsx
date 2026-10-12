"use client";
import Link from "next/link";
import { ImagePlus, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import type { StudioTexts } from "@/demo/admin/studio/content";
import { MAX_VIDEO_S, MIN_VIDEO_S } from "@/demo/admin/studio/timeline";
import type { SeasonId } from "@/demo/types";
import { cn } from "@/lib/cn";
import { MUSIC_LABEL, type StudioMusic } from "./music";
import { TemplatePicker } from "./TemplatePicker";
import type { useStudioPiece } from "./useStudioPiece";

export interface StudioControlsProps {
  piece: ReturnType<typeof useStudioPiece>;
  photoUrl: string | null;
  onPhoto: (file: File | null) => void;
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

/** Plantilla, fecha, productos o foto propia, textos, precio y oferta, duración y música. */
export function StudioControls(p: StudioControlsProps) {
  const { piece } = p;
  const max = piece.meta.maxProducts;
  const full = piece.selected.length >= max;
  const set = (patch: Partial<StudioTexts>) => piece.setTexts({ ...piece.texts, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <section className={card} aria-labelledby="st-template">
        <h2 id="st-template" className="font-display text-2xl">Plantilla</h2>
        <TemplatePicker value={piece.template} onChange={piece.setTemplate} />
        <p className="mt-2 text-xs text-muted">{piece.meta.hint}</p>
      </section>
      <section className={card} aria-labelledby="st-when">
        <h2 id="st-when" className="font-display text-2xl">Fecha</h2>
        <Field id="st-theme" label="Temática" hint={piece.template === "offer" ? "Usa su fondo animado, sus colores y su cupón." : "Usa su fondo animado y sus colores."} className="mt-3">
          <Select id="st-theme" value={piece.themeId ?? "original"} onChange={(e) => piece.setThemeId(e.target.value === "original" ? null : (e.target.value as SeasonId))} aria-describedby="st-theme-hint">
            <option value="original">Volta (sin temática)</option>
            {piece.themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
      </section>
      {max > 0 ? (
        <section className={card} aria-labelledby="st-products">
          <h2 id="st-products" className="font-display text-2xl">{max === 1 ? "Producto" : "Productos"} <span className="font-sans text-sm font-bold text-muted">({piece.selected.length}/{max})</span></h2>
          <div role="group" aria-label="Productos de la pieza" className="mt-3 flex flex-wrap gap-2">
            {piece.catalog.map((prod) => {
              const on = piece.selected.includes(prod.slug);
              return (
                <button key={prod.slug} type="button" aria-pressed={on} disabled={!on && full && max > 1} onClick={() => piece.toggle(prod.slug)}
                  className={cn("min-h-10 rounded-full border px-3.5 text-sm font-bold transition-colors disabled:opacity-40", on ? "border-ink bg-ink text-bg" : "border-ink/15 bg-surface hover:border-ink/35")}>
                  {on && max > 1 && <span aria-hidden="true">{piece.selected.indexOf(prod.slug) + 1} · </span>}{prod.name}
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
            <p className="mt-1 text-xs text-muted">Reemplaza el envase del primer producto por tu foto (por ejemplo, el pote en el mostrador). No sale de tu navegador.</p>
            {p.photoUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- foto local del dueño (blob) */}
                <img src={p.photoUrl} alt="Tu foto" className="h-14 w-14 rounded-xl object-cover" />
                <Button size="sm" variant="ghost" onClick={() => p.onPhoto(null)}><X size={16} aria-hidden="true" />Quitar foto</Button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className={card} aria-labelledby="st-game">
          <h2 id="st-game" className="font-display text-2xl">Premios</h2>
          <p className="mt-2 text-sm text-muted">{piece.game?.active ? `Usa los premios guardados: ${piece.game.tiers.map((t) => `${t.label} desde ${t.minScore.toLocaleString("es-AR")} pts`).join(" · ")}.` : "Los premios del juego están pausados: la pieza invita a jugar por el récord."}</p>
          <Link href="/admin-demo/cupones/juego/" className="mt-2 inline-block text-sm font-bold text-primary underline">Editar los premios del juego</Link>
        </section>
      )}
      <section className={card} aria-labelledby="st-texts">
        <div className="flex items-center justify-between gap-2">
          <h2 id="st-texts" className="font-display text-2xl">Textos</h2>
          <Button size="sm" variant="ghost" onClick={piece.resetTexts}><RotateCcw size={15} aria-hidden="true" />Restaurar</Button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          <Field id="st-eyebrow" label="Bajada"><Input id="st-eyebrow" value={piece.texts.eyebrow} maxLength={44} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <Field id="st-title" label="Titular"><Input id="st-title" value={piece.texts.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field id="st-subtitle" label="Texto"><Textarea id="st-subtitle" value={piece.texts.subtitle} maxLength={130} rows={3} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
          <Field id="st-cta" label="Cierre"><Input id="st-cta" value={piece.texts.cta} maxLength={44} onChange={(e) => set({ cta: e.target.value })} /></Field>
          {piece.template !== "game" && <Switch checked={p.showPrice} onChange={p.onShowPrice} label="Mostrar el precio" />}
          {p.hasOffer ? <Switch checked={p.showOffer} onChange={p.onShowOffer} label="Mostrar la oferta" description="El cupón de la temática, su condición y el precio con descuento." />
            : piece.template === "offer" && <p className="text-xs text-muted">Esta fecha no tiene un cupón activo: la pieza sale sin oferta.</p>}
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
              {(Object.keys(MUSIC_LABEL) as StudioMusic[]).map((m) => <option key={m} value={m}>{MUSIC_LABEL[m]}</option>)}
            </Select>
          </Field>
          <Button variant="secondary" disabled={p.music === "none"} onClick={p.onListen} aria-label="Escuchar la música"><Play size={16} aria-hidden="true" />Escuchar</Button>
        </div>
        <p className="mt-2 text-xs text-muted">Base electrónica sintetizada en el navegador, sin archivos ni derechos de autor: “Pulso” va a 124 bpm y “Potencia”, más pesada, a 96.</p>
      </section>
    </div>
  );
}
