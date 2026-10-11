"use client";
import { AlertCircle } from "lucide-react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { SLIDE_LIMITS } from "@/demo/admin/content-slides";
import type { CarouselSlide } from "@/demo/types";
import { ListControls } from "../ListControls";
import { CountedField } from "./CountedField";
import { SlideImageField } from "./SlideImageField";

const LINKS = [["/crear/", "Crear mi producto"], ["/categorias/", "Categorías"], ["/c/comederos/", "Comederos"], ["/c/placas-nfc/", "Placas NFC"], ["/c/iluminacion/", "Iluminación"], ["/c/hogar/", "Aromas"], ["/preguntas/", "Preguntas"]];

interface Props {
  slide: CarouselSlide;
  index: number;
  total: number;
  errors: string[];
  onChange: (p: Partial<CarouselSlide>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

/** Editor de UNA diapositiva (8.3.28): imagen, textos, botón con su destino y visibilidad. */
export function SlideForm({ slide, index, total, errors, onChange, onMove, onRemove }: Props) {
  const n = index + 1;
  return (
    <section aria-labelledby="slide-form-title" className="@container flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="slide-form-title" className="min-w-0 flex-1 text-lg font-extrabold">Diapositiva {n}</h2>
        <ListControls index={index} length={total} label={`diapositiva ${n}`} onMove={onMove} />
        {total > 1 && (
          <ConfirmButton variant="danger" size="sm" title={`Quitar la diapositiva ${n}`} confirmLabel="Quitar" description="Sale del borrador; en la tienda deja de verse cuando guardes el carrusel." onConfirm={onRemove}>Quitar</ConfirmButton>
        )}
      </div>
      {errors.length > 0 && (
        <div role="alert" className="flex gap-2 rounded-2xl bg-danger-soft p-3 text-sm font-semibold text-danger">
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <ul className="flex flex-col gap-0.5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <SlideImageField slide={slide} onChange={onChange} />
      <div className="grid gap-3 @min-[40rem]:grid-cols-2">
        <CountedField label="Título" value={slide.title} max={SLIDE_LIMITS.title} onChange={(title) => onChange({ title })} />
        <CountedField label="Texto del botón" value={slide.ctaLabel} max={SLIDE_LIMITS.ctaLabel} onChange={(ctaLabel) => onChange({ ctaLabel })} />
        <div className="@min-[40rem]:col-span-2"><CountedField label="Bajada" multiline value={slide.subtitle} max={SLIDE_LIMITS.subtitle} onChange={(subtitle) => onChange({ subtitle })} /></div>
        <label className="flex flex-col gap-1 text-sm font-bold">Destino del botón
          <Select value={slide.ctaHref} onChange={(e) => onChange({ ctaHref: e.target.value })}>{LINKS.map(([h, l]) => <option key={h} value={h}>{l}</option>)}</Select>
        </label>
        <div className="flex items-end pb-1">
          <Switch checked={slide.active !== false} onChange={(active) => onChange({ active })} label="Visible en la tienda" description="Oculta: queda guardada pero no sale en el inicio." />
        </div>
      </div>
    </section>
  );
}
