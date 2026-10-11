"use client";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { STUDIO_FORMATS, type StudioFormat } from "@/demo/fixtures/studio";
import { cn } from "@/lib/cn";
import { carouselSlides } from "./render/carousel";
import type { StudioScene } from "./render/types";
import type { StudioMusic } from "./music";
import { StudioExport } from "./StudioExport";
import { StudioPreview, useFontsReady } from "./StudioPreview";

/** Las tres plantillas (VEL-60) y la elegida en grande, con su exportación. */
export function StudioStage({ scenes, format, onFormat, slide: rawSlide, onSlide, themeId, music, ready }: {
  scenes: Record<StudioFormat, StudioScene>; format: StudioFormat; onFormat: (f: StudioFormat) => void; slide: number; onSlide: (i: number) => void; themeId: string | null; music: StudioMusic; ready: boolean;
}) {
  const scene = scenes[format];
  const [recording, setRecording] = useState(false);
  const [replay, setReplay] = useState(0);
  const fonts = useFontsReady();
  const total = carouselSlides(scenes.carousel).length;
  // Si se sacan productos estando en la última diapositiva, se queda en la última que existe.
  const slide = Math.min(rawSlide, total - 1);
  const meta = STUDIO_FORMATS.find((f) => f.id === format)!;
  return (
    <section aria-labelledby="st-templates" className="rounded-3xl border border-line bg-surface p-5">
      <h2 id="st-templates" className="font-display text-2xl">Plantillas</h2>
      <div role="group" aria-label="Formato" className="mt-3 grid grid-cols-3 items-end gap-3">
        {STUDIO_FORMATS.map((f) => (
          <button key={f.id} type="button" aria-pressed={format === f.id} onClick={() => onFormat(f.id)}
            className={cn("flex flex-col gap-2 rounded-2xl p-2 text-left transition-colors", format === f.id ? "bg-accent ring-2 ring-primary" : "hover:bg-accent/50")}>
            <StudioPreview scene={scenes[f.id]} animate={false} scale={0.22} label="" decorative />
            <span className="text-sm font-bold">{f.name} <span className="font-semibold text-muted">{f.ratio}</span></span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={cn("mx-auto w-full", format === "story" ? "max-w-[360px]" : format === "carousel" ? "max-w-[460px]" : "max-w-[520px]")}>
          <StudioPreview scene={scene} slide={slide} animate={!recording} replay={replay} scale={0.5} label={`Vista previa: ${meta.name}${format === "carousel" ? `, diapositiva ${slide + 1} de ${total}` : ""}`} />
          {format !== "carousel" && (
            <div className="mt-3 flex justify-center">
              <button type="button" onClick={() => setReplay((r) => r + 1)} disabled={recording} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-4 text-sm font-bold disabled:opacity-40">
                <Play size={16} aria-hidden="true" />Ver animación
              </button>
            </div>
          )}
          {format === "carousel" && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <button type="button" onClick={() => onSlide(Math.max(0, slide - 1))} disabled={slide === 0} aria-label="Diapositiva anterior" className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 disabled:opacity-30"><ChevronLeft size={20} aria-hidden="true" /></button>
              <span className="text-sm font-bold tabular-nums">{slide + 1} / {total}</span>
              <button type="button" onClick={() => onSlide(Math.min(total - 1, slide + 1))} disabled={slide >= total - 1} aria-label="Diapositiva siguiente" className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 disabled:opacity-30"><ChevronRight size={20} aria-hidden="true" /></button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">{meta.hint} {meta.size[0]} × {meta.size[1]} px.</p>
          <StudioExport scene={scene} slide={slide} themeId={themeId} music={music} onRecording={setRecording} ready={ready && fonts} />
        </div>
      </div>
    </section>
  );
}
