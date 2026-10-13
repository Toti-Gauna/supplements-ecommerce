"use client";
import { useState } from "react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { checkSlide, isSlideList, newSlide, newSlideId } from "@/demo/admin/content-slides";
import type { CarouselSlide } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { moveItem } from "../ListControls";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { savedInBrowser } from "../savedInBrowser";
import { useSessionDraft } from "../useSessionDraft";
import { CONTENT_SECTION } from "./ContentHub";
import { SlideForm } from "./SlideForm";
import { SlideList } from "./SlideList";
import { SlidePreview } from "./SlidePreview";

/**
 * Carrusel del inicio (8.3.28): vista previa arriba con la diapositiva elegida, lista compacta y el editor de una
 * diapositiva por vez. Elegir → editar → ver → guardar. El borrador sobrevive a salir y volver; si el navegador no
 * tiene lugar para guardarlo, se avisa y el borrador sigue acá.
 */
export function CarouselEditor() {
  const saved = useAdmin((s) => s.data.content.slides);
  const saveSlides = useAdmin((s) => s.saveSlides);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<CarouselSlide[]>("volta-ui:content-draft:slides", saved, isSlideList);
  const slides = session.draft;
  const [selId, setSelId] = useState(slides[0]?.id);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const index = Math.max(0, slides.findIndex((s) => s.id === selId));
  const slide = slides[index]!;
  const change = (next: CarouselSlide[]) => { session.setDraft(next); setErrors({}); };
  const patch = (p: Partial<CarouselSlide>) => change(slides.map((s, k) => (k === index ? { ...s, ...p } : s)));
  const add = () => { const s = newSlide(newSlideId()); change([...slides, s]); setSelId(s.id); };
  const remove = () => { const next = slides.filter((_, k) => k !== index); change(next); setSelId(next[Math.min(index, next.length - 1)]?.id); };
  const submit = () => {
    const found = Object.fromEntries(slides.map((s) => [s.id, checkSlide(s)] as const).filter(([, list]) => list.length));
    setErrors(found);
    const bad = slides.find((s) => found[s.id]);
    if (bad) { setSelId(bad.id); return; }
    const before = saved;
    saveSlides(slides);
    if (!savedInBrowser((d) => d.content.slides, slides)) {
      saveSlides(before);
      push({ tone: "error", title: "No hay lugar para guardar el carrusel", description: "Este navegador se quedó sin espacio (las imágenes ocupan mucho). Probá con una imagen más liviana o quitá otra: tus cambios siguen en el editor." });
      return;
    }
    push({ tone: "success", title: "Carrusel guardado", description: "Ya se ve en el inicio de la tienda de este navegador (solo en esta demo)." });
  };
  const visible = slide.active !== false;
  const caption = `Diapositiva ${index + 1} de ${slides.length}${visible ? "" : " · oculta: no sale en la tienda"}${session.dirty ? " · borrador sin publicar hasta guardar" : ""}`;
  return (
    <div>
      <SubpageHeader trail={[MARKETING, CONTENT_SECTION]} back={CONTENT_SECTION} title="Carrusel"
        intro="Las diapositivas grandes del inicio. Elegí una, editala y mirá cómo queda arriba antes de guardar." />
      {session.restored && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-sm bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
          <p className="flex-1 font-bold text-warning">Recuperamos los cambios del carrusel que quedaron sin guardar.</p>
          <ConfirmButton size="sm" variant="secondary" title="Descartar los cambios del carrusel" confirmLabel="Descartar" description="El carrusel vuelve a como está guardado." onConfirm={() => session.reset()}>Descartar cambios</ConfirmButton>
        </div>
      )}
      <SlidePreview slide={slide} index={index} caption={caption} />
      <div className="@container mt-6">
        <div className="grid gap-6 @min-[56rem]:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <SlideList slides={slides} selected={index} withErrors={new Set(Object.keys(errors))} onSelect={setSelId} onAdd={add} />
          <SlideForm slide={slide} index={index} total={slides.length} errors={errors[slide.id] ?? []} onChange={patch} onMove={(d) => change(moveItem(slides, index, d))} onRemove={remove} />
        </div>
      </div>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar carrusel" discardText="El carrusel vuelve a como está guardado; se pierden los cambios de todas las diapositivas." onDiscard={() => { session.reset(); setErrors({}); }} />
    </div>
  );
}
