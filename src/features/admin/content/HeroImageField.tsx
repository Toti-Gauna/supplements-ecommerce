"use client";
import { ImageUp, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { checkImageFile, checkImageSize, FRAME_DEFAULT, HERO_IMAGE, imageFrame } from "@/demo/admin/content-images";
import type { HeroFeature, HeroImageFrame } from "@/demo/types";
import { readImage } from "@/lib/image";
import { CountedField } from "./CountedField";

interface Props { feature: HeroFeature; onChange: (patch: Partial<HeroFeature>) => void }

/** Imagen opcional del rack: upload local, descripción y encuadre con controles nativos. */
export function HeroImageField({ feature, onChange }: Props) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(0);
  useEffect(() => () => { pending.current += 1; }, []);
  const image = feature.image;
  const take = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) return setError(problem);
    const request = ++pending.current;
    setBusy(true);
    try {
      const output = await readImage(file, HERO_IMAGE.outSide, HERO_IMAGE.quality, brand.colors.night);
      if (request !== pending.current) return;
      const small = checkImageSize(output.width, output.height);
      if (small) return setError(small);
      onChange({ image: { src: output.src, alt: image?.alt ?? "", frame: image ? imageFrame(image.frame) : { ...FRAME_DEFAULT } } });
      setError(null);
    } catch {
      if (request === pending.current) setError("No pudimos leer esa imagen. Probá con otra en JPG, PNG o WEBP.");
    } finally { if (request === pending.current) setBusy(false); }
  };
  const frame = image ? imageFrame(image.frame) : FRAME_DEFAULT;
  const setFrame = (patch: Partial<HeroImageFrame>) => image && onChange({ image: { ...image, frame: imageFrame({ ...frame, ...patch }) } });
  const range = (key: keyof HeroImageFrame, label: string, min: number, max: number, step: number) => (
    <label className="flex flex-col gap-1 text-sm font-bold">{label}
      <input type="range" min={min} max={max} step={step} value={frame[key]} onChange={(e) => setFrame({ [key]: Number(e.target.value) })}
        className="h-11 accent-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
    </label>
  );
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-sm border border-line p-3 sm:p-4" aria-busy={busy}>
      <legend className="px-1 text-sm font-extrabold">Imagen de la diapositiva</legend>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="plate inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 border-dashed border-line bg-surface px-4 text-sm font-bold text-ink hover:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary">
          <ImageUp size={18} aria-hidden="true" />{busy ? "Procesando…" : image ? "Reemplazar imagen" : "Subir imagen propia"}
          <input id={id} type="file" disabled={busy} accept={HERO_IMAGE.types.join(",")} className="sr-only"
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} onChange={(e) => void take(e.target)} />
        </label>
        {image && <Button variant="danger" size="sm" disabled={busy} onClick={() => { onChange({ image: undefined }); setError(null); }}><Trash2 size={16} aria-hidden="true" />Quitar imagen</Button>}
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted">JPG, PNG o WEBP, hasta 10 MB y de al menos {HERO_IMAGE.minSide} px de lado. Se optimiza y queda solo en este navegador; no se sube a ningún servidor. Sin imagen, se usa el envase del catálogo.</p>
      {error && <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      {image && <>
        <CountedField label="Texto alternativo" value={image.alt} max={HERO_IMAGE.altMax} onChange={(alt) => onChange({ image: { ...image, alt } })} />
        <p className="text-xs text-muted">Describí la escena para quien usa un lector de pantalla.</p>
        <div role="group" aria-label="Encuadre" className="grid gap-x-4 sm:grid-cols-3">
          {range("x", "Horizontal", 0, 100, 1)}{range("y", "Vertical", 0, 100, 1)}{range("zoom", "Acercar", 1, 2, 0.05)}
        </div>
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setFrame(FRAME_DEFAULT)}><RotateCcw size={15} aria-hidden="true" />Centrar encuadre</Button>
      </>}
    </fieldset>
  );
}
