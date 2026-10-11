"use client";
import { ImageUp, RotateCcw, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { checkImageFile, checkImageSize, FRAME_DEFAULT, frame, SLIDE_IMAGE, SLIDE_LIMITS } from "@/demo/admin/content-slides";
import type { ArtKey, CarouselSlide } from "@/demo/types";
import { readImage } from "@/lib/image";

const ARTS: [ArtKey, string][] = [["lamp-photo", "Velador con foto"], ["bowl-dog", "Comedero"], ["diffuser", "Difusor"], ["nfc-plate", "Placa NFC"], ["collar", "Collar"], ["candle-poodle", "Vela caniche"], ["dachshund", "Salchicha geométrico"]];

interface Props { slide: CarouselSlide; onChange: (p: Partial<CarouselSlide>) => void }

/**
 * Imagen de la diapositiva (8.3.28): la ilustración de la demo o una imagen propia. La propia se valida (JPG, PNG o
 * WEBP, hasta 10 MB, mínimo 400 px de lado), se achica y se guarda solo en este navegador; tiene encuadre,
 * reemplazar y quitar (vuelve a la ilustración).
 */
export function SlideImageField({ slide, onChange }: Props) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const img = slide.image;
  const take = async (el: HTMLInputElement) => {
    const file = el.files?.[0];
    el.value = "";
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) return setError(problem);
    setBusy(true);
    try {
      const out = await readImage(file, SLIDE_IMAGE.outSide, SLIDE_IMAGE.quality, "#f4eee3");
      const small = checkImageSize(out.width, out.height);
      if (small) return setError(small);
      onChange({ image: { src: out.src, alt: img?.alt ?? "", ...(img ? frame(img) : FRAME_DEFAULT) } });
      setError(null);
    } catch {
      setError("No pudimos leer esa imagen. Probá con otra en JPG, PNG o WEBP.");
    } finally { setBusy(false); }
  };
  const f = img ? frame(img) : FRAME_DEFAULT;
  const setFrame = (p: Partial<typeof f>) => img && onChange({ image: { ...img, ...p } });
  const range = (key: "x" | "y" | "zoom", label: string, min: number, max: number, step: number) => (
    <label className="flex flex-col gap-1 text-sm font-bold">{label}
      <input type="range" min={min} max={max} step={step} value={f[key]} onChange={(e) => setFrame({ [key]: Number(e.target.value) })} className="h-11 accent-[var(--color-primary)]" />
    </label>
  );
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line p-3 sm:p-4">
      <legend className="px-1 text-sm font-extrabold">Imagen</legend>
      {!img && (
        <label className="flex flex-col gap-1 text-sm font-bold">Ilustración de la demo
          <Select value={slide.art} onChange={(e) => onChange({ art: e.target.value as ArtKey })}>{ARTS.map(([a, l]) => <option key={a} value={a}>{l}</option>)}</Select>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-dashed border-wood bg-surface px-4 text-sm font-bold text-primary hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50">
          <ImageUp size={18} aria-hidden="true" />{busy ? "Procesando…" : img ? "Reemplazar imagen" : "Subir imagen propia"}
          <input id={id} type="file" accept={SLIDE_IMAGE.types.join(",")} className="sr-only" aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`} onChange={(e) => void take(e.target)} />
        </label>
        {img && <Button variant="danger" size="sm" onClick={() => { onChange({ image: undefined }); setError(null); }}><Trash2 size={16} aria-hidden="true" />Quitar imagen</Button>}
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted">JPG, PNG o WEBP, hasta 10 MB y de al menos {SLIDE_IMAGE.minSide} px de lado. Se achica y se guarda solo en este navegador; no se sube a ningún servidor.</p>
      {error && <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      {img && (
        <>
          <label className="flex flex-col gap-1 text-sm font-bold">Texto alternativo
            <Input value={img.alt} onChange={(e) => onChange({ image: { ...img, alt: e.target.value } })} placeholder="Velador de madera con la foto de un perro" aria-invalid={[...img.alt.trim()].length > SLIDE_LIMITS.alt || undefined} />
            <span className="text-xs font-normal text-muted">Describe la imagen para lectores de pantalla y buscadores.</span>
          </label>
          <div role="group" aria-label="Encuadre" className="grid gap-x-4 sm:grid-cols-3">
            {range("x", "Horizontal", 0, 100, 1)}
            {range("y", "Vertical", 0, 100, 1)}
            {range("zoom", "Acercar", 1, 2, 0.05)}
          </div>
          <Button variant="ghost" size="sm" className="self-start" onClick={() => setFrame(FRAME_DEFAULT)}><RotateCcw size={15} aria-hidden="true" />Centrar encuadre</Button>
        </>
      )}
    </fieldset>
  );
}
